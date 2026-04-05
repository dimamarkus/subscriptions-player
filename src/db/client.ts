import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/db/schema";
import { getServerEnv } from "@/lib/env/server";

function createDb() {
  const sql = neon(getServerEnv().DATABASE_URL);

  return drizzle({
    client: sql,
    schema,
  });
}

let database: ReturnType<typeof createDb> | null = null;

export function getDb() {
  if (database) {
    return database;
  }

  database = createDb();

  return database;
}
