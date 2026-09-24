import { buildRecipePdfFilename } from './recipe-pdf-filename.util';

describe('buildRecipePdfFilename', () => {
  it('slugifies accents and spaces', () => {
    expect(buildRecipePdfFilename('Crème brûlée aux œufs')).toBe(
      'miambook-creme-brulee-aux-oeufs.pdf',
    );
  });

  it('falls back to recette for empty slug', () => {
    expect(buildRecipePdfFilename('!!!')).toBe('miambook-recette.pdf');
  });

  it('truncates long titles', () => {
    const longTitle = 'a'.repeat(120);
    const filename = buildRecipePdfFilename(longTitle);
    expect(filename).toMatch(/^miambook-a+\.pdf$/);
    expect(filename.length).toBeLessThanOrEqual('miambook-'.length + 80 + '.pdf'.length);
  });
});
