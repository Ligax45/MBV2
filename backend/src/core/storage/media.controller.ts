import { createReadStream, existsSync } from 'node:fs';
import { Controller, Get, NotFoundException, Param, StreamableFile } from '@nestjs/common';
import {
  isRecipeImageExtension,
  resolveRecipeCoverFile,
} from './recipe-image-path';

const EXTENSION_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

@Controller('media')
export class MediaController {
  @Get('recipes/:recipeId/cover.:extension')
  cover(
    @Param('recipeId') recipeId: string,
    @Param('extension') extension: string,
  ): StreamableFile {
    const normalized = extension.replace(/^\./, '').toLowerCase();
    const file = resolveRecipeCoverFile(recipeId, normalized);
    if (!file || !isRecipeImageExtension(normalized) || !existsSync(file)) {
      throw new NotFoundException('Image introuvable');
    }

    return new StreamableFile(createReadStream(file), {
      type: EXTENSION_MIME[normalized],
      disposition: 'inline',
    });
  }
}
