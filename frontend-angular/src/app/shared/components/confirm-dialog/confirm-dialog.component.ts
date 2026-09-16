import { Component, computed, inject } from '@angular/core';
import { Button } from 'primeng/button';

import { AppDialogComponent } from '@shared/components/app-dialog/app-dialog.component';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [AppDialogComponent, Button],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly state = this.confirmDialog.state;

  protected readonly visible = computed(() => this.state()?.visible ?? false);

  protected onVisibleChange(next: boolean): void {
    if (!next) {
      this.confirmDialog.cancel();
    }
  }

  protected onCancel(): void {
    this.confirmDialog.cancel();
  }

  protected onConfirm(): void {
    this.confirmDialog.confirmAction();
  }
}
