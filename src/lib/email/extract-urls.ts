import "server-only";

const HREF_PATTERN = /href=["']([^"'#]+)["']/gi;
const URL_PATTERN = /https?:\/\/[^\s"'<>]+/gi;

export function extractUrls(input: string | null | undefined) {
  if (!input) {
    return [];
  }

  const urls = new Set<string>();

  for (const match of input.matchAll(HREF_PATTERN)) {
    const value = match[1]?.trim();

    if (value) {
      urls.add(value);
    }
  }

  for (const match of input.matchAll(URL_PATTERN)) {
    const value = match[0]?.trim();

    if (value) {
      urls.add(value);
    }
  }

  return Array.from(urls);
}
