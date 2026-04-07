import { requireRole } from "@/lib/requireRole";
import AdminLogic from "./adminLogic";

const AdminUI = async () => {
  const user = await requireRole("ADMIN");
  return <AdminLogic user={user} />;
};

export default AdminUI;
