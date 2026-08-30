import { Migration } from '@mikro-orm/migrations';

export class Migration20260830100000_AddRecipeVisibilityAndModeration extends Migration {
  override up(): void {
    this.addSql(`
      ALTER TABLE recipes
        ADD COLUMN visibility VARCHAR(20) NOT NULL DEFAULT 'public',
        ADD COLUMN moderation_status VARCHAR(20) NOT NULL DEFAULT 'approved',
        ADD COLUMN moderation_comment TEXT,
        ADD COLUMN reviewed_at TIMESTAMP,
        ADD COLUMN reviewed_by_user_id UUID;
    `);

    this.addSql(`
      ALTER TABLE recipes
        ADD CONSTRAINT recipes_visibility_check
        CHECK (visibility IN ('public', 'private'));
    `);

    this.addSql(`
      ALTER TABLE recipes
        ADD CONSTRAINT recipes_moderation_status_check
        CHECK (moderation_status IN ('pending', 'approved', 'rejected'));
    `);

    this.addSql(`
      ALTER TABLE recipes
        ADD CONSTRAINT fk_recipes_reviewed_by
        FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
    `);

    this.addSql(
      'CREATE INDEX idx_recipes_visibility_moderation ON recipes(moderation_status, visibility);',
    );

    this.addSql(`
      UPDATE recipes
      SET visibility = 'public', moderation_status = 'approved';
    `);
  }

  override down(): void {
    this.addSql(
      'DROP INDEX IF EXISTS idx_recipes_visibility_moderation;',
    );
    this.addSql(
      'ALTER TABLE recipes DROP CONSTRAINT IF EXISTS fk_recipes_reviewed_by;',
    );
    this.addSql(
      'ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_moderation_status_check;',
    );
    this.addSql(
      'ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_visibility_check;',
    );
    this.addSql(`
      ALTER TABLE recipes
        DROP COLUMN IF EXISTS reviewed_by_user_id,
        DROP COLUMN IF EXISTS reviewed_at,
        DROP COLUMN IF EXISTS moderation_comment,
        DROP COLUMN IF EXISTS moderation_status,
        DROP COLUMN IF EXISTS visibility;
    `);
  }
}
