"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db/client";
import { userReleases } from "@/db/schema";
import { ensureAppUser } from "@/lib/auth/ensure-app-user";

type UserReleaseStatus = (typeof userReleases.$inferSelect)["status"];

export async function updateUserReleaseStatusAction(
  userReleaseId: string,
  status: UserReleaseStatus,
) {
  const user = await ensureAppUser();

  await getDb()
    .update(userReleases)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(
      and(eq(userReleases.id, userReleaseId), eq(userReleases.userId, user.id)),
    );

  revalidatePath("/app");
}
