<#
  Respaldo de la carpeta de imagenes de los activos (IMAGES_DIR).

  - Copia solo lo nuevo o modificado (robocopy /E). NUNCA borra nada del destino:
    si una foto se elimina o reemplaza, su copia anterior sigue en el respaldo.
  - Programalo DESPUES del respaldo de la base de datos (ej. 18:45 vs 18:30), asi la
    carpeta siempre contiene todas las imagenes que el respaldo de la base menciona.
  - Sale con codigo 0 si todo fue bien, para que la tarea programada muestre
    "Resultado de la ultima ejecucion: 0". Cualquier error sale con codigo distinto de 0.

  Uso normal (tarea programada, sin parametros):
    powershell -NoProfile -ExecutionPolicy Bypass -File backup-images.ps1

  Prueba con otras carpetas, sin editar el script:
    .\backup-images.ps1 -Source C:\mis-pruebas\imagenes -Dest C:\mis-pruebas\respaldo

    Example 2 - Powershell:
    .\backup-images.ps1 
     -Source C:\tu-carpeta-de-pruebas 
     -Dest C:\tu-respaldo-de-pruebas 
     -Log C:\tu-respaldo-de-pruebas\backup.log
#>
param(
    [string]$Source = "C:\inventario-imagenes",   # debe coincidir con IMAGES_DIR del .env.production
    [string]$Dest   = "D:\respaldos\imagenes",
    [string]$Log    = "D:\respaldos\imagenes-backup.log"
)

$ErrorActionPreference = "Stop"

function Write-Log([string]$Message) {
    $line = "{0}  {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Message
    Write-Host $line
    Add-Content -Path $Log -Value $line -Encoding UTF8
}

try {
    if (-not (Test-Path -LiteralPath $Source -PathType Container)) {
        throw "No existe la carpeta de imagenes: $Source"
    }

    New-Item -ItemType Directory -Force -Path $Dest | Out-Null
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $Log) | Out-Null

    Write-Log "Inicio: $Source -> $Dest"

    # /E   subcarpetas (sin /MIR ni /PURGE: no se borra nada en el destino)
    # /R /W  2 reintentos, 5 s de espera (archivo en uso)
    # /NP /NFL /NDL  salida breve; /XJ no seguir enlaces
    $summary = robocopy $Source $Dest /E /R:2 /W:5 /NP /NFL /NDL /XJ
    $code = $LASTEXITCODE

    # Codigos de robocopy: 0 a 7 = exito (1 = se copiaron archivos); 8 o mas = error.
    if ($code -ge 8) {
        $summary | ForEach-Object { Add-Content -Path $Log -Value $_ -Encoding UTF8 }
        throw "robocopy fallo con codigo $code (revisa $Log)"
    }

    $copied = (Get-ChildItem -LiteralPath $Dest -Recurse -File | Measure-Object).Count
    Write-Log "Listo (codigo robocopy $code). Archivos en el respaldo: $copied"
    exit 0
}
catch {
    Write-Log "ERROR: $($_.Exception.Message)"
    exit 1
}