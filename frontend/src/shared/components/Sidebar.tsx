import { NavLink } from "react-router";
import {
  LayoutDashboard,
  Boxes,
  ScanLine,
  LogOut,
  X,
  type LucideIcon,
} from "lucide-react";
import { useLogout, useSession } from "@/modules/auth";
import { cn } from "@/shared/lib/utils";

interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
  end?: boolean;
}

// Se agregan aquí a medida que existan las pantallas (catálogos, personas, usuarios…).
const menuItems: MenuItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, end: true },
  { name: "Activos", href: "/admin/activos", icon: Boxes },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: user } = useSession();
  const logout = useLogout();

  return (
    <>
      {/* Overlay solo en móvil */}
      {isOpen && (
        <div
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-slate-900 text-white",
          "transition-transform duration-300 ease-in-out",
          "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tighter">YONDA</h2>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-400">
              System Inventory
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="p-2 text-slate-400 hover:text-white lg:hidden"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-sky-500 text-white shadow-lg shadow-blue-900/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white",
                )
              }
            >
              <item.icon size={18} />
              {item.name}
            </NavLink>
          ))}

          <NavLink
            to="/activos"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
          >
            <ScanLine size={18} />
            Vista escáner
          </NavLink>
        </nav>

        <div className="space-y-2 border-t border-slate-800 p-4 text-sm">
          <p className="px-2 text-slate-400">
            {user?.nombres} · {user?.rol}
          </p>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </aside>
    </>
  );
}
