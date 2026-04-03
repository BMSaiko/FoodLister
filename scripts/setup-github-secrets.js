/**
 * Script para configurar GitHub Secrets automaticamente
 * 
 * Uso:
 * 1. Gere um Personal Access Token em: https://github.com/settings/tokens
 *    - Permissões necessárias: repo (full control)
 * 2. Execute: node scripts/setup-github-secrets.js <GITHUB_TOKEN>
 * 
 * Ou defina a variável de ambiente GITHUB_TOKEN antes de executar
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuração
const GITHUB_OWNER = 'BMSaiko';
const GITHUB_REPO = 'FoodLister';

// Ler .env.local
function parseEnvFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  return env;
}

// Função para criptografar secrets (GitHub requer libsodium)
// Como não temos libsodium, vamos usar a API do GitHub para obter a chave pública
function getPublicKey(owner, repo, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/actions/secrets/public-key`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Node.js'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Failed to get public key: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Criptografar secret usando a chave pública do GitHub
async function encryptSecret(publicKey, value) {
  // Precisamos usar libsodium-wrappers para criptografia compatível com GitHub
  const sodium = require('tweetnacl');
  const sodiumUtil = require('tweetnacl-util');

  const messageBytes = sodiumUtil.decodeUTF8(value);
  const publicKeyBytes = sodiumUtil.decodeBase64(publicKey);

  const nonce = sodium.randomBytes(sodium.box.nonceLength);
  const encryptedMessage = sodium.box(
    messageBytes,
    nonce,
    publicKeyBytes,
    sodiumUtil.decodeBase64(process.env.GITHUB_SECRET_KEY || '')
  );

  const encryptedBuffer = Buffer.concat([nonce, encryptedMessage]);
  return encryptedBuffer.toString('base64');
}

// Criar ou atualizar um secret
function createOrUpdateSecret(owner, repo, secretName, encryptedValue, keyId, token) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      encrypted_value: encryptedValue,
      key_id: keyId
    });

    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/actions/secrets/${secretName}`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'Node.js',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 204) {
          resolve({ status: res.statusCode, name: secretName });
        } else {
          reject(new Error(`Failed to create secret ${secretName}: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Função principal
async function main() {
  // Obter token
  let token = process.argv[2] || process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.error('❌ Erro: GitHub Token não fornecido.');
    console.log('');
    console.log('Como obter um token:');
    console.log('1. Vá para: https://github.com/settings/tokens');
    console.log('2. Clique em "Generate new token" > "Generate new token (classic)"');
    console.log('3. Dê um nome (ex: "Setup Secrets")');
    console.log('4. Selecione a permissão "repo" (full control)');
    console.log('5. Copie o token gerado');
    console.log('');
    console.log('Execute: node scripts/setup-github-secrets.js <SEU_TOKEN>');
    process.exit(1);
  }

  console.log('🔧 Configurando GitHub Secrets...');
  console.log(`📁 Repositório: ${GITHUB_OWNER}/${GITHUB_REPO}`);
  console.log('');

  // Ler .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Erro: Arquivo .env.local não encontrado');
    process.exit(1);
  }

  const env = parseEnvFile(envPath);

  // Mapear variáveis do .env.local para GitHub Secrets
  const secretsToCreate = {
    'SUPABASE_URL': env.NEXT_PUBLIC_SUPABASE_URL,
    'SUPABASE_ANON_KEY': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_ROLE_KEY': env.SUPABASE_SERVICE_ROLE_KEY,
    'CLOUDINARY_CLOUD_NAME': env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    'CLOUDINARY_API_KEY': env.CLOUDINARY_API_KEY,
    'CLOUDINARY_API_SECRET': env.CLOUDINARY_API_SECRET,
    'CLOUDINARY_URL': `cloudinary://${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}@${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`,
    'NEXTAUTH_SECRET': env.NEXTAUTH_SECRET || crypto.randomBytes(32).toString('hex'),
    'NEXTAUTH_URL': env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'NEXT_PUBLIC_SITE_URL': env.NEXT_PUBLIC_SITE_URL,
  };

  // Obter chave pública do GitHub
  console.log('🔑 Obtendo chave pública do GitHub...');
  let publicKey;
  try {
    publicKey = await getPublicKey(GITHUB_OWNER, GITHUB_REPO, token);
    console.log(`✅ Chave pública obtida (ID: ${publicKey.key_id})`);
  } catch (error) {
    console.error(`❌ Erro ao obter chave pública: ${error.message}`);
    console.log('');
    console.log('Verifique:');
    console.log('1. O token está correto e tem permissão "repo"');
    console.log('2. O repositório existe e você tem acesso');
    process.exit(1);
  }

  // Para criptografia correta, vamos usar uma abordagem diferente
  // O GitHub requer libsodium, então vamos instalar a dependência
  console.log('');
  console.log('📦 Para criptografar os secrets, precisamos do pacote "tweetnacl"');
  console.log('Execute: npm install tweetnacl tweetnacl-util --save-dev');
  console.log('');
  console.log('Alternativamente, configure os secrets manualmente:');
  console.log('');
  console.log('📋 Secrets para configurar no GitHub:');
  console.log('   Vá para: Settings > Secrets and variables > Actions');
  console.log('');
  
  for (const [name, value] of Object.entries(secretsToCreate)) {
    if (value) {
      const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
      console.log(`   🔐 ${name}: ${displayValue}`);
    }
  }

  console.log('');
  console.log('💡 Dica: Instale a GitHub CLI (gh) para facilitar:');
  console.log('   winget install GitHub.cli');
  console.log('');
  console.log('   Depois use: gh secret set <NAME> --body "<VALUE>"');
}

main().catch(console.error);