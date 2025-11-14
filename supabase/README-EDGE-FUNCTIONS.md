<<<<<<< HEAD
# Edge Functions - Sincronización Automática

## 📋 Descripción

Este directorio contiene Edge Functions de Supabase para sincronización automática de datos desde CSV públicos y Google Sheets hacia la base de datos de Supabase.

## 🎯 Funcionalidad Principal

La Edge Function `sync-all-tables` sincroniza automáticamente:

1. **Jornales** - Desde CSV público de la empresa
2. **IRPF** - Desde Google Sheets privado (temporal)
3. **Primas Personalizadas** - Desde Google Sheets privado (temporal)
4. **Mensajes del Foro** - Desde Google Sheets privado (temporal)

## ⏰ Programación

- **Frecuencia**: Cada 3 minutos
- **Horario**: 07:00 - 16:00 (hora de España - Europe/Madrid)
- **Fuera de horario**: La función se ejecuta pero NO sincroniza (retorna mensaje informativo)

## 🚀 Despliegue

### Prerrequisitos

1. **Supabase CLI** instalado:
```bash
npm install -g supabase
```

2. **Cuenta de Supabase** y proyecto creado

### Pasos de Despliegue

#### 1. Login a Supabase
```bash
supabase login
```

#### 2. Vincular Proyecto (solo la primera vez)
```bash
supabase link --project-ref icszzxkdxatfytpmoviq
```

#### 3. Desplegar Edge Function
```bash
supabase functions deploy sync-all-tables
```

O usa el script automatizado:
```bash
./supabase/deploy-edge-function.sh
```

#### 4. Configurar Variables de Entorno

Ve al **Dashboard de Supabase**:
1. Settings > API
2. Copia el **service_role key** (secret)
3. Settings > Edge Functions > Secrets
4. Añade variable: `SUPABASE_SERVICE_ROLE_KEY` = [tu service_role key]

#### 5. Configurar Tabla mensajes_foro

Ejecuta en el **SQL Editor** del dashboard:
```bash
supabase/schema-mensajes-foro.sql
```

#### 6. Configurar Cron Job

Ejecuta en el **SQL Editor** del dashboard:
```bash
supabase/cron-config.sql
```

Esto creará un job que ejecuta la Edge Function cada 3 minutos entre 07:00-15:59.

## 📊 Monitoreo

### Ver Logs de la Edge Function

En el Dashboard de Supabase:
1. Edge Functions > sync-all-tables
2. Logs > Ver últimas ejecuciones
3. Buscar mensajes de éxito/error

### Ver Historial de Cron Jobs

Ejecuta en SQL Editor:
```sql
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;
```

### Ver Jobs Configurados

```sql
SELECT * FROM cron.job;
```

## 🔧 Gestión del Cron Job

### Pausar Sincronización Automática

```sql
SELECT cron.unschedule('sync-all-tables-auto');
```

### Reactivar Sincronización

```sql
SELECT cron.schedule(
  'sync-all-tables-auto',
  '*/3 7-15 * * *',
  $$
  SELECT net.http_post(
    url := 'https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/sync-all-tables',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb
  );
  $$
);
```

### Cambiar Frecuencia

Modifica el cron pattern (actualmente `*/3 7-15 * * *`):

- `*/3` = cada 3 minutos
- `*/5` = cada 5 minutos
- `*/1` = cada 1 minuto (no recomendado, puede saturar)
- `7-15` = entre las 07:00 y 15:59

Ejemplo para cada 5 minutos:
```sql
-- Primero eliminar el job actual
SELECT cron.unschedule('sync-all-tables-auto');

-- Crear nuevo job con nueva frecuencia
SELECT cron.schedule(
  'sync-all-tables-auto',
  '*/5 7-15 * * *',  -- Cada 5 minutos
  $$...$$ -- (mismo contenido)
);
```

## 📝 Fuentes de Datos

### CSV Públicos de la Empresa

| Tabla | URL | GID |
|-------|-----|-----|
| **Jornales** | 2PACX-1vSTtbkA94xqjf81lsR7bLKKtyES2YBDKs8J2T4UrSEan7e5Z_eaptShCA78R1wqUyYyASJxmHj3gDnY | 1388412839 |

### Google Sheets Privados (Temporales)

| Tabla | Sheet ID | GID |
|-------|----------|-----|
| **IRPF** | 1j-IaOHXoLEP4bK2hjdn2uAYy8a2chqiQSOw4Nfxoyxc | 988244680 |
| **Primas** | 1j-IaOHXoLEP4bK2hjdn2uAYy8a2chqiQSOw4Nfxoyxc | 1977235036 |
| **Foro** | 1j-IaOHXoLEP4bK2hjdn2uAYy8a2chqiQSOw4Nfxoyxc | 464918425 |

**Nota:** Las hojas privadas son temporales. Cuando se complete la migración, IRPF, Primas y Foro se gestionarán únicamente desde la PWA.

## 🛡️ Seguridad

- La Edge Function usa **service_role key** para tener permisos de escritura en todas las tablas
- **NO exponer** el service_role key en el código cliente (solo en variables de entorno de Supabase)
- La función NO requiere autenticación JWT (`verify_jwt = false`)
- Las tablas tienen RLS (Row Level Security) para lectura por usuarios

## 🔄 Sincronización

### Estrategia Anti-Duplicados

**Jornales:**
- Verifica existencia: `fecha + chapa + jornada`
- Si existe → SKIP
- Si NO existe → INSERT

**IRPF y Primas:**
- Usa `UPSERT` con `onConflict`
- Actualiza si existe, inserta si no

**Foro:**
- Verifica existencia: `timestamp + chapa`
- Si existe → SKIP
- Si NO existe → INSERT

### Reintentos

- **Máximo 3 intentos** por cada fetch de CSV
- **Backoff exponencial**: 2s, 4s, 8s
- Si todos fallan → Error pero NO crashea

## 📊 Respuesta de la API

### Éxito (200)
```json
{
  "exito": true,
  "timestamp": "2025-11-11T10:30:00.000Z",
  "resultados": [
    {
      "tabla": "jornales",
      "exito": true,
      "insertados": 45,
      "duplicados": 123,
      "errores": 0
    },
    {
      "tabla": "configuracion_usuario",
      "exito": true,
      "insertados": 12,
      "duplicados": 0,
      "errores": 0
    },
    ...
  ]
}
```

### Fuera de Horario (200)
```json
{
  "mensaje": "Fuera de horario laboral",
  "horario": "07:00-16:00 (Europa/Madrid)"
}
```

### Error (500)
```json
{
  "exito": false,
  "error": "Mensaje de error detallado"
}
```

## 🧪 Pruebas Manuales

### Ejecutar Edge Function Manualmente

```bash
curl -X POST https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/sync-all-tables \
  -H "Authorization: Bearer [TU_SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json"
```

### Ejecutar Localmente (Desarrollo)

```bash
# Iniciar Supabase local
supabase start

# Servir función localmente
supabase functions serve sync-all-tables

# Ejecutar en otra terminal
curl -X POST http://localhost:54321/functions/v1/sync-all-tables \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json"
```

## 📁 Estructura de Archivos

```
supabase/
├── functions/
│   └── sync-all-tables/
│       └── index.ts          # Edge Function principal
├── config.toml               # Configuración de Supabase
├── cron-config.sql           # SQL para configurar cron job
├── schema-mensajes-foro.sql  # Schema para tabla mensajes_foro
├── deploy-edge-function.sh   # Script de despliegue
└── README-EDGE-FUNCTIONS.md  # Esta documentación
```

## 🚨 Solución de Problemas

### La función no se ejecuta automáticamente

1. Verifica que el cron job esté activo:
```sql
SELECT * FROM cron.job WHERE jobname = 'sync-all-tables-auto';
```

2. Verifica el historial de ejecuciones:
```sql
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'sync-all-tables-auto')
ORDER BY start_time DESC
LIMIT 10;
```

3. Verifica los logs en el Dashboard

### La función retorna error 401

- Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada correctamente en Edge Functions > Secrets

### La función retorna error 500

- Revisa los logs en el Dashboard
- Verifica que las URLs de las hojas sean correctas
- Verifica que las tablas existan en Supabase

### No se insertan datos nuevos

- Verifica que el CSV/Sheet tenga datos nuevos
- Revisa los logs para ver mensajes de "duplicados"
- Verifica RLS policies en las tablas

## 🔮 Futuro (Post-Migración)

Cuando se complete la migración a Supabase:

1. **Eliminar** sincronización de IRPF, Primas y Foro desde Google Sheets
2. **Mantener** solo sincronización de Jornales desde CSV público
3. **Gestionar** IRPF, Primas y Foro directamente en la PWA

Para eliminar sincronizaciones innecesarias, edita `index.ts` y comenta/elimina:
- `sincronizarIRPF()`
- `sincronizarPrimas()`
- `sincronizarForo()`

## 📞 Soporte

Para dudas sobre Supabase Edge Functions:
- [Documentación oficial](https://supabase.com/docs/guides/functions)
- [Ejemplos de Edge Functions](https://github.com/supabase/supabase/tree/master/examples/edge-functions)
- [Cron Jobs en Supabase](https://supabase.com/docs/guides/database/extensions/pg_cron)
=======
# Edge Functions - Sincronización Automática

## 📋 Descripción

Este directorio contiene Edge Functions de Supabase para sincronización automática de datos desde CSV públicos y Google Sheets hacia la base de datos de Supabase.

## 🎯 Funcionalidad Principal

La Edge Function `sync-all-tables` sincroniza automáticamente:

1. **Jornales** - Desde CSV público de la empresa
2. **IRPF** - Desde Google Sheets privado (temporal)
3. **Primas Personalizadas** - Desde Google Sheets privado (temporal)
4. **Mensajes del Foro** - Desde Google Sheets privado (temporal)

## ⏰ Programación

- **Frecuencia**: Cada 3 minutos
- **Horario**: 07:00 - 16:00 (hora de España - Europe/Madrid)
- **Fuera de horario**: La función se ejecuta pero NO sincroniza (retorna mensaje informativo)

## 🚀 Despliegue

### Prerrequisitos

1. **Supabase CLI** instalado:
```bash
npm install -g supabase
```

2. **Cuenta de Supabase** y proyecto creado

### Pasos de Despliegue

#### 1. Login a Supabase
```bash
supabase login
```

#### 2. Vincular Proyecto (solo la primera vez)
```bash
supabase link --project-ref icszzxkdxatfytpmoviq
```

#### 3. Desplegar Edge Function
```bash
supabase functions deploy sync-all-tables
```

O usa el script automatizado:
```bash
./supabase/deploy-edge-function.sh
```

#### 4. Configurar Variables de Entorno

Ve al **Dashboard de Supabase**:
1. Settings > API
2. Copia el **service_role key** (secret)
3. Settings > Edge Functions > Secrets
4. Añade variable: `SUPABASE_SERVICE_ROLE_KEY` = [tu service_role key]

#### 5. Configurar Tabla mensajes_foro

Ejecuta en el **SQL Editor** del dashboard:
```bash
supabase/schema-mensajes-foro.sql
```

#### 6. Configurar Cron Job

Ejecuta en el **SQL Editor** del dashboard:
```bash
supabase/cron-config.sql
```

Esto creará un job que ejecuta la Edge Function cada 3 minutos entre 07:00-15:59.

## 📊 Monitoreo

### Ver Logs de la Edge Function

En el Dashboard de Supabase:
1. Edge Functions > sync-all-tables
2. Logs > Ver últimas ejecuciones
3. Buscar mensajes de éxito/error

### Ver Historial de Cron Jobs

Ejecuta en SQL Editor:
```sql
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;
```

### Ver Jobs Configurados

```sql
SELECT * FROM cron.job;
```

## 🔧 Gestión del Cron Job

### Pausar Sincronización Automática

```sql
SELECT cron.unschedule('sync-all-tables-auto');
```

### Reactivar Sincronización

```sql
SELECT cron.schedule(
  'sync-all-tables-auto',
  '*/3 7-15 * * *',
  $$
  SELECT net.http_post(
    url := 'https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/sync-all-tables',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}'::jsonb
  );
  $$
);
```

### Cambiar Frecuencia

Modifica el cron pattern (actualmente `*/3 7-15 * * *`):

- `*/3` = cada 3 minutos
- `*/5` = cada 5 minutos
- `*/1` = cada 1 minuto (no recomendado, puede saturar)
- `7-15` = entre las 07:00 y 15:59

Ejemplo para cada 5 minutos:
```sql
-- Primero eliminar el job actual
SELECT cron.unschedule('sync-all-tables-auto');

-- Crear nuevo job con nueva frecuencia
SELECT cron.schedule(
  'sync-all-tables-auto',
  '*/5 7-15 * * *',  -- Cada 5 minutos
  $$...$$ -- (mismo contenido)
);
```

## 📝 Fuentes de Datos

### CSV Públicos de la Empresa

| Tabla | URL | GID |
|-------|-----|-----|
| **Jornales** | 2PACX-1vSTtbkA94xqjf81lsR7bLKKtyES2YBDKs8J2T4UrSEan7e5Z_eaptShCA78R1wqUyYyASJxmHj3gDnY | 1388412839 |

### Google Sheets Privados (Temporales)

| Tabla | Sheet ID | GID |
|-------|----------|-----|
| **IRPF** | 1j-IaOHXoLEP4bK2hjdn2uAYy8a2chqiQSOw4Nfxoyxc | 988244680 |
| **Primas** | 1j-IaOHXoLEP4bK2hjdn2uAYy8a2chqiQSOw4Nfxoyxc | 1977235036 |
| **Foro** | 1j-IaOHXoLEP4bK2hjdn2uAYy8a2chqiQSOw4Nfxoyxc | 464918425 |

**Nota:** Las hojas privadas son temporales. Cuando se complete la migración, IRPF, Primas y Foro se gestionarán únicamente desde la PWA.

## 🛡️ Seguridad

- La Edge Function usa **service_role key** para tener permisos de escritura en todas las tablas
- **NO exponer** el service_role key en el código cliente (solo en variables de entorno de Supabase)
- La función NO requiere autenticación JWT (`verify_jwt = false`)
- Las tablas tienen RLS (Row Level Security) para lectura por usuarios

## 🔄 Sincronización

### Estrategia Anti-Duplicados

**Jornales:**
- Verifica existencia: `fecha + chapa + jornada`
- Si existe → SKIP
- Si NO existe → INSERT

**IRPF y Primas:**
- Usa `UPSERT` con `onConflict`
- Actualiza si existe, inserta si no

**Foro:**
- Verifica existencia: `timestamp + chapa`
- Si existe → SKIP
- Si NO existe → INSERT

### Reintentos

- **Máximo 3 intentos** por cada fetch de CSV
- **Backoff exponencial**: 2s, 4s, 8s
- Si todos fallan → Error pero NO crashea

## 📊 Respuesta de la API

### Éxito (200)
```json
{
  "exito": true,
  "timestamp": "2025-11-11T10:30:00.000Z",
  "resultados": [
    {
      "tabla": "jornales",
      "exito": true,
      "insertados": 45,
      "duplicados": 123,
      "errores": 0
    },
    {
      "tabla": "configuracion_usuario",
      "exito": true,
      "insertados": 12,
      "duplicados": 0,
      "errores": 0
    },
    ...
  ]
}
```

### Fuera de Horario (200)
```json
{
  "mensaje": "Fuera de horario laboral",
  "horario": "07:00-16:00 (Europa/Madrid)"
}
```

### Error (500)
```json
{
  "exito": false,
  "error": "Mensaje de error detallado"
}
```

## 🧪 Pruebas Manuales

### Ejecutar Edge Function Manualmente

```bash
curl -X POST https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/sync-all-tables \
  -H "Authorization: Bearer [TU_SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json"
```

### Ejecutar Localmente (Desarrollo)

```bash
# Iniciar Supabase local
supabase start

# Servir función localmente
supabase functions serve sync-all-tables

# Ejecutar en otra terminal
curl -X POST http://localhost:54321/functions/v1/sync-all-tables \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json"
```

## 📁 Estructura de Archivos

```
supabase/
├── functions/
│   └── sync-all-tables/
│       └── index.ts          # Edge Function principal
├── config.toml               # Configuración de Supabase
├── cron-config.sql           # SQL para configurar cron job
├── schema-mensajes-foro.sql  # Schema para tabla mensajes_foro
├── deploy-edge-function.sh   # Script de despliegue
└── README-EDGE-FUNCTIONS.md  # Esta documentación
```

## 🚨 Solución de Problemas

### La función no se ejecuta automáticamente

1. Verifica que el cron job esté activo:
```sql
SELECT * FROM cron.job WHERE jobname = 'sync-all-tables-auto';
```

2. Verifica el historial de ejecuciones:
```sql
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'sync-all-tables-auto')
ORDER BY start_time DESC
LIMIT 10;
```

3. Verifica los logs en el Dashboard

### La función retorna error 401

- Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada correctamente en Edge Functions > Secrets

### La función retorna error 500

- Revisa los logs en el Dashboard
- Verifica que las URLs de las hojas sean correctas
- Verifica que las tablas existan en Supabase

### No se insertan datos nuevos

- Verifica que el CSV/Sheet tenga datos nuevos
- Revisa los logs para ver mensajes de "duplicados"
- Verifica RLS policies en las tablas

## 🔮 Futuro (Post-Migración)

Cuando se complete la migración a Supabase:

1. **Eliminar** sincronización de IRPF, Primas y Foro desde Google Sheets
2. **Mantener** solo sincronización de Jornales desde CSV público
3. **Gestionar** IRPF, Primas y Foro directamente en la PWA

Para eliminar sincronizaciones innecesarias, edita `index.ts` y comenta/elimina:
- `sincronizarIRPF()`
- `sincronizarPrimas()`
- `sincronizarForo()`

## 📞 Soporte

Para dudas sobre Supabase Edge Functions:
- [Documentación oficial](https://supabase.com/docs/guides/functions)
- [Ejemplos de Edge Functions](https://github.com/supabase/supabase/tree/master/examples/edge-functions)
- [Cron Jobs en Supabase](https://supabase.com/docs/guides/database/extensions/pg_cron)
>>>>>>> ec0b337 (Initial local commit after zip download, including push notifications setup)
