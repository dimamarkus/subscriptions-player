import "server-only";
import { z } from "zod";

const resendWebhookEnvSchema = z.object({
  RESEND_WEBHOOK_SECRET: z.string().min(1),
});

export function getResendWebhookEnv() {
  return resendWebhookEnvSchema.parse({
    RESEND_WEBHOOK_SECRET: process.env.RESEND_WEBHOOK_SECRET,
  });
}
