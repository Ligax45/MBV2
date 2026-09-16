import { Migration } from '@mikro-orm/migrations';

export class Migration20260916230000_AddRecipeCompletionComment extends Migration {
  override up(): void {
    this.addSql(`
ALTER TABLE recipe_completions
  ADD COLUMN comment TEXT NULL,
  ADD COLUMN comment_updated_at TIMESTAMPTZ NULL;
`);
  }

  override down(): void {
    this.addSql(`
ALTER TABLE recipe_completions
  DROP COLUMN IF EXISTS comment_updated_at,
  DROP COLUMN IF EXISTS comment;
`);
  }
}
