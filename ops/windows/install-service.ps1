#Requires -RunAsAdministrator
param(
  [string]$ServiceName = "SystemInventory",
  [string]$AppDir = (Resolve-Path "$PSScriptRoot\..\..").Path,
  [string]$Nssm = "C:\tools\nssm\nssm.exe"
)

$ErrorActionPreference = "Stop"

function Invoke-Nssm {
  & $Nssm @args
  if ($LASTEXITCODE -ne 0) { throw "nssm $($args -join ' ') falló (código $LASTEXITCODE)" }
}

Write-Host "Instalando el servicio '$ServiceName' desde $AppDir ..."

if (-not (Test-Path $Nssm)) { throw "No se encontró NSSM en $Nssm" }
if (-not (Test-Path (Join-Path $AppDir ".env.production"))) { throw "Falta .env.production" }
if (-not (Test-Path (Join-Path $AppDir "dist\server.js"))) { throw "Falta dist\server.js: ejecuta pnpm build:all" }
if (Get-Service $ServiceName -ErrorAction SilentlyContinue) {
  throw "El servicio '$ServiceName' ya existe. Quítalo con: $Nssm remove $ServiceName confirm"
}

$node = (Get-Command node).Source
$logs = Join-Path $AppDir "logs"
New-Item -ItemType Directory -Force -Path $logs | Out-Null

Invoke-Nssm install $ServiceName $node
Invoke-Nssm set $ServiceName AppParameters "--env-file=.env.production dist\server.js"
Invoke-Nssm set $ServiceName AppDirectory $AppDir
Invoke-Nssm set $ServiceName DisplayName "System Inventory"
Invoke-Nssm set $ServiceName Start SERVICE_AUTO_START
Invoke-Nssm set $ServiceName AppStdout (Join-Path $logs "out.log")
Invoke-Nssm set $ServiceName AppStderr (Join-Path $logs "error.log")
Invoke-Nssm set $ServiceName AppRotateFiles 1
Invoke-Nssm set $ServiceName AppRotateOnline 1
Invoke-Nssm set $ServiceName AppRotateBytes 5242880
Invoke-Nssm set $ServiceName AppExit Default Restart
Invoke-Nssm set $ServiceName AppRestartDelay 5000
Invoke-Nssm start $ServiceName

Write-Host "Servicio '$ServiceName' instalado e iniciado. Registros en $logs"