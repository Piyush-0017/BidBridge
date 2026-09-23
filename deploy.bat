@echo off
echo =========================================================================
echo Central e-Procurement Portal (SIH26100) - Production Deployment
echo =========================================================================
echo.
echo [1/3] Validating Environment Configuration (.env)...
if not exist .env (
    echo [ERROR] .env file not found. Please create .env before deploying.
    exit /b 1
)

echo [2/3] Building and Starting Production Containers...
docker compose up -d --build

echo.
echo [3/3] Performing Live Health Check...
timeout /t 10 /nobreak >nul
curl -s http://localhost:3000/api/health
echo.
echo =========================================================================
echo Deployment Complete!
echo Portal Live at:       http://localhost:3000
echo MinIO Console at:     http://localhost:9001 (minioadmin / minioadmin)
echo =========================================================================
