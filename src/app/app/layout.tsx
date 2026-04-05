import { AppShell } from "@/components/app-shell";
import { ensureAppUser } from "@/lib/auth/ensure-app-user";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  await ensureAppUser();

  return <AppShell>{children}</AppShell>;
}
