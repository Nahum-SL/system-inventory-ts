import { Toaster } from "sonner";
import { useTheme } from "./useThemeProvider";

export function ThemedToaster() {
  const { theme } = useTheme();

  return <Toaster position="top-center" richColors theme={theme} />;
}
