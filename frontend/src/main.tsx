import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
// Tanstack
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Toast - Mensajes de Alerta
import { Toaster } from "sonner";

import "./index.css";
import App from "./App";
import { sessionKey } from "./modules/auth";
import { UNAUTHORIZED_EVENT } from "./shared/lib/api-client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

window.addEventListener(UNAUTHORIZED_EVENT, () =>
  queryClient.setQueryData(sessionKey, null),
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  </StrictMode>,
);
