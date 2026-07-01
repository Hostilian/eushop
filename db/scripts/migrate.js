#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'eushop_dev',
  password: process.env.POSTGRES_PASSWORD || 'dev_password_123',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'eushop_db',
});

async function migrate() {
  console.log('🚀 Running database migrations...');
  
  try {
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`▸ Applying migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const migrationFile = fs.readFileSync(filePath, 'utf8');
      const statements = migrationFile.split(';').filter(s => s.trim());

      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`  Executing: ${statement.substring(0, 50).replace(/\s+/g, ' ')}...`);
          await pool.query(statement);
        }
      }
    }

    console.log('✅ Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
