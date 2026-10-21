## Testar un archivo TS
``` bash
pnpm exec tsx src/database/test-connection.ts
```
## Comprobar compilacion
``` bash
pnpm exec tsc --noEmit
```

## Comprobar Build
``` bash
pnpm build
```

## Correr servidor
``` bash
pnpm dev
```

# Migrations
## Crea un archivo en /database/migrations/ 
``` bash
pnpm migrate:make name_migration
```

# Seeds
## Crea un archivo en /database/seeds/
``` bash
pnpm seed:make name_seed
```

## Flujo de trabajo

``` bash

pnpm migrate:make
pnpm migrate:status
pnpm migrate:latest

```
## Comando en bash para el JWT
``` bash

LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 64; echo

```


genera una migración.
identifica migraciones pendientes y completadas.
ejecuta las migraciones pendientes.