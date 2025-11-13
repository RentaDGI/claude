#!/bin/bash

echo "============================================"
echo "  PORTAL ESTIBA VLC - SERVIDOR LOCAL"
echo "============================================"
echo ""
echo "Iniciando servidor HTTP en http://localhost:8000"
echo ""
echo "IMPORTANTE:"
echo "- NO cierres esta terminal mientras uses la aplicación"
echo "- Abre tu navegador en: http://localhost:8000"
echo "- Para detener el servidor: Presiona Ctrl+C"
echo ""
echo "============================================"
echo ""

# Verificar si Python 3 está instalado
if command -v python3 &> /dev/null; then
    echo "[OK] Python 3 detectado"
    echo "[OK] Servidor iniciado en http://localhost:8000"
    echo ""

    # Abrir navegador automáticamente (funciona en la mayoría de sistemas)
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:8000 2>/dev/null &
    elif command -v open &> /dev/null; then
        # macOS
        open http://localhost:8000
    fi

    # Iniciar servidor
    python3 -m http.server 8000

elif command -v python &> /dev/null; then
    echo "[OK] Python detectado"
    echo "[OK] Servidor iniciado en http://localhost:8000"
    echo ""

    # Abrir navegador
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:8000 2>/dev/null &
    elif command -v open &> /dev/null; then
        open http://localhost:8000
    fi

    # Iniciar servidor
    python -m http.server 8000

else
    echo "[ERROR] Python no está instalado"
    echo ""
    echo "SOLUCIÓN:"
    echo "1. Instala Python:"
    echo "   - Ubuntu/Debian: sudo apt install python3"
    echo "   - macOS: brew install python3"
    echo "   - Fedora: sudo dnf install python3"
    echo ""
    echo "2. O usa Node.js:"
    echo "   - Instala Node.js: https://nodejs.org/"
    echo "   - Ejecuta: npm install -g http-server"
    echo "   - Ejecuta: http-server -p 8000"
    echo ""
    exit 1
fi
