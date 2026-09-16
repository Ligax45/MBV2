import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';

import type { RecipeListItem } from '@core/models/recipe-list-item.model';
import type { RecipeTypeSummary } from '@core/models/recipe-api.model';
import { CurrentUserService } from '@core/services/current-user.service';
import { RecipeDataService } from '@core/services/recipe-data.service';
import {
  filterRecipesByTitle,
  filterRecipesByType,
} from '@core/utils/recipe-search.util';
import { AlertService } from '@shared/services/alert.service';

import { LibraryAdvancedFiltersComponent } from './components/library-advanced-filters/library-advanced-filters.component';
import { RecipeCardComponent } from './components/recipe-card/recipe-card.component';
import { RecipeSearchBarComponent } from './components/recipe-search-bar/recipe-search-bar.component';
import {
  DEFAULT_LIBRARY_ADVANCED_FILTERS,
  libraryAdvancedFiltersCount,
  libraryAdvancedFiltersToListQuery,
  libraryAdvancedFiltersToQuery,
  parseLibraryAdvancedFiltersFromParams,
  type LibraryAdvancedFiltersState,
} from './models/library-advanced-filters.model';

@Component({
  selector: 'app-library',
  imports: [
    DragDropModule,
    RecipeSearchBarComponent,
    LibraryAdvancedFiltersComponent,
    RecipeCardComponent,
    ProgressSpinner,
  ],
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
})
export class LibraryComponent implements OnInit {
  private readonly recipeData = inject(RecipeDataService);
  private readonly alertService = inject(AlertService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly currentUser = inject(CurrentUserService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly recipes = signal<RecipeListItem[]>([]);
  protected readonly recipeTypes = signal<RecipeTypeSummary[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadFailed = signal(false);
  protected readonly reorderingFavorites = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly favoritesOnly = signal(false);
  protected readonly mineOnly = signal(false);
  protected readonly selectedRecipeTypeId = signal<string | null>(null);
  protected readonly advancedFiltersOpen = signal(false);
  protected readonly advancedFilters = signal<LibraryAdvancedFiltersState>(
    DEFAULT_LIBRARY_ADVANCED_FILTERS,
  );

  protected readonly isPublicLibrary = computed(
    () => !this.favoritesOnly() && !this.mineOnly(),
  );

  protected readonly advancedFiltersActiveCount = computed(() =>
    libraryAdvancedFiltersCount(this.advancedFilters()),
  );

  protected readonly visibleRecipeTypes = computed(() =>
    this.recipeTypes().filter(
      (type) => type.id !== 'autres' && type.label.toLowerCase() !== 'autres',
    ),
  );

  protected readonly filteredRecipes = computed(() => {
    const byType = filterRecipesByType(
      this.recipes(),
      this.selectedRecipeTypeId(),
    );
    return filterRecipesByTitle(byType, this.searchQuery());
  });

  protected readonly selectedRecipeTypeLabel = computed(() => {
    const typeId = this.selectedRecipeTypeId();
    if (!typeId) return null;
    return this.recipeTypes().find((type) => type.id === typeId)?.label ?? null;
  });

  protected readonly pageTitle = computed(() => {
    if (this.mineOnly()) return 'Mes recettes';
    if (this.favoritesOnly()) return 'Mes recettes favorites';
    return 'Bibliothèque de recettes';
  });

  protected readonly pageSubtitle = computed(() => {
    if (this.mineOnly()) {
      return 'Retrouvez vos recettes publiques, privées et en attente de validation';
    }
    if (this.favoritesOnly()) {
      if (this.canReorderFavorites()) {
        return 'Glissez les cartes pour définir votre ordre préféré';
      }
      return 'Retrouvez toutes les recettes que vous avez aimées';
    }
    return 'Découvrez les recettes validées de la communauté';
  });

  protected readonly emptyTitle = computed(() => {
    if (this.mineOnly() && !this.searchQuery().trim() && !this.selectedRecipeTypeId()) {
      return 'Vous n’avez pas encore de recette';
    }
    if (this.favoritesOnly() && !this.searchQuery().trim() && !this.selectedRecipeTypeId()) {
      return 'Vos favoris sont vides';
    }
    if (this.searchQuery().trim() || this.selectedRecipeTypeId()) {
      return 'Aucun résultat';
    }
    return 'Bibliothèque vide';
  });

  protected readonly emptyMessage = computed(() => {
    const hasSearch = this.searchQuery().trim().length > 0;
    const typeLabel = this.selectedRecipeTypeLabel();

    if (this.mineOnly()) {
      if (hasSearch && typeLabel) {
        return `Aucune de vos recettes de type « ${typeLabel} » ne correspond à votre recherche.`;
      }
      if (typeLabel) {
        return `Vous n’avez pas encore de recette de type « ${typeLabel} ».`;
      }
      if (hasSearch) {
        return 'Aucune de vos recettes ne correspond à votre recherche.';
      }
      return 'Créez une recette pour la retrouver ici.';
    }

    if (this.favoritesOnly()) {
      if (hasSearch && typeLabel) {
        return `Aucun favori de type « ${typeLabel} » ne correspond à votre recherche.`;
      }
      if (typeLabel) {
        return `Vous n\u2019avez pas encore de recette favorite de type « ${typeLabel} ».`;
      }
      if (hasSearch) {
        return 'Aucun favori ne correspond à votre recherche.';
      }
      return 'Vous n\u2019avez pas encore de recette favorite.';
    }

    if (hasSearch && typeLabel) {
      return `Aucune recette de type « ${typeLabel} » ne correspond à votre recherche.`;
    }
    if (typeLabel) {
      return `Aucune recette de type « ${typeLabel} » pour le moment.`;
    }
    if (hasSearch) {
      return 'Aucune recette ne correspond à votre recherche.';
    }
    return 'Aucune recette disponible pour le moment.';
  });

  protected readonly hasActiveFilters = computed(
    () =>
      this.searchQuery().trim().length > 0 ||
      this.selectedRecipeTypeId() !== null ||
      (this.isPublicLibrary() && this.advancedFiltersActiveCount() > 0),
  );

  protected readonly canReorderFavorites = computed(
    () =>
      this.favoritesOnly() &&
      !this.searchQuery().trim() &&
      this.selectedRecipeTypeId() === null &&
      this.recipes().length > 1,
  );

  protected readonly emptyIcon = computed(() => {
    if (this.favoritesOnly() && !this.searchQuery().trim() && !this.selectedRecipeTypeId()) {
      return 'heart';
    }
    if (this.searchQuery().trim()) {
      return 'search';
    }
    if (this.selectedRecipeTypeId()) {
      return 'filter';
    }
    return 'plate';
  });

  ngOnInit(): void {
    this.loadRecipeTypes();

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        if (!this.isPublicLibrary()) {
          return;
        }
        this.advancedFilters.set(
          parseLibraryAdvancedFiltersFromParams({
            sort: params.get('sort') ?? undefined,
            difficulty: params.get('difficulty') ?? undefined,
            maxTotalMinutes: params.get('maxTotalMinutes') ?? undefined,
            minTotalMinutes: params.get('minTotalMinutes') ?? undefined,
            minRating: params.get('minRating') ?? undefined,
          }),
        );
        this.loadRecipes();
      });

    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      const favoritesOnly = data['favoritesOnly'] === true;
      const mineOnly = data['mineOnly'] === true;
      if (favoritesOnly && !this.currentUser.isAuthenticated()) {
        void this.router.navigate(['/connexion'], {
          queryParams: { returnUrl: '/bibliotheque/favoris' },
        });
        return;
      }
      if (mineOnly && !this.currentUser.isAuthenticated()) {
        void this.router.navigate(['/connexion'], {
          queryParams: { returnUrl: '/bibliotheque/mes-recettes' },
        });
        return;
      }
      this.favoritesOnly.set(favoritesOnly);
      this.mineOnly.set(mineOnly);
      this.advancedFilters.set(
        parseLibraryAdvancedFiltersFromParams({
          sort: this.route.snapshot.queryParamMap.get('sort') ?? undefined,
          difficulty: this.route.snapshot.queryParamMap.get('difficulty') ?? undefined,
          maxTotalMinutes:
            this.route.snapshot.queryParamMap.get('maxTotalMinutes') ?? undefined,
          minTotalMinutes:
            this.route.snapshot.queryParamMap.get('minTotalMinutes') ?? undefined,
          minRating: this.route.snapshot.queryParamMap.get('minRating') ?? undefined,
        }),
      );
      this.loadRecipes();
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  toggleRecipeType(typeId: string): void {
    this.selectedRecipeTypeId.update((current) =>
      current === typeId ? null : typeId,
    );
  }

  selectAllTypes(): void {
    this.selectedRecipeTypeId.set(null);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedRecipeTypeId.set(null);
    if (this.isPublicLibrary()) {
      this.resetAdvancedFilters();
    }
  }

  toggleAdvancedFilters(): void {
    this.advancedFiltersOpen.update((open) => !open);
  }

  onAdvancedFiltersChange(filters: LibraryAdvancedFiltersState): void {
    this.advancedFilters.set(filters);
    if (!this.isPublicLibrary()) {
      return;
    }
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: libraryAdvancedFiltersToQuery(filters),
      replaceUrl: true,
    });
  }

  resetAdvancedFilters(): void {
    this.advancedFilters.set(DEFAULT_LIBRARY_ADVANCED_FILTERS);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });
    this.loadRecipes();
  }

  onFavoriteReorder(event: CdkDragDrop<RecipeListItem[]>): void {
    if (!this.canReorderFavorites() || this.reorderingFavorites()) {
      return;
    }

    const next = [...this.recipes()];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.recipes.set(next);
    this.reorderingFavorites.set(true);

    this.recipeData.reorderRecipeFavorites(next.map((item) => item.id)).subscribe({
      next: () => {
        this.reorderingFavorites.set(false);
      },
      error: () => {
        this.reorderingFavorites.set(false);
        this.alertService.error('Impossible de réordonner vos favoris.');
        this.loadRecipes();
      },
    });
  }

  onFavoriteChange(event: { recipeId: string; isFavorited: boolean }): void {
    this.recipes.update((items) => {
      if (this.favoritesOnly() && !event.isFavorited) {
        return items.filter((item) => item.id !== event.recipeId);
      }
      return items.map((item) =>
        item.id === event.recipeId
          ? { ...item, isFavorited: event.isFavorited }
          : item,
      );
    });
  }

  private loadRecipeTypes(): void {
    this.recipeData.getRecipeTypes().subscribe({
      next: (types) => this.recipeTypes.set(types),
      error: () => {
        this.alertService.error('Impossible de charger les types de recettes.');
      },
    });
  }

  private loadRecipes(): void {
    this.loading.set(true);
    this.loadFailed.set(false);

    const query = {
      favoritesOnly: this.favoritesOnly(),
      mineOnly: this.mineOnly(),
      ...(this.isPublicLibrary()
        ? libraryAdvancedFiltersToListQuery(this.advancedFilters())
        : {}),
    };

    this.recipeData.getRecipes(query).subscribe({
      next: (data) => {
        this.recipes.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loadFailed.set(true);
        this.loading.set(false);
        this.alertService.error(
          'Impossible de charger les recettes. Vérifiez que le backend tourne (port 3333).',
        );
      },
    });
  }
}
