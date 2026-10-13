import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { findEnvFile, getSafeEnvSummary, getEnvCandidatePaths } from '../src/config/env.js';

test('Environment Loading: Resolves root .env file across directory depths', () => {
  const envFile = findEnvFile();
  assert.ok(envFile, 'Should successfully find an .env file');
  assert.ok(fs.existsSync(envFile), '.env file path must exist on disk');
  assert.ok(envFile.endsWith('.env'), 'Found file must be an .env file');

  const candidates = getEnvCandidatePaths();
  assert.ok(candidates.length >= 2, 'Should search multiple candidate paths');
  assert.ok(candidates.some((p) => p.includes('RailMatte')), 'Should resolve to RailMatte monorepo path');
});

test('Environment Security: Safe environment summary never leaks secret keys', () => {
  const summary = getSafeEnvSummary();

  assert.equal(summary.isConfiguredInEnv, true, 'Environment should be reported as configured');
  assert.equal(summary.hasSupabaseUrl, true, 'SUPABASE_URL presence flag should be true');
  assert.equal(summary.hasSupabaseKey, true, 'SUPABASE_SERVICE_ROLE_KEY presence flag should be true');
  assert.equal(summary.hasSupabase, true, 'hasSupabase flag should be true');

  // Verify hostname is extracted safely
  assert.ok(summary.supabaseHost.includes('supabase.co'), 'Hostname should be parsed');

  // Stringify summary to verify secret key value is never present anywhere in output
  const serialized = JSON.stringify(summary);
  assert.ok(
    !serialized.includes(process.env.SUPABASE_SERVICE_ROLE_KEY),
    'SUPABASE_SERVICE_ROLE_KEY secret value must NEVER appear in environment summary'
  );

  // Exact variable names must remain as specified in requirements
  assert.ok(process.env.SUPABASE_URL, 'SUPABASE_URL must exist');
  assert.ok(process.env.SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY must exist');
});
