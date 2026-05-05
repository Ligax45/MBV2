import { Migrator } from '@mikro-orm/migrations';
import { defineConfig, type Options } from '@mikro-orm/postgresql';

/**
 * Postgres + SCRAM (`pg`) exige un mot de passe de type **string**.
 * On prend DB_PASSWORD puis MIKRO_ORM_PASSWORD (MikroORM merge les vars MIKRO_ORM_* au boot).
 */
function resolveDbPassword(): string {
  const raw =
    process.env.DB_PASSWORD ?? process.env.MIKRO_ORM_PASSWORD ?? '';
  return String(raw);
}

const dbPassword = resolveDbPassword();

const config: Options = defineConfig({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER ?? 'postgres',
  password: dbPassword,
  driverOptions: {
    // Garantie côté pool `pg` (évite SCRAM avec `password: undefined`).
    password: dbPassword,
  },
  dbName: process.env.DB_NAME ?? 'miambookv2_db',
  entities: ['dist/**/*.orm-entity.js'],
  entitiesTs: ['src/**/*.orm-entity.ts'],
  extensions: [Migrator],
  migrations: {
    path: './dist/migrations',
    pathTs: './src/migrations',
  },
});

export default config;
