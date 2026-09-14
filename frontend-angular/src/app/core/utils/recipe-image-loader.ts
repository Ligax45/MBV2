import type { ImageLoaderConfig } from '@angular/common';

/**
 * Loader pass-through avec redimensionnement Unsplash quand NgOptimizedImage fournit une largeur.
 */
export function recipeImageLoader({ src, width }: ImageLoaderConfig): string {
  if (!width || !src.includes('images.unsplash.com')) {
    return src;
  }

  try {
    const url = new URL(src);
    url.searchParams.set('w', String(Math.min(Math.round(width * 2), 800)));
    url.searchParams.set('auto', 'format');
    url.searchParams.set('q', '80');
    return url.toString();
  } catch {
    return src;
  }
}
