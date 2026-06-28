import { DecimalPipe } from '@angular/common';
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
import { AlertService } from '@shared/services/alert.service';

const STAR_COUNT = 5;

@Component({
  selector: 'app-recipe-card',
  imports: [RouterLink, Card, DecimalPipe],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.scss',
})
export class RecipeCardComponent {
  readonly recipe = input.required<RecipeListItem>();
  readonly favoriteChange = output<{ recipeId: string; isFavorited: boolean }>();

  private readonly recipeData = inject(RecipeDataService);
  private readonly currentUser = inject(CurrentUserService);
  private readonly router = inject(Router);
  private readonly alertService = inject(AlertService);

  protected readonly isLiked = computed(() => this.recipe().isFavorited ?? false);
  protected readonly togglingFavorite = signal(false);
  protected readonly starIndexes = Array.from({ length: STAR_COUNT }, (_, i) => i + 1);

  protected readonly starRating = computed(() => {
    const rating = this.recipe().averageRating;
    if (rating != null) {
      return Math.min(STAR_COUNT, Math.max(0, rating));
    }

    let hash = 0;
    for (const char of this.recipe().id) {
      hash = char.charCodeAt(0) + ((hash << 5) - hash);
    }
    return Math.round((4 + (Math.abs(hash) % 10) / 10) * 10) / 10;
  });

  protected formatDate(isoDate: string): string {
    return formatDateFr(isoDate);
  }

  protected formatTime(minutes: number): string {
    return formatMinutes(minutes);
  }

  protected difficultyLabel(difficulty: RecipeListItem['difficulty']): string {
    return getDifficultyLabel(difficulty);
  }

  protected starIcon(starIndex: number): string {
    const rating = this.starRating();
    if (rating >= starIndex) {
      return 'pi pi-star-fill';
    }
    if (rating >= starIndex - 0.5) {
      return 'pi pi-star-half-fill';
    }
    return 'pi pi-star';
  }

  toggleLike(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

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
