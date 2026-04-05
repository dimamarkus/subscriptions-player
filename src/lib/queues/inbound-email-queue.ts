import "server-only";

import { send } from "@/lib/queues/client";

export const PROCESS_INBOUND_EMAIL_TOPIC = "process-inbound-email";

export type ProcessInboundEmailMessage = {
  webhookEventId: string;
  providerEventId: string;
  eventType: "email.received";
};

export async function enqueueProcessInboundEmail(
  message: ProcessInboundEmailMessage,
) {
  return send(PROCESS_INBOUND_EMAIL_TOPIC, message, {
    idempotencyKey: `${message.eventType}:${message.providerEventId}`,
  });
}
