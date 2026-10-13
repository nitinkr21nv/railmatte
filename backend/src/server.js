import './config/env.js';
import { createApp } from './app.js';
import { checkDatabaseHealth } from './services/store.js';

// Environment variable audit & startup validation
async function validateEnvironment() {
  console.log('\n========================================================');
  console.log('🚄 RAILMATTE API SERVER INITIALIZATION');
  console.log('   Tagline: Swap seats. Travel better.');
  console.log('========================================================');

  const port = process.env.PORT || 5000;
  const env = process.env.NODE_ENV || 'development';
  console.log(`- Runtime Environment: ${env}`);
  console.log(`- Listening Port: ${port}`);
  console.log(`- Allowed Frontend Origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);

  // Test Supabase connectivity and table privileges
  const dbHealth = await checkDatabaseHealth();
  if (dbHealth.operational) {
    console.log(`✓ Supabase PostgreSQL: Connected & verified (${dbHealth.host}) -> Cloud database persistence ACTIVE`);
  } else if (dbHealth.configured) {
    console.log(`⚠ Supabase PostgreSQL: Configured in .env, but live table access failed:`);
    console.log(`   Error: ${dbHealth.error}${dbHealth.code ? ` (Code: ${dbHealth.code})` : ''}`);
    if (dbHealth.hint) {
      console.log(`   Hint: ${dbHealth.hint}`);
    }
    console.log(`ℹ Action required: Execute GRANT statements in docs/supabase_schema.sql in Supabase SQL Editor.`);
    console.log(`ℹ Active Datastore: In-memory datastore fallback (Real PostgreSQL persistence inactive until granted)`);
  } else {
    console.log('ℹ Supabase PostgreSQL: Not configured in .env -> Using robust in-memory datastore');
  }

  if (process.env.GEMINI_API_KEY) {
    console.log('✓ Gemini AI Assistance: Configured');
  } else {
    console.log('ℹ Gemini AI Assistance: Key not supplied -> Using built-in local heuristics');
  }

  const monadContract = process.env.MONAD_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
  console.log(`- Monad Chain ID: ${process.env.MONAD_CHAIN_ID || 10143} (Testnet)`);
  console.log(`- Monad Registry Contract: ${monadContract}`);
  console.log('========================================================\n');
}

await validateEnvironment();

const app = createApp();
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 RailMatte API Server is running at http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
