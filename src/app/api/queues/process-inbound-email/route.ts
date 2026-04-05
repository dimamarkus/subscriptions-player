import type { ProcessInboundEmailMessage } from "@/lib/queues/inbound-email-queue";
import { handleCallback } from "@/lib/queues/client";
import {
  NonRetryableImportError,
  processInboundEmailMessage,
} from "@/lib/imports/process-inbound-email-message";
import {
  findWebhookEvent,
  updateWebhookEventStatus,
} from "@/lib/webhooks/webhook-events";

class NonRetryableQueueError extends Error {}

export const POST = handleCallback<ProcessInboundEmailMessage>(
  async (message) => {
    const storedEvent = await findWebhookEvent(
      "resend",
      message.eventType,
      message.providerEventId,
    );

    if (!storedEvent) {
      throw new NonRetryableQueueError("Webhook event not found.");
    }

    if (storedEvent.status === "imported") {
      return;
    }

    await updateWebhookEventStatus(storedEvent.id, "processing", {
      error: null,
      queueMessageId: storedEvent.queueMessageId,
      processedAt: null,
    });

    try {
      await processInboundEmailMessage(message);

      await updateWebhookEventStatus(storedEvent.id, "imported", {
        error: null,
        queueMessageId: storedEvent.queueMessageId,
        processedAt: new Date(),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to import inbound email.";

      await updateWebhookEventStatus(storedEvent.id, "failed", {
        error: errorMessage,
        queueMessageId: storedEvent.queueMessageId,
        processedAt: new Date(),
      });

      throw error;
    }
  },
  {
    retry: (error, metadata) => {
      if (
        error instanceof NonRetryableQueueError ||
        error instanceof NonRetryableImportError
      ) {
        return { acknowledge: true };
      }

      if (metadata.deliveryCount >= 5) {
        return { acknowledge: true };
      }

      return { afterSeconds: Math.min(300, 2 ** metadata.deliveryCount * 5) };
    },
  },
);
