import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { connexionRedirectQueryParams } from '@core/utils/auth-navigation.util';
import { environment } from '../../../environments/environment';

function isAuthEndpoint(url: string): boolean {
  return /\/auth\/(login|register|refresh|logout|mfa)/.test(url);
}

function isApiRequest(url: string): boolean {
  return url.startsWith(environment.apiUrl) || url.startsWith('/api');
}

function redirectToConnexion(router: Router): void {
  const queryParams = connexionRedirectQueryParams(router.url);
  void router.navigate(['/connexion'], queryParams ? { queryParams } : {});
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const apiReq = isApiRequest(req.url)
    ? req.clone({ withCredentials: true })
    : req;

  return next(apiReq).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
        return throwError(() => err);
      }

      if (!isApiRequest(req.url) || isAuthEndpoint(req.url)) {
        return throwError(() => err);
      }

      return auth.refreshAccessToken().pipe(
        switchMap(() => next(apiReq.clone({ withCredentials: true }))),
        catchError((refreshErr) => {
          auth.logoutLocal();
          redirectToConnexion(router);
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};
