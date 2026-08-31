export function isAcceptedRecipePhoto(file: File): boolean {
  return file.type.startsWith('image/');
}

export function blobToRecipePhotoFile(blob: Blob, originalName: string): File {
  const baseName = originalName.replace(/\.[^.]+$/, '') || 'recette';
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
}
