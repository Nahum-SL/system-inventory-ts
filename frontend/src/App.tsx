import { Navigate, Route, Routes } from "react-router";
import AppLayout from "./layouts/AppLayout";
// ===========
// MODULOS
// ===========
// LOGIN
import { LoginPage, ProtectedRoute } from "./modules/auth";
// ACTIVOS
import { AssetsPage, AssetCardPage } from "@/modules/assets";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/activos" element={<AssetsPage />} />
          <Route path="/activos/:codigo" element={<AssetCardPage />} />
          <Route index element={<Navigate to="/activos" replace />} />
          <Route
            path="*"
            element={
              <p className="p-4 text-slate-600">Página no encontrada.</p>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}
