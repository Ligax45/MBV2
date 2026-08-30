import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';

import type { RecipeListItem } from '@core/models/recipe-list-item.model';
import { RecipeDataService } from '@core/services/recipe-data.service';
import { formatDateFr } from '@core/utils/recipe-format.util';
import { AlertService } from '@shared/services/alert.service';

@Component({
  selector: 'app-moderation',
  imports: [RouterLink, ProgressSpinner, FormsModule],
  templateUrl: './moderation.component.html',
  styleUrl: './moderation.component.scss',
})
export class ModerationComponent implements OnInit {
  private readonly recipeData = inject(RecipeDataService);
  private readonly alertService = inject(AlertService);

  protected readonly recipes = signal<RecipeListItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly actingId = signal<string | null>(null);
  protected readonly rejectingId = signal<string | null>(null);
  protected readonly rejectComment = signal('');

  ngOnInit(): void {
    this.loadPending();
  }

  protected formatDate(iso: string): string {
    return formatDateFr(iso);
  }

  protected onApprove(recipe: RecipeListItem): void {
    if (this.actingId()) return;
    this.actingId.set(recipe.id);
    this.recipeData.approveRecipe(recipe.id).subscribe({
      next: () => {
        this.recipes.update((items) => items.filter((item) => item.id !== recipe.id));
        this.actingId.set(null);
        this.alertService.success(
          `« ${recipe.title} » est maintenant visible dans la bibliothèque.`,
          'Recette validée',
        );
      },
      error: () => {
        this.actingId.set(null);
        this.alertService.error('Impossible de valider cette recette.');
      },
    });
  }

  protected startReject(recipe: RecipeListItem): void {
    if (this.actingId()) return;
    this.rejectingId.set(recipe.id);
    this.rejectComment.set('');
  }

  protected cancelReject(): void {
    this.rejectingId.set(null);
    this.rejectComment.set('');
  }

  protected confirmReject(recipe: RecipeListItem): void {
    if (this.actingId()) return;
    const comment = this.rejectComment().trim();
    if (!comment) {
      this.alertService.warning('Indiquez le motif du refus.');
      return;
    }

    this.actingId.set(recipe.id);
    this.recipeData.rejectRecipe(recipe.id, comment).subscribe({
      next: () => {
        this.recipes.update((items) => items.filter((item) => item.id !== recipe.id));
        this.actingId.set(null);
        this.rejectingId.set(null);
        this.rejectComment.set('');
        this.alertService.success(`« ${recipe.title} » a été refusée.`, 'Recette refusée');
      },
      error: () => {
        this.actingId.set(null);
        this.alertService.error('Impossible de refuser cette recette.');
      },
    });
  }

  private loadPending(): void {
    this.loading.set(true);
    this.recipeData.getPendingRecipes().subscribe({
      next: (items) => {
        this.recipes.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.alertService.error('Impossible de charger la file de modération.');
      },
    });
  }
}
