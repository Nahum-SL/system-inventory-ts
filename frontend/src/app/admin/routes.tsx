import type { RouteObject } from "react-router";
import { AssetCardPage, AssetsPage } from "@/modules/assets";
import AdminLayout from "./AdminLayout";
import AdminRoute from "./AdminRoute";
import AssetActions from "../../modules/assets/components/AssetSections";
import AdminDashboardPage from "./pages/AdminDashboardPage";

export const adminRoutes: RouteObject = {
  path: "admin",
  element: <AdminRoute />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        { index: true, element: <AdminDashboardPage /> },
        { path: "activos", element: <AssetsPage basePath="/admin/activos" /> },
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
