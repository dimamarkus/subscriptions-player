"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db/client";
import { releases, userReleases } from "@/db/schema";
import { ensureAppUser } from "@/lib/auth/ensure-app-user";
import { enrichRelease } from "@/lib/bandcamp/enrich-release";

function assertReleaseType(value: string): "album" | "track" {
  if (value === "album" || value === "track") {
    return value;
  }

  throw new Error(`Unsupported release type for enrichment: ${value}`);
}

export async function enrichReleaseAction(userReleaseId: string) {
  const user = await ensureAppUser();

  const userRelease = await getDb().query.userReleases.findFirst({
    where: and(
      eq(userReleases.id, userReleaseId),
      eq(userReleases.userId, user.id),
    ),
  });

  if (!userRelease) {
    throw new Error("Queue item not found for the current user.");
  }

  const release = await getDb().query.releases.findFirst({
    where: eq(releases.id, userRelease.releaseId),
  });

  if (!release) {
    throw new Error("Release not found.");
  }

  await enrichRelease({
    releaseId: release.id,
    canonicalUrl: release.canonicalUrl,
    releaseType: assertReleaseType(release.releaseType),
  });

  revalidatePath("/app");
  revalidatePath("/app/imports");
}
