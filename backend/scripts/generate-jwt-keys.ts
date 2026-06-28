import { generateKeyPairSync } from 'crypto';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' });
const publicPem = publicKey.export({ type: 'spki', format: 'pem' });

console.log('# RSA key pair for JWT (RS256)\n');
console.log('JWT_PRIVATE_KEY="' + String(privatePem).replace(/\n/g, '\\n') + '"');
console.log('JWT_PUBLIC_KEY="' + String(publicPem).replace(/\n/g, '\\n') + '"');
