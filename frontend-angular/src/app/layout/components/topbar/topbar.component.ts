import { Component, inject, output } from '@angular/core';

import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  private readonly themeService = inject(ThemeService);

  readonly mobileMenuToggle = output<void>();

  protected readonly theme = this.themeService.theme;

  onToggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.hidden = true;
    const fallback = img.nextElementSibling as HTMLElement | null;
    if (fallback) {
      fallback.hidden = false;
    }
  }
}
