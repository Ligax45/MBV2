import { Component, input, output } from '@angular/core';

import { NavListComponent } from '@layout/components/nav-list/nav-list.component';

@Component({
  selector: 'app-mobile-menu',
  imports: [NavListComponent],
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.css',
})
export class MobileMenuComponent {
  readonly open = input(false);
  readonly closed = output<void>();

  onClose(): void {
    this.closed.emit();
  }
}
