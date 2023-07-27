const { spawn } = require('child_process');

const child = spawn('node', ['.'], {
  stdio: 'inherit',
});

child.on('close', (code) => {
  console.log(`Child process exited with code ${code}`);
});
