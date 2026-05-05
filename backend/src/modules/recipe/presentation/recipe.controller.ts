import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateRecipeUseCase } from '../application/use-cases/create-recipe.usecase';
import { GetRecipeByIdUseCase } from '../application/use-cases/get-recipe-by-id.usecase';
import { GetRecipesUseCase } from '../application/use-cases/get-recipes.usecase';
import type { CreateRecipeParams } from '../domain/repositories/recipe.repository';

@Controller('recipes')
export class RecipeController {
  constructor(
    private readonly getRecipes: GetRecipesUseCase,
    private readonly getRecipeById: GetRecipeByIdUseCase,
    private readonly createRecipe: CreateRecipeUseCase,
  ) {}

  @Get()
  async list() {
    return this.getRecipes.execute();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.getRecipeById.execute(id);
  }

  @Post()
  async create(@Body() body: CreateRecipeParams) {
    return this.createRecipe.execute(body);
  }
}
