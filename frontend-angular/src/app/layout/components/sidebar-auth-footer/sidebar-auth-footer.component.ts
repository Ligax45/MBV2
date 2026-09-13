import { Component, computed, inject, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { CurrentUserService } from '@core/services/current-user.service';

@Component({
  selector: 'app-sidebar-auth-footer',
  imports: [RouterLink],
  templateUrl: './sidebar-auth-footer.component.html',
  styleUrl: './sidebar-auth-footer.component.scss',
})
export class SidebarAuthFooterComponent {
  private readonly auth = inject(AuthService);
  private readonly currentUser = inject(CurrentUserService);
  private readonly router = inject(Router);

  readonly action = output<void>();

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

  onLoginClick(): void {
    this.action.emit();
  }

  onLogout(): void {
    this.action.emit();
    this.auth.logout().subscribe({
      next: () => void this.router.navigate(['/']),
      error: () => void this.router.navigate(['/']),
    });
  }
}
