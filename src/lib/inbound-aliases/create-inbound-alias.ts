import "server-only";
import { randomBytes } from "node:crypto";

import { getDb } from "@/db/client";
import { inboundAliases } from "@/db/schema";

const MAX_TOKEN_ATTEMPTS = 10;

function generateInboundAliasToken() {
  return randomBytes(9).toString("base64url").toLowerCase();
}

export async function createInboundAlias(userId: string) {
  const db = getDb();

  for (let attempt = 0; attempt < MAX_TOKEN_ATTEMPTS; attempt += 1) {
    const token = generateInboundAliasToken();

    const existingAlias = await db.query.inboundAliases.findFirst({
      where: (table, { eq }) => eq(table.token, token),
    });

    if (existingAlias) {
      continue;
    }

    const [createdAlias] = await db
      .insert(inboundAliases)
      .values({
        userId,
        token,
      })
      .returning();

    return createdAlias;
  }

  throw new Error("Failed to generate a unique inbound alias token.");
}
