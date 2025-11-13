@echo off
echo ============================================
echo   PORTAL ESTIBA VLC - SERVIDOR NODE.JS
echo ============================================
echo.

REM Verificar si http-server está instalado
where http-server >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] http-server detectado
    echo [OK] Servidor iniciado en http://localhost:8000
    echo.
    start http://localhost:8000
    http-server -p 8000 -c-1
    goto :end
)

REM Si no está instalado, instalarlo
echo [INFO] Instalando http-server...
echo.
call npm install -g http-server
if %errorlevel% == 0 (
    echo.
    echo [OK] Instalacion completa
    echo [OK] Servidor iniciado en http://localhost:8000
    echo.
    start http://localhost:8000
    http-server -p 8000 -c-1
) else (
    echo.
    echo [ERROR] No se pudo instalar http-server
    echo.
    echo SOLUCION:
    echo 1. Instala Node.js desde: https://nodejs.org/
    echo 2. Ejecuta este archivo de nuevo
    echo.
    pause
)

:end
