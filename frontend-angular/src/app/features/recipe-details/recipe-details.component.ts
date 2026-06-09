import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Tag } from 'primeng/tag';

import type { RecipeDetail } from '@core/models/recipe-detail.model';
import { RecipeDataService } from '@core/services/recipe-data.service';
import {
  formatDateFr,
  formatIngredientLine,
  formatMinutes,
  getDifficultyLabel,
  getDifficultySeverity,
} from '@core/utils/recipe-format.util';
import { AlertService } from '@shared/services/alert.service';

@Component({
  selector: 'app-recipe-details',
  imports: [
    RouterLink,
    Button,
    Card,
    Divider,
    ProgressSpinner,
    Tag,
  ],
  templateUrl: './recipe-details.component.html',
  styleUrl: './recipe-details.component.scss',
})
export class RecipeDetailsComponent implements OnInit {
  private readonly recipeData = inject(RecipeDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly alertService = inject(AlertService);

  protected readonly recipe = signal<RecipeDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly pageFailed = signal(false);

  ngOnInit(): void {
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

  protected difficultySeverity(
    difficulty: RecipeDetail['difficulty'],
  ): 'success' | 'warn' | 'danger' {
    return getDifficultySeverity(difficulty);
  }

  private loadRecipe(id: string): void {
    this.loading.set(true);
    this.pageFailed.set(false);

    this.recipeData.getRecipeById(id).subscribe({
      next: (data) => {
        this.recipe.set(data);
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
