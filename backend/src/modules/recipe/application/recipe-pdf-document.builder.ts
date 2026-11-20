import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import type { Recipe } from '../domain/entities/recipe.entity';
import {
  formatIngredientLine,
  formatRecipeTimesLine,
  formatStepLine,
} from './recipe-pdf-format.util';

export function buildRecipePdfDocument(recipe: Recipe): TDocumentDefinitions {
  const content: Content[] = [
    { text: recipe.title, style: 'title' },
  ];

  if (recipe.recipeType.label) {
    content.push({ text: recipe.recipeType.label, style: 'subtitle' });
  }

  const timesLine = formatRecipeTimesLine(recipe);
  if (timesLine) {
    content.push({ text: timesLine, style: 'meta' });
  }

  content.push({
    text: `Pour ${recipe.servings} personne${recipe.servings > 1 ? 's' : ''}`,
    style: 'meta',
  });

  content.push({ text: 'Ingrédients', style: 'section' });
  content.push({
    ul: recipe.ingredients
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(formatIngredientLine),
  });

  content.push({ text: 'Étapes', style: 'section' });
  content.push({
    ol: recipe.steps
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(formatStepLine),
  });

  if (recipe.equipment.length > 0) {
    content.push({ text: 'Équipement', style: 'section' });
    content.push({ ul: recipe.equipment.map((equipment) => equipment.label) });
  }

  content.push({
    text: 'Généré par MiamBook',
    style: 'footer',
    margin: [0, 24, 0, 0],
  });

  return {
    pageSize: 'A4',
    pageMargins: [40, 56, 40, 56],
    defaultStyle: { font: 'Roboto', fontSize: 11, lineHeight: 1.35 },
    content,
    styles: {
      title: { fontSize: 20, bold: true, margin: [0, 0, 0, 8] },
      subtitle: { fontSize: 12, color: '#666666', margin: [0, 0, 0, 6] },
      meta: { fontSize: 10, color: '#555555', margin: [0, 0, 0, 4] },
      section: { fontSize: 13, bold: true, margin: [0, 16, 0, 8] },
      footer: { fontSize: 9, color: '#888888', alignment: 'center' },
    },
  };
}
