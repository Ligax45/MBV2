export const environment = {
  production: false,
  /** `true` = bouchons (`core/data/bouchon-*.ts`) ; `false` = API NestJS + Supabase */
  useMockData: false,
  /** Proxy dev Angular → backend NestJS (voir proxy.conf.json) */
  apiUrl: '/api',
};
