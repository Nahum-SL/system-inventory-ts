import type { RouteObject } from "react-router";
import { LoginPage, ProtectedRoute } from "@/modules/auth";
import HomeRedirect from "./HomeRedirect";
import { adminRoutes } from "./admin/routes";
import { scannerRoutes } from "./scanner/routes";

export const appRoutes: RouteObject[] = [
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <HomeRedirect /> },
      scannerRoutes,
      adminRoutes,
      {
        path: "*",
        element: <p className="p-4 text-slate-600">Página no encontrada.</p>,
      },
    ],
  },
];
