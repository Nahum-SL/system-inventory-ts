import { Navigate } from "react-router";
import { useSession } from "@/modules/auth";

export default function HomeRedirect() {
  const { data: user } = useSession();

  return (
    <Navigate to={user?.rol === "admin" ? "/admin" : "/activos"} replace />
  );
}
