import { useState } from "react";
import { Outlet } from "react-router";
import { Menu } from "lucide-react";
import Sidebar from "@/shared/components/Sidebar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-w-0 flex-1">
        {/* Barra superior solo en móvil */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
            className="rounded-md p-1.5 text-slate-700 hover:bg-slate-100"
          >
            <Menu size={22} />
          </button>
          <span className="font-semibold text-blue-700">System Inventory</span>
        </header>

        <main className="mx-auto max-w-5xl p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
