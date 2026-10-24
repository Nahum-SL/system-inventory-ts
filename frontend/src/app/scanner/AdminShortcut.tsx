import { Link } from "react-router";
import { useSession } from "@/modules/auth";
import type { AssetCard } from "@/modules/assets";

export default function AdminShortcut({ asset }: { asset: AssetCard }) {
  const { data: user } = useSession();

  if (user?.rol !== "admin") return null;

  return (
    <Link
      to={`/admin/activos/${encodeURIComponent(asset.codigoInventario)}`}
      className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
    >
      Gestionar en el panel
    </Link>
  );
}
