import { getBandcampDomainLabel } from "@/lib/bandcamp/get-bandcamp-domain-label";

type FormatReleaseDisplayInput = {
  releaseTitle: string | null;
  artistName: string | null;
  canonicalUrl: string;
  bandcampDomain: string;
};

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseEmbeddedArtistTitle(input: string) {
  const match = input.match(/^(.*?),\s*by\s+(.+)$/i);

  if (!match) {
    return {
      title: input.trim(),
      artist: null,
    };
  }

  return {
    title: match[1]?.trim() ?? input.trim(),
    artist: match[2]?.trim() ?? null,
  };
}

function stripTrailingArtist(input: string, artist: string) {
  const pattern = new RegExp(`,\\s*by\\s+${escapeRegExp(artist)}$`, "i");
  return input.replace(pattern, "").trim();
}

export function formatReleaseDisplay({
  releaseTitle,
  artistName,
  canonicalUrl,
  bandcampDomain,
}: FormatReleaseDisplayInput) {
  const fallbackSourceLabel = getBandcampDomainLabel(bandcampDomain);
  const rawTitle = releaseTitle?.trim() || canonicalUrl;
  const parsed = parseEmbeddedArtistTitle(rawTitle);
  const resolvedArtist = artistName?.trim() || parsed.artist || null;
  const resolvedTitle =
    resolvedArtist && releaseTitle
      ? stripTrailingArtist(rawTitle, resolvedArtist) || rawTitle
      : parsed.title;

  return {
    displayTitle: resolvedArtist
      ? `${resolvedArtist} - ${resolvedTitle}`
      : resolvedTitle,
    detailsArtistName: resolvedArtist ?? fallbackSourceLabel,
    bandcampLabel: fallbackSourceLabel,
  };
}
