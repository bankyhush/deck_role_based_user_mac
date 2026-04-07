import { requireRole } from "@/lib/requireRole";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("ADMIN"); // ✅ protects all pages inside (admin) folder
  return <>{children}</>;
}
