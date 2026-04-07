import { requireRole } from "@/lib/requireRole";

export default async function ModeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("MODERATOR"); // ✅ protects all pages inside (moderator) folder
  return <>{children}</>;
}
