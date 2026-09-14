import { isPlatformBrowser } from '@angular/common';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { Component, effect, inject, input, output, PLATFORM_ID } from '@angular/core';

import { NavListComponent } from '@layout/components/nav-list/nav-list.component';
import { SidebarAuthFooterComponent } from '@layout/components/sidebar-auth-footer/sidebar-auth-footer.component';

@Component({
  selector: 'app-mobile-menu',
  imports: [CdkTrapFocus, NavListComponent, SidebarAuthFooterComponent],
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.scss',
})
export class MobileMenuComponent {
  readonly open = input(false);
  readonly closed = output<void>();

  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    effect((onCleanup) => {
      if (!isPlatformBrowser(this.platformId) || !this.open()) {
        return;
      }

      document.body.style.overflow = 'hidden';

      const onEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          this.onClose();
        }
      };

      document.addEventListener('keydown', onEscape);

      onCleanup(() => {
        document.removeEventListener('keydown', onEscape);
        document.body.style.overflow = '';
      });
    });
  }

  onClose(): void {
    this.closed.emit();
  }
}
