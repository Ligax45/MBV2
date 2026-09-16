import { isPlatformBrowser } from '@angular/common';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';

import type { RecipeDetail } from '@core/models/recipe-detail.model';
import type { RecipeStep } from '@core/models/recipe-step.model';
import { RecipeDataService } from '@core/services/recipe-data.service';
import { formatIngredientLine } from '@core/utils/recipe-format.util';
import { AlertService } from '@shared/services/alert.service';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';

@Component({
  selector: 'app-recipe-cooking-mode',
  imports: [CdkTrapFocus, RouterLink, ProgressSpinner],
  templateUrl: './recipe-cooking-mode.component.html',
  styleUrl: './recipe-cooking-mode.component.scss',
})
export class RecipeCookingModeComponent implements OnInit {
  private readonly recipeData = inject(RecipeDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly alertService = inject(AlertService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly recipe = signal<RecipeDetail | null>(null);
  protected readonly recipeId = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly pageFailed = signal(false);
  protected readonly currentStepIndex = signal(0);
  protected readonly ingredientsOpen = signal(false);

  constructor() {
    effect((onCleanup) => {
      if (!isPlatformBrowser(this.platformId) || !this.ingredientsOpen()) {
        return;
      }

      const onEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          this.closeIngredients();
        }
      };

      document.addEventListener('keydown', onEscape);

      onCleanup(() => document.removeEventListener('keydown', onEscape));
    });
  }

  protected readonly sortedSteps = computed<RecipeStep[]>(() => {
    const detail = this.recipe();
    if (!detail) return [];
    return [...detail.steps].sort((a, b) => a.order - b.order);
  });

  protected readonly totalSteps = computed(() => this.sortedSteps().length);

  protected readonly currentStep = computed(() => {
    const steps = this.sortedSteps();
    const index = this.currentStepIndex();
    return steps[index] ?? null;
  });

  protected readonly isFirstStep = computed(() => this.currentStepIndex() === 0);

  protected readonly isLastStep = computed(
    () => this.currentStepIndex() === this.totalSteps() - 1,
  );

  protected readonly progressLabel = computed(() => {
    const total = this.totalSteps();
    if (total === 0) return '';
    return `${this.currentStepIndex() + 1} / ${total}`;
  });

  protected readonly hasIngredients = computed(
    () => (this.recipe()?.ingredients.length ?? 0) > 0,
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('recipeId');
    if (!id) {
      this.pageFailed.set(true);
      this.loading.set(false);
      this.alertService.warning('Recette introuvable.');
      return;
    }
    this.recipeId.set(id);
    this.loadRecipe(id);
  }

  protected retryLoad(): void {
    const id = this.recipeId();
    if (!id) return;
    this.loadRecipe(id);
  }

  protected formatIngredient(ingredient: RecipeDetail['ingredients'][0]): string {
    return formatIngredientLine(ingredient);
  }

  protected goToPreviousStep(): void {
    if (this.isFirstStep()) return;
    this.closeIngredients();
    this.currentStepIndex.update((index) => index - 1);
  }

  protected goToNextStep(): void {
    const detail = this.recipe();
    if (!detail) return;

    this.closeIngredients();

    if (this.isLastStep()) {
      void this.router.navigate(['/recette', detail.id]);
      return;
    }

    this.currentStepIndex.update((index) => index + 1);
  }

  protected openIngredients(): void {
    if (!this.hasIngredients()) return;
    this.ingredientsOpen.set(true);
  }

  protected closeIngredients(): void {
    this.ingredientsOpen.set(false);
  }

  protected quitCookingMode(): void {
    this.closeIngredients();

    const detail = this.recipe();
    if (!detail) {
      void this.router.navigate(['/bibliotheque']);
      return;
    }

    if (this.currentStepIndex() > 0) {
      void this.confirmDialog
        .confirm({
          title: 'Quitter le mode cuisine ?',
          message: 'Votre progression ne sera pas sauvegardée.',
          confirmLabel: 'Quitter',
          confirmSeverity: 'danger',
        })
        .then((confirmed) => {
          if (confirmed) {
            void this.router.navigate(['/recette', detail.id]);
          }
        });
      return;
    }

    void this.router.navigate(['/recette', detail.id]);
  }

  private loadRecipe(id: string): void {
    this.loading.set(true);
    this.pageFailed.set(false);

    this.recipeData.getRecipeById(id).subscribe({
      next: (data) => {
        this.recipe.set(data);
        this.currentStepIndex.set(0);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.pageFailed.set(true);
        this.loading.set(false);
        if (err instanceof Error && err.message === 'NOT_FOUND') {
          this.alertService.warning('Recette introuvable.');
        } else if (err instanceof HttpErrorResponse && err.status === 404) {
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
