import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';

import type { RecipeDetail } from '@core/models/recipe-detail.model';
import { CurrentUserService } from '@core/services/current-user.service';
import { RecipeDataService } from '@core/services/recipe-data.service';
import {
  formatDateFr,
  formatIngredientLine,
  formatMinutes,
  getDifficultyLabel,
} from '@core/utils/recipe-format.util';
import { isPubliclyListed } from '@core/utils/recipe-visibility.util';
import { AlertService } from '@shared/services/alert.service';

type DetailTab = 'ingredients' | 'steps';

@Component({
  selector: 'app-recipe-details',
  imports: [RouterLink, ProgressSpinner],
  templateUrl: './recipe-details.component.html',
  styleUrl: './recipe-details.component.scss',
})
export class RecipeDetailsComponent implements OnInit {
  private readonly recipeData = inject(RecipeDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly alertService = inject(AlertService);
  private readonly currentUser = inject(CurrentUserService);

  protected readonly recipe = signal<RecipeDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly pageFailed = signal(false);
  protected readonly deleting = signal(false);
  protected readonly isLiked = computed(() => this.recipe()?.isFavorited ?? false);
  protected readonly togglingFavorite = signal(false);
  protected readonly activeTab = signal<DetailTab>('ingredients');

  protected readonly isAuthor = computed(() => {
    const detail = this.recipe();
    const userId = this.currentUser.userId();
    return !!detail && !!userId && detail.authorUserId === userId;
  });

  protected readonly canModify = computed(
    () => this.isAuthor() || this.currentUser.canModerateRecipes(),
  );

  protected readonly canFavorite = computed(() => {
    const detail = this.recipe();
    return !!detail && isPubliclyListed(detail);
  });

  protected readonly statusBadge = computed(() => {
    const detail = this.recipe();
    if (!detail) return null;
    if (detail.visibility === 'private') {
      return { kind: 'private', label: 'Privée' };
    }
    if (detail.moderationStatus === 'pending') {
      return { kind: 'pending', label: 'En attente de validation' };
    }
    if (detail.moderationStatus === 'rejected') {
      return { kind: 'rejected', label: 'Refusée' };
    }
    return null;
  });

  protected readonly fromModeration = signal(false);

  ngOnInit(): void {
    this.fromModeration.set(this.route.snapshot.queryParamMap.get('from') === 'moderation');
    const id = this.route.snapshot.paramMap.get('recipeId');
    if (!id) {
      this.pageFailed.set(true);
      this.loading.set(false);
      this.alertService.warning('Recette introuvable.');
      return;
    }
    this.loadRecipe(id);
  }

  protected totalTimeMinutes(recipe: RecipeDetail): number {
    return recipe.prepMinutes + recipe.cookMinutes + recipe.restMinutes;
  }

  protected formatDate(isoDate: string): string {
    return formatDateFr(isoDate);
  }

  protected formatTime(minutes: number): string {
    return formatMinutes(minutes);
  }

  protected formatIngredient(ingredient: RecipeDetail['ingredients'][0]): string {
    return formatIngredientLine(ingredient);
  }

  protected difficultyLabel(difficulty: RecipeDetail['difficulty']): string {
    return getDifficultyLabel(difficulty);
  }

  protected setActiveTab(tab: DetailTab): void {
    this.activeTab.set(tab);
  }

  protected toggleLike(): void {
    const detail = this.recipe();
    if (!detail || this.togglingFavorite() || !this.canFavorite()) {
      return;
    }

    if (!this.currentUser.isAuthenticated()) {
      void this.router.navigate(['/connexion'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    const next = !this.isLiked();
    this.togglingFavorite.set(true);

    this.recipeData.setRecipeFavorite(detail.id, next).subscribe({
      next: () => {
        this.togglingFavorite.set(false);
        this.recipe.set({ ...detail, isFavorited: next });
      },
      error: () => {
        this.togglingFavorite.set(false);
        this.alertService.error('Impossible de mettre à jour vos favoris.');
      },
    });
  }

  protected onDeleteRecipe(detail: RecipeDetail): void {
    if (!this.currentUser.userId() || this.deleting()) return;

    const confirmed = window.confirm(
      `Supprimer « ${detail.title} » ? Cette action est irréversible.`,
    );
    if (!confirmed) return;

    this.deleting.set(true);

    this.recipeData.deleteRecipe(detail.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.alertService.success('La recette a été supprimée.', 'Suppression', 4000);
        void this.router.navigate(['/bibliotheque']);
      },
      error: (err: unknown) => {
        this.deleting.set(false);
        if (err instanceof HttpErrorResponse && err.status === 403) {
          this.alertService.error('Seul l\u2019auteur peut supprimer cette recette.');
          return;
        }
        this.alertService.error('Impossible de supprimer la recette.');
      },
    });
  }

  private loadRecipe(id: string): void {
    this.loading.set(true);
    this.pageFailed.set(false);

    this.recipeData.getRecipeById(id).subscribe({
      next: (data) => {
        this.recipe.set(data);
        this.activeTab.set(data.ingredients.length > 0 ? 'ingredients' : 'steps');
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.pageFailed.set(true);
        this.loading.set(false);
        if (err instanceof Error && err.message === 'NOT_FOUND') {
          this.alertService.warning('Recette introuvable.');
        } else {
          this.alertService.error(
            'Impossible de charger la recette. Vérifiez que le backend tourne.',
          );
        }
      },
    });
  }
}
