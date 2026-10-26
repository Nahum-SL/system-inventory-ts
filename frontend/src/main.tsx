import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import App from "./App";
import { sessionKey } from "./modules/auth";
import { UNAUTHORIZED_EVENT } from "./shared/lib/api-client";
import { ThemeProvider } from "./shared/lib/providers/ThemeProvider";

import { ThemedToaster } from "./shared/lib/providers/ThemedToaster";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

window.addEventListener(UNAUTHORIZED_EVENT, () =>
  queryClient.setQueryData(sessionKey, null),
);


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <ThemedToaster />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
