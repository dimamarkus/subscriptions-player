import { NextResponse } from "next/server";

import { enqueueProcessInboundEmail } from "@/lib/queues/inbound-email-queue";
import { verifyAndParseResendInboundWebhook } from "@/lib/resend/resend-inbound-webhook";
import {
  createResendInboundWebhookEvent,
  findWebhookEvent,
  updateWebhookEventStatus,
} from "@/lib/webhooks/webhook-events";

export async function POST(request: Request) {
  const payload = await request.text();

  let webhookEvent;

  try {
    webhookEvent = verifyAndParseResendInboundWebhook(payload, request.headers);
  } catch {
    return NextResponse.json({ error: "Invalid webhook request." }, { status: 400 });
  }

  let storedEvent = await findWebhookEvent(
    "resend",
    webhookEvent.type,
    webhookEvent.data.email_id,
  );

  if (!storedEvent) {
    storedEvent = await createResendInboundWebhookEvent(webhookEvent);
  }

  if (
    storedEvent.status === "queued" ||
    storedEvent.status === "processing" ||
    storedEvent.status === "imported"
  ) {
    return NextResponse.json(
      {
        acknowledged: true,
        webhookEventId: storedEvent.id,
        duplicate: true,
        status: storedEvent.status,
      },
      { status: 200 },
    );
  }

  try {
    const queueResult = await enqueueProcessInboundEmail({
      webhookEventId: storedEvent.id,
      providerEventId: storedEvent.providerEventId,
      eventType: "email.received",
    });

    const queuedEvent = await updateWebhookEventStatus(storedEvent.id, "queued", {
      queueMessageId: queueResult.messageId,
      error: null,
      processedAt: null,
    });

    return NextResponse.json(
      {
        acknowledged: true,
        webhookEventId: queuedEvent.id,
        queueMessageId: queueResult.messageId,
        status: queuedEvent.status,
      },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to queue inbound email.";

    await updateWebhookEventStatus(storedEvent.id, "failed", {
      error: errorMessage,
      queueMessageId: null,
      processedAt: null,
    });

    return NextResponse.json(
      {
        acknowledged: false,
        webhookEventId: storedEvent.id,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
