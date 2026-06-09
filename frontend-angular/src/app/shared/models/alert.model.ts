export type AlertSeverity = 'success' | 'info' | 'warning' | 'error';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  title?: string;
}
