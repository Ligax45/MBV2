import { Migration } from '@mikro-orm/migrations';

export class Migration20260830120000_LimitRecipeServings extends Migration {
  override up(): void {
    this.addSql(`UPDATE recipes SET servings = 99 WHERE servings > 99;`);
    this.addSql(
      'ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_servings_check;',
    );
    this.addSql(`
      ALTER TABLE recipes
        ADD CONSTRAINT recipes_servings_check
        CHECK (servings >= 0 AND servings <= 99);
    `);
  }

  override down(): void {
    this.addSql(
      'ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_servings_check;',
    );
    this.addSql(`
      ALTER TABLE recipes
        ADD CONSTRAINT recipes_servings_check
        CHECK (servings >= 0);
    `);
  }
}
