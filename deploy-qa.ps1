[CmdletBinding()]
param(
    [switch]$SyncOnly,
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$SkipSync
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

if (-not $SkipSync) {
    Write-Host "==> [1/3] Sincronizando con upstream/develop..." -ForegroundColor Cyan
    git fetch upstream develop
    git merge upstream/develop -m "chore: sincronizar novedades diarias desde upstream/develop"
    git push origin develop
    Write-Host "==> Sincronización completada y subida a origin." -ForegroundColor Green
}

if ($SyncOnly) {
    Write-Host "==> Proceso finalizado (SyncOnly solicitado)." -ForegroundColor Green
    exit 0
}

if (-not $FrontendOnly) {
    Write-Host "==> [2/3] Desplegando Backend a Cloud Run (umssy-backend)..." -ForegroundColor Cyan
    Set-Location "$root\backend"
    gcloud run deploy umssy-backend `
      --project daty-76e04 `
      --source . `
      --platform managed `
      --region us-central1 `
      --allow-unauthenticated `
      --add-cloudsql-instances daty-76e04:us-central1:umsy-db `
      --set-env-vars NODE_ENV=production `
      --set-env-vars DB_HOST="/cloudsql/daty-76e04:us-central1:umsy-db" `
      --set-env-vars DB_PORT=5432 `
      --set-env-vars DB_USER="postgres" `
      --set-env-vars DB_PASSWORD="RihitoGG#5700" `
      --set-env-vars DB_NAME="umsy-database" `
      --set-env-vars DB_SCHEMA="public" `
      --set-env-vars JWT_SECRET="RihitoGG#5700" `
      --set-env-vars JWT_EXPIRES_IN="8h" `
      --set-env-vars JWT_ALGORITHM="HS256" `
      --set-env-vars CORS_ORIGIN="*"
    Write-Host "==> Backend desplegado exitosamente." -ForegroundColor Green
}

if (-not $BackendOnly) {
    Write-Host "==> [3/3] Desplegando Frontend a Cloud Run (umssy-frontend) y Firebase Hosting..." -ForegroundColor Cyan
    Set-Location "$root\frontend"
    gcloud run deploy umssy-frontend `
      --project daty-76e04 `
      --source . `
      --platform managed `
      --region us-central1 `
      --allow-unauthenticated `
      --set-env-vars NODE_ENV=production `
      --set-env-vars NEXT_PUBLIC_API_URL_PROD="https://umssy-backend-466552952154.us-central1.run.app/api"

    Set-Location $root
    firebase deploy --only hosting --project daty-76e04
    Write-Host "==> Frontend desplegado exitosamente en Firebase Hosting." -ForegroundColor Green
}

Set-Location $root
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " Deploy QA completado con exito!" -ForegroundColor Green
Write-Host " URL Frontend: https://daty-76e04.web.app" -ForegroundColor Green
Write-Host " URL Backend:  https://umssy-backend-466552952154.us-central1.run.app/api" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
