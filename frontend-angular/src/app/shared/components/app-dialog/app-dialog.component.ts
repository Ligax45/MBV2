import { Component, input, model } from '@angular/core';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-dialog',
  imports: [Dialog],
  templateUrl: './app-dialog.component.html',
  styleUrl: './app-dialog.component.scss',
})
export class AppDialogComponent {
  readonly title = input.required<string>();
  readonly visible = model(false);
  readonly closable = input(true);
  readonly dismissableMask = input(true);
  readonly width = input('min(95vw, 28rem)');

  protected dialogStyle(): Record<string, string> {
    return { width: this.width() };
  }

  protected onVisibleChange(next: boolean): void {
    this.visible.set(next);
  }
}
