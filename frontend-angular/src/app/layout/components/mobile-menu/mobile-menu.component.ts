import { Component, input, output } from '@angular/core';

import { NavListComponent } from '@layout/components/nav-list/nav-list.component';
import { SidebarAuthFooterComponent } from '@layout/components/sidebar-auth-footer/sidebar-auth-footer.component';

@Component({
  selector: 'app-mobile-menu',
  imports: [NavListComponent, SidebarAuthFooterComponent],
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.scss',
})
export class MobileMenuComponent {
  readonly open = input(false);
  readonly closed = output<void>();

  onClose(): void {
    this.closed.emit();
  }
}
