/**
 * Résolution de la connexion PostgreSQL.
 * Priorité : DATABASE_URL puis DB_HOST / DB_PORT / …
 */

export interface DbConnectionParams {
  host: string;
  port: number;
  user: string;
  dbName: string;
}

export interface DbResolvedConfig extends DbConnectionParams {
  password: string;
}

/** Parse DATABASE_URL en paramètres explicites pour `pg` / SCRAM. */
export function parseDatabaseUrl(url: string): DbResolvedConfig {
  const parsed = new URL(url);

  return {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    dbName: parsed.pathname.replace(/^\//, '') || 'postgres',
  };
}

/** Connexion effective : DATABASE_URL prioritaire, sinon DB_HOST / …. */
export function resolveDbConfig(): DbResolvedConfig {
  const password = resolveEffectivePassword();
  const url = resolveDatabaseUrl();
  if (url) {
    return {
      ...parseDatabaseUrl(url),
      password,
    };
  }

  const conn = resolveDbConnection();
  return {
    ...conn,
    password,
  };
}

export function resolveDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL?.trim();
  return url || undefined;
}

export function resolveDbPassword(): string {
  const raw = process.env.DB_PASSWORD ?? process.env.MIKRO_ORM_PASSWORD ?? '';
  return String(raw);
}

/** Mot de passe pour SCRAM : .env ou extrait de DATABASE_URL. */
export function resolveEffectivePassword(): string {
  const fromEnv = resolveDbPassword();
  if (fromEnv) return fromEnv;

  const url = resolveDatabaseUrl();
  if (!url) return '';

  try {
    return decodeURIComponent(new URL(url).password);
  } catch {
    return '';
  }
}

/** SSL uniquement si `DB_SSL=true` ou si l'URI l'exige. */
export function shouldUseSsl(): boolean {
  const flag = process.env.DB_SSL?.toLowerCase();
  if (flag === 'true' || flag === '1') return true;
  if (flag === 'false' || flag === '0') return false;

  const url = resolveDatabaseUrl() ?? '';
  return url.includes('sslmode=require') || url.includes('ssl=true');
}

export function resolveDbConnection(): DbConnectionParams {
  return {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    dbName: process.env.DB_NAME ?? 'miambookv2_db',
  };
}

/**
 * Options passées au pool `pg` (fusionnées par MikroORM dans driverOptions).
 * Utiliser `ssl` à la racine — pas `connection.ssl` (incompatible pg 8 / MikroORM 7).
 */
export function buildDriverOptions(password: string):
  | {
      password?: string;
      ssl?: { rejectUnauthorized: boolean };
    }
  | undefined {
  const opts: {
    password?: string;
    ssl?: { rejectUnauthorized: boolean };
  } = {};

  if (password) {
    opts.password = password;
  }
  if (shouldUseSsl()) {
    opts.ssl = { rejectUnauthorized: false };
  }

  if (!opts.password && !opts.ssl) {
    return undefined;
  }

  return opts;
}
