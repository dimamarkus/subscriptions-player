import "server-only";

import { extractEmailAddress } from "@/lib/email/extract-email-address";

const FORWARDED_SUBJECT_PATTERN = /^(fwd|fw):/i;
const FORWARDED_BANDCAMP_PREAMBLE_PATTERN =
  /On\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})(?:\s+at\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM))?,\s+(.+?)\s+wrote:/i;

const MONTHS_BY_NAME: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

type ExtractOriginalBandcampEmailSentOnInput = {
  subject: string;
  html: string | null | undefined;
  text: string | null | undefined;
};

function collapseHtmlToText(input: string | null | undefined) {
  if (!input) {
    return "";
  }

  return input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeEnglishDateToIso(input: string) {
  const match = input.match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, monthName, dayText, year] = match;
  const month = MONTHS_BY_NAME[monthName.toLowerCase()];

  if (!month) {
    return null;
  }

  return `${year}-${month}-${dayText.padStart(2, "0")}`;
}

function extractOriginalSenderAddress(senderLabel: string) {
  const emailAddress = extractEmailAddress(senderLabel);

  if (!emailAddress) {
    return null;
  }

  return emailAddress;
}

export function extractOriginalBandcampEmailSentOn(
  input: ExtractOriginalBandcampEmailSentOnInput,
) {
  if (!FORWARDED_SUBJECT_PATTERN.test(input.subject)) {
    return null;
  }

  const candidates = [input.text ?? "", collapseHtmlToText(input.html)];

  for (const candidate of candidates) {
    const match = candidate.match(FORWARDED_BANDCAMP_PREAMBLE_PATTERN);

    if (!match) {
      continue;
    }

    const [, originalDateLabel, senderLabel] = match;
    const senderAddress = extractOriginalSenderAddress(senderLabel);

    if (!senderAddress?.endsWith("@bandcamp.com")) {
      continue;
    }

    const normalizedDate = normalizeEnglishDateToIso(originalDateLabel);

    if (normalizedDate) {
      return normalizedDate;
    }
  }

  return null;
}
