import "server-only";

import type { NormalizedBandcampLink } from "@/lib/bandcamp/normalize-bandcamp-url";
import { normalizeBandcampUrl } from "@/lib/bandcamp/normalize-bandcamp-url";
import { extractUrls } from "@/lib/email/extract-urls";

export function extractBandcampReleaseLinks(input: {
  html?: string | null;
  text?: string | null;
}) {
  const candidates = new Set<string>([
    ...extractUrls(input.html),
    ...extractUrls(input.text),
  ]);

  const normalizedLinks = new Map<string, NormalizedBandcampLink>();

  for (const candidate of candidates) {
    const normalized = normalizeBandcampUrl(candidate);

    if (!normalized) {
      continue;
    }

    normalizedLinks.set(normalized.canonicalUrl, normalized);
  }

  return {
    rawLinks: Array.from(candidates),
    normalizedLinks: Array.from(normalizedLinks.values()),
  };
}
