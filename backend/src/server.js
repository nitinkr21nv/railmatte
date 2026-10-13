import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';

// Environment variable audit & startup validation
function validateEnvironment() {
  console.log('\n========================================================');
  console.log('🚄 RAILMATTE API SERVER INITIALIZATION');
  console.log('   Tagline: Swap seats. Travel better.');
  console.log('========================================================');

  const port = process.env.PORT || 5000;
  const env = process.env.NODE_ENV || 'development';
  console.log(`- Runtime Environment: ${env}`);
  console.log(`- Listening Port: ${port}`);
  console.log(`- Allowed Frontend Origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('✓ Supabase PostgreSQL: Configured & active');
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

validateEnvironment();

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
