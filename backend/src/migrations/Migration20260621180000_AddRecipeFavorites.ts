import { Migration } from '@mikro-orm/migrations';

export class Migration20260621180000_AddRecipeFavorites extends Migration {
  override up(): void {
    this.addSql(`CREATE TABLE recipe_favorites (
  user_id UUID NOT NULL,
  recipe_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id),
  CONSTRAINT fk_fav_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);`);

    this.addSql(
      'CREATE INDEX idx_recipe_favorites_user ON recipe_favorites(user_id);',
    );
    this.addSql(
      'CREATE INDEX idx_recipe_favorites_recipe ON recipe_favorites(recipe_id);',
    );
  }

  override down(): void {
    this.addSql('DROP TABLE IF EXISTS recipe_favorites;');
  }
}
