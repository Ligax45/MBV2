import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import type { EquipmentSummary, RecipeDifficulty, RecipeDetailApiResponse } from '@core/models/recipe-api.model';
import type { RecipeIngredient } from '@core/models/recipe-ingredient.model';
import type { RecipeStep } from '@core/models/recipe-step.model';
import { RecipeApiService } from '@core/services/recipe-api.service';
import { CurrentUserService } from '@core/services/current-user.service';
import { AlertService } from '@shared/services/alert.service';
import { switchMap, of } from 'rxjs';

import { DIFFICULTY_OPTIONS } from './constants/difficulty-options.constant';
import { INGREDIENT_UNITS } from './constants/ingredient-units.constant';
import {
  INITIAL_CREATE_RECIPE_FORM,
  type CreateRecipeFormData,
  type RecipeTimeForm,
} from './models/create-recipe-form.model';
import { buildCreateRecipePayload } from './utils/create-recipe-payload.util';
import { createRecipeFieldId } from './utils/create-recipe-id.util';
import { mapApiToRecipeForm } from './utils/recipe-form.mapper';

@Component({
  selector: 'app-create-recipe',
  imports: [FormsModule, Card, InputText, Textarea, InputNumber, Select, Button, Divider, ProgressSpinner],
  templateUrl: './create-recipe.component.html',
  styleUrl: './create-recipe.component.scss',
})
export class CreateRecipeComponent implements OnInit {
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly recipeApi = inject(RecipeApiService);
  private readonly currentUser = inject(CurrentUserService);

  protected readonly editRecipeId = signal<string | null>(null);
  protected readonly isEditMode = computed(() => this.editRecipeId() !== null);
  protected readonly pageTitle = computed(() => (this.isEditMode() ? 'Modifier la recette' : 'Créer une recette'));
  protected readonly submitLabel = computed(() =>
    this.isEditMode() ? 'Enregistrer les modifications' : 'Créer la recette',
  );

  protected readonly form = signal<CreateRecipeFormData>({
    ...INITIAL_CREATE_RECIPE_FORM,
    time: { ...INITIAL_CREATE_RECIPE_FORM.time },
    equipment: [],
    ingredients: [],
    steps: [],
  });

  protected readonly titleError = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly typesLoading = signal(true);
  protected readonly recipeLoading = signal(false);
  protected readonly imageCleared = signal(false);

  protected readonly recipeTypeOptions = signal<{ label: string; value: string }[]>([]);

  protected readonly difficultyOptions = DIFFICULTY_OPTIONS.map((d) => ({
    label: d.label,
    value: d.value,
  }));

  protected readonly equipmentOptions = signal<EquipmentSummary[]>([]);
  protected readonly ingredientUnitSelectOptions = INGREDIENT_UNITS.map((unit) => ({
    label: unit,
    value: unit,
  }));

  protected readonly pageBusy = computed(() => this.typesLoading() || this.recipeLoading());

  ngOnInit(): void {
    const editId = this.route.snapshot.paramMap.get('recipeId');
    const isEditRoute = this.route.snapshot.routeConfig?.path === 'recette/:recipeId/modifier';

    if (isEditRoute && editId) {
      this.editRecipeId.set(editId);
      this.loadRecipeForEdit(editId);
    }

    this.loadRecipeTypes();
    this.loadEquipment();
  }

  protected updateTitle(value: string): void {
    this.patchForm({ title: value });
    this.titleError.set(null);
    this.formError.set(null);
  }

  protected updateDescription(value: string): void {
    this.patchForm({ description: value });
    this.formError.set(null);
  }

  protected updateServings(value: number | null): void {
    const servings = value && value >= 1 ? Math.min(value, 999) : 1;
    this.patchForm({ servings });
  }

  protected updateRecipeType(value: string | null): void {
    this.patchForm({ recipeType: value ?? '' });
    this.formError.set(null);
  }

  protected updateDifficulty(value: RecipeDifficulty | null): void {
    this.patchForm({ difficulty: value ?? '' });
    this.formError.set(null);
  }

  protected updateTime(field: keyof RecipeTimeForm, value: number | null): void {
    const minutes = value != null && value >= 0 ? value : 0;
    this.patchForm({
      time: { ...this.form().time, [field]: minutes },
    });
  }

  protected onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file) {
      this.clearPhoto();
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      this.imageCleared.set(false);
      this.patchForm({
        photo: file,
        photoPreview: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  }

  protected clearPhoto(): void {
    this.imageCleared.set(true);
    this.patchForm({ photo: null, photoPreview: null });
  }

  protected isEquipmentSelected(id: string): boolean {
    return this.form().equipment.includes(id);
  }

  protected toggleEquipment(id: string): void {
    const current = this.form().equipment;
    const equipment = current.includes(id) ? current.filter((e) => e !== id) : [...current, id];
    this.patchForm({ equipment });
  }

  protected addIngredient(): void {
    const ingredient: RecipeIngredient = {
      id: createRecipeFieldId('ing'),
      quantity: '',
      unit: '',
      name: '',
    };
    this.patchForm({
      ingredients: [...this.form().ingredients, ingredient],
    });
  }

  protected removeIngredient(id: string): void {
    this.patchForm({
      ingredients: this.form().ingredients.filter((i) => i.id !== id),
    });
  }

  protected updateIngredient(id: string, field: keyof RecipeIngredient, value: string): void {
    this.patchForm({
      ingredients: this.form().ingredients.map((i) => (i.id === id ? { ...i, [field]: value } : i)),
    });
  }

  protected addStep(): void {
    const steps = this.form().steps;
    const newOrder = steps.length > 0 ? Math.max(...steps.map((s) => s.order)) + 1 : 1;
    const step: RecipeStep = {
      id: createRecipeFieldId('step'),
      content: '',
      order: newOrder,
    };
    this.patchForm({ steps: [...steps, step] });
  }

  protected removeStep(id: string): void {
    const remaining = this.form()
      .steps.filter((s) => s.id !== id)
      .map((s, index) => ({ ...s, order: index + 1 }));
    this.patchForm({ steps: remaining });
  }

  protected updateStep(id: string, content: string): void {
    this.patchForm({
      steps: this.form().steps.map((s) => (s.id === id ? { ...s, content } : s)),
    });
  }

  protected onCancel(): void {
    const editId = this.editRecipeId();
    if (editId) {
      void this.router.navigate(['/recette', editId]);
      return;
    }
    void this.router.navigate(['/bibliotheque']);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (this.submitting() || this.pageBusy()) return;

    const data = this.form();
    const title = data.title.trim();
    if (!title) {
      this.titleError.set('Le titre est obligatoire');
      return;
    }
    if (!data.description.trim()) {
      this.formError.set('La description est obligatoire.');
      return;
    }
    if (!data.recipeType) {
      this.formError.set('Sélectionnez un type de recette.');
      return;
    }
    if (!data.difficulty) {
      this.formError.set('Sélectionnez une difficulté.');
      return;
    }

    this.titleError.set(null);
    this.formError.set(null);
    this.submitting.set(true);

    const editId = this.editRecipeId();
    const payload = buildCreateRecipePayload(data, {
      clearImage: !!editId && this.imageCleared() && !data.photo,
    });
    const photo = data.photo;

    const saveRecipe$ = editId ? this.recipeApi.updateRecipe(editId, payload) : this.recipeApi.createRecipe(payload);

    saveRecipe$.pipe(switchMap((saved) => this.uploadPhotoIfNeeded(saved, photo))).subscribe({
      next: (saved) => {
        this.submitting.set(false);
        this.alertService.success(saved.title, editId ? 'Recette mise à jour' : 'Recette créée', 4000);
        void this.router.navigate(['/recette', saved.id]);
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        const detail = this.resolveSubmitError(err, !!editId);
        this.alertService.error(detail, editId ? 'Modification impossible' : 'Création impossible');
      },
    });
  }

  private loadRecipeTypes(): void {
    this.recipeApi.getRecipeTypes().subscribe({
      next: (types) => {
        this.recipeTypeOptions.set(types.map((t) => ({ label: t.label, value: t.id })));
        this.typesLoading.set(false);
      },
      error: () => {
        this.typesLoading.set(false);
        this.alertService.error(
          'Impossible de charger les types de recette. Lancez les migrations backend (npm run migration:up).',
        );
      },
    });
  }

  private loadEquipment(): void {
    this.recipeApi.getEquipment().subscribe({
      next: (items) => this.equipmentOptions.set(items),
      error: () => {
        this.alertService.error(
          'Impossible de charger la liste d\u2019équipement. Lancez les migrations backend (npm run migration:up).',
        );
      },
    });
  }

  private uploadPhotoIfNeeded(saved: RecipeDetailApiResponse, photo: File | null) {
    if (!photo) {
      return of(saved);
    }
    return this.recipeApi
      .uploadRecipeImage(saved.id, photo)
      .pipe(switchMap((res) => of({ ...saved, imageUrl: res.imageUrl })));
  }

  private loadRecipeForEdit(id: string): void {
    this.recipeLoading.set(true);
    this.recipeApi.getRecipeById(id).subscribe({
      next: (api) => {
        const userId = this.currentUser.userId();
        const canEdit =
          !!userId &&
          (api.authorUserId === userId || this.currentUser.canModerateRecipes());

        if (!canEdit) {
          this.recipeLoading.set(false);
          this.alertService.warning('Seul l’auteur peut modifier cette recette.');
          void this.router.navigate(['/recette', id]);
          return;
        }

        this.imageCleared.set(false);
        this.form.set(mapApiToRecipeForm(api));
        this.recipeLoading.set(false);
      },
      error: (err: unknown) => {
        this.recipeLoading.set(false);
        if (err instanceof HttpErrorResponse && err.status === 404) {
          this.alertService.warning('Recette introuvable.');
        } else {
          this.alertService.error('Impossible de charger la recette à modifier. Vérifiez que le backend tourne.');
        }
      },
    });
  }

  private resolveSubmitError(err: unknown, isEdit: boolean): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { message?: string | string[] } | null;
      if (Array.isArray(body?.message)) {
        return body.message.join(', ');
      }
      if (typeof body?.message === 'string') {
        return body.message;
      }
      if (err.status === 0) {
        return 'Backend inaccessible (port 3333).';
      }
      if (err.status === 404 && isEdit) {
        return 'Recette introuvable.';
      }
      if (err.status === 401) {
        return 'Connectez-vous pour créer ou modifier une recette.';
      }
      if (err.status === 403 && isEdit) {
        return 'Seul l’auteur peut modifier cette recette.';
      }
    }
    return isEdit ? 'Une erreur est survenue lors de la modification.' : 'Une erreur est survenue lors de la création.';
  }

  private patchForm(partial: Partial<CreateRecipeFormData>): void {
    this.form.update((current) => ({ ...current, ...partial }));
  }
}
