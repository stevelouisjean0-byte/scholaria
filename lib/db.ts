import { Pool } from "pg";

declare global {
  var __scholariaPool: Pool | undefined;
}

const pool =
  global.__scholariaPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined
  });

if (process.env.NODE_ENV !== "production") global.__scholariaPool = pool;

export const db = {
  query: (text: string, params?: unknown[]) => pool.query(text, params as never[]),
  pool
};
