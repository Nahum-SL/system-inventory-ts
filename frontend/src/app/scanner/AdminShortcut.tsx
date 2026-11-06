import { Link } from "react-router";
import { useSession } from "@/modules/auth";
import type { AssetCard } from "@/modules/assets";
import { cn } from "@/shared/lib/utils";

export default function AdminShortcut({ asset }: { asset: AssetCard }) {
  const { data: user } = useSession();

  if (user?.rol !== "admin") return null;

  return (
    <Link
      to={`/admin/activos/${encodeURIComponent(asset.codigoInventario)}`}
      className={cn(
        "block rounded-md  px-3 py-2 text-center text-sm font-medium ",
        "border border-transparent bg-amber-600 text-white",
        "hover:bg-amber-700",
        "dark:bg-amber-500 dark:text-gray-950 dark:hover:bg-amber-400",
      )}
    >
      Gestionar en el panel
    </Link>
  );
}
