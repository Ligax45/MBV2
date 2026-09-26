import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { ProgressSpinner } from 'primeng/progressspinner';

import type {
  MealPlanDayView,
  MealPlanEntry,
} from '@core/models/meal-plan.model';
import type { RecipeListItem } from '@core/models/recipe-list-item.model';
import { MealPlanDataService } from '@core/services/meal-plan-data.service';
import { RecipeDataService } from '@core/services/recipe-data.service';
import {
  addDaysToIsoDate,
  buildWeekDates,
  formatShortDateLabel,
  formatWeekdayLabel,
  formatWeekRangeLabel,
  startOfWeekMonday,
} from '@core/utils/meal-plan-week.util';
import { filterRecipesByTitle } from '@core/utils/recipe-search.util';
import { AlertService } from '@shared/services/alert.service';
import { AppDialogComponent } from '@shared/components/app-dialog/app-dialog.component';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';

@Component({
  selector: 'app-meal-plan',
  imports: [
    RouterLink,
    NgOptimizedImage,
    AppDialogComponent,
    IconField,
    InputIcon,
    InputText,
    ProgressSpinner,
  ],
  templateUrl: './meal-plan.component.html',
  styleUrl: './meal-plan.component.scss',
})
export class MealPlanComponent implements OnInit {
  private readonly mealPlanData = inject(MealPlanDataService);
  private readonly recipeData = inject(RecipeDataService);
  private readonly alertService = inject(AlertService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly weekStart = signal(startOfWeekMonday(new Date()));
  protected readonly weekEnd = computed(() =>
    addDaysToIsoDate(this.weekStart(), 6),
  );
  protected readonly weekLabel = computed(() =>
    formatWeekRangeLabel(this.weekStart(), this.weekEnd()),
  );

  protected readonly loading = signal(true);
  protected readonly loadFailed = signal(false);
  protected readonly entriesByDate = signal<Record<string, MealPlanEntry>>({});
  protected readonly mutatingDate = signal<string | null>(null);

  protected readonly days = computed((): MealPlanDayView[] => {
    const entries = this.entriesByDate();
    return buildWeekDates(this.weekStart()).map((date) => ({
      date,
      weekdayLabel: formatWeekdayLabel(date),
      shortDateLabel: formatShortDateLabel(date),
      entry: entries[date] ?? null,
    }));
  });

  protected readonly pickerOpen = signal(false);
  protected readonly pickerDate = signal<string | null>(null);
  protected readonly recipesLoading = signal(false);
  protected readonly recipeCatalog = signal<RecipeListItem[]>([]);
  protected readonly recipeSearch = signal('');

  protected readonly filteredRecipes = computed(() =>
    filterRecipesByTitle(this.recipeCatalog(), this.recipeSearch()),
  );

  ngOnInit(): void {
    this.loadWeek();
  }

  protected loadWeek(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.mealPlanData.getWeek(this.weekStart()).subscribe({
      next: (week) => {
        const map: Record<string, MealPlanEntry> = {};
        for (const entry of week.entries) {
          map[entry.date] = entry;
        }
        this.entriesByDate.set(map);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadFailed.set(true);
      },
    });
  }

  protected goToPreviousWeek(): void {
    this.weekStart.set(addDaysToIsoDate(this.weekStart(), -7));
    this.loadWeek();
  }

  protected goToNextWeek(): void {
    this.weekStart.set(addDaysToIsoDate(this.weekStart(), 7));
    this.loadWeek();
  }

  protected goToCurrentWeek(): void {
    this.weekStart.set(startOfWeekMonday(new Date()));
    this.loadWeek();
  }

  protected openPicker(date: string): void {
    this.pickerDate.set(date);
    this.recipeSearch.set('');
    this.pickerOpen.set(true);
    if (this.recipeCatalog().length > 0) {
      return;
    }
    this.recipesLoading.set(true);
    this.recipeData.getRecipes().subscribe({
      next: (recipes) => {
        this.recipeCatalog.set(recipes);
        this.recipesLoading.set(false);
      },
      error: () => {
        this.recipesLoading.set(false);
        this.alertService.error('Impossible de charger les recettes.');
      },
    });
  }

  protected onPickerVisibleChange(visible: boolean): void {
    this.pickerOpen.set(visible);
    if (!visible) {
      this.pickerDate.set(null);
    }
  }

  protected selectRecipe(recipe: RecipeListItem): void {
    const date = this.pickerDate();
    if (!date || this.mutatingDate()) {
      return;
    }
    this.mutatingDate.set(date);
    this.mealPlanData.setEntry(date, recipe.id).subscribe({
      next: (entry) => {
        this.entriesByDate.update((current) => ({
          ...current,
          [date]: entry,
        }));
        this.mutatingDate.set(null);
        this.onPickerVisibleChange(false);
      },
      error: () => {
        this.mutatingDate.set(null);
        this.alertService.error('Impossible d’ajouter cette recette au planning.');
      },
    });
  }

  protected onRemoveDay(date: string, title: string): void {
    if (this.mutatingDate()) {
      return;
    }
    void this.confirmDialog
      .confirm({
        title: 'Retirer du menu ?',
        message: `Retirer « ${title} » du ${formatWeekdayLabel(date)} ${formatShortDateLabel(date)} ?`,
        confirmLabel: 'Retirer',
        confirmSeverity: 'danger',
      })
      .then((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.mutatingDate.set(date);
        this.mealPlanData.removeEntry(date).subscribe({
          next: () => {
            this.entriesByDate.update((current) => {
              const next = { ...current };
              delete next[date];
              return next;
            });
            this.mutatingDate.set(null);
          },
          error: () => {
            this.mutatingDate.set(null);
            this.alertService.error('Impossible de retirer ce repas.');
          },
        });
      });
  }

  protected difficultyLabel(
    difficulty: MealPlanEntry['recipe']['difficulty'],
  ): string {
    switch (difficulty) {
      case 'facile':
        return 'Facile';
      case 'moyen':
        return 'Moyen';
      case 'difficile':
        return 'Difficile';
      default:
        return difficulty;
    }
  }

  protected isDayBusy(date: string): boolean {
    return this.mutatingDate() === date;
  }
}
