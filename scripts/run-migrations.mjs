import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const supabaseUrl = 'https://kgzeoyubgchhvfmtyqsk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnemVveXViZ2NoaHZmbXR5cXNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTcxOTQxOSwiZXhwIjoyMDU3Mjk1NDE5fQ.0G9-waVNUuEopVaBNphGO-MENmQt5Q16EKbbVEO2xis';

const migrationsDir = join(projectRoot, 'supabase', 'migrations');
const files = readdirSync(migrationsDir).filter(f => /^02[4-7]/.test(f) && f.endsWith('.sql')).sort();

console.log('Migrations to run:', files);

for (const file of files) {
  const sql = readFileSync(join(migrationsDir, file), 'utf8');
  console.log('\n--- Running:', file, '---');
  console.log('SQL length:', sql.length);
  
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
      'x-supabase-script': 'true'
    },
    body: JSON.stringify({})
  });
  
  console.log('Response status:', response.status);
  const text = await response.text();
  console.log('Response:', text.substring(0, 200));
}

// Verify migration 024
console.log('\n--- Verifying position column ---');
const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/list_restaurants?select=position&limit=1`, {
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  }
});
console.log('Verify status:', verifyResponse.status);
const verifyText = await verifyResponse.text();
console.log('Verify response:', verifyText.substring(0, 200));