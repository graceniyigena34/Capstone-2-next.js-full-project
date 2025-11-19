// Simple script to remove Next.js lock file
const fs = require('fs');
const path = require('path');

const lockPath = path.join(process.cwd(), '.next', 'dev', 'lock');

try {
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath);
    console.log('✓ Lock file removed successfully');
  } else {
    console.log('✓ No lock file found');
  }
  console.log('\n✓ Cleanup complete! You can now run: npm run dev');
} catch (error) {
  console.error('Error removing lock file:', error.message);
  process.exit(1);
}

