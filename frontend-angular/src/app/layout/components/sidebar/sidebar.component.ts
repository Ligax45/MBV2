import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { CurrentUserService } from '@core/services/current-user.service';
import { NavListComponent } from '@layout/components/nav-list/nav-list.component';

@Component({
  selector: 'app-sidebar',
  imports: [NavListComponent, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly currentUser = inject(CurrentUserService);
  private readonly router = inject(Router);

  protected readonly isAuthenticated = this.currentUser.isAuthenticated;
  protected readonly pseudo = this.currentUser.pseudo;

  protected readonly roleLabel = computed(() => {
    const role = this.currentUser.role();
    if (role === 'admin') return 'Administrateur';
    if (role === 'moderator') return 'Modérateur';
    return 'Membre';
  });

  avatarInitials(): string {
    const name = this.pseudo();
    if (!name) return 'MB';
    return name.charAt(0).toUpperCase();
  }

  onLogout(): void {
    this.auth.logout().subscribe({
      complete: () => void this.router.navigate(['/connexion']),
    });
  }
}
