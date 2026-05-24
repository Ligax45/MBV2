import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Toast } from 'primeng/toast';

import { BOUCHON_EQUIPMENT } from '@core/data/bouchon-equipment.data';
import type { RecipeDifficulty } from '@core/models/recipe-api.model';
import type { RecipeIngredient } from '@core/models/recipe-ingredient.model';
import type { RecipeStep } from '@core/models/recipe-step.model';
import type { RecipeApiResponse } from '@core/models/recipe-api.model';
import { RecipeApiService } from '@core/services/recipe-api.service';
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
  imports: [
    FormsModule,
    Card,
    InputText,
    Textarea,
    InputNumber,
    Select,
    Button,
    Divider,
    Toast,
    ProgressSpinner,
  ],
  templateUrl: './create-recipe.component.html',
  styleUrl: './create-recipe.component.css',
})
export class CreateRecipeComponent implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly recipeApi = inject(RecipeApiService);

  protected readonly editRecipeId = signal<string | null>(null);
  protected readonly isEditMode = computed(() => this.editRecipeId() !== null);
  protected readonly pageTitle = computed(() =>
    this.isEditMode() ? 'Modifier la recette' : 'Créer une recette',
  );
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

  protected readonly recipeTypeOptions = signal<
    { label: string; value: string }[]
  >([]);

  protected readonly difficultyOptions = DIFFICULTY_OPTIONS.map((d) => ({
    label: d.label,
    value: d.value,
  }));

  protected readonly equipmentOptions = BOUCHON_EQUIPMENT;
  protected readonly ingredientUnitSelectOptions = INGREDIENT_UNITS.map(
    (unit) => ({
      label: unit || '—',
      value: unit,
    }),
  );

  protected readonly pageBusy = computed(
    () => this.typesLoading() || this.recipeLoading(),
  );

  ngOnInit(): void {
    const editId = this.route.snapshot.paramMap.get('recipeId');
    const isEditRoute =
      this.route.snapshot.routeConfig?.path === 'recette/:recipeId/modifier';

    if (isEditRoute && editId) {
      this.editRecipeId.set(editId);
      this.loadRecipeForEdit(editId);
    }

    this.loadRecipeTypes();
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
    if (!file) {
      this.clearPhoto();
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      this.patchForm({
        photo: file,
        photoPreview: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  }

  protected clearPhoto(): void {
    this.patchForm({ photo: null, photoPreview: null });
  }

  protected isEquipmentSelected(id: string): boolean {
    return this.form().equipment.includes(id);
  }

  protected toggleEquipment(id: string): void {
    const current = this.form().equipment;
    const equipment = current.includes(id)
      ? current.filter((e) => e !== id)
      : [...current, id];
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

  protected updateIngredient(
    id: string,
    field: keyof RecipeIngredient,
    value: string,
  ): void {
    this.patchForm({
      ingredients: this.form().ingredients.map((i) =>
        i.id === id ? { ...i, [field]: value } : i,
      ),
    });
  }

  protected addStep(): void {
    const steps = this.form().steps;
    const newOrder =
      steps.length > 0 ? Math.max(...steps.map((s) => s.order)) + 1 : 1;
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
      steps: this.form().steps.map((s) =>
        s.id === id ? { ...s, content } : s,
      ),
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

    const payload = buildCreateRecipePayload(data);
    const editId = this.editRecipeId();
    const photo = data.photo;
    const hasUnsavedExtras =
      data.ingredients.some((i) => i.name.trim()) ||
      data.steps.some((s) => s.content.trim()) ||
      data.equipment.length > 0;

    const saveRecipe$ = editId
      ? this.recipeApi.updateRecipe(editId, payload)
      : this.recipeApi.createRecipe(payload);

    saveRecipe$
      .pipe(
        switchMap((saved) => this.uploadPhotoIfNeeded(saved, photo)),
      )
      .subscribe({
      next: (saved) => {
        this.submitting.set(false);
        this.messageService.add({
          severity: 'success',
          summary: editId ? 'Recette mise à jour' : 'Recette créée',
          detail: saved.title,
          life: 4000,
        });
        if (hasUnsavedExtras) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Ingrédients / étapes / équipement',
            detail:
              'Non enregistrés côté serveur pour l’instant.',
            life: 6000,
          });
        }
        void this.router.navigate(['/recette', saved.id]);
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        const detail = this.resolveSubmitError(err, !!editId);
        this.formError.set(detail);
        this.messageService.add({
          severity: 'error',
          summary: editId ? 'Modification impossible' : 'Création impossible',
          detail,
          life: 5000,
        });
      },
    });
  }

  private loadRecipeTypes(): void {
    this.recipeApi.getRecipeTypes().subscribe({
      next: (types) => {
        this.recipeTypeOptions.set(
          types.map((t) => ({ label: t.label, value: t.id })),
        );
        this.typesLoading.set(false);
      },
      error: () => {
        this.typesLoading.set(false);
        if (!this.formError()) {
          this.formError.set(
            'Impossible de charger les types de recette. Lancez les migrations backend (npm run migration:up).',
          );
        }
      },
    });
  }

  private uploadPhotoIfNeeded(saved: RecipeApiResponse, photo: File | null) {
    if (!photo) {
      return of(saved);
    }
    return this.recipeApi.uploadRecipeImage(saved.id, photo).pipe(
      switchMap((res) => of({ ...saved, imageUrl: res.imageUrl })),
    );
  }

  private loadRecipeForEdit(id: string): void {
    this.recipeLoading.set(true);
    this.recipeApi.getRecipeById(id).subscribe({
      next: (api) => {
        this.form.set(mapApiToRecipeForm(api));
        this.recipeLoading.set(false);
      },
      error: (err: unknown) => {
        this.recipeLoading.set(false);
        if (err instanceof HttpErrorResponse && err.status === 404) {
          this.formError.set('Recette introuvable.');
        } else {
          this.formError.set(
            'Impossible de charger la recette à modifier. Vérifiez que le backend tourne.',
          );
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
    }
    return isEdit
      ? 'Une erreur est survenue lors de la modification.'
      : 'Une erreur est survenue lors de la création.';
  }

  private patchForm(partial: Partial<CreateRecipeFormData>): void {
    this.form.update((current) => ({ ...current, ...partial }));
  }
}
