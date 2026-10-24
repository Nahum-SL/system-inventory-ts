import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/lib/api-client";

/** Crea (sin id) o edita (con id) un recurso del catálogo. */
export function useSaveCatalogItem<V>(
  path: string,
  key: readonly string[],
  id?: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: V) =>
      id === undefined
        ? api.post<unknown>(path, values)
        : api.patch<unknown>(`${path}/${id}`, values),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: key }),
        // Renombrar un área, marca, cargo o persona cambia lo que muestran fichas y listas de activos.
        // Se usa la clave literal para no importar el módulo assets desde aquí.
        queryClient.invalidateQueries({ queryKey: ["assets"] }),
      ]),
  });
}
