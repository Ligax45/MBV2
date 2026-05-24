import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  buildPublicStorageUrl,
  resolveSupabaseStorageConfig,
  type SupabaseStorageConfig,
} from './supabase.config';

@Injectable()
export class SupabaseStorageService {
  private readonly config: SupabaseStorageConfig | null;
  private readonly client: SupabaseClient | null;

  constructor() {
    this.config = resolveSupabaseStorageConfig();
    this.client = this.config
      ? createClient(this.config.url, this.config.serviceRoleKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      : null;
  }

  isConfigured(): boolean {
    return this.client !== null && this.config !== null;
  }

  async uploadRecipeCover(
    recipeId: string,
    file: Buffer,
    contentType: string,
    extension: string,
  ): Promise<string> {
    if (!this.client || !this.config) {
      throw new ServiceUnavailableException(
        'Supabase Storage non configuré (SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env).',
      );
    }

    const safeExt = extension.replace(/^\./, '').toLowerCase() || 'jpg';
    const objectPath = `recipes/${recipeId}/cover.${safeExt}`;

    const { error } = await this.client.storage
      .from(this.config.bucket)
      .upload(objectPath, file, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw new ServiceUnavailableException(
        `Échec upload Supabase Storage : ${error.message}`,
      );
    }

    return buildPublicStorageUrl(this.config, objectPath);
  }
}
