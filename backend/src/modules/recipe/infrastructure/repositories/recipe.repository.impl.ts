import type { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Recipe } from '../../domain/entities/recipe.entity';
import type {
  CreateRecipeParams,
  RecipeRepository,
} from '../../domain/repositories/recipe.repository';
import { EquipmentOrmEntity } from '../mikroorm/equipment.orm-entity';
import { RecipeEquipmentOrmEntity } from '../mikroorm/recipe-equipment.orm-entity';
import { RecipeIngredientOrmEntity } from '../mikroorm/recipe-ingredient.orm-entity';
import { RecipeOrmEntity } from '../mikroorm/recipe.orm-entity';
import { RecipeStepOrmEntity } from '../mikroorm/recipe-step.orm-entity';
import { RecipeTypeOrmEntity } from '../mikroorm/recipe-type.orm-entity';
import { UserOrmEntity } from '../mikroorm/user.orm-entity';

@Injectable()
export class MikroOrmRecipeRepository implements RecipeRepository {
  constructor(
    @InjectRepository(RecipeOrmEntity)
    private readonly repo: EntityRepository<RecipeOrmEntity>,
    @InjectRepository(RecipeIngredientOrmEntity)
    private readonly ingredientRepo: EntityRepository<RecipeIngredientOrmEntity>,
    @InjectRepository(RecipeStepOrmEntity)
    private readonly stepRepo: EntityRepository<RecipeStepOrmEntity>,
    @InjectRepository(RecipeEquipmentOrmEntity)
    private readonly recipeEquipmentRepo: EntityRepository<RecipeEquipmentOrmEntity>,
  ) {}

  async findById(id: string): Promise<Recipe | null> {
    const r = await this.repo.findOne({ id }, { populate: ['recipeType', 'author'] });
    if (!r) return null;
    const details = await this.loadDetails(id);
    return this.toDomain(r, details);
  }

  async findAll(): Promise<Recipe[]> {
    const rows = await this.repo.findAll({
      populate: ['recipeType', 'author'],
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async create(params: CreateRecipeParams): Promise<Recipe> {
    const em = this.repo.getEntityManager();
    const entity = new RecipeOrmEntity();
    entity.title = params.title;
    entity.description = params.description;
    entity.imageUrl = params.imageUrl ?? null;
    entity.difficulty = params.difficulty;
    entity.servings = params.servings;
    entity.recipeType = em.getReference(
      RecipeTypeOrmEntity,
      params.recipeTypeId,
    );
    entity.author = params.authorUserId
      ? em.getReference(UserOrmEntity, params.authorUserId)
      : null;
    entity.prepMinutes = params.prepMinutes ?? 0;
    entity.cookMinutes = params.cookMinutes ?? 0;
    entity.restMinutes = params.restMinutes ?? 0;

    em.persist(entity);
    await em.flush();
    await this.replaceDetails(entity.id, params);
    await em.populate(entity, ['recipeType', 'author']);

    const details = await this.loadDetails(entity.id);
    return this.toDomain(entity, details);
  }

  async update(id: string, params: CreateRecipeParams): Promise<Recipe | null> {
    const entity = await this.repo.findOne({ id }, { populate: ['recipeType', 'author'] });
    if (!entity) return null;

    const em = this.repo.getEntityManager();
    entity.title = params.title;
    entity.description = params.description;
    if (params.imageUrl !== undefined) {
      entity.imageUrl = params.imageUrl ?? null;
    }
    entity.difficulty = params.difficulty;
    entity.servings = params.servings;
    entity.recipeType = em.getReference(
      RecipeTypeOrmEntity,
      params.recipeTypeId,
    );
    entity.author = params.authorUserId
      ? em.getReference(UserOrmEntity, params.authorUserId)
      : null;
    entity.prepMinutes = params.prepMinutes ?? 0;
    entity.cookMinutes = params.cookMinutes ?? 0;
    entity.restMinutes = params.restMinutes ?? 0;

    await em.flush();
    await this.replaceDetails(id, params);
    await em.populate(entity, ['recipeType', 'author']);

    const details = await this.loadDetails(id);
    return this.toDomain(entity, details);
  }

  async updateImageUrl(id: string, imageUrl: string): Promise<Recipe | null> {
    const entity = await this.repo.findOne({ id }, { populate: ['recipeType', 'author'] });
    if (!entity) return null;

    entity.imageUrl = imageUrl;
    await this.repo.getEntityManager().flush();
    await this.repo.getEntityManager().populate(entity, ['recipeType', 'author']);

    const details = await this.loadDetails(id);
    return this.toDomain(entity, details);
  }

  async delete(id: string): Promise<boolean> {
    const entity = await this.repo.findOne({ id });
    if (!entity) return false;

    const em = this.repo.getEntityManager();
    em.remove(entity);
    await em.flush();
    return true;
  }

  private async loadDetails(recipeId: string) {
    const [ingredients, steps, recipeEquipment] = await Promise.all([
      this.ingredientRepo.find(
        { recipe: recipeId },
        { orderBy: { position: 'asc' } },
      ),
      this.stepRepo.find(
        { recipe: recipeId },
        { orderBy: { stepOrder: 'asc' } },
      ),
      this.recipeEquipmentRepo.find(
        { recipe: recipeId },
        { populate: ['equipment'], orderBy: { equipment: { label: 'asc' } } },
      ),
    ]);

    return {
      ingredients: ingredients.map((ingredient) => ({
        id: ingredient.id,
        position: ingredient.position,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        name: ingredient.name,
      })),
      steps: steps.map((step) => ({
        id: step.id,
        order: step.stepOrder,
        content: step.content,
      })),
      equipment: recipeEquipment.map((link) => ({
        id: link.equipment.id,
        label: link.equipment.label,
      })),
    };
  }

  private async replaceDetails(
    recipeId: string,
    params: CreateRecipeParams,
  ): Promise<void> {
    const em = this.repo.getEntityManager();

    await em.nativeDelete(RecipeIngredientOrmEntity, { recipe: recipeId });
    await em.nativeDelete(RecipeStepOrmEntity, { recipe: recipeId });
    await em.nativeDelete(RecipeEquipmentOrmEntity, { recipe: recipeId });

    const recipeRef = em.getReference(RecipeOrmEntity, recipeId);

    const ingredients = (params.ingredients ?? []).filter((item) =>
      item.name.trim(),
    );
    ingredients.forEach((item, index) => {
      const ingredient = new RecipeIngredientOrmEntity();
      ingredient.recipe = recipeRef;
      ingredient.position = index;
      ingredient.quantity = item.quantity.trim() || '0';
      ingredient.unit = item.unit.trim();
      ingredient.name = item.name.trim();
      em.persist(ingredient);
    });

    const steps = (params.steps ?? []).filter((item) => item.content.trim());
    steps.forEach((item, index) => {
      const step = new RecipeStepOrmEntity();
      step.recipe = recipeRef;
      step.stepOrder = item.order > 0 ? item.order : index + 1;
      step.content = item.content.trim();
      em.persist(step);
    });

    const equipmentIds = [...new Set(params.equipmentIds ?? [])];
    equipmentIds.forEach((equipmentId) => {
      const link = new RecipeEquipmentOrmEntity();
      link.recipe = recipeRef;
      link.equipment = em.getReference(EquipmentOrmEntity, equipmentId);
      em.persist(link);
    });

    await em.flush();
  }

  private toDomain(
    r: RecipeOrmEntity,
    details?: {
      ingredients: Recipe['ingredients'];
      steps: Recipe['steps'];
      equipment: Recipe['equipment'];
    },
  ): Recipe {
    return new Recipe(
      r.id,
      r.title,
      r.description,
      r.difficulty,
      r.servings,
      { id: r.recipeType.id, label: r.recipeType.label },
      r.imageUrl ?? null,
      r.author?.id ?? null,
      r.author?.pseudo ?? null,
      r.prepMinutes,
      r.cookMinutes,
      r.restMinutes,
      r.createdAt,
      r.updatedAt,
      details?.ingredients ?? [],
      details?.steps ?? [],
      details?.equipment ?? [],
    );
  }
}
