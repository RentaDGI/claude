-- ============================================================================
-- PORTAL ESTIBA VLC - ESQUEMA DE BASE DE DATOS SUPABASE
-- ============================================================================
-- Este script crea todas las tablas necesarias para migrar desde Google Sheets
-- Ejecutar en: Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. TABLA DE USUARIOS
-- ============================================================================
-- Almacena información de usuarios y configuración personal
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  chapa VARCHAR(10) UNIQUE NOT NULL,
  nombre VARCHAR(100),
  email VARCHAR(255),
  password_hash VARCHAR(255), -- Hash bcrypt (temporal, luego usaremos Supabase Auth)
  posicion VARCHAR(50),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice para búsquedas rápidas por chapa
CREATE INDEX idx_usuarios_chapa ON usuarios(chapa);

-- ============================================================================
-- 2. CONFIGURACIÓN DE USUARIO (IRPF)
-- ============================================================================
CREATE TABLE IF NOT EXISTS configuracion_usuario (
  id BIGSERIAL PRIMARY KEY,
  chapa VARCHAR(10) NOT NULL,
  irpf DECIMAL(5,2) DEFAULT 2.00, -- Porcentaje de IRPF (ej: 2.00%)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(chapa)
);

CREATE INDEX idx_config_usuario_chapa ON configuracion_usuario(chapa);

-- ============================================================================
-- 3. JORNALES (HISTÓRICO COMPLETO)
-- ============================================================================
-- Tabla principal: almacena TODOS los jornales históricos sin límite
CREATE TABLE IF NOT EXISTS jornales (
  id BIGSERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  chapa VARCHAR(10) NOT NULL,
  puesto VARCHAR(50),
  jornada VARCHAR(20), -- 'completa', 'media', etc.
  empresa VARCHAR(100),
  buque VARCHAR(100),
  parte VARCHAR(50),
  turno VARCHAR(20),

  -- Campos calculados de salario (opcional, pueden calcularse en el cliente)
  base_sueldo DECIMAL(10,2),
  primas DECIMAL(10,2),
  total_bruto DECIMAL(10,2),

  -- Metadatos
  origen VARCHAR(20) DEFAULT 'importacion', -- 'importacion', 'manual', 'apps_script'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices críticos para rendimiento
CREATE INDEX idx_jornales_chapa_fecha ON jornales(chapa, fecha DESC);
CREATE INDEX idx_jornales_fecha ON jornales(fecha DESC);
CREATE INDEX idx_jornales_empresa ON jornales(empresa);

-- ============================================================================
-- 4. CONTRATACIONES (TABLA DIARIA)
-- ============================================================================
-- Tabla de contratación: asignaciones diarias
CREATE TABLE IF NOT EXISTS contrataciones (
  id BIGSERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  turno VARCHAR(20), -- 'mañana', 'tarde', 'noche'
  slot INTEGER, -- Número de slot (1, 2, 3...)
  chapa VARCHAR(10),
  puesto VARCHAR(50),
  empresa VARCHAR(100),
  estado VARCHAR(50), -- 'confirmado', 'pendiente', etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Evitar duplicados para la misma fecha/turno/slot
  UNIQUE(fecha, turno, slot)
);

CREATE INDEX idx_contrataciones_fecha ON contrataciones(fecha DESC);
CREATE INDEX idx_contrataciones_chapa ON contrataciones(chapa);

-- ============================================================================
-- 5. PUERTAS (POSICIONES EN COLA)
-- ============================================================================
-- Almacena las posiciones en cola para SP y OC por turno
CREATE TABLE IF NOT EXISTS puertas (
  id BIGSERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  turno VARCHAR(20), -- 'mañana', 'tarde', 'noche'
  tipo VARCHAR(10), -- 'SP', 'OC'
  posicion INTEGER,
  chapa VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),

  -- Una chapa por tipo/turno/fecha
  UNIQUE(fecha, turno, tipo, chapa)
);

CREATE INDEX idx_puertas_fecha ON puertas(fecha DESC);
CREATE INDEX idx_puertas_chapa ON puertas(chapa);

-- ============================================================================
-- 6. CENSO (DISPONIBILIDAD DIARIA)
-- ============================================================================
-- Estado de disponibilidad de cada trabajador
CREATE TABLE IF NOT EXISTS censo (
  id BIGSERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  posicion INTEGER, -- Posición en el censo
  chapa VARCHAR(10),
  color VARCHAR(20), -- 'green' (disponible), 'red' (no disponible), 'yellow', etc.
  estado VARCHAR(100), -- Texto descriptivo del estado
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Una posición única por fecha
  UNIQUE(fecha, posicion)
);

CREATE INDEX idx_censo_fecha ON censo(fecha DESC);
CREATE INDEX idx_censo_chapa ON censo(chapa);
CREATE INDEX idx_censo_color ON censo(color);

-- ============================================================================
-- 7. PRIMAS PERSONALIZADAS
-- ============================================================================
-- Primas adicionales por trabajador y fecha
CREATE TABLE IF NOT EXISTS primas_personalizadas (
  id BIGSERIAL PRIMARY KEY,
  chapa VARCHAR(10) NOT NULL,
  fecha DATE NOT NULL,
  concepto VARCHAR(50) NOT NULL, -- 'prima', 'movimientos', 'relevo', 'remate'
  cantidad DECIMAL(10,2) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Una prima por concepto/chapa/fecha
  UNIQUE(chapa, fecha, concepto)
);

CREATE INDEX idx_primas_chapa_fecha ON primas_personalizadas(chapa, fecha DESC);

-- ============================================================================
-- 8. MENSAJES DEL FORO
-- ============================================================================
CREATE TABLE IF NOT EXISTS mensajes_foro (
  id BIGSERIAL PRIMARY KEY,
  chapa VARCHAR(10) NOT NULL,
  texto TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  editado BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para ordenar por fecha (más recientes primero)
CREATE INDEX idx_foro_timestamp ON mensajes_foro(timestamp DESC);

-- ============================================================================
-- 9. MAPEO DE PUESTOS (Para cálculo de salarios)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mapeo_puestos (
  id BIGSERIAL PRIMARY KEY,
  puesto_original VARCHAR(100) NOT NULL UNIQUE,
  puesto_normalizado VARCHAR(100) NOT NULL,
  categoria VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 10. TABLA DE SALARIOS (Base de cálculo)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tabla_salarios (
  id BIGSERIAL PRIMARY KEY,
  puesto VARCHAR(100) NOT NULL,
  jornada VARCHAR(20) NOT NULL, -- 'completa', 'media'
  salario_base DECIMAL(10,2) NOT NULL,
  plus_nocturnidad DECIMAL(10,2),
  plus_festivo DECIMAL(10,2),

  -- Vigencia del salario
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,

  created_at TIMESTAMP DEFAULT NOW(),

  -- Evitar duplicados
  UNIQUE(puesto, jornada, fecha_inicio)
);

CREATE INDEX idx_salarios_puesto ON tabla_salarios(puesto);
CREATE INDEX idx_salarios_vigencia ON tabla_salarios(fecha_inicio, fecha_fin);

-- ============================================================================
-- 11. JORNALES MANUALES (Jornales añadidos manualmente)
-- ============================================================================
-- Para distinguir jornales que se añaden manualmente vs importados
CREATE TABLE IF NOT EXISTS jornales_manuales (
  id BIGSERIAL PRIMARY KEY,
  chapa VARCHAR(10) NOT NULL,
  fecha DATE NOT NULL,
  puesto VARCHAR(50),
  jornada VARCHAR(20),
  empresa VARCHAR(100),
  buque VARCHAR(100),
  parte VARCHAR(50),
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(10) -- Chapa de quien lo creó
);

CREATE INDEX idx_jornales_manuales_chapa ON jornales_manuales(chapa, fecha DESC);

-- ============================================================================
-- TRIGGERS PARA UPDATED_AT AUTOMÁTICO
-- ============================================================================

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a tablas relevantes
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_usuario_updated_at BEFORE UPDATE ON configuracion_usuario
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jornales_updated_at BEFORE UPDATE ON jornales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_primas_updated_at BEFORE UPDATE ON primas_personalizadas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security - RLS)
-- ============================================================================
-- Por ahora deshabilitado para simplificar la migración inicial
-- Se activará después con Supabase Auth

-- ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE jornales ENABLE ROW LEVEL SECURITY;
-- etc.

-- ============================================================================
-- COMENTARIOS EN TABLAS
-- ============================================================================

COMMENT ON TABLE usuarios IS 'Usuarios del sistema con credenciales y configuración básica';
COMMENT ON TABLE jornales IS 'Histórico completo de jornales - tabla principal del sistema';
COMMENT ON TABLE contrataciones IS 'Asignaciones diarias de contratación';
COMMENT ON TABLE puertas IS 'Posiciones en cola (SP/OC) por turno';
COMMENT ON TABLE censo IS 'Estado de disponibilidad diaria de trabajadores';
COMMENT ON TABLE primas_personalizadas IS 'Primas adicionales personalizadas por trabajador';
COMMENT ON TABLE mensajes_foro IS 'Mensajes del foro de comunicación';
COMMENT ON TABLE mapeo_puestos IS 'Mapeo de nombres de puestos para normalización';
COMMENT ON TABLE tabla_salarios IS 'Tabla de salarios base por puesto y jornada';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

-- Para verificar que todo se creó correctamente:
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
