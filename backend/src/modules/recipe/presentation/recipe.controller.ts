import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateRecipeUseCase } from '../application/use-cases/create-recipe.usecase';
import { GetRecipeByIdUseCase } from '../application/use-cases/get-recipe-by-id.usecase';
import { GetEquipmentUseCase } from '../application/use-cases/get-equipment.usecase';
import { GetRecipeTypesUseCase } from '../application/use-cases/get-recipe-types.usecase';
import { GetRecipesUseCase } from '../application/use-cases/get-recipes.usecase';
import { UpdateRecipeUseCase } from '../application/use-cases/update-recipe.usecase';
import { UploadRecipeImageUseCase } from '../application/use-cases/upload-recipe-image.usecase';
import type { CreateRecipeParams } from '../domain/repositories/recipe.repository';
import { recipeImageUploadOptions } from './recipe-image-upload.filter';

@Controller('recipes')
export class RecipeController {
  constructor(
    private readonly getRecipes: GetRecipesUseCase,
    private readonly getRecipeById: GetRecipeByIdUseCase,
    private readonly getRecipeTypes: GetRecipeTypesUseCase,
    private readonly getEquipment: GetEquipmentUseCase,
    private readonly createRecipe: CreateRecipeUseCase,
    private readonly updateRecipe: UpdateRecipeUseCase,
    private readonly uploadRecipeImage: UploadRecipeImageUseCase,
  ) {}

  @Get()
  async list() {
    return this.getRecipes.execute();
  }

  @Get('types')
  async listTypes() {
    return this.getRecipeTypes.execute();
  }

  @Get('equipment')
  async listEquipment() {
    return this.getEquipment.execute();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.getRecipeById.execute(id);
  }

  @Post()
  async create(@Body() body: CreateRecipeParams) {
    return this.createRecipe.execute(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: CreateRecipeParams) {
    return this.updateRecipe.execute(id, body);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file', recipeImageUploadOptions))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadRecipeImage.execute(id, file);
  }
}
