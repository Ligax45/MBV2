import { Component, inject } from '@angular/core';

import { AlertService } from '@shared/services/alert.service';
import type { AlertSeverity } from '@shared/models/alert.model';

const SEVERITY_ICONS: Record<AlertSeverity, string> = {
  success: 'pi-check-circle',
  info: 'pi-info-circle',
  warning: 'pi-exclamation-triangle',
  error: 'pi-times-circle',
};

@Component({
  selector: 'app-alert-container',
  templateUrl: './alert-container.component.html',
  styleUrl: './alert-container.component.scss',
})
export class AlertContainerComponent {
  private readonly alertService = inject(AlertService);

  protected readonly alerts = this.alertService.alerts;

  protected iconFor(severity: AlertSeverity): string {
    return SEVERITY_ICONS[severity];
  }

  protected dismiss(id: string): void {
    this.alertService.dismiss(id);
  }
}
