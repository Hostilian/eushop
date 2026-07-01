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
    const seedFiles = [
      '001_initial_data.sql',
      '002_extended_data.sql'
    ];

    for (const file of seedFiles) {
      const filePath = path.join(__dirname, '../seed', file);
      if (fs.existsSync(filePath)) {
        console.log(`▸ Applying seed: ${file}`);
        const seedContent = fs.readFileSync(filePath, 'utf8');
        const statements = seedContent.split(';').filter(s => s.trim());

        for (const statement of statements) {
          if (statement.trim()) {
            console.log(`  Executing: ${statement.substring(0, 50).replace(/\s+/g, ' ')}...`);
            await pool.query(statement);
          }
        }
      } else {
        console.log(`⚠️ Seed file not found: ${file}`);
      }
    }

    console.log('✅ Seeds completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
