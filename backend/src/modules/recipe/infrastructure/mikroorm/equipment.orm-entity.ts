import { EntitySchema } from '@mikro-orm/core';

export class EquipmentOrmEntity {
  id!: string;

  label!: string;
}

export const EquipmentOrmEntitySchema = new EntitySchema<EquipmentOrmEntity>({
  class: EquipmentOrmEntity,
  tableName: 'equipment',
  properties: {
    id: { primary: true, type: 'uuid', defaultRaw: 'gen_random_uuid()' },
    label: { type: 'string', length: 64 },
  },
});
