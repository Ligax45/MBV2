import { Injectable, Logger } from '@nestjs/common';
import { generateKeyPairSync } from 'crypto';

function normalizePem(value: string): string {
  return value.replace(/\\n/g, '\n').trim();
}

@Injectable()
export class JwtKeyService {
  private readonly logger = new Logger(JwtKeyService.name);

  readonly privateKey: string;
  readonly publicKey: string;

  constructor() {
    const envPrivate = process.env.JWT_PRIVATE_KEY;
    const envPublic = process.env.JWT_PUBLIC_KEY;

    if (envPrivate && envPublic) {
      this.privateKey = normalizePem(envPrivate);
      this.publicKey = normalizePem(envPublic);
      return;
    }

    const pair = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    this.privateKey = pair.privateKey.export({
      type: 'pkcs8',
      format: 'pem',
    }) as string;
    this.publicKey = pair.publicKey.export({
      type: 'spki',
      format: 'pem',
    }) as string;

    this.logger.warn(
      'JWT RSA keys not configured — using ephemeral dev keys (tokens invalid after restart). ' +
        'Run: npm run auth:generate-keys',
    );
  }
}
