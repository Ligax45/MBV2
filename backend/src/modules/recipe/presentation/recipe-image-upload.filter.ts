import { BadRequestException } from '@nestjs/common';

const MAX_BYTES = 5 * 1024 * 1024;

export const recipeImageUploadOptions = {
  limits: { fileSize: MAX_BYTES },
  fileFilter: (
    _req: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      callback(
        new BadRequestException(
          'Format non supporté. Utilisez JPEG, PNG, WebP ou GIF.',
        ),
        false,
      );
      return;
    }
    callback(null, true);
  },
};
