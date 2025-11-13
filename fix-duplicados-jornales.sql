-- Script para limpiar duplicados en la tabla jornales
-- y agregar constraint UNIQUE para prevenir futuros duplicados

-- PASO 1: Identificar duplicados (para revisar antes de borrar)
-- Ejecuta esto primero para ver cuántos duplicados hay:
SELECT
  fecha,
  chapa,
  jornada,
  COUNT(*) as total_duplicados
FROM jornales
GROUP BY fecha, chapa, jornada
HAVING COUNT(*) > 1
ORDER BY total_duplicados DESC, fecha DESC;

-- PASO 2: Eliminar duplicados (mantener solo el registro con ID más bajo)
-- Este query elimina los duplicados, manteniendo solo el primer registro insertado
DELETE FROM jornales
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY fecha, chapa, jornada
        ORDER BY id ASC
      ) as row_num
    FROM jornales
  ) t
  WHERE row_num > 1
);

-- PASO 3: Crear constraint UNIQUE para prevenir duplicados futuros
-- Esto garantiza que no se puedan insertar jornales duplicados con la misma combinación de fecha+chapa+jornada
ALTER TABLE jornales
ADD CONSTRAINT jornales_unique_fecha_chapa_jornada
UNIQUE (fecha, chapa, jornada);

-- PASO 4: Verificar que ya no hay duplicados
SELECT
  fecha,
  chapa,
  jornada,
  COUNT(*) as total
FROM jornales
GROUP BY fecha, chapa, jornada
HAVING COUNT(*) > 1;
-- Si este query no devuelve ninguna fila, significa que ya no hay duplicados ✅
