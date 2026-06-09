import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MobileMenuComponent } from '@layout/components/mobile-menu/mobile-menu.component';
import { SidebarComponent } from '@layout/components/sidebar/sidebar.component';
import { TopbarComponent } from '@layout/components/topbar/topbar.component';
import { AlertContainerComponent } from '@shared/components/alert-container/alert-container.component';

@Component({
  selector: 'app-layout',
  imports: [
    TopbarComponent,
    SidebarComponent,
    MobileMenuComponent,
    RouterOutlet,
    AlertContainerComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  protected readonly mobileMenuOpen = signal(false);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
