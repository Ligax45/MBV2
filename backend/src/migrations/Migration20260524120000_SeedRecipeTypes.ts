import { Migration } from '@mikro-orm/migrations';

export class Migration20260524120000_SeedRecipeTypes extends Migration {
  override up(): void {
    this.addSql(`INSERT INTO recipe_types (label)
SELECT v.label FROM (VALUES
  ('Apéro'),
  ('Entrée'),
  ('Plat'),
  ('Dessert'),
  ('Sauce'),
  ('Autres')
) AS v(label)
WHERE NOT EXISTS (SELECT 1 FROM recipe_types LIMIT 1);`);
  }

  override down(): void {
    this.addSql(`DELETE FROM recipe_types WHERE label IN (
  'Apéro', 'Entrée', 'Plat', 'Dessert', 'Sauce', 'Autres'
);`);
  }
}
