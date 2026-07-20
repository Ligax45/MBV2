import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Select } from 'primeng/select';
import { Tag } from 'primeng/tag';

import type { UserRole } from '@core/models/auth-api.model';
import {
  AdminApiService,
  type AdminUserSummary,
} from '@core/services/admin-api.service';
import { CurrentUserService } from '@core/services/current-user.service';
import { formatDateFr } from '@core/utils/recipe-format.util';
import { AlertService } from '@shared/services/alert.service';

interface UserRow extends AdminUserSummary {
  pendingRole: UserRole;
  saving: boolean;
}

@Component({
  selector: 'app-admin-users',
  imports: [FormsModule, Card, Button, Select, Tag, ProgressSpinner],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
})
export class AdminUsersComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  private readonly currentUser = inject(CurrentUserService);
  private readonly alertService = inject(AlertService);

  protected readonly loading = signal(true);
  protected readonly users = signal<UserRow[]>([]);

  protected readonly roleOptions: { label: string; value: UserRole }[] = [
    { label: 'Utilisateur', value: 'user' },
    { label: 'Modérateur', value: 'moderator' },
    { label: 'Administrateur', value: 'admin' },
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  protected formatDate(iso: string): string {
    return formatDateFr(iso);
  }

  protected roleLabel(role: UserRole): string {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'moderator':
        return 'Modérateur';
      default:
        return 'Utilisateur';
    }
  }

  protected roleSeverity(
    role: UserRole,
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'moderator':
        return 'warn';
      default:
        return 'info';
    }
  }

  protected isCurrentUser(row: UserRow): boolean {
    return row.id === this.currentUser.userId();
  }

  protected hasRoleChange(row: UserRow): boolean {
    return row.pendingRole !== row.role;
  }

  protected onSaveRole(row: UserRow): void {
    if (!this.hasRoleChange(row) || row.saving) return;

    row.saving = true;
    this.adminApi.updateUserRole(row.id, row.pendingRole).subscribe({
      next: (updated) => {
        row.role = updated.role;
        row.pendingRole = updated.role;
        row.saving = false;
        this.users.set([...this.users()]);
        this.alertService.success(
          `Rôle de ${updated.pseudo} mis à jour.`,
          'Administration',
          3000,
        );
      },
      error: (err: unknown) => {
        row.saving = false;
        row.pendingRole = row.role;
        this.users.set([...this.users()]);
        const message = this.resolveError(err);
        this.alertService.error(message, 'Modification impossible');
      },
    });
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.adminApi.getUsers().subscribe({
      next: (items) => {
        this.users.set(
          items.map((user) => ({
            ...user,
            pendingRole: user.role,
            saving: false,
          })),
        );
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.alertService.error(this.resolveError(err), 'Chargement impossible');
      },
    });
  }

  private resolveError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { message?: string | string[] } | null;
      if (Array.isArray(body?.message)) {
        return body.message.join(', ');
      }
      if (typeof body?.message === 'string') {
        return body.message;
      }
      if (err.status === 403) {
        return 'Accès réservé aux administrateurs.';
      }
    }
    return 'Une erreur est survenue.';
  }
}
