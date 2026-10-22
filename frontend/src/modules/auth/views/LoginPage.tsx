import { Navigate, useLocation } from "react-router";
import Spinner from "../../../components/Spinner";
import LoginForm from "../components/LoginForm";
import { useSession } from "../hooks/useSessions";

export default function LoginPage() {
  const { data: user, isPending } = useSession();
  const location = useLocation();
  const from = (
    location.state as { from?: { pathname: string; search: string } } | null
  )?.from;

  if (isPending) return <Spinner />;
  if (user)
    return (
      <Navigate
        to={from ? `${from.pathname}${from.search}` : "/activos"}
        replace
      />
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <LoginForm />
    </div>
  );
}
