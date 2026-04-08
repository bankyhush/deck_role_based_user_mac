import { requireRole } from "@/lib/requireRole";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("USER"); // protects all pages inside (dashboard) folder
  return <>{children}</>;
}
