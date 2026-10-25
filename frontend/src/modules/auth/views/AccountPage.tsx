import ChangePasswordForm from "../components/ChangePasswordForm";
import { useSession } from "../hooks/useSessions";

export default function AccountPage() {
  const { data: user } = useSession();

  return (
    <section className="mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Mi cuenta</h1>

      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <p className="font-medium">
          {user?.nombres} {user?.apellidos}
        </p>
        <p className="text-slate-500">
          @{user?.username} · {user?.rol}
        </p>
      </div>

      <ChangePasswordForm />
    </section>
  );
}
