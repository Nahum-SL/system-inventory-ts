import { useState } from "react";
import { Outlet } from "react-router";
import { Menu } from "lucide-react";

import Sidebar from "@/shared/components/Sidebar";
import ThemeToggle from "@/shared/components/ThemeToggle";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-gray-900 dark:text-slate-100 lg:flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 sm:px-6 print:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú"
              className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-gray-800 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <span className="truncate font-semibold text-amber-700 dark:text-amber-400">
              System Inventory
            </span>
          </div>

          <ThemeToggle />
        </header>

        <main className="mx-auto max-w-5xl p-4 lg:p-6 print:max-w-none print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
