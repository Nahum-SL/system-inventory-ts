import { Link, Outlet } from "react-router";
import { useLogout, useSession } from "@/modules/auth";
import ThemeToggle from "@/shared/components/ThemeToggle";

export default function ScannerLayout() {
  const { data: user } = useSession();
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-gray-900 dark:text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/activos"
            className="truncate font-semibold text-amber-700 dark:text-amber-400"
          >
            System Inventory
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {user?.rol === "admin" && (
              <Link
                to="/admin"
                className="hidden text-sm text-amber-700 underline underline-offset-4 dark:text-amber-400 sm:inline"
              >
                Panel
              </Link>
            )}

            <ThemeToggle />

            <span className="hidden text-sm text-slate-600 dark:text-slate-300 sm:inline">
              {user?.nombres} · {user?.rol}
            </span>

            <button
              type="button"
              onClick={() => logout()}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors 
              hover:bg-slate-100 dark:border-gray-700 dark:hover:bg-gray-800 cursor-pointer"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
