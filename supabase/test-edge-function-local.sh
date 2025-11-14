<<<<<<< HEAD
#!/bin/bash

# Script para probar la Edge Function localmente antes de desplegar

echo "🧪 Probando Edge Function sync-all-tables localmente..."
echo ""

# Verificar que Supabase CLI esté instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI no está instalado"
    echo "Instálalo con: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI encontrado"
echo ""

# Iniciar Supabase local (si no está corriendo)
echo "🚀 Iniciando Supabase local..."
supabase start

echo ""
echo "📡 Sirviendo Edge Function localmente..."
supabase functions serve sync-all-tables --env-file supabase/.env.local &

# Esperar a que la función esté lista
sleep 5

echo ""
echo "🔥 Ejecutando Edge Function..."
echo ""

# Ejecutar la función
curl -X POST http://localhost:54321/functions/v1/sync-all-tables \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -H "Content-Type: application/json" \
  | jq '.'

echo ""
echo "✅ Prueba completada!"
echo ""
echo "Para detener Supabase local:"
echo "  supabase stop"
=======
#!/bin/bash

# Script para probar la Edge Function localmente antes de desplegar

echo "🧪 Probando Edge Function sync-all-tables localmente..."
echo ""

# Verificar que Supabase CLI esté instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI no está instalado"
    echo "Instálalo con: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI encontrado"
echo ""

# Iniciar Supabase local (si no está corriendo)
echo "🚀 Iniciando Supabase local..."
supabase start

echo ""
echo "📡 Sirviendo Edge Function localmente..."
supabase functions serve sync-all-tables --env-file supabase/.env.local &

# Esperar a que la función esté lista
sleep 5

echo ""
echo "🔥 Ejecutando Edge Function..."
echo ""

# Ejecutar la función
curl -X POST http://localhost:54321/functions/v1/sync-all-tables \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0" \
  -H "Content-Type: application/json" \
  | jq '.'

echo ""
echo "✅ Prueba completada!"
echo ""
echo "Para detener Supabase local:"
echo "  supabase stop"
>>>>>>> ec0b337 (Initial local commit after zip download, including push notifications setup)
