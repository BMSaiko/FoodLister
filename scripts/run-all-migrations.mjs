import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Supabase credentials from environment or use defaults
const supabaseUrl = process.env.SUPABASE_URL || 'https://kgzeoyubgchhvfmtyqsk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnemVveXViZ2NoaHZmbXR5cXNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTcxOTQxOSwiZXhwIjoyMDU3Mjk1NDE5fQ.0G9-waVNUuEopVaBNphGO-MENmQt5Q16EKbbVEO2xis';

const migrationsDir = join(projectRoot, 'supabase', 'migrations');

// Get all SQL files and sort them numerically
const files = readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort((a, b) => {
    const numA = parseInt(a.split('_')[0]);
    const numB = parseInt(b.split('_')[0]);
    return numA - numB;
  });

console.log('Found', files.length, 'migration files to run in order:');
files.forEach(f => console.log(' -', f));

// Run each migration
for (const file of files) {
  const sql = readFileSync(join(migrationsDir, file), 'utf8');
  console.log(`\n--- Running migration: ${file} ---`);
  console.log('SQL length:', sql.length, 'characters');
  
  try {
    const response = await fetch(`${supabaseUrl}/pg`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: sql
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✓ Migration ${file} completed successfully`);
    } else {
      console.error(`✗ Migration ${file} failed:`, result);
      console.error('Status:', response.status);
      // Continue with other migrations even if one fails
    }
  } catch (error) {
    console.error(`✗ Error running migration ${file}:`, error.message);
  }
}

console.log('\n--- All migrations processed ---');