<<<<<<< HEAD
#!/bin/bash

# Script para desplegar Edge Function en Supabase
# Requiere Supabase CLI instalado: npm install -g supabase

echo "🚀 Desplegando Edge Function sync-all-tables..."

# 1. Login a Supabase (si no estás logueado)
echo "📝 Verificando login en Supabase..."
supabase login

# 2. Vincular proyecto (solo la primera vez)
echo "🔗 Vinculando proyecto..."
# supabase link --project-ref icszzxkdxatfytpmoviq

# 3. Desplegar función
echo "📤 Desplegando función..."
supabase functions deploy sync-all-tables

# 4. Configurar variables de entorno (Service Role Key)
echo "🔑 Configurando variables de entorno..."
echo "IMPORTANTE: Configura el Service Role Key en el dashboard de Supabase"
echo "Dashboard > Settings > API > service_role key"

# 5. Ejecutar SQL para configurar cron job
echo "⏰ Configurando cron job..."
echo "Ejecuta el archivo supabase/cron-config.sql en el SQL Editor del dashboard de Supabase"

echo "✅ Despliegue completado!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ve al Dashboard de Supabase: https://supabase.com/dashboard"
echo "2. Settings > API > Copia el 'service_role' key"
echo "3. Settings > Edge Functions > Secrets > Añade SUPABASE_SERVICE_ROLE_KEY"
echo "4. SQL Editor > Ejecuta el archivo supabase/cron-config.sql"
echo "5. Verifica en Logs que la función se ejecuta cada 3 minutos"
=======
#!/bin/bash

# Script para desplegar Edge Function en Supabase
# Requiere Supabase CLI instalado: npm install -g supabase

echo "🚀 Desplegando Edge Function sync-all-tables..."

# 1. Login a Supabase (si no estás logueado)
echo "📝 Verificando login en Supabase..."
supabase login

# 2. Vincular proyecto (solo la primera vez)
echo "🔗 Vinculando proyecto..."
# supabase link --project-ref icszzxkdxatfytpmoviq

# 3. Desplegar función
echo "📤 Desplegando función..."
supabase functions deploy sync-all-tables

# 4. Configurar variables de entorno (Service Role Key)
echo "🔑 Configurando variables de entorno..."
echo "IMPORTANTE: Configura el Service Role Key en el dashboard de Supabase"
echo "Dashboard > Settings > API > service_role key"

# 5. Ejecutar SQL para configurar cron job
echo "⏰ Configurando cron job..."
echo "Ejecuta el archivo supabase/cron-config.sql en el SQL Editor del dashboard de Supabase"

echo "✅ Despliegue completado!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ve al Dashboard de Supabase: https://supabase.com/dashboard"
echo "2. Settings > API > Copia el 'service_role' key"
echo "3. Settings > Edge Functions > Secrets > Añade SUPABASE_SERVICE_ROLE_KEY"
echo "4. SQL Editor > Ejecuta el archivo supabase/cron-config.sql"
echo "5. Verifica en Logs que la función se ejecuta cada 3 minutos"
>>>>>>> ec0b337 (Initial local commit after zip download, including push notifications setup)
