import { JwtKeyService } from './jwt-key.service';

describe('JwtKeyService', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('refuse de démarrer en production sans clés JWT', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_PRIVATE_KEY;
    delete process.env.JWT_PUBLIC_KEY;

    expect(() => new JwtKeyService()).toThrow(
      /JWT_PRIVATE_KEY and JWT_PUBLIC_KEY are required/,
    );
  });

  it('génère des clés éphémères hors production', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.JWT_PRIVATE_KEY;
    delete process.env.JWT_PUBLIC_KEY;

    const service = new JwtKeyService();
    expect(service.privateKey).toContain('PRIVATE KEY');
    expect(service.publicKey).toContain('PUBLIC KEY');
  });
});
