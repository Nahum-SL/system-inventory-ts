const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/+$/, "");
let failed = 0;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function check(name, fn) {
  try {
    await fn();
    console.log(`✔ ${name}`);
  } catch (error) {
    failed++;
    console.log(`✘ ${name}: ${error.message}`);
  }
}

await check("health responde 200", async () => {
  const res = await fetch(`${base}/api/health`);
  assert(res.status === 200, `estado ${res.status}`);
});

await check("/login devuelve la aplicación (HTML)", async () => {
  const res = await fetch(`${base}/login`);
  assert(res.status === 200, `estado ${res.status}`);
  assert(
    (res.headers.get("content-type") ?? "").includes("text/html"),
    "no es HTML",
  );
});

await check(
  "la URL de una ficha (la del QR) devuelve la aplicación",
  async () => {
    const res = await fetch(`${base}/activos/INV-0001`);
    assert(res.status === 200, `estado ${res.status}`);
    assert(
      (res.headers.get("content-type") ?? "").includes("text/html"),
      "no es HTML",
    );
  },
);

await check(
  "una ruta /api inexistente responde JSON 404, no HTML",
  async () => {
    const res = await fetch(`${base}/api/no-existe`);
    assert(res.status === 404, `estado ${res.status}`);
    assert(
      (res.headers.get("content-type") ?? "").includes("application/json"),
      "no es JSON",
    );
  },
);

await check("la API protegida exige sesión", async () => {
  for (const path of ["/api/assets", "/api/reports/summary", "/api/users"]) {
    const res = await fetch(`${base}${path}`);
    assert(res.status === 401, `${path}: estado ${res.status}`);
  }
});

await check("cabeceras de seguridad y sin X-Powered-By", async () => {
  const res = await fetch(`${base}/login`);
  assert(
    res.headers.get("x-content-type-options") === "nosniff",
    "falta nosniff",
  );
  assert(!res.headers.get("x-powered-by"), "expone X-Powered-By");
});

await check("el CSP no fuerza HTTPS (el sitio va por HTTP)", async () => {
  const csp =
    (await fetch(`${base}/login`)).headers.get("content-security-policy") ?? "";
  assert(
    !csp.includes("upgrade-insecure-requests"),
    "upgrade-insecure-requests activo: la pantalla quedaría en blanco",
  );
});

console.log(
  failed === 0 ? "\nTodo en orden." : `\n${failed} comprobación(es) fallaron.`,
);
process.exit(failed === 0 ? 0 : 1);
