import { Pool } from 'pg';

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.PRISMA_DATABASE_URL ||
  'postgres://9352450170d3f05d3da9068d697e1bb14ea78d5858dbd463a206ab1291697ed8:sk_yLaf1OsiHQAwbmymecm8F@db.prisma.io:5432/postgres?sslmode=require';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('[db] Unexpected error on idle Postgres client', err);
    });
  }
  return pool;
}

export async function queryDb<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const p = getDbPool();
  const res = await p.query(text, params);
  return res.rows as T[];
}
