import { Pool } from 'pg';

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.PRISMA_DATABASE_URL ||
  'postgres://b705848675fcaeaaffd19fa01dfe8d0a734054357e3fd4df4d2941a82bcd444f:sk_4qKR3Mulr3zj64OfJHyz_@db.prisma.io:5432/postgres?sslmode=require';

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
