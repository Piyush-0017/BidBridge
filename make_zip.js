const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting archive creation...');
const cwd = process.cwd();
const dest = path.resolve(cwd, 'BidBridge.zip');

if (fs.existsSync(dest)) {
  fs.unlinkSync(dest);
}

const tarCmd = 'tar -a -c -f "BidBridge.zip" --exclude="node_modules" --exclude=".next" --exclude=".git" --exclude="*.zip" *';
console.log('Running:', tarCmd);
execSync(tarCmd, { stdio: 'inherit' });

if (fs.existsSync(dest)) {
  const stats = fs.statSync(dest);
  console.log('ARCHIVE_READY');
  console.log('Path:', dest);
  console.log('Size_MB:', (stats.size / 1024 / 1024).toFixed(2));
} else {
  console.error('File not created');
}
