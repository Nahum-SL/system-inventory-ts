<#
  Respaldo de la base de datos MySQL de system-inventory-ts.

  - Genera un archivo SQL independiente por ejecución.
  - Utiliza mysqldump.
  - No modifica ni elimina respaldos anteriores.
  - Usa backup.cnf para las credenciales.
  - Registra las ejecuciones en un log.
  - Comprueba el código de salida y el tamaño del archivo.
  - Genera el archivo temporalmente y lo renombra al finalizar.

  Ejecución:
    powershell -NoProfile -ExecutionPolicy Bypass -File backup-database.ps1

  Prueba con otros parámetros:
    .\backup-database.ps1 -Database system_inventory -Dest "C:\pruebas\backups"
#>

param(
    [string]$Database = "system_inventory_prod",
    [string]$Dest = "C:\respaldos\database",
    [string]$Log = "C:\respaldos\database-backup.log",
    [string]$Config = (Join-Path $PSScriptRoot "backup.cnf")
)

$ErrorActionPreference = "Stop"

function Write-Log([string]$Message) {
    $line = "{0}  {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Message
    Write-Host $line
    Add-Content -LiteralPath $Log -Value $line -Encoding UTF8
}

try {
    # Validaciones iniciales
    if (-not (Test-Path -LiteralPath $Config -PathType Leaf)) {
        throw "No existe el archivo de configuracion: $Config"
    }

    if ([string]::IsNullOrWhiteSpace($Database)) {
        throw "El nombre de la base de datos no puede estar vacio."
    }

    # Localizar mysqldump
    $command = Get-Command mysqldump.exe -ErrorAction SilentlyContinue

    if (-not $command) {
        throw "No se encontro mysqldump.exe. Agrega MySQL Server\bin al PATH o configura su ruta."
    }

    $DumpExe = $command.Source

    # Preparar directorios
    New-Item -ItemType Directory -Force -Path $Dest | Out-Null

    $logDirectory = Split-Path -Parent $Log

    if ($logDirectory) {
        New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
    }

    # Nombre del respaldo
    $timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"

    $fileName = "${Database}_${timestamp}.sql"
    $outputFile = Join-Path $Dest $fileName
    $tempFile = "$outputFile.tmp"

    Write-Log "========================================"
    Write-Log "Inicio del respaldo MySQL."
    Write-Log "Base de datos: $Database"
    Write-Log "Destino: $outputFile"

    # Ejecutar mysqldump.
    # defaults-extra-file debe ser la primera opcion.
    & $DumpExe `
        "--defaults-extra-file=$Config" `
        "--single-transaction" `
        "--quick" `
        "--routines" `
        "--triggers" `
        "--events" `
        "--hex-blob" `
        "--no-tablespaces" `
        "--default-character-set=utf8mb4" `
        "--databases" `
        "$Database" `
        "--result-file=$tempFile"

    $code = $LASTEXITCODE

    if ($code -ne 0) {
        throw "mysqldump fallo con codigo $code."
    }

    # Verificar que el archivo se haya generado correctamente
    if (-not (Test-Path -LiteralPath $tempFile -PathType Leaf)) {
        throw "mysqldump no genero el archivo esperado."
    }

    $file = Get-Item -LiteralPath $tempFile

    if ($file.Length -le 0) {
        throw "El archivo de respaldo esta vacio."
    }

    # Publicar el respaldo terminado
    Move-Item -LiteralPath $tempFile -Destination $outputFile

    $finalFile = Get-Item -LiteralPath $outputFile
    $sizeMB = [math]::Round($finalFile.Length / 1MB, 2)

    Write-Log "Respaldo completado correctamente."
    Write-Log "Archivo: $($finalFile.Name)"
    Write-Log "Tamano: $sizeMB MB"
    Write-Log "Codigo de salida: $code"
    Write-Log "========================================"

    exit 0
}
catch {
    if ($tempFile -and (Test-Path -LiteralPath $tempFile)) {
        Remove-Item -LiteralPath $tempFile -Force
    }

    Write-Log "ERROR: $($_.Exception.Message)"
    exit 1
}