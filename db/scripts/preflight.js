#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const { loadPlan } = require('./migrate');

const required = [['node', ['--version']], ['pnpm', ['--version']], ['java', ['--version']]];
const optional = [['docker', ['--version']], ['mvn', ['--version']]];
let failed = false;

for (const [tool, args] of [...required, ...optional]) {
  const result = spawnSync(tool, args, { encoding: 'utf8', shell: process.platform === 'win32' });
  const isRequired = required.some(([name]) => name === tool);
  if (result.status === 0) {
    console.log(`ok       ${tool}: ${(result.stdout || result.stderr).split(/\r?\n/)[0]}`);
  } else {
    console.log(`${isRequired ? 'missing ' : 'optional'} ${tool}`);
    if (isRequired) failed = true;
  }
}

try {
  console.log(`ok       migrations: ${loadPlan().length} supported files`);
} catch (error) {
  console.error(`invalid  migrations: ${error.message}`);
  failed = true;
}

console.log('note     Docker is needed only for repository-managed PostgreSQL/Redis; Maven is optional when mvnw is present.');
if (failed) process.exitCode = 1;
