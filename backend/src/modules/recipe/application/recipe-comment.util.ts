import { BadRequestException } from '@nestjs/common';

export const RECIPE_COMMENT_MAX_LENGTH = 2000;

export function parseRecipeCommentInput(input: unknown): string | null {
  if (input == null) {
    return null;
  }

  if (typeof input !== 'string') {
    throw new BadRequestException('comment doit être une chaîne de caractères');
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.length > RECIPE_COMMENT_MAX_LENGTH) {
    throw new BadRequestException(
      `comment ne peut pas dépasser ${RECIPE_COMMENT_MAX_LENGTH} caractères`,
    );
  }

  return trimmed;
}
