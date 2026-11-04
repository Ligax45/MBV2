import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateRecipeIngredientDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  quantity!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  unit!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;
}

export class CreateRecipeStepDto {
  @IsInt()
  @Min(1)
  @Max(200)
  order!: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;
}

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  imageUrl?: string | null;

  @IsIn(['facile', 'moyen', 'difficile'])
  difficulty!: 'facile' | 'moyen' | 'difficile';

  @IsInt()
  @Min(0)
  @Max(99)
  servings!: number;

  @IsUUID()
  recipeTypeId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(24 * 60)
  prepMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(24 * 60)
  cookMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(24 * 60)
  restMinutes?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeIngredientDto)
  ingredients?: CreateRecipeIngredientDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeStepDto)
  steps?: CreateRecipeStepDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsUUID(undefined, { each: true })
  equipmentIds?: string[];

  @IsOptional()
  @IsIn(['private', 'public'])
  visibility?: 'private' | 'public';
}

export class RejectRecipeDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}

export class SetRecipeRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;
}

export class SetRecipeCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  comment!: string;
}

export class ReorderFavoritesDto {
  @IsArray()
  @ArrayMaxSize(500)
  @IsUUID(undefined, { each: true })
  recipeIds!: string[];
}
