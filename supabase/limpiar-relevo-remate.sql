-- Script para limpiar valores incorrectos de relevo y remate
-- Ejecutar en Supabase SQL Editor

-- 1. Ver cuántos registros tienen valores en relevo/remate antes de limpiar
SELECT
  COUNT(*) as total_registros,
  COUNT(CASE WHEN relevo > 0 THEN 1 END) as con_relevo,
  COUNT(CASE WHEN remate > 0 THEN 1 END) as con_remate,
  AVG(relevo) as promedio_relevo,
  AVG(remate) as promedio_remate,
  MAX(relevo) as max_relevo,
  MAX(remate) as max_remate
FROM primas_personalizadas;

-- 2. Ver algunos ejemplos de datos incorrectos
SELECT
  chapa,
  fecha,
  jornada,
  prima_personalizada,
  movimientos_personalizados,
  relevo,
  remate
FROM primas_personalizadas
WHERE relevo > 0 OR remate > 0
ORDER BY relevo DESC, remate DESC
LIMIT 10;

-- 3. LIMPIAR todos los valores de relevo y remate (resetear a 0)
UPDATE primas_personalizadas
SET
  relevo = 0,
  remate = 0,
  ultima_actualizacion = NOW()
WHERE relevo > 0 OR remate > 0;

-- 4. Verificar que se limpiaron correctamente
SELECT
  COUNT(*) as total_registros,
  COUNT(CASE WHEN relevo > 0 THEN 1 END) as con_relevo,
  COUNT(CASE WHEN remate > 0 THEN 1 END) as con_remate
FROM primas_personalizadas;

-- Resultado esperado:
-- total_registros: X (número total de primas)
-- con_relevo: 0
-- con_remate: 0
