import { Injectable } from '@nestjs/common';
import { generateSecret, generateURI, verifySync } from 'otplib';

const APP_NAME = 'MiamBook';

@Injectable()
export class MfaService {
  generateSecret(): string {
    return generateSecret();
  }

  buildOtpAuthUri(identifiant: string, secret: string): string {
    return generateURI({
      issuer: APP_NAME,
      label: identifiant,
      secret,
    });
  }

  verifyToken(secret: string, token: string): boolean {
    try {
      const result = verifySync({ secret, token: token.trim() });
      return result.valid;
    } catch {
      return false;
    }
  }
}
