import "server-only";

export function formatInboundAliasAddress(
  token: string,
  domain: string,
): string {
  return `u_${token}@${domain}`;
}
