import './dotenv-load';
import { MikroORM } from '@mikro-orm/postgresql';
import config from './core/database/mikro-orm.config';

function isConnectionError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|timeout|the database system is starting up|Connection terminated|connect ECONN/i.test(
    message,
  );
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function migrate(): Promise<void> {
  const attempts = 30;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const orm = await MikroORM.init(config);
      try {
        await orm.migrator.up();
      } finally {
        await orm.close(true);
      }
      return;
    } catch (error) {
      if (!isConnectionError(error) || attempt === attempts) {
        throw error;
      }
      console.warn(
        `PostgreSQL indisponible (tentative ${attempt}/${attempts}), nouvel essai...`,
      );
      await sleep(2000);
    }
  }
}

migrate().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
