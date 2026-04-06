import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/app");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold tracking-[0.24em] text-zinc-400">
            TraxHunter
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Sign in</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Google and magic link should be the easiest path. Password sign-in
            stays available for users who want it.
          </p>
        </div>

        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/app"
        />
      </div>
    </main>
  );
}
