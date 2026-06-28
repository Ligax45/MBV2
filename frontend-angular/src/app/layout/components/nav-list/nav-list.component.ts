import { Component, computed, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { CurrentUserService } from '@core/services/current-user.service';
import { NAV_LINKS } from '@layout/constants/nav-links.constant';
import type { NavLink } from '@layout/models/nav-link.model';

@Component({
  selector: 'app-nav-list',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-list.component.html',
  styleUrl: './nav-list.component.scss',
})
export class NavListComponent {
  private readonly currentUser = inject(CurrentUserService);

  readonly linkNavigate = output<void>();

  protected readonly navLinks = computed(() => {
    const links: NavLink[] = [...NAV_LINKS];
    if (this.currentUser.isAdmin()) {
      links.push({
        path: '/admin/utilisateurs',
        label: 'Administration',
        icon: 'pi pi-shield',
      });
    }
    return links;
  });

  onLinkClick(): void {
    this.linkNavigate.emit();
  }
}
