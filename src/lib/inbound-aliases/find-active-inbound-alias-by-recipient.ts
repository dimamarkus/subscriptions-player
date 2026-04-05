import "server-only";
import { and, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { inboundAliases } from "@/db/schema";
import { extractEmailAddress } from "@/lib/email/extract-email-address";
import { getServerEnv } from "@/lib/env/server";

function extractInboundAliasToken(emailAddress: string) {
  const normalizedEmail = emailAddress.toLowerCase();
  const domain = getServerEnv().INBOUND_EMAIL_DOMAIN.toLowerCase();

  if (!normalizedEmail.endsWith(`@${domain}`)) {
    return null;
  }

  const localPart = normalizedEmail.slice(0, normalizedEmail.indexOf("@"));

  if (!localPart.startsWith("u_")) {
    return null;
  }

  return localPart.slice(2);
}

export async function findActiveInboundAliasByRecipients(recipients: string[]) {
  for (const recipient of recipients) {
    const emailAddress = extractEmailAddress(recipient);

    if (!emailAddress) {
      continue;
    }

    const token = extractInboundAliasToken(emailAddress);

    if (!token) {
      continue;
    }

    const alias = await getDb().query.inboundAliases.findFirst({
      where: and(
        eq(inboundAliases.token, token),
        eq(inboundAliases.status, "active"),
      ),
    });

    if (alias) {
      return {
        alias,
        matchedRecipient: emailAddress,
      };
    }
  }

  return null;
}
