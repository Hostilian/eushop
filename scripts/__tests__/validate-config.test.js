const { execFileSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

test('configuration validator succeeds without printing environment values', () => {
  const secret = 'must-not-be-logged';
  const output = execFileSync(process.execPath, ['scripts/validate-config.js'], {
    cwd: path.resolve(__dirname, '../..'),
    env: { ...process.env, EU_SHOP_VALIDATION_SENTINEL: secret },
    encoding: 'utf8',
  });
  assert.match(output, /configuration references are present/i);
  assert.doesNotMatch(output, new RegExp(secret));
});
