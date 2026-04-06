import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { inboundEmails } from "@/db/schema";

export async function getLatestGmailForwardingVerification(userId: string) {
  const db = getDb();

  return db.query.inboundEmails.findFirst({
    where: and(
      eq(inboundEmails.userId, userId),
      eq(inboundEmails.emailType, "gmail_forwarding_verification"),
    ),
    orderBy: desc(inboundEmails.receivedAt),
  });
}
