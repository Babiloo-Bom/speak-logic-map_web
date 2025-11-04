

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

console.log('\n========================================');
console.log('Environment Secrets Generator');
console.log('========================================\n');

console.log('# JWT Secrets (copy to .env.local):');
console.log(`JWT_SECRET=${generateSecret(32)}`);
console.log(`JWT_REFRESH_SECRET=${generateSecret(32)}`);
console.log('');

console.log('# NextAuth Secret:');
console.log(`NEXTAUTH_SECRET=${generateSecret(32)}`);
console.log('');

console.log('# All secrets combined:');
console.log(`JWT_SECRET=${generateSecret(32)}`);
console.log(`JWT_REFRESH_SECRET=${generateSecret(32)}`);
console.log(`NEXTAUTH_SECRET=${generateSecret(32)}`);
console.log('');

console.log('========================================');
console.log('✅ Generated! Copy these to your .env.local file');
console.log('========================================\n');


