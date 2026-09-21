import { Migration } from '@mikro-orm/migrations';

export class Migration20260921120000_AddMealPlanEntries extends Migration {
  override up(): void {
    this.addSql(`CREATE TABLE meal_plan_entries (
  user_id UUID NOT NULL,
  plan_date DATE NOT NULL,
  recipe_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, plan_date),
  CONSTRAINT fk_meal_plan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_meal_plan_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);`);

    this.addSql(
      'CREATE INDEX idx_meal_plan_entries_user_date ON meal_plan_entries(user_id, plan_date);',
    );
  }

  override down(): void {
    this.addSql('DROP TABLE IF EXISTS meal_plan_entries;');
  }
}
