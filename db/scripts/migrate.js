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

function splitSqlStatements(sql) {
  const statements = [];
  let currentStatement = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inDollarQuote = false;
  let dollarTag = '';

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];

    if (char === "'" && !inDoubleQuote && !inDollarQuote) {
      if (inSingleQuote && sql[i + 1] === "'") {
        currentStatement += char;
        currentStatement += sql[i + 1];
        i++;
      } else {
        inSingleQuote = !inSingleQuote;
        currentStatement += char;
      }
    } else if (char === '"' && !inSingleQuote && !inDollarQuote) {
      inDoubleQuote = !inDoubleQuote;
      currentStatement += char;
    } else if (char === '$' && !inSingleQuote && !inDoubleQuote) {
      if (inDollarQuote) {
        if (sql.substring(i, i + dollarTag.length) === dollarTag) {
          inDollarQuote = false;
          currentStatement += dollarTag;
          i += dollarTag.length - 1;
        } else {
          currentStatement += char;
        }
      } else {
        const match = sql.substring(i).match(/^(\$[a-zA-Z0-9_]*\$)/);
        if (match) {
          inDollarQuote = true;
          dollarTag = match[1];
          currentStatement += dollarTag;
          i += dollarTag.length - 1;
        } else {
          currentStatement += char;
        }
      }
    } else if (char === '-' && sql[i + 1] === '-' && !inSingleQuote && !inDoubleQuote && !inDollarQuote) {
      const eol = sql.indexOf('\n', i);
      if (eol === -1) {
        currentStatement += sql.substring(i);
        break;
      }
      currentStatement += sql.substring(i, eol);
      i = eol - 1;
    } else if (char === '/' && sql[i + 1] === '*' && !inSingleQuote && !inDoubleQuote && !inDollarQuote) {
      const endBlock = sql.indexOf('*/', i);
      if (endBlock === -1) {
        currentStatement += sql.substring(i);
        break;
      }
      currentStatement += sql.substring(i, endBlock + 2);
      i = endBlock + 1;
    } else if (char === ';' && !inSingleQuote && !inDoubleQuote && !inDollarQuote) {
      if (currentStatement.trim()) {
        statements.push(currentStatement.trim());
      }
      currentStatement = '';
    } else {
      currentStatement += char;
    }
  }

  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  return statements;
}

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
      const statements = splitSqlStatements(migrationFile);

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
