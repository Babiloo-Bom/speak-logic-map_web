/**
 * Helper script to generate bcrypt password hashes for test users
 * Run with: node scripts/generate-password-hash.js <password>
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node generate-password-hash.js <password>');
  process.exit(1);
}

const saltRounds = 12;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }
  
  console.log('\n===========================================');
  console.log('Password Hash Generated');
  console.log('===========================================');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('Salt Rounds:', saltRounds);
  console.log('===========================================\n');
  
  // Verify the hash
  bcrypt.compare(password, hash, (err, result) => {
    if (err) {
      console.error('Error verifying hash:', err);
      return;
    }
    console.log('Verification:', result ? '✓ Success' : '✗ Failed');
  });
});

