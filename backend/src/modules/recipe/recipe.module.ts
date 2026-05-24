import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CreateRecipeUseCase } from './application/use-cases/create-recipe.usecase';
import { UpdateRecipeUseCase } from './application/use-cases/update-recipe.usecase';
import { UploadRecipeImageUseCase } from './application/use-cases/upload-recipe-image.usecase';
import { GetRecipeByIdUseCase } from './application/use-cases/get-recipe-by-id.usecase';
import { GetRecipeTypesUseCase } from './application/use-cases/get-recipe-types.usecase';
import { GetRecipesUseCase } from './application/use-cases/get-recipes.usecase';
import { RECIPE_REPOSITORY } from './domain/repositories/recipe.repository';
import {
  RecipeOrmEntity,
  RecipeOrmEntitySchema,
} from './infrastructure/mikroorm/recipe.orm-entity';
import {
  RecipeTypeOrmEntity,
  RecipeTypeOrmEntitySchema,
} from './infrastructure/mikroorm/recipe-type.orm-entity';
import { MikroOrmRecipeRepository } from './infrastructure/repositories/recipe.repository.impl';
import { RecipeController } from './presentation/recipe.controller';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      RecipeOrmEntitySchema,
      RecipeOrmEntity,
      RecipeTypeOrmEntitySchema,
      RecipeTypeOrmEntity,
    ]),
  ],
  controllers: [RecipeController],
  providers: [
    GetRecipesUseCase,
    GetRecipeByIdUseCase,
    GetRecipeTypesUseCase,
    CreateRecipeUseCase,
    UpdateRecipeUseCase,
    UploadRecipeImageUseCase,
    {
      provide: RECIPE_REPOSITORY,
      useClass: MikroOrmRecipeRepository,
    },
  ],
})
export class RecipeModule {}
