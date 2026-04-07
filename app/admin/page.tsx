import AdminLogic from "./adminLogic";

interface Props {
  user: { id: string; email: string; role: "USER" | "MODERATOR" | "ADMIN" };
}
// Pa$$w0rd!
const AdminUI = async ({ user }: Props) => {
  return <AdminLogic user={user} />;
};

export default AdminUI;
