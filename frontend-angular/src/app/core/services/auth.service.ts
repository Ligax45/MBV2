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
      .post<AuthApiResponse>(`${this.baseUrl}/auth/login`, payload, {
        withCredentials: true,
      })
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  register(payload: RegisterPayload): Observable<AuthApiResponse> {
    return this.http
      .post<AuthApiResponse>(`${this.baseUrl}/auth/register`, payload, {
        withCredentials: true,
      })
      .pipe(tap((response) => this.handleAuthResponse(response)));
  }

  verifyMfa(mfaSessionToken: string, totpCode: string): Observable<AuthSuccessResponse> {
    return this.http
      .post<AuthSuccessResponse>(
        `${this.baseUrl}/auth/mfa/verify`,
        { mfaSessionToken, totpCode },
        { withCredentials: true },
      )
      .pipe(tap((response) => this.persistSession(response)));
  }

  setupMfaRequired(mfaSetupSessionToken: string): Observable<MfaSetupResponse> {
    return this.http.post<MfaSetupResponse>(
      `${this.baseUrl}/auth/mfa/setup-required`,
      { mfaSetupSessionToken },
      { withCredentials: true },
    );
  }

  confirmMfaRequired(
    mfaSetupSessionToken: string,
    totpCode: string,
  ): Observable<AuthSuccessResponse> {
    return this.http
      .post<AuthSuccessResponse>(
        `${this.baseUrl}/auth/mfa/confirm-required`,
        { mfaSetupSessionToken, totpCode },
        { withCredentials: true },
      )
      .pipe(tap((response) => this.persistSession(response)));
  }

  refreshAccessToken(): Observable<void> {
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.http
        .post<AuthSuccessResponse>(
          `${this.baseUrl}/auth/refresh`,
          {},
          { withCredentials: true },
        )
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
    this.clearSession();

    return this.http.post<{ success: boolean }>(
      `${this.baseUrl}/auth/logout`,
      {},
      { withCredentials: true },
    );
  }

  logoutLocal(): void {
    this.clearSession();
  }

  async restoreSession(): Promise<void> {
    try {
      const user = await firstValueFrom(
        this.http.get<AuthUser>(`${this.baseUrl}/auth/me`, {
          withCredentials: true,
        }),
      );
      this.persistUser(user);
    } catch {
      try {
        await firstValueFrom(this.refreshAccessToken());
        const user = await firstValueFrom(
          this.http.get<AuthUser>(`${this.baseUrl}/auth/me`, {
            withCredentials: true,
          }),
        );
        this.persistUser(user);
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
    this.persistUser(response.user);
  }

  private persistUser(user: AuthUser): void {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    this.userSignal.set(user);
  }

  private clearSession(): void {
    localStorage.removeItem(USER_STORAGE_KEY);
    // Legacy cleanup (ancien stockage Bearer).
    localStorage.removeItem('miambook_access_token');
    localStorage.removeItem('miambook_refresh_token');
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
