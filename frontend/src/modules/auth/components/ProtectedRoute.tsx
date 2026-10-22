import { Navigate, Outlet, useLocation } from "react-router";
import Spinner from "../../../components/Spinner";
import { useSession } from "../hooks/useSessions";

export default function ProtectedRoute() {
  const { data: user, isPending, error, refetch } = useSession();
  const location = useLocation();

  if (isPending) return <Spinner />;

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="mb-3 text-red-700">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="rounded-md border px-3 py-1.5"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
