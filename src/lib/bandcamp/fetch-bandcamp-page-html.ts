import "server-only";

const BANDCAMP_FETCH_TIMEOUT_MS = 10_000;

export async function fetchBandcampPageHtml(canonicalUrl: string) {
  const url = new URL(canonicalUrl);

  if (!url.hostname.toLowerCase().endsWith(".bandcamp.com")) {
    throw new Error("Bandcamp enrichment only supports *.bandcamp.com hosts.");
  }

  const response = await fetch(canonicalUrl, {
    method: "GET",
    headers: {
      "user-agent": "subscriptions-player/1.0 (+https://subscriptions-player.app)",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(BANDCAMP_FETCH_TIMEOUT_MS),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Bandcamp page fetch failed with status ${response.status}.`);
  }

  return response.text();
}
