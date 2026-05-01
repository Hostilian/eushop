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

async function seed() {
  console.log('🌱 Seeding database with initial data...');
  
  try {
    const seedFile = fs.readFileSync(
      path.join(__dirname, '../seed/001_initial_data.sql'),
      'utf8'
    );

    const statements = seedFile.split(';').filter(s => s.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await pool.query(statement);
      }
    }

    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
