import "server-only";

import { extractEmailAddress } from "@/lib/email/extract-email-address";
import { extractUrls } from "@/lib/email/extract-urls";

const GMAIL_FORWARDING_SENDERS = new Set([
  "forwarding-noreply@google.com",
  "send-as-noreply@google.com",
]);

const GMAIL_FORWARDING_SUBJECT_PATTERN = /forwarding confirmation/i;
const GMAIL_FORWARDING_CODE_PATTERN =
  /(?:confirmation|verification)\s+code[^A-Z0-9]*([A-Z0-9-]{6,})/i;

type GmailForwardingVerificationInput = {
  fromEmail: string;
  subject: string;
  html: string | null | undefined;
  text: string | null | undefined;
};

export type GmailForwardingVerificationDetails = {
  confirmationUrl: string | null;
  confirmationCode: string | null;
};

function extractGoogleMailSettingsUrl(urls: string[]) {
  for (const url of urls) {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      continue;
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    if (
      hostname === "mail-settings.google.com" ||
      hostname === "mail.google.com"
    ) {
      return parsedUrl.toString();
    }
  }

  return null;
}

function extractConfirmationCode(input: string) {
  const match = input.match(GMAIL_FORWARDING_CODE_PATTERN);

  return match?.[1] ?? null;
}

export function parseGmailForwardingVerification(
  input: GmailForwardingVerificationInput,
): GmailForwardingVerificationDetails | null {
  const normalizedSender =
    extractEmailAddress(input.fromEmail) ?? input.fromEmail.trim().toLowerCase();

  if (!GMAIL_FORWARDING_SENDERS.has(normalizedSender)) {
    return null;
  }

  if (!GMAIL_FORWARDING_SUBJECT_PATTERN.test(input.subject)) {
    return null;
  }

  const htmlUrls = extractUrls(input.html);
  const textUrls = extractUrls(input.text);
  const confirmationUrl = extractGoogleMailSettingsUrl([...htmlUrls, ...textUrls]);
  const confirmationCode = extractConfirmationCode(
    [input.text ?? "", input.html ?? ""].join("\n"),
  );

  return {
    confirmationUrl,
    confirmationCode,
  };
}
