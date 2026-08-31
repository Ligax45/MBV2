import { Migration } from '@mikro-orm/migrations';

export class Migration20260831180000_AddRecipeStepTitle extends Migration {
  override up(): void {
    this.addSql(`
      ALTER TABLE recipe_steps
        ADD COLUMN title VARCHAR(120) NULL;
    `);
  }

  override down(): void {
    this.addSql(`
      ALTER TABLE recipe_steps
        DROP COLUMN IF EXISTS title;
    `);
  }
}
