import "server-only";

export type NormalizedBandcampLink = {
  canonicalUrl: string;
  releaseType: "album" | "track";
  host: string;
  path: string;
};

export function normalizeBandcampUrl(url: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }

  const host = parsedUrl.hostname.toLowerCase();

  if (!host.endsWith(".bandcamp.com")) {
    return null;
  }

  const path = parsedUrl.pathname.replace(/\/+$/, "");
  const [firstSegment] = path.split("/").filter(Boolean);

  if (firstSegment !== "album" && firstSegment !== "track") {
    return null;
  }

  const normalizedPath = path.length > 0 ? path : "/";
  const canonicalUrl = `https://${host}${normalizedPath}`;

  return {
    canonicalUrl,
    releaseType: firstSegment,
    host,
    path: normalizedPath,
  } satisfies NormalizedBandcampLink;
}
