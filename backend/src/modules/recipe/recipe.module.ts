import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from '../auth/auth.module';
import { AddRecipeFavoriteUseCase } from './application/use-cases/add-recipe-favorite.usecase';
import { ApproveRecipeUseCase } from './application/use-cases/approve-recipe.usecase';
import { CreateRecipeUseCase } from './application/use-cases/create-recipe.usecase';
import { UpdateRecipeUseCase } from './application/use-cases/update-recipe.usecase';
import { UploadRecipeImageUseCase } from './application/use-cases/upload-recipe-image.usecase';
import { DeleteRecipeUseCase } from './application/use-cases/delete-recipe.usecase';
import { GetEquipmentUseCase } from './application/use-cases/get-equipment.usecase';
import { GetRecipeByIdUseCase } from './application/use-cases/get-recipe-by-id.usecase';
import { GetRecipeTypesUseCase } from './application/use-cases/get-recipe-types.usecase';
import { GetRecipesUseCase } from './application/use-cases/get-recipes.usecase';
import { RejectRecipeUseCase } from './application/use-cases/reject-recipe.usecase';
import { RemoveRecipeFavoriteUseCase } from './application/use-cases/remove-recipe-favorite.usecase';
import { RECIPE_FAVORITE_REPOSITORY } from './domain/repositories/recipe-favorite.repository';
import { RECIPE_REPOSITORY } from './domain/repositories/recipe.repository';
import {
  EquipmentOrmEntity,
  EquipmentOrmEntitySchema,
} from './infrastructure/mikroorm/equipment.orm-entity';
import {
  RecipeEquipmentOrmEntity,
  RecipeEquipmentOrmEntitySchema,
} from './infrastructure/mikroorm/recipe-equipment.orm-entity';
import {
  RecipeFavoriteOrmEntity,
  RecipeFavoriteOrmEntitySchema,
} from './infrastructure/mikroorm/recipe-favorite.orm-entity';
import {
  RecipeIngredientOrmEntity,
  RecipeIngredientOrmEntitySchema,
} from './infrastructure/mikroorm/recipe-ingredient.orm-entity';
import {
  RecipeOrmEntity,
  RecipeOrmEntitySchema,
} from './infrastructure/mikroorm/recipe.orm-entity';
import {
  RecipeStepOrmEntity,
  RecipeStepOrmEntitySchema,
} from './infrastructure/mikroorm/recipe-step.orm-entity';
import {
  RecipeTypeOrmEntity,
  RecipeTypeOrmEntitySchema,
} from './infrastructure/mikroorm/recipe-type.orm-entity';
import {
  UserOrmEntity,
  UserOrmEntitySchema,
} from './infrastructure/mikroorm/user.orm-entity';
import { MikroOrmRecipeFavoriteRepository } from './infrastructure/repositories/recipe-favorite.repository.impl';
import { MikroOrmRecipeRepository } from './infrastructure/repositories/recipe.repository.impl';
import { RecipeController } from './presentation/recipe.controller';

@Module({
  imports: [
    AuthModule,
    MikroOrmModule.forFeature([
      RecipeOrmEntitySchema,
      RecipeOrmEntity,
      RecipeTypeOrmEntitySchema,
      RecipeTypeOrmEntity,
      EquipmentOrmEntitySchema,
      EquipmentOrmEntity,
      RecipeIngredientOrmEntitySchema,
      RecipeIngredientOrmEntity,
      RecipeStepOrmEntitySchema,
      RecipeStepOrmEntity,
      RecipeEquipmentOrmEntitySchema,
      RecipeEquipmentOrmEntity,
      RecipeFavoriteOrmEntitySchema,
      RecipeFavoriteOrmEntity,
      UserOrmEntitySchema,
      UserOrmEntity,
    ]),
  ],
  controllers: [RecipeController],
  providers: [
    GetRecipesUseCase,
    GetRecipeByIdUseCase,
    GetRecipeTypesUseCase,
    GetEquipmentUseCase,
    CreateRecipeUseCase,
    UpdateRecipeUseCase,
    DeleteRecipeUseCase,
    UploadRecipeImageUseCase,
    AddRecipeFavoriteUseCase,
    RemoveRecipeFavoriteUseCase,
    ApproveRecipeUseCase,
    RejectRecipeUseCase,
    {
      provide: RECIPE_REPOSITORY,
      useClass: MikroOrmRecipeRepository,
    },
    {
      provide: RECIPE_FAVORITE_REPOSITORY,
      useClass: MikroOrmRecipeFavoriteRepository,
    },
  ],
})
export class RecipeModule {}
