import type { RecipeDetails } from './types';

/**
 * Bouchon détaillé pour "Tarte aux pommes" avec toutes les infos
 * disponibles lors de la création d'une recette.
 */
export const bouchonRecipeDetailsTarteAuxPommes: RecipeDetails = {
  id: '1',
  title: 'Tarte aux pommes',
  description:
    'Une tarte traditionnelle aux pommes, fondante et parfumée à la cannelle. La pâte est croustillante, la compotée onctueuse et les quartiers de pommes fondants.',
  imageUrl: 'https://images.unsplash.com/photo-1562007908-17c67e878c88?w=800',
  createdAt: '2024-01-15',
  difficulty: 'facile',
  creatorName: 'Marie Dupont',
  servings: 6,
  recipeType: 'dessert',
  equipment: ['four', 'moule', 'balance', 'robot-cuisine'],
  time: {
    preparationMinutes: 30,
    cookingMinutes: 35,
    restMinutes: 30,
  },
  ingredients: [
    { id: '1', quantity: '250', unit: 'g', name: 'Farine' },
    { id: '2', quantity: '125', unit: 'g', name: 'Beurre froid' },
    { id: '3', quantity: '1', unit: 'pincée', name: 'Sel' },
    { id: '4', quantity: '3', unit: 'c. à soupe', name: 'Eau froide' },
    { id: '5', quantity: '800', unit: 'g', name: 'Pommes (type Golden ou Granny Smith)' },
    { id: '6', quantity: '50', unit: 'g', name: 'Beurre' },
    { id: '7', quantity: '40', unit: 'g', name: 'Sucre' },
    { id: '8', quantity: '1', unit: 'c. à café', name: 'Cannelle' },
    { id: '9', quantity: '2', unit: 'c. à soupe', name: 'Confiture d\'abricot (pour napper)' },
  ],
  steps: [
    {
      id: '1',
      order: 1,
      content:
        'Préparer la pâte : dans le robot, mélanger la farine et le sel. Ajouter le beurre en dés et mixer par à-coups jusqu\'à obtenir un sablage. Verser l\'eau et former une boule. Filmer et réserver 30 min au frais.',
    },
    {
      id: '2',
      order: 2,
      content:
        'Étaler la pâte sur un plan fariné, la foncer dans un moule à tarte (26 cm), piquer le fond à la fourchette. Enfourner à blanc 10 min à 180 °C.',
    },
    {
      id: '3',
      order: 3,
      content:
        'Pendant ce temps, éplucher les pommes, en couper la moitié en dés (pour la compotée) et l\'autre moitié en quartiers (pour le dessus).',
    },
    {
      id: '4',
      order: 4,
      content:
        'Faire fondre 50 g de beurre dans une casserole, ajouter les dés de pommes, le sucre et la cannelle. Cuire 10 min à feu moyen en remuant, jusqu\'à obtenir une compotée. Laisser tiédir.',
    },
    {
      id: '5',
      order: 5,
      content:
        'Garnir le fond de tarte précuit avec la compotée. Disposer les quartiers de pommes en rosace sur le dessus. Enfourner 25 min à 180 °C.',
    },
    {
      id: '6',
      order: 6,
      content:
        'À la sortie du four, faire fondre la confiture avec une cuillère d\'eau et napper la tarte au pinceau. Servir tiède ou froid.',
    },
  ],
};
