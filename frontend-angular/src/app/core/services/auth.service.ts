import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, firstValueFrom, map, shareReplay, tap, throwError } from 'rxjs';

import type {
  AuthApiResponse,
  AuthSuccessResponse,
  AuthUser,
  LoginPayload,
  MfaSetupResponse,
  RegisterPayload,
} from '@core/models/auth-api.model';
import { isAuthSuccessResponse } from '@core/models/auth-api.model';
import { environment } from '../../../environments/environment';

const ACCESS_TOKEN_KEY = 'miambook_access_token';
const REFRESH_TOKEN_KEY = 'miambook_refresh_token';
const USER_STORAGE_KEY = 'miambook_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private readonly userSignal = signal<AuthUser | null>(this.readStoredUser());
  private refreshInFlight: Observable<void> | null = null;

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  login(payload: LoginPayload): Observable<AuthApiResponse> {
    return this.http
      .post<AuthApiResponse>(`${this.baseUrl}/auth/login`, payload)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  register(payload: RegisterPayload): Observable<AuthApiResponse> {
    return this.http
      .post<AuthApiResponse>(`${this.baseUrl}/auth/register`, payload)
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  verifyMfa(mfaSessionToken: string, totpCode: string): Observable<AuthSuccessResponse> {
    return this.http
      .post<AuthSuccessResponse>(`${this.baseUrl}/auth/mfa/verify`, {
        mfaSessionToken,
        totpCode,
      })
      .pipe(tap((response) => this.persistSession(response)));
  }

  setupMfaRequired(mfaSetupSessionToken: string): Observable<MfaSetupResponse> {
    return this.http.post<MfaSetupResponse>(`${this.baseUrl}/auth/mfa/setup-required`, {
      mfaSetupSessionToken,
    });
  }

  confirmMfaRequired(
    mfaSetupSessionToken: string,
    totpCode: string,
  ): Observable<AuthSuccessResponse> {
    return this.http
      .post<AuthSuccessResponse>(`${this.baseUrl}/auth/mfa/confirm-required`, {
        mfaSetupSessionToken,
        totpCode,
      })
      .pipe(tap((response) => this.persistSession(response)));
  }

  refreshAccessToken(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('NO_REFRESH_TOKEN'));
    }

    if (!this.refreshInFlight) {
      this.refreshInFlight = this.http
        .post<AuthSuccessResponse>(`${this.baseUrl}/auth/refresh`, { refreshToken })
        .pipe(
          tap((response) => this.persistSession(response)),
          map(() => undefined),
          finalize(() => {
            this.refreshInFlight = null;
          }),
          shareReplay(1),
        );
    }

    return this.refreshInFlight;
  }

  logout(): Observable<{ success: boolean } | void> {
    const refreshToken = this.getRefreshToken();
    this.clearSession();

    if (!refreshToken) {
      return new Observable((subscriber) => {
        subscriber.next();
        subscriber.complete();
      });
    }

    return this.http.post<{ success: boolean }>(`${this.baseUrl}/auth/logout`, {
      refreshToken,
    });
  }

  logoutLocal(): void {
    this.clearSession();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  async restoreSession(): Promise<void> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const storedUser = this.readStoredUser();

    if (!accessToken || !refreshToken || !storedUser) {
      this.clearSession();
      return;
    }

    this.userSignal.set(storedUser);

    try {
      const user = await firstValueFrom(
        this.http.get<AuthUser>(`${this.baseUrl}/auth/me`),
      );
      this.userSignal.set(user);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch {
      try {
        await firstValueFrom(this.refreshAccessToken());
        const user = await firstValueFrom(
          this.http.get<AuthUser>(`${this.baseUrl}/auth/me`),
        );
        this.userSignal.set(user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } catch {
        this.clearSession();
      }
    }
  }

  private handleAuthResponse(response: AuthApiResponse): void {
    if (isAuthSuccessResponse(response)) {
      this.persistSession(response);
    }
  }

  private persistSession(response: AuthSuccessResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
    this.userSignal.set(response.user);
  }

  private clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    this.userSignal.set(null);
  }

  private readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as AuthUser;
      if (parsed?.id && parsed?.pseudo) {
        return {
          ...parsed,
          role: parsed.role ?? 'user',
        };
      }
    } catch {
      return null;
    }

    return null;
  }
}
