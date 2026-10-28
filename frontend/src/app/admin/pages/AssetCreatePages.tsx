import { ArrowLeft, PackagePlus } from "lucide-react";
import { Link, useNavigate } from "react-router";
// COMPONENT FORM
import { CreateAssetForm } from "@/modules/assets";
// COMPONENT ATOMIC
import SectionHeader from "@/shared/components/ui/SectionHeader";

export default function AssetCreatePage() {
  const navigate = useNavigate();

  return (
    <section className="min-w-0 space-y-6">
      <SectionHeader
        title="Nuevo activo"
        description="Registra un activo y completa su información de identificación, clasificación y detalles."
        icon={PackagePlus}
        actions={
          <Link
            to="/admin/activos"
            className={[
              "inline-flex min-h-10 items-center justify-center gap-2",
              "rounded-xl border border-slate-200 bg-white px-4 py-2",
              "text-sm font-medium text-slate-700 transition-colors",
              "hover:bg-slate-50 hover:border-slate-300",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-amber-500 focus-visible:ring-offset-2",
              "dark:border-gray-700 dark:bg-gray-900 dark:text-slate-200",
              "dark:hover:border-gray-600 dark:hover:bg-gray-800",
              "dark:focus-visible:ring-offset-gray-900",
            ].join(" ")}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Volver a activos
          </Link>
        }
      />

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
