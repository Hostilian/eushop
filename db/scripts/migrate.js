#!/usr/bin/env node

const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function loadLocalEnvironment() {
  try {
    require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') throw error;
  }
}

const migrationsDir = path.join(__dirname, '../migrations');
const manifestPath = path.join(migrationsDir, 'manifest.json');

function loadPlan() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (!Array.isArray(manifest.migrations) || manifest.migrations.length === 0) {
    throw new Error('Migration manifest must contain a non-empty migrations array.');
  }
  const duplicates = manifest.migrations.filter((name, i, all) => all.indexOf(name) !== i);
  if (duplicates.length) throw new Error(`Duplicate migration manifest entries: ${duplicates.join(', ')}`);
  return manifest.migrations.map((name) => {
    if (!/^\d{3}_[a-z0-9_]+\.sql$/.test(name)) throw new Error(`Invalid migration filename: ${name}`);
    const filePath = path.join(migrationsDir, name);
    if (!fs.existsSync(filePath)) throw new Error(`Manifest migration is missing: ${name}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    return { name, sql, checksum: createHash('sha256').update(sql).digest('hex') };
  });
}

// 002 predates the runner and contains syntax PostgreSQL does not support. The
// email constraint is already created by 001, so removing this redundant line
// preserves the intended schema without rewriting a historical migration.
function compatibleSql(migration) {
  if (migration.name !== '002_compliance_fields.sql') return migration.sql;
  return migration.sql.replace(
    /ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS unique_users_email UNIQUE \(email\);/,
    '-- legacy redundant unique constraint omitted by migration runner'
  );
}

function databaseConfig(env = process.env) {
  return {
    host: env.POSTGRES_HOST || 'localhost',
    port: Number(env.POSTGRES_PORT || 5432),
    database: env.POSTGRES_DB || 'eushop_db',
    user: env.POSTGRES_USER || 'eushop_dev',
    password: env.POSTGRES_PASSWORD || 'dev_password_123',
    connectionTimeoutMillis: 5000,
  };
}

function shouldRefuseUntrackedSchema(appliedCount, userTableCount) {
  return appliedCount === 0 && userTableCount > 0;
}

async function migrate() {
  loadLocalEnvironment();
  const { Pool } = require('pg');
  const plan = loadPlan();
  const pool = new Pool(databaseConfig());
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [17012026]);
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      checksum CHAR(64) NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    const { rows } = await client.query('SELECT filename, checksum FROM schema_migrations');
    const applied = new Map(rows.map((row) => [row.filename, row.checksum.trim()]));
    const tableResult = await client.query(`SELECT COUNT(*)::int AS count
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        AND table_name <> 'schema_migrations'`);
    if (shouldRefuseUntrackedSchema(applied.size, tableResult.rows[0].count)) {
      throw new Error('Existing untracked schema detected. Review and baseline it explicitly before running migrations.');
    }

    for (const migration of plan) {
      if (applied.has(migration.name)) {
        if (applied.get(migration.name) !== migration.checksum) {
          throw new Error(`Checksum mismatch for applied migration ${migration.name}; refusing to continue.`);
        }
        console.log(`skip ${migration.name}`);
        continue;
      }
      console.log(`apply ${migration.name}`);
      await client.query('BEGIN');
      try {
        await client.query(compatibleSql(migration));
        await client.query(
          'INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)',
          [migration.name, migration.checksum]
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`${migration.name} failed and was rolled back: ${error.message}`);
      }
    }
    console.log('Database migrations are current.');
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [17012026]).catch(() => {});
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  migrate().catch((error) => {
    console.error(`Migration failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { compatibleSql, databaseConfig, loadPlan, loadLocalEnvironment, shouldRefuseUntrackedSchema };
