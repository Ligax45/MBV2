import { Migration } from '@mikro-orm/migrations';

export class Migration20260505210000_InitialSchema extends Migration {
  override up(): void {
    this.addSql('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

    this.addSql(`CREATE TABLE recipe_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label VARCHAR(64) NOT NULL
);`);

    this.addSql(`CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label VARCHAR(64) NOT NULL
);`);

    this.addSql(`CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifiant VARCHAR(255) UNIQUE NOT NULL,
  pseudo VARCHAR(50) NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);`);

    this.addSql(`CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(500),
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('facile','moyen','difficile')),
  servings SMALLINT NOT NULL CHECK (servings >= 0),
  recipe_type_id UUID NOT NULL,
  author_user_id UUID,
  prep_minutes SMALLINT NOT NULL DEFAULT 0 CHECK (prep_minutes >= 0),
  cook_minutes SMALLINT NOT NULL DEFAULT 0 CHECK (cook_minutes >= 0),
  rest_minutes SMALLINT NOT NULL DEFAULT 0 CHECK (rest_minutes >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_recipes_type FOREIGN KEY (recipe_type_id) REFERENCES recipe_types(id),
  CONSTRAINT fk_recipes_author FOREIGN KEY (author_user_id) REFERENCES users(id)
);`);

    this.addSql('CREATE INDEX idx_recipes_type ON recipes(recipe_type_id);');
    this.addSql('CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);');
    this.addSql('CREATE INDEX idx_recipes_created_at ON recipes(created_at);');

    this.addSql(`CREATE TABLE recipe_equipment (
  recipe_id UUID NOT NULL,
  equipment_id UUID NOT NULL,
  PRIMARY KEY (recipe_id, equipment_id),
  CONSTRAINT fk_re FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  CONSTRAINT fk_eq FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);`);

    this.addSql(`CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL,
  position INTEGER NOT NULL CHECK (position >= 0),
  quantity VARCHAR(32) NOT NULL,
  unit VARCHAR(32) NOT NULL,
  name VARCHAR(120) NOT NULL,

  CONSTRAINT fk_ing_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);`);

    this.addSql(
      'CREATE INDEX idx_ing_recipe_pos ON recipe_ingredients(recipe_id, position);',
    );

    this.addSql(`CREATE TABLE recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL,
  step_order INTEGER NOT NULL CHECK (step_order >= 0),
  content TEXT NOT NULL,

  CONSTRAINT fk_step_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  CONSTRAINT uq_step_order UNIQUE (recipe_id, step_order)
);`);
  }

  override down(): void {
    this.addSql('DROP TABLE IF EXISTS recipe_steps CASCADE;');
    this.addSql('DROP TABLE IF EXISTS recipe_ingredients CASCADE;');
    this.addSql('DROP TABLE IF EXISTS recipe_equipment CASCADE;');
    this.addSql('DROP TABLE IF EXISTS recipes CASCADE;');
    this.addSql('DROP TABLE IF EXISTS users CASCADE;');
    this.addSql('DROP TABLE IF EXISTS equipment CASCADE;');
    this.addSql('DROP TABLE IF EXISTS recipe_types CASCADE;');
  }
}
