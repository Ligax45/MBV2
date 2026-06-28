import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';

import type { AuthApiResponse } from '@core/models/auth-api.model';
import {
  isAuthSuccessResponse,
  isMfaRequiredResponse,
  isMfaSetupRequiredResponse,
} from '@core/models/auth-api.model';
import { AuthService } from '@core/services/auth.service';
import { AlertService } from '@shared/services/alert.service';

type AuthView = 'login' | 'register' | 'mfa' | 'mfa-setup';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, RouterLink, Card, InputText, Password, Button],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly alertService = inject(AlertService);

  protected readonly view = signal<AuthView>('login');
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected identifiant = '';
  protected pseudo = '';
  protected password = '';
  protected confirmPassword = '';
  protected totpCode = '';

  protected mfaSessionToken = '';
  protected mfaSetupSessionToken = '';
  protected mfaSecret = '';
  protected otpauthUri = '';
  protected qrCodeUrl = '';

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      void this.navigateAfterAuth();
    }
  }

  protected setView(next: AuthView): void {
    this.view.set(next);
    this.formError.set(null);
  }

  protected onSubmitLogin(): void {
    if (!this.identifiant.trim() || !this.password) {
      this.formError.set('Renseignez votre identifiant et votre mot de passe.');
      return;
    }

    this.submitting.set(true);
    this.formError.set(null);

    this.auth
      .login({
        identifiant: this.identifiant.trim(),
        password: this.password,
      })
      .subscribe({
        next: (response) => this.handleAuthApiResponse(response),
        error: (err) => this.handleError(err, 'Connexion impossible'),
      });
  }

  protected onSubmitRegister(): void {
    if (!this.identifiant.trim() || !this.pseudo.trim() || !this.password) {
      this.formError.set('Tous les champs sont obligatoires.');
      return;
    }
    if (this.password.length < 8) {
      this.formError.set('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.formError.set('Les mots de passe ne correspondent pas.');
      return;
    }

    this.submitting.set(true);
    this.formError.set(null);

    this.auth
      .register({
        identifiant: this.identifiant.trim(),
        pseudo: this.pseudo.trim(),
        password: this.password,
      })
      .subscribe({
        next: (response) => this.handleAuthApiResponse(response),
        error: (err) => this.handleError(err, 'Inscription impossible'),
      });
  }

  protected onSubmitMfa(): void {
    if (!this.totpCode.trim()) {
      this.formError.set('Saisissez le code à 6 chiffres.');
      return;
    }

    this.submitting.set(true);
    this.formError.set(null);

    this.auth.verifyMfa(this.mfaSessionToken, this.totpCode.trim()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.alertService.success('Connexion réussie.', 'Bienvenue', 3000);
        void this.navigateAfterAuth();
      },
      error: (err) => this.handleError(err, 'Code invalide'),
    });
  }

  protected onSubmitMfaSetup(): void {
    if (!this.totpCode.trim()) {
      this.formError.set('Saisissez le code à 6 chiffres de votre application.');
      return;
    }

    this.submitting.set(true);
    this.formError.set(null);

    this.auth
      .confirmMfaRequired(this.mfaSetupSessionToken, this.totpCode.trim())
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.alertService.success(
            'Authentification à deux facteurs activée.',
            'Compte sécurisé',
            4000,
          );
          void this.navigateAfterAuth();
        },
        error: (err) => this.handleError(err, 'Activation MFA impossible'),
      });
  }

  private handleAuthApiResponse(response: AuthApiResponse): void {
    this.submitting.set(false);

    if (isAuthSuccessResponse(response)) {
      this.alertService.success('Connexion réussie.', 'Bienvenue', 3000);
      void this.navigateAfterAuth();
      return;
    }

    if (isMfaRequiredResponse(response)) {
      this.mfaSessionToken = response.mfaSessionToken;
      this.totpCode = '';
      this.view.set('mfa');
      return;
    }

    if (isMfaSetupRequiredResponse(response)) {
      this.mfaSetupSessionToken = response.mfaSetupSessionToken;
      this.startMfaSetup(response.mfaSetupSessionToken);
    }
  }

  private startMfaSetup(mfaSetupSessionToken: string): void {
    this.submitting.set(true);
    this.auth.setupMfaRequired(mfaSetupSessionToken).subscribe({
      next: (setup) => {
        this.submitting.set(false);
        this.mfaSecret = setup.secret;
        this.otpauthUri = setup.otpauthUri;
        this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setup.otpauthUri)}`;
        this.totpCode = '';
        this.view.set('mfa-setup');
      },
      error: (err) => this.handleError(err, 'Configuration MFA impossible'),
    });
  }

  private navigateAfterAuth(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
    void this.router.navigateByUrl(returnUrl);
  }

  private handleError(err: unknown, fallback: string): void {
    this.submitting.set(false);
    const message = this.resolveErrorMessage(err, fallback);
    this.formError.set(message);
  }

  private resolveErrorMessage(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { message?: string | string[] } | null;
      if (Array.isArray(body?.message)) {
        return body.message.join(', ');
      }
      if (typeof body?.message === 'string') {
        return body.message;
      }
      if (err.status === 0) {
        return 'Backend inaccessible. Vérifiez que le serveur tourne sur le port 3333.';
      }
      if (err.status === 401) {
        return 'Identifiant ou mot de passe incorrect.';
      }
      if (err.status === 409) {
        return 'Cet identifiant est déjà utilisé — connectez-vous ou choisissez un autre identifiant.';
      }
    }
    return fallback;
  }
}
