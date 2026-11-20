export function buildRecipePdfFilename(title: string): string {
  const slug = slugifyRecipeTitle(title);
  return `miambook-${slug}.pdf`;
}

function slugifyRecipeTitle(title: string): string {
  return (
    title
      .replace(/œ/gi, 'oe')
      .replace(/æ/gi, 'ae')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'recette'
  );
}
