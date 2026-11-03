import { Link, type RouteObject } from "react-router";

import AdminLayout from "./AdminLayout";
import AdminRoute from "./AdminRoute";
// MODULO - ASSET
import { AssetCardPage, AssetsPage } from "@/modules/assets";
// MODULO - REPORTS
import {
  ExportAssetsButton,
  ExportAssetsPdfButton,
  ReportsPage,
} from "@/modules/reports";
// COMPONENTS
import AssetActions from "./components/AssetActions";
// PAGES
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AssetCreatePage from "./pages/AssetCreatePages";
import LabelsPage from "./pages/LabelsPage";
import UsersPage from "@/modules/users/views/UsersPage";
// COMPONENTS - CATALOGS
import {
  NamedCatalogPage,
  PeoplePage,
  PositionsPage,
} from "@/modules/catalogs";
import AssetSheetButton from "@/modules/reports/components/AssetSheetButton";
import { Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export const adminRoutes: RouteObject = {
  path: "admin",
  element: <AdminRoute />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        { index: true, element: <AdminDashboardPage /> },
        {
          path: "activos",
          element: (
            <AssetsPage
              basePath="/admin/activos"
              createAction={
                <Link
                  to="/admin/activos/nuevo"
                  className={cn(
                    "inline-flex min-h-10 items-center justify-center gap-2",
                    "rounded-xl border border-transparent px-4 py-2",
                    "text-sm font-medium transition-colors duration-200",
                    "bg-amber-600 text-white hover:bg-amber-700",
                    "dark:bg-amber-500 dark:text-gray-950 dark:hover:bg-amber-400",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-amber-500 focus-visible:ring-offset-2",
                    "dark:focus-visible:ring-offset-gray-900",
                  )}
                >
                  <Plus size={16} aria-hidden="true" />
                  Nuevo activo
                </Link>
              }
              exportAction={(filters) => (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <ExportAssetsPdfButton filters={filters} />
                  <ExportAssetsButton filters={filters} />
                </div>
              )}
            />
          ),
        },
        { path: "activos/nuevo", element: <AssetCreatePage /> },
        {
          path: "activos/:codigo",
          element: (
            <AssetCardPage
              backTo="/admin/activos"
              actions={(a) => <AssetActions asset={a} />}
              errorActions={(codigo) => <AssetSheetButton codigo={codigo} />}
            />
          ),
        },
        {
          path: "etiquetas",
          element: <LabelsPage />,
        },
        {
          path: "areas",
          element: <NamedCatalogPage key="areas" kind="areas" />,
        },
        {
          path: "marcas",
          element: <NamedCatalogPage key="brands" kind="brands" />,
        },
        {
          path: "categorias",
          element: <NamedCatalogPage key="categories" kind="categories" />,
        },
        { path: "cargos", element: <PositionsPage /> },
        { path: "personas", element: <PeoplePage /> },
        { path: "usuarios", element: <UsersPage /> },
        { path: "reportes", element: <ReportsPage /> },
      ],
    },
  ],
};
