import { Link, type RouteObject } from "react-router";

import { AssetCardPage, AssetsPage } from "@/modules/assets";

import AdminLayout from "./AdminLayout";
import AdminRoute from "./AdminRoute";

import AssetActions from "./components/AssetActions";
// PAGES
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AssetCreatePage from "./pages/AssetCreatePages";

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
              headerAction={
                <Link
                  to="/admin/activos/nuevo"
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Nuevo activo
                </Link>
              }
            />
          ),
        },
        { path: "activos/nuevo", element: <AssetCreatePage /> },
        {
          path: "activos/:codigo",
          element: (
            <AssetCardPage actions={(a) => <AssetActions asset={a} />} />
          ),
        },
      ],
    },
  ],
};
