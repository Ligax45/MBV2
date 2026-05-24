import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { Message } from 'primeng/message';
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

@Component({
  selector: 'app-recipe-details',
  imports: [
    RouterLink,
    Button,
    Card,
    Divider,
    Message,
    ProgressSpinner,
    Tag,
  ],
  templateUrl: './recipe-details.component.html',
  styleUrl: './recipe-details.component.css',
})
export class RecipeDetailsComponent implements OnInit {
  private readonly recipeData = inject(RecipeDataService);
  private readonly route = inject(ActivatedRoute);

  protected readonly recipe = signal<RecipeDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('recipeId');
    if (!id) {
      this.notFound.set(true);
      this.loading.set(false);
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
    this.error.set(null);
    this.notFound.set(false);

    this.recipeData.getRecipeById(id).subscribe({
      next: (data) => {
        this.recipe.set(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        if (err instanceof Error && err.message === 'NOT_FOUND') {
          this.notFound.set(true);
        } else {
          this.error.set('Impossible de charger la recette. Vérifiez que le backend tourne.');
        }
        this.loading.set(false);
      },
    });
  }
}
