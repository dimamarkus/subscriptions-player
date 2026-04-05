import "server-only";
import { Resend } from "resend";
import { z } from "zod";

const resendApiEnvSchema = z.object({
  RESEND_API_KEY: z.string().min(1),
});

let resendClient: Resend | null = null;

export function getResendClient() {
  if (resendClient) {
    return resendClient;
  }

  const { RESEND_API_KEY } = resendApiEnvSchema.parse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  });

  resendClient = new Resend(RESEND_API_KEY);

  return resendClient;
}
