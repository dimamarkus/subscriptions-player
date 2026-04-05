import "server-only";

import { getResendClient } from "@/lib/resend/resend-server";

export async function getReceivedEmail(emailId: string) {
  const resend = getResendClient();
  const response = await resend.emails.receiving.get(emailId);

  if (response.error || !response.data) {
    throw new Error(`Failed to retrieve received email ${emailId}.`);
  }

  return response.data;
}
