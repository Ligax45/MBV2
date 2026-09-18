import pdfMake from 'pdfmake';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

const robotoFonts = require('pdfmake/fonts/Roboto.js') as Record<
  string,
  {
    normal: string;
    bold: string;
    italics: string;
    bolditalics: string;
  }
>;

let fontsInitialized = false;

function ensureFonts(): void {
  if (!fontsInitialized) {
    pdfMake.addFonts(robotoFonts);
    fontsInitialized = true;
  }
}

export async function renderPdfToBuffer(
  doc: TDocumentDefinitions,
): Promise<Buffer> {
  ensureFonts();
  const pdf = pdfMake.createPdf(doc);
  return pdf.getBuffer();
}
