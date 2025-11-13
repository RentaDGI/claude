-- Configuración de Cron Job para sincronización automática
-- Se ejecuta cada 3 minutos entre las 07:00 y 16:00 (hora de España)

-- 1. Habilitar la extensión pg_cron si no está habilitada
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Configurar cron job para ejecutar la Edge Function cada 3 minutos
-- Cron: */3 7-15 * * * (cada 3 minutos entre 07:00-15:59)
SELECT cron.schedule(
  'sync-all-tables-auto',           -- Nombre del job
  '*/3 7-15 * * *',                  -- Cada 3 minutos entre 07:00-15:59
  $$
  SELECT
    net.http_post(
      url := 'https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/sync-all-tables',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb
    ) as request_id;
  $$
);

-- 3. Ver todos los cron jobs configurados
SELECT * FROM cron.job;

-- 4. Para eliminar el job (si es necesario):
-- SELECT cron.unschedule('sync-all-tables-auto');

-- 5. Ver historial de ejecuciones:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
