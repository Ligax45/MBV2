import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import type { UserRole } from '@core/models/auth-api.model';
import { CurrentUserService } from '@core/services/current-user.service';

export const roleGuard: CanActivateFn = (route) => {
  const currentUser = inject(CurrentUserService);
  const router = inject(Router);

  const allowedRoles = (route.data['roles'] as UserRole[] | undefined) ?? [];
  if (allowedRoles.length === 0) {
    return true;
  }

  if (currentUser.hasRole(...allowedRoles)) {
    return true;
  }

  return router.createUrlTree(['/']);
};
