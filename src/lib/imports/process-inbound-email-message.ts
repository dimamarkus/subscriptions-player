import "server-only";
import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  inboundEmails,
  releaseImportOccurrences,
  releases,
  userReleases,
} from "@/db/schema";
import { enrichRelease } from "@/lib/bandcamp/enrich-release";
import { extractOriginalBandcampEmailSentOn } from "@/lib/email/extract-original-bandcamp-email-sent-on";
import { parseGmailForwardingVerification } from "@/lib/email/parse-gmail-forwarding-verification";
import { extractBandcampReleaseLinks } from "@/lib/bandcamp/extract-bandcamp-release-links";
import { findActiveInboundAliasByRecipients } from "@/lib/inbound-aliases/find-active-inbound-alias-by-recipient";
import type { ProcessInboundEmailMessage } from "@/lib/queues/inbound-email-queue";
import { getReceivedEmail } from "@/lib/resend/get-received-email";

export class NonRetryableImportError extends Error {}

async function upsertInboundEmailRecord(input: {
  webhookEventId: string;
  userId: string;
  resendEmailId: string;
  messageIdHeader: string | null | undefined;
  fromEmail: string;
  toEmail: string;
  subject: string;
  receivedAt: string;
  headersJson: Record<string, string> | null | undefined;
  rawLinksJson: string[];
  emailType?: "bandcamp_import" | "gmail_forwarding_verification";
  originalEmailSentOn?: string | null | undefined;
  gmailForwardingConfirmationUrl?: string | null | undefined;
  gmailForwardingConfirmationCode?: string | null | undefined;
}) {
  const db = getDb();

  const existingInboundEmail = await db.query.inboundEmails.findFirst({
    where: eq(inboundEmails.resendEmailId, input.resendEmailId),
  });

  if (existingInboundEmail) {
    const [updatedInboundEmail] = await db
      .update(inboundEmails)
      .set({
        userId: input.userId,
        webhookEventId: input.webhookEventId,
        messageIdHeader: input.messageIdHeader ?? null,
        fromEmail: input.fromEmail,
        toEmail: input.toEmail,
        subject: input.subject,
        receivedAt: new Date(input.receivedAt),
        headersJson: input.headersJson ?? null,
        rawLinksJson: input.rawLinksJson,
        emailType: input.emailType ?? "bandcamp_import",
        originalEmailSentOn: input.originalEmailSentOn ?? null,
        gmailForwardingConfirmationUrl:
          input.gmailForwardingConfirmationUrl ?? null,
        gmailForwardingConfirmationCode:
          input.gmailForwardingConfirmationCode ?? null,
        updatedAt: new Date(),
      })
      .where(eq(inboundEmails.id, existingInboundEmail.id))
      .returning();

    return updatedInboundEmail;
  }

  const [createdInboundEmail] = await db
    .insert(inboundEmails)
    .values({
      webhookEventId: input.webhookEventId,
      userId: input.userId,
      resendEmailId: input.resendEmailId,
      messageIdHeader: input.messageIdHeader ?? null,
      fromEmail: input.fromEmail,
      toEmail: input.toEmail,
      subject: input.subject,
      receivedAt: new Date(input.receivedAt),
      headersJson: input.headersJson ?? null,
      rawLinksJson: input.rawLinksJson,
      emailType: input.emailType ?? "bandcamp_import",
      originalEmailSentOn: input.originalEmailSentOn ?? null,
      gmailForwardingConfirmationUrl: input.gmailForwardingConfirmationUrl ?? null,
      gmailForwardingConfirmationCode:
        input.gmailForwardingConfirmationCode ?? null,
      parseStatus: "processing",
    })
    .returning();

  return createdInboundEmail;
}

async function upsertReleaseRecord(input: {
  canonicalUrl: string;
  host: string;
  releaseType: "album" | "track";
}) {
  const db = getDb();
  const existingRelease = await db.query.releases.findFirst({
    where: eq(releases.canonicalUrl, input.canonicalUrl),
  });

  if (existingRelease) {
    const [updatedRelease] = await db
      .update(releases)
      .set({
        bandcampDomain: input.host,
        releaseType: input.releaseType,
        updatedAt: new Date(),
      })
      .where(eq(releases.id, existingRelease.id))
      .returning();

    return updatedRelease;
  }

  const [createdRelease] = await db
    .insert(releases)
    .values({
      canonicalUrl: input.canonicalUrl,
      bandcampDomain: input.host,
      releaseType: input.releaseType,
    })
    .returning();

  return createdRelease;
}

async function maybeEnrichRelease(input: {
  releaseId: string;
  canonicalUrl: string;
  releaseType: "album" | "track";
  resolvedStatus: string;
  embedUrl: string | null;
  releaseTitle: string | null;
  artistName: string | null;
}) {
  if (
    input.embedUrl &&
    input.releaseTitle &&
    input.artistName &&
    input.resolvedStatus === "embed_ready"
  ) {
    return;
  }

  try {
    await enrichRelease({
      releaseId: input.releaseId,
      canonicalUrl: input.canonicalUrl,
      releaseType: input.releaseType,
    });
  } catch {
    // Keep queue import successful even if metadata enrichment fails.
  }
}

async function upsertUserReleaseRecord(input: {
  userId: string;
  releaseId: string;
}) {
  const db = getDb();
  const existingUserRelease = await db.query.userReleases.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.userId, input.userId), eq(table.releaseId, input.releaseId)),
  });

  if (existingUserRelease) {
    const [updatedUserRelease] = await db
      .update(userReleases)
      .set({
        lastSeenAt: new Date(),
        importCount: existingUserRelease.importCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(userReleases.id, existingUserRelease.id))
      .returning();

    return updatedUserRelease;
  }

  const [createdUserRelease] = await db
    .insert(userReleases)
    .values({
      userId: input.userId,
      releaseId: input.releaseId,
    })
    .returning();

  return createdUserRelease;
}

async function createReleaseImportOccurrence(input: {
  userReleaseId: string;
  inboundEmailId: string;
}) {
  const db = getDb();
  const existingOccurrence = await db.query.releaseImportOccurrences.findFirst({
    where: (table, { and, eq }) =>
      and(
        eq(table.userReleaseId, input.userReleaseId),
        eq(table.inboundEmailId, input.inboundEmailId),
      ),
  });

  if (existingOccurrence) {
    return existingOccurrence;
  }

  const [createdOccurrence] = await db
    .insert(releaseImportOccurrences)
    .values(input)
    .returning();

  return createdOccurrence;
}

export async function processInboundEmailMessage(
  message: ProcessInboundEmailMessage,
) {
  const receivedEmail = await getReceivedEmail(message.providerEventId);
  const matchedAlias = await findActiveInboundAliasByRecipients(receivedEmail.to);

  if (!matchedAlias) {
    throw new NonRetryableImportError(
      "Could not match the inbound email recipient to an active alias.",
    );
  }

  const extractedLinks = extractBandcampReleaseLinks({
    html: receivedEmail.html,
    text: receivedEmail.text,
  });
  const gmailForwardingVerification = parseGmailForwardingVerification({
    fromEmail: receivedEmail.from,
    subject: receivedEmail.subject,
    html: receivedEmail.html,
    text: receivedEmail.text,
  });
  const originalBandcampEmailSentOn = extractOriginalBandcampEmailSentOn({
    subject: receivedEmail.subject,
    html: receivedEmail.html,
    text: receivedEmail.text,
  });

  const inboundEmail = await upsertInboundEmailRecord({
    webhookEventId: message.webhookEventId,
    userId: matchedAlias.alias.userId,
    resendEmailId: receivedEmail.id,
    messageIdHeader: receivedEmail.message_id,
    fromEmail: receivedEmail.from,
    toEmail: matchedAlias.matchedRecipient,
    subject: receivedEmail.subject,
    receivedAt: receivedEmail.created_at,
    headersJson:
      receivedEmail.headers && typeof receivedEmail.headers === "object"
        ? receivedEmail.headers
        : null,
    rawLinksJson: extractedLinks.rawLinks,
    emailType: gmailForwardingVerification
      ? "gmail_forwarding_verification"
      : "bandcamp_import",
    originalEmailSentOn: originalBandcampEmailSentOn,
    gmailForwardingConfirmationUrl:
      gmailForwardingVerification?.confirmationUrl ?? null,
    gmailForwardingConfirmationCode:
      gmailForwardingVerification?.confirmationCode ?? null,
  });

  if (gmailForwardingVerification) {
    await getDb()
      .update(inboundEmails)
      .set({
        parseStatus: "parsed",
        parseError: null,
        updatedAt: new Date(),
      })
      .where(eq(inboundEmails.id, inboundEmail.id));

    return {
      inboundEmailId: inboundEmail.id,
      releaseCount: 0,
    };
  }

  if (extractedLinks.normalizedLinks.length === 0) {
    await getDb()
      .update(inboundEmails)
      .set({
        parseStatus: "failed",
        parseError: "No Bandcamp album or track URLs were found in the email.",
        updatedAt: new Date(),
      })
      .where(eq(inboundEmails.id, inboundEmail.id));

    throw new NonRetryableImportError(
      "No Bandcamp album or track URLs were found in the email.",
    );
  }

  for (const link of extractedLinks.normalizedLinks) {
    const release = await upsertReleaseRecord({
      canonicalUrl: link.canonicalUrl,
      host: link.host,
      releaseType: link.releaseType,
    });

    await maybeEnrichRelease({
      releaseId: release.id,
      canonicalUrl: release.canonicalUrl,
      releaseType: link.releaseType,
      resolvedStatus: release.resolvedStatus,
      embedUrl: release.embedUrl,
      releaseTitle: release.releaseTitle,
      artistName: release.artistName,
    });

    const userRelease = await upsertUserReleaseRecord({
      userId: matchedAlias.alias.userId,
      releaseId: release.id,
    });

    await createReleaseImportOccurrence({
      userReleaseId: userRelease.id,
      inboundEmailId: inboundEmail.id,
    });
  }

  await getDb()
    .update(inboundEmails)
    .set({
      parseStatus: "parsed_with_fallback",
      parseError: null,
      updatedAt: new Date(),
    })
    .where(eq(inboundEmails.id, inboundEmail.id));

  return {
    inboundEmailId: inboundEmail.id,
    releaseCount: extractedLinks.normalizedLinks.length,
  };
}
