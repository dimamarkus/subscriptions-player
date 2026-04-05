"use server";

import { revalidatePath } from "next/cache";

import { ensureAppUser } from "@/lib/auth/ensure-app-user";
import { rotateInboundAlias } from "@/lib/inbound-aliases/rotate-inbound-alias";

export async function rotateInboundAliasAction() {
  const user = await ensureAppUser();

  await rotateInboundAlias(user.id);

  revalidatePath("/app");
  revalidatePath("/app/onboarding");
  revalidatePath("/app/settings");
}
