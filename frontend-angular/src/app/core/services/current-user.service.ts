import { Injectable, computed, inject } from '@angular/core';

import type { UserRole } from '@core/models/auth-api.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private readonly auth = inject(AuthService);

  readonly userId = computed(() => this.auth.user()?.id ?? null);
  readonly pseudo = computed(() => this.auth.user()?.pseudo ?? null);
  readonly role = computed(() => this.auth.user()?.role ?? null);
  readonly isAuthenticated = this.auth.isAuthenticated;

  readonly isAdmin = computed(() => this.role() === 'admin');
  readonly isModerator = computed(() => this.role() === 'moderator');
  readonly canModerateRecipes = computed(() => {
    const role = this.role();
    return role === 'moderator' || role === 'admin';
  });

  hasRole(...roles: UserRole[]): boolean {
    const current = this.role();
    return !!current && roles.includes(current);
  }
}
