import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../auth/presentation/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/domain/auth-user.model';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../auth/presentation/optional-jwt-auth.guard';
import { AddRecipeFavoriteUseCase } from '../application/use-cases/add-recipe-favorite.usecase';
import { CreateRecipeUseCase } from '../application/use-cases/create-recipe.usecase';
import { DeleteRecipeUseCase } from '../application/use-cases/delete-recipe.usecase';
import { GetRecipeByIdUseCase } from '../application/use-cases/get-recipe-by-id.usecase';
import { GetEquipmentUseCase } from '../application/use-cases/get-equipment.usecase';
import { GetRecipeTypesUseCase } from '../application/use-cases/get-recipe-types.usecase';
import { GetRecipesUseCase } from '../application/use-cases/get-recipes.usecase';
import { RemoveRecipeFavoriteUseCase } from '../application/use-cases/remove-recipe-favorite.usecase';
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
    private readonly deleteRecipe: DeleteRecipeUseCase,
    private readonly uploadRecipeImage: UploadRecipeImageUseCase,
    private readonly addRecipeFavorite: AddRecipeFavoriteUseCase,
    private readonly removeRecipeFavorite: RemoveRecipeFavoriteUseCase,
  ) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async list(
    @Query('favorites') favorites?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.getRecipes.execute({
      favoritesOnly: favorites === 'true',
      userId: user?.id,
    });
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
  @UseGuards(OptionalJwtAuthGuard)
  async getOne(
    @Param('id') id: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.getRecipeById.execute(id, user?.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateRecipeParams,
  ) {
    return this.createRecipe.execute(body, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateRecipeParams,
  ) {
    return this.updateRecipe.execute(id, body, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.deleteRecipe.execute(id, user);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async addFavorite(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.addRecipeFavorite.execute(id, user);
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async removeFavorite(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.removeRecipeFavorite.execute(id, user);
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', recipeImageUploadOptions))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadRecipeImage.execute(id, file);
  }
}
