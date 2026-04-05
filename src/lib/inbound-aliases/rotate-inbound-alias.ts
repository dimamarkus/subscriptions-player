import "server-only";
import { and, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { inboundAliases } from "@/db/schema";
import { createInboundAlias } from "@/lib/inbound-aliases/create-inbound-alias";

export async function rotateInboundAlias(userId: string) {
  const db = getDb();

  await db
    .update(inboundAliases)
    .set({
      status: "rotated",
      rotatedAt: new Date(),
    })
    .where(
      and(
        eq(inboundAliases.userId, userId),
        eq(inboundAliases.status, "active"),
      ),
    );

  return createInboundAlias(userId);
}
