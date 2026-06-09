import { Component, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { NAV_LINKS } from '@layout/constants/nav-links.constant';

@Component({
  selector: 'app-nav-list',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-list.component.html',
  styleUrl: './nav-list.component.scss',
})
export class NavListComponent {
  readonly linkNavigate = output<void>();

  protected readonly navLinks = NAV_LINKS;

  onLinkClick(): void {
    this.linkNavigate.emit();
  }
}
