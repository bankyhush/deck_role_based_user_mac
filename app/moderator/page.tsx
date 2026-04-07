import React from "react";
import ModeratorLogic from "./modLogic";

interface Props {
  user: { id: string; email: string; role: "USER" | "MODERATOR" | "ADMIN" };
}

const ModeratorUI = ({ user }: Props) => {
  return <ModeratorLogic user={user} />;
};

export default ModeratorUI;
