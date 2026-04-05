import "server-only";

import { createInboundAlias } from "@/lib/inbound-aliases/create-inbound-alias";
import { getActiveInboundAlias } from "@/lib/inbound-aliases/get-active-inbound-alias";

export async function ensureActiveInboundAlias(userId: string) {
  const existingAlias = await getActiveInboundAlias(userId);

  if (existingAlias) {
    return existingAlias;
  }

  return createInboundAlias(userId);
}
