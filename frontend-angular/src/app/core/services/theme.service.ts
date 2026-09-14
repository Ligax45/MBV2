import { Injectable, effect, signal } from '@angular/core';

export const THEME_STORAGE_KEY = 'miambook-theme';

export type Theme = 'light' | 'dark';

export function resolveInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyThemeClass(theme: Theme): void {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(resolveInitialTheme());

  constructor() {
    effect(() => {
      const theme = this.theme();
      applyThemeClass(theme);
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      if (localStorage.getItem(THEME_STORAGE_KEY)) {
        return;
      }

      this.theme.set(event.matches ? 'dark' : 'light');
    });
  }

  initialize(): void {
    applyThemeClass(this.theme());
  }

  toggleTheme(): void {
    this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }
}
