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
  readonly dialogStyleClass = input('app-dialog');
  /** Hauteur fixe du corps (scroll interne). Utiliser les tokens `--dialog-*-content-height`. */
  readonly contentHeight = input<string | null>(null);
  readonly contentMinHeight = input('var(--dialog-content-min-height)');

  protected resolvedDialogStyleClass(): string {
    const classes = [this.dialogStyleClass()];
    if (this.contentHeight()) {
      classes.push('app-dialog--fixed-body');
    }
    return classes.join(' ');
  }

  protected dialogStyle(): Record<string, string> {
    const style: Record<string, string> = {
      width: this.width(),
      '--app-dialog-content-min-height': this.contentMinHeight(),
    };
    const height = this.contentHeight();
    if (height) {
      style['--app-dialog-content-height'] = height;
    }
    return style;
  }

  protected onVisibleChange(next: boolean): void {
    this.visible.set(next);
  }
}
