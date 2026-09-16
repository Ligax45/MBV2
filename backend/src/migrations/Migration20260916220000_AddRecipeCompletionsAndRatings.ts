import { Migration } from '@mikro-orm/migrations';

export class Migration20260916220000_AddRecipeCompletionsAndRatings extends Migration {
  override up(): void {
    this.addSql(`
CREATE TABLE recipe_completions (
  user_id UUID NOT NULL,
  recipe_id UUID NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT recipe_completions_pkey PRIMARY KEY (user_id, recipe_id),
  CONSTRAINT recipe_completions_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT recipe_completions_recipe_id_foreign FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON UPDATE CASCADE ON DELETE CASCADE
);
`);

    this.addSql(`
CREATE TABLE recipe_ratings (
  user_id UUID NOT NULL,
  recipe_id UUID NOT NULL,
  rating SMALLINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT recipe_ratings_pkey PRIMARY KEY (user_id, recipe_id),
  CONSTRAINT recipe_ratings_rating_check CHECK (rating >= 1 AND rating <= 10),
  CONSTRAINT recipe_ratings_user_id_foreign FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT recipe_ratings_recipe_id_foreign FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON UPDATE CASCADE ON DELETE CASCADE
);
`);

    this.addSql(
      'CREATE INDEX idx_recipe_completions_recipe_id ON recipe_completions (recipe_id);',
    );
    this.addSql(
      'CREATE INDEX idx_recipe_ratings_recipe_id ON recipe_ratings (recipe_id);',
    );
  }

  override down(): void {
    this.addSql('DROP TABLE IF EXISTS recipe_ratings;');
    this.addSql('DROP TABLE IF EXISTS recipe_completions;');
  }
}
