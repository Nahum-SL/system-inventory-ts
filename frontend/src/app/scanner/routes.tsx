import type { RouteObject } from "react-router";
import { AssetCardPage, AssetsPage } from "@/modules/assets";
import AdminShortcut from "./AdminShortcut";
import ScannerLayout from "./ScannerLayout";

// /activos/:codigo es la URL que lleva el QR impreso: no debe cambiar nunca.
export const scannerRoutes: RouteObject = {
  element: <ScannerLayout />,
  children: [
    { path: "activos", element: <AssetsPage basePath="/activos" /> },
    {
      path: "activos/:codigo",
      element: <AssetCardPage actions={(a) => <AdminShortcut asset={a} />} />,
    },
  ],
};
