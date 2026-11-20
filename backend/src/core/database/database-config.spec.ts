import { resolveDbConnection, shouldUseSsl } from './database-config';

describe('database-config', () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
  });

  it('cible la base locale par défaut', () => {
    delete process.env.DATABASE_URL;
    delete process.env.DB_HOST;
    delete process.env.DB_NAME;
    expect(resolveDbConnection()).toMatchObject({
      host: 'localhost',
      port: 5432,
      dbName: 'miambookv2_db',
    });
  });

  it('n’active le SSL que sur demande explicite', () => {
    delete process.env.DATABASE_URL;
    delete process.env.DB_SSL;
    process.env.DB_HOST = 'db.example.supabase.co';
    expect(shouldUseSsl()).toBe(false);

    process.env.DB_SSL = 'true';
    expect(shouldUseSsl()).toBe(true);

    process.env.DB_SSL = 'false';
    process.env.DATABASE_URL =
      'postgresql://postgres:secret@localhost:5432/miambookv2_db?sslmode=require';
    expect(shouldUseSsl()).toBe(false);

    delete process.env.DB_SSL;
    expect(shouldUseSsl()).toBe(true);
  });
});
