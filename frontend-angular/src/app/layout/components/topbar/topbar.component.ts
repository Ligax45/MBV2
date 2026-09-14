import { Component, input, output } from '@angular/core';

import { ThemeToggleComponent } from '@layout/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-topbar',
  imports: [ThemeToggleComponent],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  readonly mobileMenuOpen = input(false);
  readonly mobileMenuToggle = output<void>();
}
