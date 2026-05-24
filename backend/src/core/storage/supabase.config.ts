export interface SupabaseStorageConfig {
  url: string;
  serviceRoleKey: string;
  bucket: string;
}

export function resolveSupabaseStorageConfig(): SupabaseStorageConfig | null {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'recipe-images';

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { url, serviceRoleKey, bucket };
}

export function buildPublicStorageUrl(
  config: SupabaseStorageConfig,
  objectPath: string,
): string {
  const base = config.url.replace(/\/$/, '');
  const path = objectPath.replace(/^\//, '');
  return `${base}/storage/v1/object/public/${config.bucket}/${path}`;
}
