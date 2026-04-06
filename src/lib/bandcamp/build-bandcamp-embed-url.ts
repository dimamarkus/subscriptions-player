import "server-only";

type BandcampEmbedInput = {
  releaseType: "album" | "track";
  itemId: string;
};

export function buildBandcampEmbedUrl({
  releaseType,
  itemId,
}: BandcampEmbedInput) {
  return `https://bandcamp.com/EmbeddedPlayer/${releaseType}=${itemId}/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=false/artwork=small/transparent=true/`;
}
