import { resolve } from 'node:path';
import { config } from 'dotenv';

// Doit être importé avant `AppModule` (qui charge `mikro-orm.config`).
config({ path: resolve(process.cwd(), '.env') });
