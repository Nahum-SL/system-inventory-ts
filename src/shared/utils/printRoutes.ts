import type { Router } from "express";

interface RouteInfo {
  Método: string;
  Ruta: string;
}

// Express 5 no expone el prefijo de montaje, por eso se pasa a mano.
export function collectRoutes(router: Router, prefix: string): RouteInfo[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (router as any).stack
    .filter((layer: any) => layer.route)
    .flatMap((layer: any) =>
      Object.keys(layer.route.methods).map((method) => ({
        Método: method.toUpperCase(),
        Ruta: `${prefix}${layer.route.path === "/" ? "" : layer.route.path}`,
      })),
    );
}
