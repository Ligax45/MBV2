import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type { UserRole } from '@core/models/auth-api.model';
import { environment } from '../../../environments/environment';

export interface AdminUserSummary {
  id: string;
  pseudo: string;
  role: UserRole;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getUsers(): Observable<AdminUserSummary[]> {
    return this.http.get<AdminUserSummary[]>(`${this.baseUrl}/admin/users`);
  }

  updateUserRole(userId: string, role: UserRole): Observable<AdminUserSummary> {
    return this.http.patch<AdminUserSummary>(
      `${this.baseUrl}/admin/users/${userId}/role`,
      { role },
    );
  }
}
