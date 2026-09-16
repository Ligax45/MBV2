export type ConfirmDialogSeverity = 'primary' | 'danger' | 'secondary';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmSeverity?: ConfirmDialogSeverity;
}

export interface ConfirmDialogState extends ConfirmDialogOptions {
  visible: boolean;
}
