import { Navigate, Route, Routes } from "react-router";
import AppLayout from "./layouts/AppLayout";
import { LoginPage, ProtectedRoute } from "./modules/auth";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
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
