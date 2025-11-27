import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "../db/schema";

const connectionString = process.env.DATABASE_URL!;

export const pool = new Pool({
  connectionString: connectionString,
});

export const db = drizzle(pool, { schema });
