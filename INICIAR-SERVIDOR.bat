@echo off
echo ============================================
echo   PORTAL ESTIBA VLC - SERVIDOR LOCAL
echo ============================================
echo.
echo Iniciando servidor HTTP en http://localhost:8000
echo.
echo IMPORTANTE:
echo - NO cierres esta ventana mientras uses la aplicacion
echo - Abre tu navegador en: http://localhost:8000
echo - Para detener el servidor: Cierra esta ventana o presiona Ctrl+C
echo.
echo ============================================
echo.

REM Intentar Python 3 primero
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Python detectado
    echo [OK] Servidor iniciado en http://localhost:8000
    echo.
    start http://localhost:8000
    python -m http.server 8000
    goto :end
)

REM Intentar py (launcher de Python en Windows)
py --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Python detectado (py)
    echo [OK] Servidor iniciado en http://localhost:8000
    echo.
    start http://localhost:8000
    py -m http.server 8000
    goto :end
)

REM Si no encuentra Python
echo [ERROR] Python no esta instalado o no esta en el PATH
echo.
echo SOLUCION:
echo 1. Instala Python desde: https://www.python.org/downloads/
echo    (Marca la opcion "Add Python to PATH" durante la instalacion)
echo.
echo 2. O usa Node.js:
echo    - Instala Node.js desde: https://nodejs.org/
echo    - Ejecuta en su lugar: INICIAR-SERVIDOR-NODE.bat
echo.
pause

:end
