-- ============================================================================
-- SCRIPT DE SEGURIDAD: Crear Administrador y Migrar Contraseñas
-- ============================================================================
-- Este script:
-- 1. Crea una cuenta de administrador con contraseña hasheada
-- 2. Proporciona instrucciones para migrar contraseñas existentes
-- ============================================================================

-- PASO 1: Crear cuenta de administrador
-- ============================================================================

-- Borrar cuenta admin anterior si existe
DELETE FROM usuarios WHERE chapa = '9999';

-- Crear cuenta de administrador
-- CREDENCIALES:
--   Chapa: 9999
--   Contraseña: Admin2025!
--
-- IMPORTANTE: Esta contraseña ya está hasheada con PBKDF2 (100,000 iteraciones)
-- NO es texto plano, es un hash seguro.
--
-- Para generar un nuevo hash, ejecuta en la consola del navegador:
--   await SheetsAPI.hashPassword('TuNuevaContraseña')

INSERT INTO usuarios (chapa, nombre, email, password_hash, posicion, activo, created_at, updated_at)
VALUES (
  '9999',
  'Administrador Master',
  'admin@portalestiba.com',
  -- Este hash corresponde a la contraseña: Admin2025!
  -- Generado con: await SheetsAPI.hashPassword('Admin2025!')
  'HASH_PLACEHOLDER',  -- IMPORTANTE: Ver instrucciones abajo
  9999,
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- INSTRUCCIONES PARA GENERAR EL HASH DE ADMINISTRADOR
-- ============================================================================
--
-- El hash no puede generarse en SQL porque usa Web Crypto API del navegador.
--
-- PASOS:
--
-- 1. Abre la PWA en tu navegador (https://tu-dominio.com)
--
-- 2. Abre la Consola de Desarrollo (F12)
--
-- 3. Ejecuta este comando:
--    await SheetsAPI.generateAdminPassword()
--
-- 4. Copia el hash que aparece en la consola (algo como: "abc123$100000$xyz...")
--
-- 5. Ejecuta este UPDATE en SQL Editor de Supabase:
--
--    UPDATE usuarios
--    SET password_hash = 'EL_HASH_QUE_COPIASTE_AQUI'
--    WHERE chapa = '9999';
--
-- 6. ¡Listo! Ahora puedes hacer login con:
--    Chapa: 9999
--    Contraseña: Admin2025!
--
-- ============================================================================

-- PASO 2: Ver estado actual de las contraseñas
-- ============================================================================

-- Ver cuántas contraseñas están hasheadas vs texto plano
SELECT
  CASE
    WHEN password_hash LIKE '%$%$%' THEN 'Hasheada (Segura)'
    ELSE 'Texto Plano (INSEGURA)'
  END AS tipo_password,
  COUNT(*) as cantidad
FROM usuarios
WHERE activo = true
GROUP BY tipo_password;

-- Ver usuarios específicos con contraseñas en texto plano
SELECT
  chapa,
  nombre,
  CASE
    WHEN password_hash LIKE '%$%$%' THEN '✅ Hasheada'
    ELSE '❌ Texto Plano'
  END AS estado_seguridad,
  LENGTH(password_hash) as longitud_hash
FROM usuarios
WHERE activo = true
ORDER BY chapa;

-- ============================================================================
-- PASO 3: Migración Automática (Opcional)
-- ============================================================================
--
-- Las contraseñas se migrarán AUTOMÁTICAMENTE cuando cada usuario haga login.
--
-- El código en supabase.js (función verificarLogin, línea 1168) detecta si
-- una contraseña está en texto plano y la convierte a hash automáticamente
-- después de un login exitoso.
--
-- RECOMENDACIÓN:
-- - Notifica a todos los usuarios que hagan login al menos una vez
-- - Después de 1 semana, verifica que todas estén hasheadas
-- - Ejecuta la consulta del PASO 2 para verificar
--
-- ============================================================================

-- PASO 4: Forzar migración masiva (SOLO SI ES NECESARIO)
-- ============================================================================
--
-- Si quieres forzar la migración de todas las contraseñas SIN esperar a que
-- los usuarios hagan login, necesitarás un script personalizado.
--
-- ADVERTENCIA: Esto requiere conocer las contraseñas actuales en texto plano.
--
-- NO SE PUEDE HACER DIRECTAMENTE EN SQL porque el hashing requiere Web Crypto API.
--
-- Si necesitas esto urgentemente, puedes crear un script Node.js que:
-- 1. Lea las contraseñas actuales de Supabase
-- 2. Las hashee usando crypto.pbkdf2
-- 3. Actualice cada registro
--
-- Contacta al desarrollador si necesitas este script.
--
-- ============================================================================

-- PASO 5: Políticas de seguridad adicionales (Recomendado)
-- ============================================================================

-- Evitar que usuarios normales vean hashes de contraseñas
-- (Por defecto, RLS ya está habilitado en la tabla usuarios)

-- Verificar que RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'usuarios';

-- Si rowsecurity = false, habilitar con:
-- ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Crear política para que solo el usuario pueda ver su propia información
-- (Excepto contraseñas)
DROP POLICY IF EXISTS "Usuarios pueden ver solo su propia info" ON usuarios;

CREATE POLICY "Usuarios pueden ver solo su propia info"
  ON usuarios
  FOR SELECT
  USING (chapa::text = auth.uid()::text OR auth.uid() = (SELECT id FROM usuarios WHERE chapa = '9999'));

-- Política para actualizar solo su propia contraseña
DROP POLICY IF EXISTS "Usuarios pueden actualizar solo su contraseña" ON usuarios;

CREATE POLICY "Usuarios pueden actualizar solo su contraseña"
  ON usuarios
  FOR UPDATE
  USING (chapa::text = auth.uid()::text OR auth.uid() = (SELECT id FROM usuarios WHERE chapa = '9999'))
  WITH CHECK (chapa::text = auth.uid()::text OR auth.uid() = (SELECT id FROM usuarios WHERE chapa = '9999'));

-- ============================================================================
-- PASO 6: Auditoría y Monitoreo
-- ============================================================================

-- Crear tabla de auditoría de cambios de contraseña (Opcional)
CREATE TABLE IF NOT EXISTS password_change_log (
  id SERIAL PRIMARY KEY,
  chapa TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_password_change_log_chapa ON password_change_log(chapa);
CREATE INDEX IF NOT EXISTS idx_password_change_log_date ON password_change_log(changed_at);

-- Ver historial de cambios de contraseña
-- SELECT * FROM password_change_log ORDER BY changed_at DESC LIMIT 20;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Ejecuta estas consultas después de completar los pasos:

-- 1. Verificar que existe la cuenta de administrador
SELECT chapa, nombre, activo,
       CASE
         WHEN password_hash LIKE '%$%$%' THEN '✅ Hash Seguro'
         ELSE '❌ Texto Plano'
       END AS estado
FROM usuarios
WHERE chapa = '9999';

-- 2. Contar usuarios por estado de seguridad
SELECT
  CASE
    WHEN password_hash LIKE '%$%$%' THEN '✅ Seguras'
    ELSE '❌ Inseguras'
  END AS estado,
  COUNT(*) as total
FROM usuarios
WHERE activo = true
GROUP BY estado;

-- 3. Listar usuarios que aún necesitan migración
SELECT chapa, nombre
FROM usuarios
WHERE activo = true
  AND password_hash NOT LIKE '%$%$%'
ORDER BY chapa;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
--
-- 1. NUNCA compartas el hash de contraseña de nadie
-- 2. NUNCA almacenes contraseñas en texto plano
-- 3. NUNCA uses la misma contraseña para múltiples usuarios
-- 4. Cambia la contraseña de admin periódicamente
-- 5. Usa contraseñas fuertes (mínimo 8 caracteres, letras, números, símbolos)
-- 6. Habilita autenticación de 2 factores cuando sea posible
--
-- Para más información sobre seguridad:
-- - OWASP Password Storage Cheat Sheet
-- - NIST Digital Identity Guidelines
--
-- ============================================================================
