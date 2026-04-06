import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
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
          <h1 className="mt-4 text-3xl font-semibold text-white">
            Create your account
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Open signup is enabled. After account creation, the app will take
            users into settings to get their forwarding address.
          </p>
        </div>

        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/app/settings"
        />
      </div>
    </main>
  );
}
