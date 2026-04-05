import "server-only";
import { z } from "zod";

import { getResendClient } from "@/lib/resend/resend-server";
import { getResendWebhookEnv } from "@/lib/resend/resend-env";

const resendInboundWebhookSchema = z.object({
  type: z.literal("email.received"),
  created_at: z.string(),
  data: z.object({
    email_id: z.string().min(1),
    created_at: z.string(),
    from: z.string(),
    to: z.array(z.string()),
    bcc: z.array(z.string()),
    cc: z.array(z.string()),
    message_id: z.string().nullable().optional(),
    subject: z.string(),
    attachments: z
      .array(
        z.object({
          id: z.string(),
          filename: z.string(),
          content_type: z.string(),
          content_disposition: z.string().nullable().optional(),
          content_id: z.string().nullable().optional(),
        }),
      )
      .default([]),
  }),
});

export type ResendInboundWebhookEvent = z.infer<
  typeof resendInboundWebhookSchema
>;

function getRequiredWebhookHeader(headers: Headers, name: string) {
  const value = headers.get(name);

  if (!value) {
    throw new Error(`Missing required webhook header: ${name}`);
  }

  return value;
}

export function verifyAndParseResendInboundWebhook(
  payload: string,
  headers: Headers,
) {
  const resend = getResendClient();
  const { RESEND_WEBHOOK_SECRET } = getResendWebhookEnv();

  const verifiedPayload = resend.webhooks.verify({
    payload,
    headers: {
      id: getRequiredWebhookHeader(headers, "svix-id"),
      timestamp: getRequiredWebhookHeader(headers, "svix-timestamp"),
      signature: getRequiredWebhookHeader(headers, "svix-signature"),
    },
    webhookSecret: RESEND_WEBHOOK_SECRET,
  });

  return resendInboundWebhookSchema.parse(verifiedPayload);
}
