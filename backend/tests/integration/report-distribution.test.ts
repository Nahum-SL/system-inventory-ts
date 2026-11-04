import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app, prepareTest } from "../setup/helpers.js";

interface Cat {
  id: number;
  nombre: string;
  total: number;
}
interface Area extends Cat {
  categorias: Cat[];
}
interface Dist {
  total: number;
  categorias: Cat[];
  areas: Area[];
}

const sum = (xs: { total: number }[]) => xs.reduce((n, x) => n + x.total, 0);
const isDesc = (xs: { total: number }[]) =>
  xs.every((x, i) => i === 0 || xs[i - 1]!.total >= x.total);

describe("Reportes: distribución por área y categoría", () => {
  let t: Awaited<ReturnType<typeof prepareTest>>;

  beforeEach(async () => {
    t = await prepareTest();
  });

  const get = (qs = "", token = t?.adminToken) =>
    request(app)
      .get(`/api/reports/distribution${qs}`)
      .auth(token, { type: "bearer" });

  const dist = async (qs = ""): Promise<Dist> => {
    const res = await get(qs);
    expect(res.status).toBe(200);
    return res.body.data;
  };

  const summaryTotals = async () =>
    (
      await request(app)
        .get("/api/reports/summary")
        .auth(t.adminToken, { type: "bearer" })
    ).body.data.totals;

  it("es coherente y excluye el activo dado de baja", async () => {
    const d = await dist();
    const totals = await summaryTotals();

    expect(d.total).toBe(3); // 3 vigentes; el dado de baja no cuenta
    expect(d.total).toBe(totals.total);
    expect(sum(d.areas)).toBe(d.total);
    expect(sum(d.categorias)).toBe(d.total);
    for (const area of d.areas) expect(sum(area.categorias)).toBe(area.total);
  });

  it("ordena áreas y leyenda de mayor a menor, sin categorías en cero", async () => {
    const d = await dist();

    expect(isDesc(d.areas)).toBe(true);
    expect(isDesc(d.categorias)).toBe(true);

    const legend = d.categorias.map((c) => c.id);
    for (const area of d.areas) {
      expect(area.categorias.every((c) => c.total > 0)).toBe(true);
      const idx = area.categorias.map((c) => legend.indexOf(c.id));
      expect(idx).toEqual([...idx].sort((a, b) => a - b));
    }
  });

  it("filtra por área", async () => {
    const all = await dist();
    const target = all.areas[0]!;
    const filtered = await dist(`?areaId=${target.id}`);

    expect(filtered.areas).toHaveLength(1);
    expect(filtered.areas[0]!.id).toBe(target.id);
    expect(filtered.total).toBe(target.total);
  });

  it("filtra por categoría", async () => {
    const all = await dist();
    const target = all.categorias[0]!;
    const filtered = await dist(`?categoriaId=${target.id}`);

    expect(filtered.total).toBe(target.total);
    expect(filtered.categorias.map((c) => c.id)).toEqual([target.id]);
    for (const area of filtered.areas) {
      expect(area.categorias.map((c) => c.id)).toEqual([target.id]);
    }
  });

  it("filtra por estado y coincide con los totales del summary", async () => {
    const totals = await summaryTotals();

    expect((await dist("?estado=operativo")).total).toBe(totals.operativos);
    expect((await dist("?estado=mantenimiento")).total).toBe(1); // INV-0003
    expect((await dist("?estado=fuera_de_servicio")).total).toBe(
      totals.fueraDeServicio,
    );
  });

  it("refleja un traslado: el activo pasa de un área a otra y el total no cambia", async () => {
    const ventas = (d: Dist) =>
      d.areas.find((a) => a.id === t.data.areas.ventasId)?.total ?? 0;
    const before = await dist();

    await request(app)
      .post(`/api/assets/${t.data.assets.free}/movements`)
      .auth(t.adminToken, { type: "bearer" })
      .send({ areaDestinoId: t.data.areas.ventasId, motivo: "Prueba" });

    const after = await dist();
    expect(ventas(after)).toBe(ventas(before) + 1);
    expect(after.total).toBe(before.total);
  });

  it("si nada coincide responde 200 vacío", async () => {
    expect(await dist("?areaId=999999")).toEqual({
      total: 0,
      categorias: [],
      areas: [],
    });
  });

  it("filtros inválidos: 400", async () => {
    expect((await get("?areaId=abc")).status).toBe(400);
    expect((await get("?areaId=0")).status).toBe(400);
    expect((await get("?estado=roto")).status).toBe(400);
  });

  it("rol usuario: 403; sin token: 401", async () => {
    expect((await get("", t.userToken)).status).toBe(403);
    expect((await request(app).get("/api/reports/distribution")).status).toBe(
      401,
    );
  });
});
