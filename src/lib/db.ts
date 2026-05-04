import { Pool, types } from "pg";

// Return timestamps as UTC ISO strings instead of local Date objects
types.setTypeParser(types.builtins.TIMESTAMP, (val: string) => new Date(val + "Z").toISOString());
types.setTypeParser(types.builtins.TIMESTAMPTZ, (val: string) => new Date(val).toISOString());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

export default pool;
