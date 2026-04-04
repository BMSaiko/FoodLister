/**
 * Script para gerar instruções de configuração dos GitHub Secrets
 * 
 * Este script lê o arquivo .env.local e lista os secrets necessários
 * para serem configurados manualmente no GitHub.
 * 
 * Uso: node scripts/setup-github-secrets.js
 * 
 * Os secrets devem ser configurados em:
 * https://github.com/BMSaiko/FoodLister/settings/secrets/actions
 */

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

// Função principal
function main() {
  console.log('🔧 GitHub Secrets - Instruções de Configuração');
  console.log(`📁 Repositório: ${GITHUB_OWNER}/${GITHUB_REPO}`);
  console.log('');

  // Ler .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Erro: Arquivo .env.local não encontrado');
    console.log('');
    console.log('Crie o arquivo .env.local com suas variáveis de ambiente antes de executar este script.');
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
    'CLOUDINARY_URL': env.CLOUDINARY_URL || `cloudinary://${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}@${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`,
    'NEXTAUTH_SECRET': env.NEXTAUTH_SECRET || crypto.randomBytes(32).toString('hex'),
    'NEXTAUTH_URL': env.NEXTAUTH_URL || 'http://localhost:3000',
    'NEXT_PUBLIC_SITE_URL': env.NEXT_PUBLIC_SITE_URL,
  };

  console.log('📋 Secrets necessários para o repositório:');
  console.log('');
  console.log('Configure em: https://github.com/BMSaiko/FoodLister/settings/secrets/actions');
  console.log('');
  
  for (const [name, value] of Object.entries(secretsToCreate)) {
    if (value) {
      console.log(`   🔐 ${name}`);
    }
  }

  console.log('');
  console.log('💡 Use a GitHub CLI para configurar rapidamente:');
  console.log('   gh secret set <NAME> --body "<VALUE>"');
  console.log('');
  console.log('Ou use a interface web: Settings > Secrets and variables > Actions > New repository secret');
}

main();
