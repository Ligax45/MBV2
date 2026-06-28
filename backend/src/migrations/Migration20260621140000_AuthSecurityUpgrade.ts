import { Migration } from '@mikro-orm/migrations';

export class Migration20260621140000_AuthSecurityUpgrade extends Migration {
  override up(): void {
    this.addSql(`
      ALTER TABLE users
        ADD COLUMN mfa_enabled BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN mfa_secret TEXT,
        ADD COLUMN requires_mfa BOOLEAN NOT NULL DEFAULT false;
    `);

    this.addSql(`
      CREATE TABLE refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        revoked_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    this.addSql(`
      CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
    `);

    this.addSql(`
      CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at)
        WHERE revoked_at IS NULL;
    `);
  }

  override down(): void {
    this.addSql('DROP TABLE IF EXISTS refresh_tokens;');
    this.addSql(`
      ALTER TABLE users
        DROP COLUMN IF EXISTS mfa_enabled,
        DROP COLUMN IF EXISTS mfa_secret,
        DROP COLUMN IF EXISTS requires_mfa;
    `);
  }
}
