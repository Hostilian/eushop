const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

const isWin = os.platform() === 'win32';
const cmd = isWin ? 'mvnw.cmd' : './mvnw';
const args = process.argv.slice(2);

console.log(`Executing: ${cmd} ${args.join(' ')}`);

const child = spawn(cmd, args, {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '../services/core-service')
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('Failed to start maven wrapper process:', err);
  process.exit(1);
});
