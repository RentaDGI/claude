-- Schema para tabla mensajes_foro
-- Almacena mensajes del foro sincronizados desde Google Sheets

CREATE TABLE IF NOT EXISTS mensajes_foro (
  id SERIAL PRIMARY KEY,
  timestamp TEXT NOT NULL,
  chapa TEXT NOT NULL,
  texto TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(timestamp, chapa)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_mensajes_foro_chapa ON mensajes_foro(chapa);
CREATE INDEX IF NOT EXISTS idx_mensajes_foro_timestamp ON mensajes_foro(timestamp);

-- Habilitar RLS (Row Level Security)
ALTER TABLE mensajes_foro ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden leer todos los mensajes
CREATE POLICY "Todos pueden leer mensajes del foro"
  ON mensajes_foro
  FOR SELECT
  USING (true);

-- Política: Solo usuarios autenticados pueden insertar mensajes
CREATE POLICY "Usuarios autenticados pueden insertar mensajes"
  ON mensajes_foro
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Comentarios
COMMENT ON TABLE mensajes_foro IS 'Mensajes del foro sincronizados desde Google Sheets';
COMMENT ON COLUMN mensajes_foro.timestamp IS 'Timestamp del mensaje en formato de Google Sheets';
COMMENT ON COLUMN mensajes_foro.chapa IS 'Chapa del usuario que escribió el mensaje';
COMMENT ON COLUMN mensajes_foro.texto IS 'Contenido del mensaje';
