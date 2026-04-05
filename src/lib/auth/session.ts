import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type CurrentAuthUser = {
  clerkUserId: string;
  email: string;
};

export async function getCurrentAuthUser(): Promise<CurrentAuthUser | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();

  if (!user) {
    return null;
  }

  const primaryEmailAddress = user.emailAddresses.find(
    (emailAddress) => emailAddress.id === user.primaryEmailAddressId,
  );

  if (!primaryEmailAddress) {
    throw new Error("Authenticated Clerk user is missing a primary email.");
  }

  return {
    clerkUserId: user.id,
    email: primaryEmailAddress.emailAddress,
  };
}

export async function requireCurrentAuthUser(): Promise<CurrentAuthUser> {
  const user = await getCurrentAuthUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}
