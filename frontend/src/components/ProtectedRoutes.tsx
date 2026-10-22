import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../shared/lib/useAuth";
import Spinner from "./Spinner";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
