import "server-only";
import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { inboundAliases } from "@/db/schema";

export async function getActiveInboundAlias(userId: string) {
  return getDb().query.inboundAliases.findFirst({
    where: and(
      eq(inboundAliases.userId, userId),
      eq(inboundAliases.status, "active"),
    ),
    orderBy: desc(inboundAliases.createdAt),
  });
}
