import type { CountByName } from "../types";

/** Con muchas áreas o categorías, un gráfico de 30 barras no se lee. 
Muestra las mayores y agrupa el resto. */
export function groupTop(items: CountByName[], max = 8): CountByName[] {
  if (items.length <= max) return items;

  const sorted = [...items].sort((a, b) => b.total - a.total);
  const rest = sorted.slice(max - 1);

  return [
    ...sorted.slice(0, max - 1),
    {
      id: -1,
      nombre: "Otros",
      total: rest.reduce((sum, i) => sum + i.total, 0),
    },
  ];
}
