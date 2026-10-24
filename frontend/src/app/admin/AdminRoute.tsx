import { Navigate, Outlet } from "react-router";
import { useSession } from "@/modules/auth";

export default function AdminRoute() {
  const { data: user } = useSession();

  if (user?.rol !== "admin") return <Navigate to="/activos" replace />;

  return <Outlet />;
}
