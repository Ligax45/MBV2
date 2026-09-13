import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { connexionRedirectQueryParams } from '@core/utils/auth-navigation.util';

function isAuthEndpoint(url: string): boolean {
  return /\/auth\/(login|register|refresh|logout|mfa)/.test(url);
}

function redirectToConnexion(router: Router): void {
  const queryParams = connexionRedirectQueryParams(router.url);
  void router.navigate(['/connexion'], queryParams ? { queryParams } : {});
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getAccessToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
        return throwError(() => err);
      }

      if (isAuthEndpoint(req.url) || req.url.includes('/auth/refresh')) {
        return throwError(() => err);
      }

      if (!auth.getRefreshToken()) {
        auth.logoutLocal();
        redirectToConnexion(router);
        return throwError(() => err);
      }

      return auth.refreshAccessToken().pipe(
        switchMap(() => {
          const newToken = auth.getAccessToken();
          if (!newToken) {
            return throwError(() => err);
          }
          return next(
            req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }),
          );
        }),
        catchError((refreshErr) => {
          auth.logoutLocal();
          redirectToConnexion(router);
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};
