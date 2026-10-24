import { useRoutes } from "react-router";
// Centraliza las rutas de fronted/src/app -> (admin / scaner)
import { appRoutes } from "./app/routes";

export default function App() {
  return useRoutes(appRoutes);
}
