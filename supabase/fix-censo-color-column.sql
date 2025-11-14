-- ============================================================================
-- MIGRACIÓN: Cambiar columna 'color' de VARCHAR a INTEGER en tabla censo
-- ============================================================================
--
-- Problema: La PWA espera que el color sea un número (0-4), pero la tabla
-- lo define como VARCHAR. Esto causa que todas las chapas aparezcan rojas.
--
-- Solución: Cambiar el tipo de dato de VARCHAR(20) a INTEGER
--
-- Ejecutar en: Supabase SQL Editor
-- ============================================================================

-- Paso 1: Eliminar todos los datos existentes (contienen strings)
DELETE FROM censo;

-- Paso 2: Cambiar el tipo de columna de VARCHAR a INTEGER
ALTER TABLE censo
  ALTER COLUMN color TYPE INTEGER USING color::integer;

-- Paso 3: Agregar comentario explicativo
COMMENT ON COLUMN censo.color IS 'Código de color: 0=rojo (no disponible), 1=naranja, 2=amarillo, 3=azul, 4=verde (disponible)';

-- Paso 4: Verificar la estructura de la tabla
SELECT
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'censo' AND column_name = 'color';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
--
-- Después de ejecutar este script:
-- 1. Redesplegar el Edge Function: supabase functions deploy sync-all-tables
-- 2. Esperar 3 minutos para que se sincronice automáticamente
-- 3. Verificar: SELECT * FROM censo LIMIT 10;
