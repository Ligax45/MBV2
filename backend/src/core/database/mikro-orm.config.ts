import { join } from 'node:path';
import '../../dotenv-load';
import { Migrator } from '@mikro-orm/migrations';
import { defineConfig, type Options } from '@mikro-orm/postgresql';
import { buildDriverOptions, resolveDbConfig } from './database-config';

const db = resolveDbConfig();
const driverOptions = buildDriverOptions(db.password);

/** Racine `dist/` en prod (config compilée dans `dist/core/database/`). */
const distRoot = join(__dirname, '..', '..');

const config: Options = defineConfig({
  host: db.host,
  port: db.port,
  user: db.user,
  password: db.password,
  dbName: db.dbName,
  ...(driverOptions ? { driverOptions } : {}),
  entities: [join(distRoot, '**', '*.orm-entity.js')],
  entitiesTs: ['src/**/*.orm-entity.ts'],
  extensions: [Migrator],
  migrations: {
    path: join(distRoot, 'migrations'),
    pathTs: './src/migrations',
  },
});

export default config;
