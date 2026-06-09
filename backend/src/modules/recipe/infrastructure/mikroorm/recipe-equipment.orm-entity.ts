import { EntitySchema, ReferenceKind } from '@mikro-orm/core';
import { EquipmentOrmEntity } from './equipment.orm-entity';
import { RecipeOrmEntity } from './recipe.orm-entity';

export class RecipeEquipmentOrmEntity {
  recipe!: RecipeOrmEntity;

  equipment!: EquipmentOrmEntity;
}

export const RecipeEquipmentOrmEntitySchema =
  new EntitySchema<RecipeEquipmentOrmEntity>({
    class: RecipeEquipmentOrmEntity,
    tableName: 'recipe_equipment',
    properties: {
      recipe: {
        kind: ReferenceKind.MANY_TO_ONE,
        entity: () => RecipeOrmEntity,
        primary: true,
        fieldNames: ['recipe_id'],
        nullable: false,
      },
      equipment: {
        kind: ReferenceKind.MANY_TO_ONE,
        entity: () => EquipmentOrmEntity,
        primary: true,
        fieldNames: ['equipment_id'],
        nullable: false,
      },
    },
  });
