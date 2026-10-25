# System Inventory (e-yonda)

Sistema web de gestión y control de activos mediante códigos QR. Permite registrar activos, imprimir etiquetas QR, escanearlas con el celular para ver la ficha (responsable, área, estado, mantenimiento) y llevar el historial de asignaciones, traslados y mantenimientos.

- **Backend:** Node.js, Express 5, TypeScript, Knex, MySQL.
- **Frontend:** React, Vite, TypeScript, Tailwind, TanStack Query, React Hook Form + Zod (carpeta `frontend/`).
- **Roles:** `admin` (gestiona todo) y `usuario` (consulta).

## Requisitos

- Node.js 20.6 o superior (usa `--env-file`).
- pnpm.
- MySQL 8 (se usan columnas generadas).

## Estructura

```
src/                  Backend
  modules/            Un módulo por dominio (assets, assignments, maintenance, ...)
  shared/             Errores, middlewares y utilidades comunes
  database/           knex, migraciones y seeds
    production/seeds/ Seed mínimo para producción
frontend/src/
  app/                Superficies: scanner (móvil) y admin (escritorio)
  modules/            Dominio: api, hooks, componentes, schemas
  shared/             Componentes y utilidades comunes
tests/                Pruebas de integración (Vitest + Supertest)
ops/backup/           Script de respaldo de la base de datos
```

## Variables de entorno

Se validan al arrancar (`src/config/env.ts`). Si falta alguna, la app no inicia.

| Variable | Descripción |
|---|---|
| `NODE_ENV` | `development`, `test` o `production` |
| `PORT` | Puerto del backend (por defecto 3000) |
| `CORS_ORIGIN` | Origen permitido (en producción, la misma URL de la app) |
| `PUBLIC_APP_URL` | URL base que codifican los QR, por ejemplo `http://192.168.1.50:3000` |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Conexión a MySQL |
| `JWT_SECRET` | Secreto de firma, mínimo 32 caracteres, aleatorio |
| `JWT_EXPIRES_IN` | Duración del token en segundos (producción: `28800` = 8 h) |

Solo para el seed de producción: `ADMIN_USERNAME`, `INITIAL_ADMIN_PASSWORD`, `ADMIN_DNI`, `ADMIN_NOMBRES`, `ADMIN_APELLIDOS`, `ADMIN_TELEFONO`, `ADMIN_EMAIL`.

Archivos: `.env` (desarrollo), `.env.test` (pruebas) y `.env.production` (servidor). Ninguno se versiona.

## Desarrollo

```bash
pnpm install
pnpm --dir frontend install
# crear la base de datos y completar .env
pnpm migrate:latest
pnpm seed:run            # datos ficticios de prueba
pnpm dev                 # backend en :3000
pnpm dev:frontend        # frontend en :5173 (proxy de /api hacia el backend)
```

### Probar el QR con el celular (misma red WiFi)

1. En el `.env`: `PUBLIC_APP_URL=http://<IP-de-tu-PC>:5173` y reinicia el backend.
2. Si el celular no carga la página, marca la red como Privada (PowerShell como administrador):
   `Set-NetConnectionProfile -InterfaceAlias "Wi-Fi" -NetworkCategory Private`
3. Escanea el QR de una ficha. Si no hay sesión, pedirá iniciar sesión y volverá a la ficha.

## Pruebas

Corren contra una base separada cuyo nombre **debe terminar en `_test`** (se recrea en cada corrida).

```bash
# .env.test: NODE_ENV=test, DB_NAME=system_inventory_test, JWT_SECRET propio
pnpm test
```

## Despliegue en producción (servidor local, Windows)

El sistema se sirve desde un solo puerto: Express entrega la API y el build del frontend.

**No expongas el servidor a internet** (sin port forwarding en el router).

1. **Red:** reserva una IP fija para la máquina en el router (o usa un nombre de host). Los QR dependen de esa dirección: defínela **antes de imprimir etiquetas**.
2. **Firewall:** abre solo el puerto de la app, solo en perfil Privado:
   `New-NetFirewallRule -DisplayName "Inventario" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Private -RemoteAddress LocalSubnet`
3. **MySQL:** crea la base y un usuario propio (no `root`) con permisos solo sobre ella:
   ```sql
   CREATE DATABASE system_inventory_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'inventario_app'@'localhost' IDENTIFIED BY '<clave-larga>';
   GRANT ALL PRIVILEGES ON system_inventory_prod.* TO 'inventario_app'@'localhost';
   ```
4. **Código:** `git clone`, luego `pnpm install` (con devDependencies: las migraciones usan `tsx`).
5. **`.env.production`:** completa las variables (usa `.env.production.example` como guía). No debe existir un `.env` de desarrollo en esta máquina.
6. **Compilar:** `pnpm build:all`
7. **Base de datos:** `pnpm migrate:prod` y luego `pnpm seed:prod` (crea solo el administrador).
8. **Primer ingreso:** inicia sesión como admin, cambia la contraseña en **Mi cuenta**, y borra `INITIAL_ADMIN_PASSWORD` del `.env.production`.
9. **Arrancar:** `pnpm start`. Para que sobreviva a reinicios, regístralo como servicio de Windows (NSSM) o con el Programador de tareas.
10. **Comprobar:** `http://<ip>:3000/api/health` y `http://<ip>:3000/login`.

## Respaldo

El script `ops/backup/backup-db.ps1` genera un `.zip` con `mysqldump` y borra los de más de 30 días.

- **Diario:** tarea programada dentro de la jornada, con la máquina encendida.
- **Antes de cada migración:** `pnpm backup:db`.
- **Semanal:** copia fuera de la máquina (disco externo o carpeta sincronizada; cifra el archivo si sale de la empresa).
- **Mensual:** prueba de restauración en una base temporal.

Credenciales y respaldos viven **fuera del repositorio**.

## Actualizar una versión

```bash
pnpm backup:db
git pull
pnpm install
pnpm build:all
pnpm migrate:prod
# reiniciar el servicio
```

Nunca ejecutes `migrate:rollback` en producción sin respaldo previo.

## Lista de seguridad

- [ ] Servidor sin exposición a internet.
- [ ] `JWT_SECRET` nuevo, largo y distinto al de desarrollo y pruebas.
- [ ] Contraseña del admin cambiada y `INITIAL_ADMIN_PASSWORD` eliminada del `.env.production`.
- [ ] WiFi con WPA2/WPA3, separada de la red de invitados.
- [ ] Usuario de MySQL propio, con MySQL escuchando solo en `localhost`.
- [ ] Windows y Node actualizados.
- [ ] Respaldos diarios con una copia fuera de la máquina.
- [ ] HTTPS (pendiente): hoy el tráfico viaja en texto plano dentro de la red local.

## Notas de diseño

- **Baja de activos:** lógica (`eliminado`), conserva el historial. El código de inventario es inmutable porque lo usa el QR.
- **Estados:** `operativo`, `mantenimiento`, `fuera_de_servicio`. "Asignado" no se guarda: se deriva de las asignaciones abiertas.
- **Sesiones:** el JWT se valida contra la base en cada petición. Desactivar una cuenta o cambiar su contraseña cierra sus sesiones.