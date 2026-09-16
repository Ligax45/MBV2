import { Migration } from '@mikro-orm/migrations';

export class Migration20260916180000_AddRecipeFavoriteSortOrder extends Migration {
  override up(): void {
    this.addSql(
      'ALTER TABLE recipe_favorites ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;',
    );

    this.addSql(`
WITH ranked AS (
  SELECT
    user_id,
    recipe_id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY created_at ASC
    ) - 1 AS position
  FROM recipe_favorites
)
UPDATE recipe_favorites AS favorites
SET sort_order = ranked.position
FROM ranked
WHERE favorites.user_id = ranked.user_id
  AND favorites.recipe_id = ranked.recipe_id;
`);

    this.addSql(
      'CREATE INDEX idx_recipe_favorites_user_sort ON recipe_favorites(user_id, sort_order);',
    );
  }

  override down(): void {
    this.addSql('DROP INDEX IF EXISTS idx_recipe_favorites_user_sort;');
    this.addSql(
      'ALTER TABLE recipe_favorites DROP COLUMN IF EXISTS sort_order;',
    );
  }
}
