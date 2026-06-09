import { InjectRepository } from '@mikro-orm/nestjs';
import type { EntityRepository } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { EquipmentOrmEntity } from '../../infrastructure/mikroorm/equipment.orm-entity';

@Injectable()
export class GetEquipmentUseCase {
  constructor(
    @InjectRepository(EquipmentOrmEntity)
    private readonly equipmentRepo: EntityRepository<EquipmentOrmEntity>,
  ) {}

  async execute() {
    const items = await this.equipmentRepo.findAll({
      orderBy: { label: 'asc' },
    });
    return items.map((item) => ({ id: item.id, label: item.label }));
  }
}
