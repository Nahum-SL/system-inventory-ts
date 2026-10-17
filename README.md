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
genera una migración.
identifica migraciones pendientes y completadas.
ejecuta las migraciones pendientes.