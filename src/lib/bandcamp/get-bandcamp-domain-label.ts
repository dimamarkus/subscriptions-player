export function getBandcampDomainLabel(bandcampDomain: string): string {
  return bandcampDomain.replace(/\.bandcamp\.com$/i, "");
}
