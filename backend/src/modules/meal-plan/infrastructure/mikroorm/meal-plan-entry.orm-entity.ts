import { EntitySchema, ReferenceKind } from '@mikro-orm/core';
import { RecipeOrmEntity } from '../../../recipe/infrastructure/mikroorm/recipe.orm-entity';
import { UserOrmEntity } from '../../../recipe/infrastructure/mikroorm/user.orm-entity';

export class MealPlanEntryOrmEntity {
  user!: UserOrmEntity;

  planDate!: string;

  recipe!: RecipeOrmEntity;

  createdAt: Date = new Date();

  updatedAt: Date = new Date();
}

export const MealPlanEntryOrmEntitySchema =
  new EntitySchema<MealPlanEntryOrmEntity>({
    class: MealPlanEntryOrmEntity,
    tableName: 'meal_plan_entries',
    properties: {
      user: {
        kind: ReferenceKind.MANY_TO_ONE,
        entity: () => UserOrmEntity,
        primary: true,
        fieldNames: ['user_id'],
        nullable: false,
      },
      planDate: {
        type: 'date',
        primary: true,
        fieldNames: ['plan_date'],
        nullable: false,
      },
      recipe: {
        kind: ReferenceKind.MANY_TO_ONE,
        entity: () => RecipeOrmEntity,
        fieldNames: ['recipe_id'],
        nullable: false,
      },
      createdAt: {
        type: 'datetime',
        fieldNames: ['created_at'],
        defaultRaw: 'NOW()',
      },
      updatedAt: {
        type: 'datetime',
        fieldNames: ['updated_at'],
        defaultRaw: 'NOW()',
        onUpdate: () => new Date(),
      },
    },
  });
