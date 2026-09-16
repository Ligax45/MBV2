import { EntitySchema, ReferenceKind } from '@mikro-orm/core';
import { RecipeOrmEntity } from './recipe.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

export class RecipeCompletionOrmEntity {
  user!: UserOrmEntity;

  recipe!: RecipeOrmEntity;

  completedAt: Date = new Date();

  comment?: string | null;

  commentUpdatedAt?: Date | null;
}

export const RecipeCompletionOrmEntitySchema =
  new EntitySchema<RecipeCompletionOrmEntity>({
    class: RecipeCompletionOrmEntity,
    tableName: 'recipe_completions',
    properties: {
      user: {
        kind: ReferenceKind.MANY_TO_ONE,
        entity: () => UserOrmEntity,
        primary: true,
        fieldNames: ['user_id'],
        nullable: false,
      },
      recipe: {
        kind: ReferenceKind.MANY_TO_ONE,
        entity: () => RecipeOrmEntity,
        primary: true,
        fieldNames: ['recipe_id'],
        nullable: false,
      },
      completedAt: {
        type: 'datetime',
        fieldNames: ['completed_at'],
        defaultRaw: 'NOW()',
      },
      comment: { type: 'text', nullable: true },
      commentUpdatedAt: {
        type: 'datetime',
        fieldNames: ['comment_updated_at'],
        nullable: true,
      },
    },
  });
