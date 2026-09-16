import { Injectable, signal } from '@angular/core';

import type {
  ConfirmDialogOptions,
  ConfirmDialogState,
} from '@shared/models/confirm-dialog.model';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly _state = signal<ConfirmDialogState | null>(null);
  private pendingResolve: ((value: boolean) => void) | null = null;

  readonly state = this._state.asReadonly();

  confirm(options: ConfirmDialogOptions): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.pendingResolve) {
        resolve(false);
        return;
      }

      this.pendingResolve = resolve;
      this._state.set({
        ...options,
        confirmLabel: options.confirmLabel ?? 'Confirmer',
        cancelLabel: options.cancelLabel ?? 'Annuler',
        confirmSeverity: options.confirmSeverity ?? 'primary',
        visible: true,
      });
    });
  }

  confirmAction(): void {
    this.close(true);
  }

  cancel(): void {
    this.close(false);
  }

  private close(confirmed: boolean): void {
    this._state.update((state) => (state ? { ...state, visible: false } : null));

    const resolve = this.pendingResolve;
    this.pendingResolve = null;
    resolve?.(confirmed);

    queueMicrotask(() => {
      if (!this.pendingResolve) {
        this._state.set(null);
      }
    });
  }
}
