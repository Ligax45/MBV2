import { Migration } from '@mikro-orm/migrations';

export class Migration20260621160000_AddUserRoles extends Migration {
  override up(): void {
    this.addSql(`
      ALTER TABLE users
        ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';
    `);

    this.addSql(`
      ALTER TABLE users
        ADD CONSTRAINT users_role_check
        CHECK (role IN ('user', 'moderator', 'admin'));
    `);

    this.addSql(`UPDATE users SET role = 'user' WHERE role IS NULL;`);
  }

  override down(): void {
    this.addSql(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;`);
    this.addSql(`ALTER TABLE users DROP COLUMN IF EXISTS role;`);
  }
}
