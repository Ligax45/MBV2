import { Component, inject, model, signal } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { Button } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { firstValueFrom } from 'rxjs';

import { RecipeDataService } from '@core/services/recipe-data.service';
import { downloadBlobAsFile } from '@core/utils/recipe-pdf-download.util';
import { buildRecipePdfFilename } from '@core/utils/recipe-pdf-filename.util';
import { AppDialogComponent } from '@shared/components/app-dialog/app-dialog.component';
import { AlertService } from '@shared/services/alert.service';

@Component({
  selector: 'app-recipe-pdf-preview',
  imports: [AppDialogComponent, Button, ProgressSpinner],
  templateUrl: './recipe-pdf-preview.component.html',
  styleUrl: './recipe-pdf-preview.component.scss',
})
export class RecipePdfPreviewComponent {
  private readonly recipeData = inject(RecipeDataService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly alertService = inject(AlertService);

  readonly visible = model(false);
  protected readonly generatingPdf = signal(false);
  protected readonly pdfBlob = signal<Blob | null>(null);
  protected readonly pdfPreviewUrl = signal<SafeResourceUrl | null>(null);

  private pdfObjectUrl: string | null = null;
  private recipeTitle: string | null = null;

  async open(recipeId: string, recipeTitle: string): Promise<void> {
    if (this.generatingPdf()) {
      return;
    }

    this.generatingPdf.set(true);
    this.recipeTitle = recipeTitle;

    try {
      const blob = await firstValueFrom(this.recipeData.downloadRecipePdf(recipeId));
      this.pdfBlob.set(blob);
      this.pdfObjectUrl = URL.createObjectURL(blob);
      this.pdfPreviewUrl.set(
        this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfObjectUrl),
      );
      this.visible.set(true);
    } catch (error: unknown) {
      await this.handleDownloadError(error);
    } finally {
      this.generatingPdf.set(false);
    }
  }

  protected onVisibleChange(next: boolean): void {
    if (!next) {
      this.close();
    }
  }

  protected close(): void {
    if (this.pdfObjectUrl) {
      URL.revokeObjectURL(this.pdfObjectUrl);
      this.pdfObjectUrl = null;
    }
    this.pdfPreviewUrl.set(null);
    this.pdfBlob.set(null);
    this.visible.set(false);
  }

  protected downloadPdf(): void {
    const blob = this.pdfBlob();
    const title = this.recipeTitle;
    if (!blob || !title) {
      return;
    }
    downloadBlobAsFile(blob, buildRecipePdfFilename(title));
  }

  protected openInNewTab(): void {
    if (!this.pdfObjectUrl) {
      return;
    }
    window.open(this.pdfObjectUrl, '_blank', 'noopener,noreferrer');
  }

  private async handleDownloadError(error: unknown): Promise<void> {
    if (error instanceof HttpErrorResponse && error.error instanceof Blob) {
      const type = error.error.type;
      if (type.includes('json') || type.includes('text')) {
        try {
          const text = await error.error.text();
          const body = JSON.parse(text) as { message?: string | string[] };
          const message = Array.isArray(body.message)
            ? body.message.join(', ')
            : body.message;
          this.alertService.error(message ?? 'Impossible de générer le PDF.');
          return;
        } catch {
          // ignore parse errors
        }
      }
    }

    if (error instanceof Error && error.message === 'MOCK_PDF_UNSUPPORTED') {
      this.alertService.warning(
        'L\u2019export PDF nécessite le backend (mode démo non supporté).',
      );
      return;
    }

    this.alertService.error('Impossible de générer le PDF.');
  }
}
