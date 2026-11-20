import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalImageStorageService } from './local-image-storage.service';

const RECIPE_ID = '11111111-1111-4111-8111-111111111111';

describe('LocalImageStorageService', () => {
  let directory: string;
  const previous = process.env.RECIPE_IMAGES_DIR;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'mbv2-images-'));
    process.env.RECIPE_IMAGES_DIR = directory;
  });

  afterEach(async () => {
    if (previous === undefined) {
      delete process.env.RECIPE_IMAGES_DIR;
    } else {
      process.env.RECIPE_IMAGES_DIR = previous;
    }
    await rm(directory, { recursive: true, force: true });
  });

  it('écrit la couverture sur le disque et retourne son URL /api', async () => {
    const service = new LocalImageStorageService();
    const url = await service.uploadRecipeCover(
      RECIPE_ID,
      Buffer.from('image-jpeg'),
      'jpg',
    );

    expect(url).toBe(`/api/media/recipes/${RECIPE_ID}/cover.jpg`);
    await expect(
      readFile(join(directory, 'recipes', RECIPE_ID, 'cover.jpg'), 'utf8'),
    ).resolves.toBe('image-jpeg');
  });

  it('remplace une ancienne extension', async () => {
    const service = new LocalImageStorageService();
    await service.uploadRecipeCover(RECIPE_ID, Buffer.from('png'), 'png');
    await service.uploadRecipeCover(RECIPE_ID, Buffer.from('jpg'), 'jpg');

    await expect(
      readFile(join(directory, 'recipes', RECIPE_ID, 'cover.png')),
    ).rejects.toThrow();
    await expect(
      readFile(join(directory, 'recipes', RECIPE_ID, 'cover.jpg'), 'utf8'),
    ).resolves.toBe('jpg');
  });
});
