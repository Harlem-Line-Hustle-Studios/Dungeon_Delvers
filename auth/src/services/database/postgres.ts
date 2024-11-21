import { Pool } from 'pg';

const { DB_USER, DB_HOST = 'localhost', DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

export const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: Number(DB_PORT),
});
