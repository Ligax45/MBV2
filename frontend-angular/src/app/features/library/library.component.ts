import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Message } from 'primeng/message';
import { ProgressSpinner } from 'primeng/progressspinner';

import type { RecipeListItem } from '@core/models/recipe-list-item.model';
import { RecipeDataService } from '@core/services/recipe-data.service';
import { filterRecipesByTitle } from '@core/utils/recipe-search.util';

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
  styleUrl: './library.component.css',
})
export class LibraryComponent implements OnInit {
  private readonly recipeData = inject(RecipeDataService);

  protected readonly recipes = signal<RecipeListItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchQuery = signal('');

  protected readonly filteredRecipes = computed(() =>
    filterRecipesByTitle(this.recipes(), this.searchQuery()),
  );

  ngOnInit(): void {
    this.loadRecipes();
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  private loadRecipes(): void {
    this.loading.set(true);
    this.error.set(null);

    this.recipeData.getRecipes().subscribe({
      next: (data) => {
        this.recipes.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(
          'Impossible de charger les recettes. Vérifiez que le backend tourne (port 3333).',
        );
        this.loading.set(false);
      },
    });
  }
}
