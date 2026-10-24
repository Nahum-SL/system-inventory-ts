import type { NamedKind } from "../types";

export const NAMED_LABELS: Record<
  NamedKind,
  { plural: string; singular: string; path: string }
> = {
  areas: { plural: "Áreas", singular: "área", path: "/areas" },
  brands: { plural: "Marcas", singular: "marca", path: "/brands" },
  categories: {
    plural: "Categorías",
    singular: "categoría",
    path: "/categories",
  },
};
