import "server-only";
import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { webhookEvents } from "@/db/schema";
import type { ResendInboundWebhookEvent } from "@/lib/resend/resend-inbound-webhook";

type WebhookEventStatus = (typeof webhookEvents.$inferSelect)["status"];

export async function findWebhookEvent(
  provider: string,
  eventType: string,
  providerEventId: string,
) {
  return getDb().query.webhookEvents.findFirst({
    where: and(
      eq(webhookEvents.provider, provider),
      eq(webhookEvents.eventType, eventType),
      eq(webhookEvents.providerEventId, providerEventId),
    ),
  });
}

export async function createResendInboundWebhookEvent(
  payload: ResendInboundWebhookEvent,
) {
  const [createdEvent] = await getDb()
    .insert(webhookEvents)
    .values({
      provider: "resend",
      eventType: payload.type,
      providerEventId: payload.data.email_id,
      payloadJson: payload,
      status: "received",
    })
    .returning();

  return createdEvent;
}

export async function updateWebhookEventStatus(
  webhookEventId: string,
  status: WebhookEventStatus,
  options?: {
    error?: string | null;
    queueMessageId?: string | null;
    processedAt?: Date | null;
  },
) {
  const [updatedEvent] = await getDb()
    .update(webhookEvents)
    .set({
      status,
      error: options?.error ?? null,
      queueMessageId: options?.queueMessageId ?? null,
      processedAt: options?.processedAt ?? null,
      updatedAt: new Date(),
    })
    .where(eq(webhookEvents.id, webhookEventId))
    .returning();

  return updatedEvent;
}

export async function listRecentWebhookEvents(limit = 25) {
  return getDb().query.webhookEvents.findMany({
    orderBy: desc(webhookEvents.createdAt),
    limit,
  });
}
