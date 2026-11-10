import { ArrowLeft, PackagePlus } from "lucide-react";
import { useNavigate } from "react-router";
// COMPONENT FORM
import { CreateAssetForm } from "@/modules/assets";
// COMPONENT ATOMIC
import SectionHeader from "@/shared/components/ui/SectionHeader";
import { NavigationLink } from "@/shared/components/ui/links/NavigationLink";

export default function AssetCreatePage() {
  const navigate = useNavigate();

  return (
    <section className="min-w-0 space-y-6">
      <SectionHeader
        title="Nuevo activo"
        description="Registra un activo y completa su información de identificación, clasificación y detalles."
        icon={PackagePlus}
        actions={
          <NavigationLink to="/admin/activos">
            <ArrowLeft size={16} aria-hidden="true" />
            Volver a activos
          </NavigationLink>
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
