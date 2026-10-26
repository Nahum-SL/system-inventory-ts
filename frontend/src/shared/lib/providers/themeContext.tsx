import { createContext } from "react";

export type ResolvedTheme = "light" | "dark";
export type ThemeMode = "system" | "light" | "dark";


interface ThemeContextValue {
  mode: ThemeMode;
  theme: ResolvedTheme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
