import { Injectable, signal } from '@angular/core';

import type { Alert, AlertSeverity } from '@shared/models/alert.model';

const DEFAULT_LIFE_MS = 5000;

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly _alerts = signal<Alert[]>([]);
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  readonly alerts = this._alerts.asReadonly();

  success(message: string, title?: string, life = DEFAULT_LIFE_MS): void {
    this.show('success', message, title, life);
  }

  info(message: string, title?: string, life = DEFAULT_LIFE_MS): void {
    this.show('info', message, title, life);
  }

  warning(message: string, title?: string, life = DEFAULT_LIFE_MS): void {
    this.show('warning', message, title, life);
  }

  error(message: string, title?: string, life = DEFAULT_LIFE_MS): void {
    this.show('error', message, title, life);
  }

  dismiss(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this._alerts.update((alerts) => alerts.filter((a) => a.id !== id));
  }

  private show(
    severity: AlertSeverity,
    message: string,
    title?: string,
    life = DEFAULT_LIFE_MS,
  ): void {
    const alert: Alert = {
      id: crypto.randomUUID(),
      severity,
      message,
      title,
    };

    this._alerts.update((alerts) => [...alerts, alert]);

    if (life > 0) {
      const timer = setTimeout(() => this.dismiss(alert.id), life);
      this.timers.set(alert.id, timer);
    }
  }
}
