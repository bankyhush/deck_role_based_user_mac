import DashboardLogic from "./userLogic";

interface Props {
  user: { id: string; email: string; role: "USER" | "MODERATOR" | "ADMIN" };
}

export default async function DashboardUI(Props: Props) {
  return <DashboardLogic user={Props.user} />;
}
