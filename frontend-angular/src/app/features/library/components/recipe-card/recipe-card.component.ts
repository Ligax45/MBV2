import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';

import type { RecipeListItem } from '@core/models/recipe-list-item.model';
import {
  formatDateFr,
  formatMinutes,
  getDifficultyLabel,
  getDifficultySeverity,
} from '@core/utils/recipe-format.util';

@Component({
  selector: 'app-recipe-card',
  imports: [RouterLink, Card, Button, Tag],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.scss',
})
export class RecipeCardComponent {
  readonly recipe = input.required<RecipeListItem>();

  protected readonly isLiked = signal(false);

  protected formatDate(isoDate: string): string {
    return formatDateFr(isoDate);
  }

  protected formatTime(minutes: number): string {
    return formatMinutes(minutes);
  }

  protected difficultyLabel(difficulty: RecipeListItem['difficulty']): string {
    return getDifficultyLabel(difficulty);
  }

  protected difficultySeverity(
    difficulty: RecipeListItem['difficulty'],
  ): 'success' | 'warn' | 'danger' {
    return getDifficultySeverity(difficulty);
  }

  toggleLike(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isLiked.update((liked) => !liked);
  }
}
