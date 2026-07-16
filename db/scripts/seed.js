#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { databaseConfig, loadLocalEnvironment } = require('./migrate');

function assertDevelopmentSeedAllowed(env = process.env) {
  if (env.NODE_ENV !== 'development' || env.EUSHOP_ALLOW_DEV_SEED !== '1') {
    throw new Error('Development seed disabled. Set NODE_ENV=development and EUSHOP_ALLOW_DEV_SEED=1 explicitly.');
  }
}

async function seed() {
  assertDevelopmentSeedAllowed();
  loadLocalEnvironment();
  const { Pool } = require('pg');
  const pool = new Pool(databaseConfig());
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../seed/001_initial_data.sql'), 'utf8');
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('COMMIT');
      console.log('Development demo seed applied deterministically.');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seed().catch((error) => {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { assertDevelopmentSeedAllowed };
