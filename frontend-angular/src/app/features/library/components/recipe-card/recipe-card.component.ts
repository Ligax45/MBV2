import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Card } from 'primeng/card';

import type { RecipeListItem } from '@core/models/recipe-list-item.model';
import { CurrentUserService } from '@core/services/current-user.service';
import { RecipeDataService } from '@core/services/recipe-data.service';
import {
  formatDateFr,
  formatMinutes,
  getDifficultyLabel,
} from '@core/utils/recipe-format.util';
import { isPubliclyListed } from '@core/utils/recipe-visibility.util';
import { RecipeStarRatingComponent } from '@shared/components/recipe-star-rating/recipe-star-rating.component';
import { AlertService } from '@shared/services/alert.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';

@Component({
  selector: 'app-recipe-card',
  imports: [RouterLink, Card, NgOptimizedImage, RecipeStarRatingComponent],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.scss',
})
export class RecipeCardComponent {
  readonly recipe = input.required<RecipeListItem>();
  readonly priority = input(false);
  readonly confirmBeforeUnfavorite = input(false);
  readonly favoriteChange = output<{ recipeId: string; isFavorited: boolean }>();

  private readonly recipeData = inject(RecipeDataService);
  private readonly currentUser = inject(CurrentUserService);
  private readonly router = inject(Router);
  private readonly alertService = inject(AlertService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly isLiked = computed(() => this.recipe().isFavorited ?? false);
  protected readonly canFavorite = computed(() => isPubliclyListed(this.recipe()));
  protected readonly statusBadge = computed(() => {
    const item = this.recipe();
    if (item.visibility === 'private') {
      return { kind: 'private', label: 'Privée' };
    }
    if (item.moderationStatus === 'pending') {
      return { kind: 'pending', label: 'En attente' };
    }
    if (item.moderationStatus === 'rejected') {
      return { kind: 'rejected', label: 'Refusée' };
    }
    return null;
  });
  protected readonly togglingFavorite = signal(false);
  protected readonly showRating = computed(
    () => (this.recipe().ratingCount ?? 0) > 0 && this.recipe().averageRating != null,
  );

  protected formatDate(isoDate: string): string {
    return formatDateFr(isoDate);
  }

  protected formatTime(minutes: number): string {
    return formatMinutes(minutes);
  }

  protected difficultyLabel(difficulty: RecipeListItem['difficulty']): string {
    return getDifficultyLabel(difficulty);
  }

  toggleLike(event: Event): void {
    event.stopPropagation();

    if (!this.canFavorite()) {
      return;
    }

    if (!this.currentUser.isAuthenticated()) {
      void this.router.navigate(['/connexion'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    if (this.togglingFavorite()) {
      return;
    }

    const next = !this.isLiked();

    if (!next && this.confirmBeforeUnfavorite()) {
      void this.confirmDialog
        .confirm({
          title: 'Retirer des favoris ?',
          message: `Voulez-vous retirer « ${this.recipe().title} » de vos favoris ?`,
          confirmLabel: 'Retirer',
          confirmSeverity: 'danger',
        })
        .then((confirmed) => {
          if (confirmed) {
            this.applyFavoriteChange(false);
          }
        });
      return;
    }

    this.applyFavoriteChange(next);
  }

  private applyFavoriteChange(next: boolean): void {
    if (this.togglingFavorite()) {
      return;
    }

    this.togglingFavorite.set(true);

    this.recipeData.setRecipeFavorite(this.recipe().id, next).subscribe({
      next: () => {
        this.togglingFavorite.set(false);
        this.favoriteChange.emit({
          recipeId: this.recipe().id,
          isFavorited: next,
        });
      },
      error: () => {
        this.togglingFavorite.set(false);
        this.alertService.error('Impossible de mettre à jour vos favoris.');
      },
    });
  }
}
