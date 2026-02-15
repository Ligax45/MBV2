import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/shared/components/ui/button';
import type { CreateRecipeFormData } from './types';
import {
  RecipeTitleField,
  RecipePhotoField,
  RecipeServingsField,
  RecipeTypeField,
  RecipeEquipmentField,
  RecipeTimeField,
  RecipeIngredientsField,
  RecipeStepsField,
} from './fields';

const initialFormData: CreateRecipeFormData = {
  title: '',
  photo: null,
  photoPreview: null,
  servings: 2,
  recipeType: '',
  equipment: [],
  time: {
    preparationMinutes: 0,
    cookingMinutes: 0,
    restMinutes: 0,
  },
  ingredients: [],
  steps: [],
};

export function CreateRecipeForm() {
  const [formData, setFormData] = useState<CreateRecipeFormData>(initialFormData);
  const [titleError, setTitleError] = useState<string | null>(null);

  function updateField<K extends keyof CreateRecipeFormData>(
    field: K,
    value: CreateRecipeFormData[K],
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'title') setTitleError(null);
  }

  function handlePhotoChange(file: File | null, preview: string | null) {
    setFormData((prev) => ({ ...prev, photo: file, photoPreview: preview }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const title = formData.title.trim();
    if (!title) {
      setTitleError('Le titre est obligatoire');
      return;
    }
    // TODO: soumission vers l'API
    console.log('Form submitted:', formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
          <CardDescription>
            Titre, photo et type de votre recette
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <RecipeTitleField
            value={formData.title}
            onChange={(v) => updateField('title', v)}
            error={titleError ?? undefined}
          />
          <RecipePhotoField
            photoPreview={formData.photoPreview}
            onPhotoChange={handlePhotoChange}
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <RecipeServingsField value={formData.servings} />
            <RecipeTypeField
              value={formData.recipeType}
              onChange={(v) => updateField('recipeType', v)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Équipement et temps</CardTitle>
          <CardDescription>
            Outils nécessaires et durée de préparation
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <RecipeEquipmentField
            value={formData.equipment}
            onChange={(v) => updateField('equipment', v)}
          />
          <Separator />
          <RecipeTimeField
            value={formData.time}
            onChange={(v) => updateField('time', v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingrédients</CardTitle>
          <CardDescription>
            Liste des ingrédients avec quantités et unités
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecipeIngredientsField
            ingredients={formData.ingredients}
            onChange={(v) => updateField('ingredients', v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Étapes de réalisation</CardTitle>
          <CardDescription>
            Décrivez les étapes dans l'ordre
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecipeStepsField
            steps={formData.steps}
            onChange={(v) => updateField('steps', v)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">
          Annuler
        </Button>
        <Button type="submit">Créer la recette</Button>
      </div>
    </form>
  );
}
