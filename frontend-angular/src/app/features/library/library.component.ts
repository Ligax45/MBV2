import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Message } from 'primeng/message';
import { ProgressSpinner } from 'primeng/progressspinner';

import type { RecipeListItem } from '@core/models/recipe-list-item.model';
import { CurrentUserService } from '@core/services/current-user.service';
import { RecipeDataService } from '@core/services/recipe-data.service';
import { filterRecipesByTitle } from '@core/utils/recipe-search.util';
import { AlertService } from '@shared/services/alert.service';

import { RecipeCardComponent } from './components/recipe-card/recipe-card.component';
import { RecipeSearchBarComponent } from './components/recipe-search-bar/recipe-search-bar.component';

@Component({
  selector: 'app-library',
  imports: [
    RecipeSearchBarComponent,
    RecipeCardComponent,
    ProgressSpinner,
    Message,
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

  protected readonly recipes = signal<RecipeListItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadFailed = signal(false);
  protected readonly searchQuery = signal('');
  protected readonly favoritesOnly = signal(false);

  protected readonly filteredRecipes = computed(() =>
    filterRecipesByTitle(this.recipes(), this.searchQuery()),
  );

  protected readonly pageTitle = computed(() =>
    this.favoritesOnly() ? 'Mes recettes favorites' : 'Bibliothèque de recettes',
  );

  protected readonly pageSubtitle = computed(() =>
    this.favoritesOnly()
      ? 'Retrouvez toutes les recettes que vous avez aimées'
      : 'Découvrez et gérez toutes vos recettes',
  );

  protected readonly emptyMessage = computed(() => {
    if (this.favoritesOnly()) {
      return this.searchQuery().trim()
        ? 'Aucun favori ne correspond à votre recherche.'
        : 'Vous n\u2019avez pas encore de recette favorite.';
    }
    return 'Aucune recette ne correspond à votre recherche.';
  });

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      const favoritesOnly = data['favoritesOnly'] === true;
      if (favoritesOnly && !this.currentUser.isAuthenticated()) {
        void this.router.navigate(['/connexion'], {
          queryParams: { returnUrl: '/bibliotheque/favoris' },
        });
        return;
      }
      this.favoritesOnly.set(favoritesOnly);
      this.loadRecipes();
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  toggleFavorites(): void {
    if (this.favoritesOnly()) {
      void this.router.navigate(['/bibliotheque']);
      return;
    }

    if (!this.currentUser.isAuthenticated()) {
      void this.router.navigate(['/connexion'], {
        queryParams: { returnUrl: '/bibliotheque/favoris' },
      });
      return;
    }

    void this.router.navigate(['/bibliotheque/favoris']);
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

  private loadRecipes(): void {
    this.loading.set(true);
    this.loadFailed.set(false);

    this.recipeData.getRecipes(this.favoritesOnly()).subscribe({
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
