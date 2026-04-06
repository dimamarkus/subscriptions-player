import "server-only";

import { buildBandcampEmbedUrl } from "@/lib/bandcamp/build-bandcamp-embed-url";

type ExtractBandcampPageMetadataInput = {
  canonicalUrl: string;
  html: string;
  releaseType: "album" | "track";
};

function decodeHtmlEntities(input: string) {
  return input
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getMetaContent(
  html: string,
  attributeName: "name" | "property",
  attributeValue: string,
) {
  const pattern = new RegExp(
    `<meta[^>]*${attributeName}=["']${escapeRegExp(
      attributeValue,
    )}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "i",
  );

  const match = html.match(pattern);

  if (!match?.[1]) {
    return null;
  }

  return decodeHtmlEntities(match[1]);
}

function getBandcampPageProperties(html: string) {
  const rawContent = getMetaContent(html, "name", "bc-page-properties");

  if (!rawContent) {
    return null;
  }

  try {
    return JSON.parse(rawContent) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function splitOgTitle(ogTitle: string | null) {
  if (!ogTitle) {
    return {
      releaseTitle: null,
      artistName: null,
    };
  }

  const parts = ogTitle.split(" | ");

  if (parts.length < 2) {
    return {
      releaseTitle: ogTitle,
      artistName: null,
    };
  }

  return {
    releaseTitle: parts[0] ?? null,
    artistName: parts.slice(1).join(" | ") || null,
  };
}

export function extractBandcampPageMetadata({
  canonicalUrl,
  html,
  releaseType,
}: ExtractBandcampPageMetadataInput) {
  const pageProperties = getBandcampPageProperties(html);
  const ogTitle = getMetaContent(html, "property", "og:title");
  const ogImage = getMetaContent(html, "property", "og:image");
  const titleParts = splitOgTitle(ogTitle);

  const itemId =
    typeof pageProperties?.item_id === "number" ||
    typeof pageProperties?.item_id === "string"
      ? String(pageProperties.item_id)
      : null;

  return {
    canonicalUrl,
    bandcampItemId: itemId,
    releaseTitle: titleParts.releaseTitle,
    artistName: titleParts.artistName,
    coverImageUrl: ogImage,
    embedUrl: itemId
      ? buildBandcampEmbedUrl({
          releaseType,
          itemId,
        })
      : null,
    metadataJson: {
      ogTitle,
      ogImage,
      pageProperties,
    },
  };
}
