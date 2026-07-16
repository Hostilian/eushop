const test = require('node:test');
const assert = require('node:assert/strict');
const { compatibleSql, databaseConfig, loadPlan, shouldRefuseUntrackedSchema } = require('./migrate');
const { assertDevelopmentSeedAllowed } = require('./seed');

test('migration manifest is ordered, unique, and resolvable', () => {
  const plan = loadPlan();
  assert.deepEqual(plan.map((item) => item.name), [...plan.map((item) => item.name)].sort());
  assert.equal(new Set(plan.map((item) => item.name)).size, plan.length);
});

test('legacy unsupported constraint syntax is removed only from migration 002', () => {
  const migration = loadPlan().find((item) => item.name.startsWith('002_'));
  assert.doesNotMatch(compatibleSql(migration), /ADD CONSTRAINT IF NOT EXISTS/);
});

test('database connections have a bounded timeout', () => {
  assert.equal(databaseConfig({}).connectionTimeoutMillis, 5000);
});

test('existing schemas without migration history fail closed', () => {
  assert.equal(shouldRefuseUntrackedSchema(0, 1), true);
  assert.equal(shouldRefuseUntrackedSchema(0, 0), false);
  assert.equal(shouldRefuseUntrackedSchema(1, 5), false);
});

test('seed fails closed unless explicitly enabled for development', () => {
  assert.throws(() => assertDevelopmentSeedAllowed({ NODE_ENV: 'production', EUSHOP_ALLOW_DEV_SEED: '1' }));
  assert.throws(() => assertDevelopmentSeedAllowed({ NODE_ENV: 'development' }));
  assert.doesNotThrow(() => assertDevelopmentSeedAllowed({ NODE_ENV: 'development', EUSHOP_ALLOW_DEV_SEED: '1' }));
});
