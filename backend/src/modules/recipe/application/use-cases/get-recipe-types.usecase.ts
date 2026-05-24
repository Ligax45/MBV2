import { InjectRepository } from '@mikro-orm/nestjs';
import type { EntityRepository } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { RecipeTypeOrmEntity } from '../../infrastructure/mikroorm/recipe-type.orm-entity';

@Injectable()
export class GetRecipeTypesUseCase {
  constructor(
    @InjectRepository(RecipeTypeOrmEntity)
    private readonly recipeTypeRepo: EntityRepository<RecipeTypeOrmEntity>,
  ) {}

  async execute() {
    const types = await this.recipeTypeRepo.findAll({
      orderBy: { label: 'asc' },
    });
    return types.map((t) => ({ id: t.id, label: t.label }));
  }
}
