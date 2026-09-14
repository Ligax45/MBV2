import { Component, computed, inject, input } from '@angular/core';

import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
})
export class ThemeToggleComponent {
  readonly variant = input<'compact' | 'sidebar'>('compact');

  private readonly themeService = inject(ThemeService);

  protected readonly isDark = computed(() => this.themeService.theme() === 'dark');

  protected readonly label = computed(() =>
    this.isDark() ? 'Activer le thème clair' : 'Activer le thème sombre',
  );

  protected readonly iconClass = computed(() =>
    this.isDark() ? 'pi pi-sun' : 'pi pi-moon',
  );

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
