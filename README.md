# System Inventory (e-yonda)

Sistema web de gestión y control de activos mediante códigos QR. Permite registrar activos con su imagen, imprimir etiquetas QR, escanearlas con el celular para ver la ficha (imagen, responsable, área, estado, mantenimiento) y llevar el historial de asignaciones, traslados y mantenimientos.

- **Backend (`backend/`):** Node.js, Express 5, TypeScript, Knex, MySQL/MariaDB, sharp.
- **Frontend (`frontend/`):** React, Vite, TypeScript, Tailwind, TanStack Query, React Hook Form + Zod.
- **Roles:** `admin` (gestiona todo) y `usuario` (consulta).

El repositorio es un workspace de pnpm: una sola instalación y un solo `pnpm-lock.yaml` en la raíz, y los comandos de la raíz delegan en cada paquete.

## Requisitos

- Node.js 20.6 o superior (usa `--env-file`).
- pnpm (la versión está fijada en el `package.json` de la raíz).
- MySQL 8 o MariaDB (se usan columnas generadas).

## Estructura

```
e-yonda-ts/
  package.json            Comandos de la raíz (delegan en backend y frontend)
  pnpm-workspace.yaml     Workspace: backend + frontend
  pnpm-lock.yaml          Único lockfile
  backend/
    src/
      modules/            Un módulo por dominio (assets, assignments, maintenance, ...)
      shared/             Errores, middlewares, almacenamiento de imágenes y utilidades
      database/           knex, migraciones y seeds
        production/seeds/ Seed mínimo para producción (solo el administrador)
    tests/                Pruebas de integración (Vitest + Supertest)
    ops/                  Respaldo (backup/), servicio de Windows (windows/) y smoke test
    knexfile.ts
    .env, .env.test, .env.production    (no se versionan)
  frontend/
    src/
      app/                Superficies: scanner (móvil) y admin (escritorio)
      modules/            Dominio: api, hooks, componentes, schemas
      shared/             Componentes y utilidades comunes
```

## Variables de entorno

Viven en `backend/` y se validan al arrancar (`backend/src/config/env.ts`). Si falta alguna, la app no inicia.

| Variable                                                  | Descripción                                                           |
| --------------------------------------------------------- | --------------------------------------------------------------------- |
| `NODE_ENV`                                                | `development`, `test` o `production`                                  |
| `PORT`                                                    | Puerto del backend (por defecto 3000)                                 |
| `CORS_ORIGIN`                                             | Origen permitido (en producción, la misma URL de la app)              |
| `PUBLIC_APP_URL`                                          | URL base que codifican los QR, por ejemplo `http://192.168.1.50:3000` |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Conexión a la base de datos                                           |
| `JWT_SECRET`                                              | Secreto de firma, mínimo 32 caracteres, aleatorio                     |
| `JWT_EXPIRES_IN`                                          | Duración del token en segundos (producción: `28800` = 8 h)            |
| `IMAGES_DIR`                                              | Carpeta donde se guardan las imágenes de los activos                  |

Notas sobre `IMAGES_DIR`:

- Escríbela con barras normales y sin comillas (`C:/inventario-imagenes`). Con comillas dobles y `\`, secuencias como `\n` se interpretan mal.
- Debe estar **fuera del repositorio** y ser distinta en cada entorno. En `.env.test` su nombre **debe terminar en `-test`** (las pruebas la vacían y se niegan a correr si no).

Solo para el seed de producción: `ADMIN_USERNAME`, `INITIAL_ADMIN_PASSWORD`, `ADMIN_DNI`, `ADMIN_NOMBRES`, `ADMIN_APELLIDOS`, `ADMIN_TELEFONO`, `ADMIN_EMAIL`.

Opcional en desarrollo: `INITIAL_USER_PASSWORD` (mínimo 12 caracteres) hace que `pnpm seed:run` cree también un usuario de prueba con rol `usuario`.

Archivos: `backend/.env` (desarrollo), `backend/.env.test` (pruebas) y `backend/.env.production` (servidor). Ninguno se versiona. Usa contraseñas solo con letras, números, `_` y `-`: otros caracteres rompen el formato del archivo.

## Desarrollo

Todos los comandos se ejecutan desde la raíz del repositorio.

```bash
pnpm install             # instala backend y frontend
# crear la base de datos y completar backend/.env
pnpm migrate:latest
pnpm seed:run            # datos ficticios de prueba
pnpm dev                 # backend en :3000
pnpm dev:frontend        # frontend en :5173 (proxy de /api hacia el backend)
```

Otros comandos de la raíz: `pnpm test`, `pnpm typecheck`, `pnpm typecheck:test`, `pnpm lint:all` y `pnpm build:all`. Los comandos de Knex que no tienen atajo en la raíz (`migrate:make`, `migrate:rollback`, `migrate:status`, `seed:make`) se ejecutan con `pnpm --filter ./backend <comando>`.

### Probar el QR con el celular (misma red WiFi)

1. En `backend/.env`: `PUBLIC_APP_URL=http://<IP-de-tu-PC>:5173` y reinicia el backend.
2. Si el celular no carga la página, marca la red como Privada (PowerShell como administrador):
   `Set-NetConnectionProfile -InterfaceAlias "Wi-Fi" -NetworkCategory Private`
3. Escanea el QR de una ficha. Si no hay sesión, pedirá iniciar sesión y volverá a la ficha.

## Pruebas

Corren contra una base separada cuyo nombre **debe terminar en `_test`** (se recrea en cada corrida) y una carpeta de imágenes separada que termina en `-test`.

```bash
# backend/.env.test: NODE_ENV=test, DB_NAME=system_inventory_test,
#                    IMAGES_DIR=C:/inventario-imagenes-test, JWT_SECRET propio
pnpm test
```

## Migraciones

Una vez que el sistema esté instalado con datos reales, **no se edita ninguna migración que ya se ejecutó**: Knex la da por aplicada y la base queda desfasada. Cada cambio de esquema es una migración nueva (`pnpm --filter ./backend migrate:make <nombre>`).

## Despliegue en producción (servidor local, Windows)

El sistema se sirve desde un solo puerto: Express entrega la API y el build del frontend (`frontend/dist`). Si el build no existe, el servidor no arranca.

**No expongas el servidor a internet** (sin port forwarding en el router).

1. **Red:** reserva una IP fija para la máquina en el router (o usa un nombre de host). Los QR dependen de esa dirección: defínela **antes de imprimir etiquetas**.
2. **Firewall:** abre solo el puerto de la app, solo en perfil Privado (y marca la red como Privada):
   `New-NetFirewallRule -DisplayName "Inventario 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Private -RemoteAddress LocalSubnet`
3. **Base de datos:** crea la base y un usuario propio (no `root`) con permisos solo sobre ella:
   ```sql
   CREATE DATABASE system_inventory_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'inventario_app'@'localhost' IDENTIFIED BY '<clave-larga>';
   GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES
     ON system_inventory_prod.* TO 'inventario_app'@'localhost';
   FLUSH PRIVILEGES;
   ```
4. **Código:** `git clone`, `git checkout <etiqueta>` y `pnpm install` en la raíz (con devDependencies: las migraciones usan `tsx` y el frontend se compila con Vite).
5. **`backend/.env.production`:** completa las variables (usa `backend/.env.production.example` como guía). No debe existir un `.env` de desarrollo en esta máquina. Protege el archivo para que solo lean Administradores y el sistema.
6. **Carpeta de imágenes:** crea la carpeta de `IMAGES_DIR` (por ejemplo `D:/inventario-imagenes`) fuera del repositorio.
7. **Compilar:** `pnpm build:all`
8. **Base de datos:** `pnpm migrate:prod` y luego `pnpm seed:prod` (crea solo el administrador).
9. **Primer ingreso:** inicia sesión como admin, cambia la contraseña en **Mi cuenta**, y borra las variables `ADMIN_*` e `INITIAL_ADMIN_PASSWORD` del `.env.production`.
10. **Arrancar:** `pnpm start`. Para que sobreviva a reinicios, instálalo como servicio de Windows (NSSM) con `backend/ops/windows/install-service.ps1`; el servicio debe correr con `backend/` como directorio de trabajo.
11. **Comprobar:** `pnpm smoke http://<ip>:3000` (7 comprobaciones) y abrir `http://<ip>:3000/login` desde un celular de la misma red.

## Respaldo

Hay que respaldar **dos cosas**: la base de datos y la carpeta de imágenes (`IMAGES_DIR`). La base solo guarda el nombre de cada archivo; si se restaura sin las imágenes, las fichas quedan con imágenes que no existen.

- **Base de datos:** el script `backend/ops/backup/backup-db.ps1` (`pnpm backup:db`) genera un `.zip` con `mysqldump` y borra los de más de 30 días.
- **Imágenes:** copia la carpeta de `IMAGES_DIR` junto con cada respaldo de la base.
- **Diario:** tarea programada dentro de la jornada, con la máquina encendida.
- **Antes de cada migración:** `pnpm backup:db`.
- **Semanal:** copia fuera de la máquina (disco externo o carpeta sincronizada; cifra el archivo si sale de la empresa).
- **Mensual:** prueba de restauración en una base temporal.

Credenciales y respaldos viven **fuera del repositorio**.

## Actualizar una versión

Hazlo fuera de la jornada: hay unos minutos sin servicio.

```bash
pnpm backup:db
# detener el servicio (nssm stop SystemInventory)
git fetch --tags
git checkout <etiqueta-nueva>
pnpm install
pnpm build:all
pnpm migrate:prod
# iniciar el servicio (nssm start SystemInventory)
pnpm smoke http://localhost:3000
```

Nunca ejecutes `migrate:rollback` en producción sin respaldo previo.

## Lista de seguridad

- [ ] Servidor sin exposición a internet.
- [ ] `JWT_SECRET` nuevo, largo y distinto al de desarrollo y pruebas.
- [ ] Contraseña del admin cambiada y variables `ADMIN_*` eliminadas del `.env.production`.
- [ ] WiFi con WPA2/WPA3, separada de la red de invitados.
- [ ] Usuario de base de datos propio, con permisos solo sobre `system_inventory_prod` y el servicio escuchando solo en `localhost`.
- [ ] Windows y Node actualizados.
- [ ] Respaldos diarios (base de datos e imágenes) con una copia fuera de la máquina.
- [ ] `backend/.env.production` ignorado por Git (`git check-ignore -v backend/.env.production`).
- [ ] HTTPS (pendiente): hoy el tráfico viaja en texto plano dentro de la red local.

## Notas de diseño

- **Baja de activos:** lógica (`eliminado`), conserva el historial. El código de inventario es inmutable porque lo usa el QR.
- **Estados:** `operativo`, `mantenimiento`, `fuera_de_servicio`. "Asignado" no se guarda: se deriva de las asignaciones abiertas.
- **Sesiones:** el JWT se valida contra la base en cada petición. Desactivar una cuenta o cambiar su contraseña cierra sus sesiones.
- **Imágenes:** una por activo, guardada en disco (`IMAGES_DIR`) como WebP de máximo 1200 px y sin metadatos EXIF; la base solo guarda el nombre del archivo (`activos.imagen_archivo`). Se lee con sesión desde `GET /api/assets/:id/imagen`. Solo el admin las sube, cambia o quita (máx. 12 MB, JPG, PNG o WebP) y al cambiarla se borra la anterior.
