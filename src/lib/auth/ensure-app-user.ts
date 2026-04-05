import "server-only";
import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { requireCurrentAuthUser } from "@/lib/auth/session";

export async function ensureAppUser() {
  const authenticatedUser = await requireCurrentAuthUser();
  const db = getDb();

  const existingUser = await db.query.users.findFirst({
    where: eq(users.clerkUserId, authenticatedUser.clerkUserId),
  });

  if (existingUser) {
    const [updatedUser] = await db
      .update(users)
      .set({
        email: authenticatedUser.email,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingUser.id))
      .returning();

    return updatedUser;
  }

  const [createdUser] = await db
    .insert(users)
    .values({
      clerkUserId: authenticatedUser.clerkUserId,
      email: authenticatedUser.email,
    })
    .returning();

  return createdUser;
}
