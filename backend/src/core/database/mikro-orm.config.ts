import '../../dotenv-load';
import { Migrator } from '@mikro-orm/migrations';
import { defineConfig, type Options } from '@mikro-orm/postgresql';
import { buildDriverOptions, resolveDbConfig } from './database-config';

const db = resolveDbConfig();
const driverOptions = buildDriverOptions(db.password);

const config: Options = defineConfig({
  host: db.host,
  port: db.port,
  user: db.user,
  password: db.password,
  dbName: db.dbName,
  ...(driverOptions ? { driverOptions } : {}),
  entities: ['dist/**/*.orm-entity.js'],
  entitiesTs: ['src/**/*.orm-entity.ts'],
  extensions: [Migrator],
  migrations: {
    path: './dist/migrations',
    pathTs: './src/migrations',
  },
});

export default config;
