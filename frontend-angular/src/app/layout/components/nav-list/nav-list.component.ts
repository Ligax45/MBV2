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

  protected readonly visibleLinks = computed(() => {
    const authenticated = this.currentUser.isAuthenticated();
    return NAV_LINKS.filter((link) => !link.requiresAuth || authenticated);
  });

  protected readonly ctaLink = computed(
    () => this.visibleLinks().find((link) => link.variant === 'cta') ?? null,
  );

  protected readonly navLinks = computed(() =>
    this.visibleLinks().filter((link) => link.variant !== 'cta'),
  );

  protected readonly staffLinks = computed(() => {
    const links: NavLink[] = [];
    if (this.currentUser.canModerateRecipes()) {
      links.push({
        path: '/moderation',
        label: 'Modération',
        icon: 'pi pi-check-square',
      });
    }
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
