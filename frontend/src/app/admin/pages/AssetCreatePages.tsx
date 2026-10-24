import { Link, useNavigate } from "react-router";
import { CreateAssetForm } from "@/modules/assets";

/**
 * Pagina que contiene el formulario para crear un Activo
 * @returns 
 */
export default function AssetCreatePage() {
  const navigate = useNavigate();

  return (
    <section className="space-y-4">
      <Link to="/admin/activos" className="text-sm text-blue-700 underline">
        ← Activos
      </Link>
      <h1 className="text-xl font-semibold">Nuevo activo</h1>

      <CreateAssetForm
        onCreated={(asset) =>
          navigate(
            `/admin/activos/${encodeURIComponent(asset.codigoInventario)}`,
          )
        }
        onCancel={() => navigate("/admin/activos")}
      />
    </section>
  );
}
