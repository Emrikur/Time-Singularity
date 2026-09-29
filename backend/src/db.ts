import pg from 'pg';
import {getEnv} from './config/env'

const env = getEnv()
const { Pool } = pg

// Return DATE columns as plain "YYYY-MM-DD" strings instead of JS Dates,
// which would otherwise shift by the server's timezone when serialized
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default pool;
