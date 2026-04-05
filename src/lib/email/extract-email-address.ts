import "server-only";

const EMAIL_ADDRESS_PATTERN =
  /<?([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})>?/i;

export function extractEmailAddress(input: string) {
  const match = input.match(EMAIL_ADDRESS_PATTERN);

  return match?.[1]?.toLowerCase() ?? null;
}
