import type { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  RecipeCompletionRepository,
  RecipePublicComment,
} from '../../domain/repositories/recipe-completion.repository';
import { RecipeCompletionOrmEntity } from '../mikroorm/recipe-completion.orm-entity';
import { RecipeOrmEntity } from '../mikroorm/recipe.orm-entity';
import { UserOrmEntity } from '../mikroorm/user.orm-entity';

@Injectable()
export class MikroOrmRecipeCompletionRepository implements RecipeCompletionRepository {
  constructor(
    @InjectRepository(RecipeCompletionOrmEntity)
    private readonly completionRepo: EntityRepository<RecipeCompletionOrmEntity>,
    @InjectRepository(RecipeOrmEntity)
    private readonly recipeRepo: EntityRepository<RecipeOrmEntity>,
  ) {}

  async hasCompleted(userId: string, recipeId: string): Promise<boolean> {
    const count = await this.completionRepo.count({
      user: userId,
      recipe: recipeId,
    });
    return count > 0;
  }

  async markCompleted(userId: string, recipeId: string): Promise<void> {
    const recipeExists = await this.recipeRepo.count({ id: recipeId });
    if (!recipeExists) {
      throw new NotFoundException('Recette introuvable');
    }

    const alreadyCompleted = await this.hasCompleted(userId, recipeId);
    if (alreadyCompleted) {
      throw new ConflictException('Vous avez déjà marqué cette recette comme réalisée');
    }

    const em = this.completionRepo.getEntityManager();
    const completion = new RecipeCompletionOrmEntity();
    completion.user = em.getReference(UserOrmEntity, userId);
    completion.recipe = em.getReference(RecipeOrmEntity, recipeId);
    em.persist(completion);
    await em.flush();
  }

  async getUserComment(userId: string, recipeId: string): Promise<string | null> {
    const row = await this.completionRepo.findOne({
      user: userId,
      recipe: recipeId,
    });
    const comment = row?.comment?.trim();
    return comment ? comment : null;
  }

  async setUserComment(
    userId: string,
    recipeId: string,
    comment: string | null,
  ): Promise<void> {
    const row = await this.completionRepo.findOne({
      user: userId,
      recipe: recipeId,
    });
    if (!row) {
      throw new NotFoundException('Réalisation introuvable');
    }

    row.comment = comment;
    row.commentUpdatedAt = comment ? new Date() : null;
    await this.completionRepo.getEntityManager().flush();
  }

  async listPublicComments(recipeId: string): Promise<RecipePublicComment[]> {
    const em = this.completionRepo.getEntityManager();
    const rows = await em.getConnection().execute<
      Array<{
        user_id: string;
        pseudo: string;
        comment: string;
        comment_updated_at: Date | string | null;
        completed_at: Date | string;
      }>
    >(
      `SELECT c.user_id,
              u.pseudo,
              c.comment,
              c.comment_updated_at,
              c.completed_at
       FROM recipe_completions c
       INNER JOIN users u ON u.id = c.user_id
       WHERE c.recipe_id = ?
         AND c.comment IS NOT NULL
         AND BTRIM(c.comment) <> ''
       ORDER BY COALESCE(c.comment_updated_at, c.completed_at) DESC`,
      [recipeId],
    );

    return rows.map((row) => ({
      userId: row.user_id,
      authorName: row.pseudo,
      comment: row.comment.trim(),
      updatedAt: new Date(
        row.comment_updated_at ?? row.completed_at,
      ).toISOString(),
    }));
  }
}
