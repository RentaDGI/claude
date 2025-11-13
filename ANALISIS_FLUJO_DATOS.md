# ANÁLISIS COMPLETO DEL FLUJO DE DATOS - Portal Estiba VLC

## RESUMEN GENERAL

La aplicación utiliza una arquitectura híbrida:
- **Backend**: Supabase (PostgreSQL) + Google Sheets CSV
- **Frontend**: JavaScript vanilla + localStorage para caché
- **Sincronización**: Bidireccional (CSV ↔ Supabase)
- **Caché**: 5 minutos (localStorage con timestamp)

---

## 1. DASHBOARD

### Datos que se cargan:
- Bienvenida con nombre del usuario
- Posiciones hasta contratación (laborable y festiva)
- Información de posición en censo

### Flujo de datos:

```
Login → updateUIForAuthenticatedUser()
   ↓
getPosicionesHastaContratacion(chapa)
   ↓
1. getPosicionChapa(chapa) → getCenso() → tabla 'censo' en Supabase
2. getPuertas() → CSV público de puertas
3. detectarUltimaJornadaContratada() → calcula última jornada
4. contarRojosEntre() → filtra censo por color 'rojo'
5. Retorna { laborable: X, festiva: Y }
```

### Función principal:
- `updateUIForAuthenticatedUser()` (app.js:543)

### Función de API:
- `getPosicionesHastaContratacion(chapa)` (supabase.js:1495)
- `getPosicionChapa(chapa)` (supabase.js:1450)
- `detectarUltimaJornadaContratada(puertas, esSP)` (supabase.js:1464)

### Origen de datos:
- **Tabla Supabase**: `censo` (posiciones de trabajadores)
- **CSV público**: Puertas del día (Google Sheets)
- **localStorage**: Nombres de usuario (`usuarios_cache`)

### Transformaciones:
1. Mapeo de colores numéricos a nombres: 0→'red', 1→'orange', 2→'yellow', 3→'blue', 4→'green'
2. Cálculo circular de posiciones (SP: 1-449, OC: 450-535)
3. Descuento de trabajadores en rojo (no disponibles)

### Sistema de caché:
- `supabase_censo_actual` (5 min)
- `usuarios_cache` (localStorage permanente)

### Sincronización:
- Manual: Solo al hacer login
- CSV de puertas se lee en tiempo real (sin caché)

---

## 2. CONTRATACIÓN (Mi Contratación / Mis Asignaciones)

### Datos que se cargan:
- Jornales de hoy, mañana y pasado mañana
- Puesto, empresa, jornada, fecha
- Logos de empresas

### Flujo de datos:

```
loadContratacion()
   ↓
getJornalesHistoricoAcumulado(chapa)
   ↓
getJornales(chapa) → tabla 'jornales' en Supabase
   ↓
1. Filtra por fechas (hoy, mañana, pasado mañana)
2. Normaliza formato de jornada
3. Ordena por fecha y jornada
4. Mapea logos de empresas
5. Renderiza tarjetas con diseño bonito
```

### Función principal:
- `loadContratacion()` (app.js:906)

### Función de API:
- `getJornalesHistoricoAcumulado(chapa)` (supabase.js:1629)
- `getJornales(chapa)` (supabase.js:857)

### Origen de datos:
- **Tabla Supabase**: `jornales` (chapa, fecha, jornada, puesto, empresa, buque, parte, origen)
- **localStorage**: `supabase_jornales_${chapa}_*` (caché de jornales)

### Transformaciones:
1. Conversión de fecha ISO (yyyy-mm-dd) a español (dd/mm/yyyy)
2. Normalización de jornada: "02 a 08" → "02-08"
3. Filtrado por fecha con Date JS
4. Ordenamiento por fecha descendente y jornada (02-08 < 08-14 < 14-20 < 20-02)

### Sistema de caché:
- `supabase_jornales_${chapa}_*` (5 min) - por chapa, fechas y límite
- Fallback a `jornales_historico` en localStorage

### Sincronización:
- Manual: Se realiza al cargar la página
- CSV → Supabase cada vez que se abre la pestaña
- Acumulativo: No sobreescribe, agrega evitando duplicados

### Mapeo de empresas:
```javascript
APM: https://i.imgur.com/HgQ95qc.jpeg
CSP: https://i.imgur.com/8Tjx3KP.jpeg
VTEU: https://i.imgur.com/3nNCkw5.jpeg
... (otros logos en app.js:1002)
```

---

## 3. MIS JORNALES (Histórico agrupado por quincenas)

### Datos que se cargan:
- Todos los jornales del usuario (histórico completo)
- Agrupados por quincenas (1-15 y 16-31 de cada mes)
- Estadísticas: total jornales, bruto, neto

### Flujo de datos:

```
loadJornales() (primera llamada con control anti-duplicado)
   ↓
1. syncJornalesFromCSV() → CSV público de jornales
   ↓
   Despivotea CSV:
   - Lee CSV pivotado (filas = fechas, columnas = puestos)
   - Genera jornal por cada chapa+fecha+puesto
   - Valida fechas (formato dd/mm/yyyy)
   - Valida jornadas (02-08, 08-14, 14-20, 20-02, festivo)
   ↓
2. getJornalesHistoricoAcumulado(chapa) → Supabase
   ↓
3. Agrupa por quincena
4. Calcula estadísticas
5. Renderiza tabla por quincena
6. Fallback a localStorage si Supabase falla
```

### Función principal:
- `loadJornales()` (app.js:1160)

### Función de API:
- `syncJornalesFromCSV()` (supabase.js:206) - Sincronización
- `getJornalesHistoricoAcumulado(chapa)` (supabase.js:1629)
- `getJornales(chapa)` (supabase.js:857)

### Origen de datos:
- **CSV público**: `https://docs.google.com/spreadsheets/d/e/2PACX-1vSTtbkA94xqjf81lsR7bLKKtyES2YBDKs8J2T4UrSEan7e5Z_eaptShCA78R1wqUyYyASJxmHj3gDnY/pub?gid=1388412839&single=true&output=csv`
- **Tabla Supabase**: `jornales` (campos: id, fecha, chapa, jornada, puesto, empresa, buque, parte, origen)
- **localStorage**: `jornales_historico` (fallback)

### Transformaciones:
1. **Despivoteo de CSV**:
   - Lectura UTF-8 del CSV con ArrayBuffer
   - Mapeo de códigos de puesto: T→Trincador, TC→Trincador de Coches, C1→Conductor 1a, B→Conductor 2a, E→Especialista
   - Validación de formato: fechas dd/mm/yyyy, jornadas XX-XX
   - Generación de registro por cada chapa en puesto

2. **Conversión de fechas**: ISO (yyyy-mm-dd) ↔ Español (dd/mm/yyyy)

3. **Agrupación por quincena**:
   ```javascript
   Quincena 1: 01-15
   Quincena 2: 16-31 (o último día del mes)
   ```

4. **Deduplicación**: 
   - En sincronización: Si existe jornal con misma (chapa, fecha, jornada), no inserta
   - En origen: Marca con campo `origen` (csv, manual, otro)

### Sistema de caché:
- `supabase_jornales_${chapa}_*` (5 min)
- `jornales_historico` (localStorage, sin expiración)
- Limpieza automática: Elimina jornales de años anteriores

### Sincronización:
- **Automática**: Al cargar la pestaña de "Mis Jornales"
- **CSV → Supabase**: 
  - No sobreescribe registros existentes
  - Acumula nuevos registros
  - Valida que no sean encabezados duplicados
- **Frecuencia**: Cada carga de la pestaña (manual trigger)
- **Fallback**: Si CSV falla, usa Supabase existente
- **Origen**: Marca cada jornal con `origen: 'csv'` o `origen: 'manual'`

---

## 4. SUELDÓMETRO (Cálculo de salario estimado)

### Datos que se cargan:
- Jornales del usuario (CSV y manuales)
- Mapeo de puestos (código → salario base)
- Tabla de salarios (por jornada y puesto)
- Primas personalizadas (si existen)
- Configuración de IRPF del usuario

### Flujo de datos:

```
loadSueldometro()
   ↓
1. Limpiar caché de jornales, primas, mapeo_puestos, tabla_salarios
   ↓
2. syncPrimasPersonalizadasFromCSV(primasURL)
   ↓
   CSV de primas: https://docs.google.com/spreadsheets/d/1j-IaOHXoLEP4bK2hjdn2uAYy8a2chqiQSOw4Nfxoyxc/export?format=csv&gid=1977235036
   - Parsea CSV de primas (chapa, fecha, jornada, prima_personalizada, movimientos)
   - Deduplica por (chapa, fecha, jornada) - mantiene el último del CSV
   ↓
3. Promise.all([
     getJornalesHistoricoAcumulado(chapa),
     getMapeoPuestos(),
     getTablaSalarial()
   ])
   ↓
4. Cálculo de salario:
   - Por cada jornal:
     a. Busca puesto en mapeo_puestos → salario_base
     b. Busca jornada en tabla_salarios → multiplicador
     c. Calcula: base = salario_base * multiplicador
     d. Busca prima personalizada o usa prima por defecto
     e. Calcula bruto = base + prima
     f. IRPF = bruto * porcentaje_irpf
     g. Neto = bruto - IRPF
   ↓
5. Agrupa por quincena
6. Renderiza tabla editable con:
   - Bloqueo de IRPF opcional
   - Edición de primas y movimientos
   - Estadísticas por quincena
```

### Función principal:
- `loadSueldometro()` (app.js:2525)

### Funciones de API:
- `getJornalesHistoricoAcumulado(chapa)` (supabase.js:1629)
- `getMapeoPuestos()` (supabase.js:1161)
- `getTablaSalarial()` (supabase.js:1186)
- `syncPrimasPersonalizadasFromCSV(primasURL)` (supabase.js:497)
- `getPrimasPersonalizadas(chapa)` (supabase.js:1074)
- `getUserConfig(chapa)` (supabase.js:1030)

### Origen de datos:
- **Tabla Supabase**: 
  - `jornales` (jornales del usuario)
  - `mapeo_puestos` (puesto → salario_base)
  - `tabla_salarios` (jornada → multiplicador)
  - `primas_personalizadas` (primas custom por usuario)
  - `configuracion_usuario` (irpf_porcentaje)
  
- **CSV públicos**:
  - Primas personalizadas: https://docs.google.com/spreadsheets/d/1j-IaOHXoLEP4bK2hjdn2uAYy8a2chqiQSOw4Nfxoyxc/export?format=csv&gid=1977235036

- **localStorage**:
  - `irpf_${chapa}` (IRPF guardado del usuario)
  - `irpf_locked_${chapa}` (flag de bloqueo de IRPF)
  - `lockedValuesKey` (valores editados bloqueados en tabla)

### Transformaciones:
1. **Cálculo de prima**: 
   - Si hay prima personalizada para (chapa, fecha, jornada): usa esa
   - Si no: calcula prima por defecto según tabla_salarios
   
2. **Complementos de puesto**:
   - Trincador y Trincador de Coches: +46,94€ adicionales

3. **Cálculo de IRPF**:
   - IRPF por defecto: 15% (o valor guardado del usuario)
   - IRPF = bruto * (porcentaje / 100)
   - El usuario puede bloquear/desbloquear el IRPF con candado

4. **Agrupación por quincena**: Misma lógica que Mis Jornales

5. **Deduplicación de primas**: Si hay duplicados en CSV (mismo chapa+fecha+jornada), mantiene el último

### Sistema de caché:
- `supabase_jornales_${chapa}_*` (5 min)
- `supabase_primas_${chapa}_*` (5 min)
- `supabase_mapeo_puestos` (5 min)
- `supabase_tabla_salarios` (5 min)
- `supabase_config_${chapa}` (5 min)
- **localStorage**:
  - `irpf_${chapa}` (permanente)
  - `irpf_locked_${chapa}` (permanente)
  - `lockedValuesKey` (permanente)

### Sincronización:
- **CSV de primas → Supabase**: Automática al cargar Sueldómetro
- **IRPF**: 
  - Lectura: Supabase → localStorage (fallback)
  - Escritura: Solo en localStorage (edición en tiempo real)
- **Caché**: Se limpia al cargar Sueldómetro para asegurar datos frescos

---

## 5. PUERTAS (Posiciones en cola por jornada)

### Datos que se cargan:
- Número de puerta para SP (Servicio Público)
- Número de puerta para OC (Operaciones Complementarias)
- Separadas por jornadas laborables y festivas

### Flujo de datos:

```
loadPuertas()
   ↓
getPuertas()
   ↓
1. Fetch CSV público de puertas (sin caché, cache: no-store)
2. Parseo del CSV:
   - Lee UTF-8 con ArrayBuffer
   - Busca fecha en primeras 5 líneas
   - Identifica columnas: Jornada, Puerta SP, Puerta OC
   - Filtra líneas con "No se admiten" o "!!"
3. Agrupa por jornada ordenada: 02-08, 08-14, 14-20, 20-02, Festivo
4. Devuelve { fecha, puertas: [{jornada, puertaSP, puertaOC}] }
5. Renderiza tabla separada para laborables y festivas
```

### Función principal:
- `loadPuertas()` (app.js:1674)

### Función de API:
- `getPuertas()` (supabase.js:707)

### Origen de datos:
- **CSV público**: `https://docs.google.com/spreadsheets/d/e/2PACX-1vQrQ5bGZDNShEWi1lwx_l1EvOxC0si5kbN8GBxj34rF0FkyGVk6IZOiGk5D91_TZXBHO1mchydFvvUl/pub?gid=3770623&single=true&output=csv`
- **Nota**: Los datos de puertas NO están en Supabase, solo en CSV (tabla puertas no existe aún)

### Transformaciones:
1. **Parseo de CSV**: Lectura UTF-8, split por líneas, split por comas
2. **Extracción de fecha**: Formato dd/mm/yyyy → dd/mm/yyyy (normaliza 2 dígitos a 4 dígitos de año)
3. **Identificación de columnas**: Busca índices de "Jornada", "Puerta SP", "Puerta OC"
4. **Filtrado**: Elimina líneas de error ("No se admiten", "!!")
5. **Agrupación**: Por jornada en orden específico
6. **Primeros valores**: Para cada jornada, toma el primer valor válido de cada puerta

### Sistema de caché:
- **NO usa caché** - Se lee directo del CSV en tiempo real
- Configuración: `cache: 'no-store'` en fetch

### Sincronización:
- Manual: Solo cuando el usuario abre la pestaña de Puertas
- Sin sincronización bidireccional (CSV → Supabase)
- Lectura en tiempo real del CSV

---

## 6. CENSO (Disponibilidad de trabajadores)

### Datos que se cargan:
- Lista de trabajadores
- Posición en censo (1-535)
- Color de disponibilidad (rojo, naranja, amarillo, azul, verde)
- Estadísticas por color

### Flujo de datos:

```
loadCenso()
   ↓
1. syncCensoFromCSV() → CSV público de censo
   ↓
   Parsea CSV:
   - Lee columnas: chapa, posicion, color
   - Valida que chapa sea número
   - Mapea colores numéricos a nombres (0→red, 1→orange, etc.)
   - Inserta/actualiza en tabla 'censo'
   ↓
2. getCenso() → Supabase tabla 'censo'
   ↓
3. Mapea colores numéricos a nombres
4. Calcula estadísticas por color
5. Renderiza:
   - Cards de estadísticas (count y %)
   - Tabla completa con chapa y color
   - Ordenada por posición
```

### Función principal:
- `loadCenso()` (app.js:1833)

### Funciones de API:
- `syncCensoFromCSV()` (supabase.js:385)
- `getCenso(fecha)` (supabase.js:145)

### Origen de datos:
- **CSV público**: `https://docs.google.com/spreadsheets/d/e/2PACX-1vTrMuapybwZUEGPR1vsP9p1_nlWvznyl0sPD4xWsNJ7HdXCj1ABY1EpU1um538HHZQyJtoAe5Niwrxq/pub?gid=841547354&single=true&output=csv`
- **Tabla Supabase**: `censo` (chapa, posicion, color, fecha)
- **localStorage**: `supabase_censo_actual` (caché)

### Transformaciones:
1. **Parseo de CSV**: UTF-8, split líneas, identificación de columnas
2. **Mapeo de colores**:
   ```javascript
   0 → 'red'     (Sin información / No disponible)
   1 → 'orange'  (1 jornada)
   2 → 'yellow'  (2 jornadas)
   3 → 'blue'    (3 jornadas)
   4 → 'green'   (Disponible)
   ```
3. **Validación**: Chapa es número positivo
4. **Deduplicación**: UPSERT por (chapa, fecha) - actualiza si existe

5. **Estadísticas**: Cuenta por color y calcula porcentaje

### Sistema de caché:
- `supabase_censo_actual` (5 min)
- Caché por fecha si se especifica: `supabase_censo_${fecha}`

### Sincronización:
- **Automática**: Al cargar la pestaña de Censo
- **CSV → Supabase**:
  - UPSERT: Actualiza si existe, inserta si no
  - Por defecto usa fecha de hoy (o la actual)
- **Frecuencia**: Manual trigger al abrir pestaña

---

## 7. FORO (Mensajería entre trabajadores)

### Datos que se cargan:
- Mensajes del foro (últimos 50)
- Nombre del remitente (desde censo)
- Timestamp de cada mensaje
- Caché de nombres de usuario

### Flujo de datos:

```
loadForo()
   ↓
1. actualizarCacheNombres()
   → getUsuarios() → Supabase tabla 'usuarios'
   → Construye cache: { chapa: nombre }
   → Guarda en localStorage 'usuarios_cache'
   ↓
2. getForoMensajes() → Supabase tabla 'mensajes_foro'
   ↓
3. Si hay mensajes en Supabase:
   - Renderiza desde Supabase
   - Sincroniza a localStorage como backup
   Sino:
   - Carga desde localStorage
   ↓
4. Normaliza chapas (80983 → 983)
5. Obtiene nombre del cache
6. Ordena por timestamp (antiguos abajo, recientes arriba, como WhatsApp)
7. Renderiza con nombre, mensaje y hora
   ↓
sendForoMessage()
   ↓
1. Obtiene texto del input
2. Valida que no esté vacío
3. guardarMensajeForo(chapa, texto)
   → INSERT en tabla 'mensajes_foro'
4. Limpia caché de foro
5. Recarga mensajes
6. Scroll al final
```

### Función principal:
- `loadForo()` (app.js:2016)
- `sendForoMessage()` (app.js:2177)

### Funciones de API:
- `getForoMensajes(limit)` (supabase.js:1130)
- `guardarMensajeForo(chapa, texto)` (supabase.js:1216)
- `getUsuarios()` (supabase.js:948)

### Origen de datos:
- **Tabla Supabase**:
  - `mensajes_foro` (id, chapa, texto, timestamp)
  - `usuarios` (chapa, nombre)
  
- **localStorage**:
  - `foro_messages` (backup de mensajes)
  - `usuarios_cache` (mapeo chapa → nombre)

### Transformaciones:
1. **Obtención de nombres**: 
   - Carga usuarios desde Supabase
   - Construye índice { chapa: nombre }
   - Guarda en localStorage para consulta rápida

2. **Normalización de chapa**:
   - 80983 → 983 (quita 80 inicial)
   - 0983 → 983 (quita 0 inicial)
   - Busca nombre en cache

3. **Ordenamiento**: Por timestamp ASC (antiguos primero, recientes abajo)

4. **Fecha/Hora**: Formatea timestamp a HH:MM

### Sistema de caché:
- `supabase_foro_${limit}` (5 min)
- `foro_messages` (localStorage, permanente como backup)
- `usuarios_cache` (localStorage, permanente)

### Sincronización:
- **Lectura**: Supabase → localStorage (backup automático)
- **Escritura**: Solo Supabase
- **Caché**:
  - `clearCacheByPrefix('supabase_foro')` después de nuevo mensaje
  - Fallback automático a localStorage si Supabase falla
- **Actualización de nombres**: Manual trigger en loadForo()

---

## TABLAS DE SUPABASE UTILIZADAS

```sql
-- 1. USUARIOS
CREATE TABLE usuarios (
  id BIGINT PRIMARY KEY,
  chapa VARCHAR NOT NULL UNIQUE,
  nombre VARCHAR,
  email VARCHAR,
  posicion INTEGER,
  activo BOOLEAN,
  password_hash VARCHAR
);

-- 2. JORNALES (Histórico de trabajos)
CREATE TABLE jornales (
  id BIGINT PRIMARY KEY,
  fecha DATE NOT NULL,
  chapa VARCHAR NOT NULL,
  jornada VARCHAR,
  puesto VARCHAR,
  empresa VARCHAR,
  buque VARCHAR,
  parte VARCHAR,
  origen VARCHAR (csv|manual|otro)
);

-- 3. CENSO (Disponibilidad actual)
CREATE TABLE censo (
  id BIGINT PRIMARY KEY,
  chapa VARCHAR NOT NULL UNIQUE,
  posicion INTEGER,
  color INTEGER (0-4),
  fecha DATE
);

-- 4. CONFIGURACION_USUARIO
CREATE TABLE configuracion_usuario (
  id BIGINT PRIMARY KEY,
  chapa VARCHAR NOT NULL UNIQUE,
  irpf_porcentaje NUMERIC
);

-- 5. PRIMAS_PERSONALIZADAS
CREATE TABLE primas_personalizadas (
  id BIGINT PRIMARY KEY,
  chapa VARCHAR NOT NULL,
  fecha DATE NOT NULL,
  jornada VARCHAR NOT NULL,
  prima_personalizada NUMERIC,
  movimientos_personalizados INTEGER
  -- UNIQUE(chapa, fecha, jornada)
);

-- 6. MENSAJES_FORO
CREATE TABLE mensajes_foro (
  id BIGINT PRIMARY KEY,
  chapa VARCHAR NOT NULL,
  texto TEXT,
  timestamp TIMESTAMP
);

-- 7. MAPEO_PUESTOS (Códigos y salarios base)
CREATE TABLE mapeo_puestos (
  id BIGINT PRIMARY KEY,
  codigo VARCHAR,
  nombre VARCHAR,
  salario_base NUMERIC
);

-- 8. TABLA_SALARIOS (Multiplicadores por jornada)
CREATE TABLE tabla_salarios (
  id BIGINT PRIMARY KEY,
  clave_jornada VARCHAR,
  descripcion VARCHAR,
  multiplicador NUMERIC
);

-- 9. CONTRATACIONES (Datos diarios - DEPRECIADO)
CREATE TABLE contrataciones (
  id BIGINT PRIMARY KEY,
  fecha DATE,
  chapa VARCHAR,
  puesto VARCHAR,
  empresa VARCHAR
);
```

---

## URLS DE GOOGLE SHEETS CSV

| Recurso | URL | GID | Actualización |
|---------|-----|-----|---|
| Jornales (Pivotado) | https://docs.google.com/spreadsheets/d/e/2PACX-1vSTtbkA94xqjf81lsR7bLKKtyES2YBDKs8J2T4UrSEan7e5Z_eaptShCA78R1wqUyYyASJxmHj3gDnY/pub | 1388412839 | Manual (cada carga) |
| Censo (Disponibilidad) | https://docs.google.com/spreadsheets/d/e/2PACX-1vTrMuapybwZUEGPR1vsP9p1_nlWvznyl0sPD4xWsNJ7HdXCj1ABY1EpU1um538HHZQyJtoAe5Niwrxq/pub | 841547354 | Manual (cada carga) |
| Puertas del Día | https://docs.google.com/spreadsheets/d/e/2PACX-1vQrQ5bGZDNShEWi1lwx_l1EvOxC0si5kbN8GBxj34rF0FkyGVk6IZOiGk5D91_TZXBHO1mchydFvvUl/pub | 3770623 | Diario (sin caché) |
| Primas Personalizadas | https://docs.google.com/spreadsheets/d/1j-IaOHXoLEP4bK2hjdn2uAYy8a2chqiQSOw4Nfxoyxc/export | 1977235036 | Manual (Sueldómetro) |

---

## FUNCIONES DE SINCRONIZACIÓN

### 1. `syncJornalesFromCSV()`
- **Ubicación**: supabase.js:206
- **Disparador**: Automático en `loadJornales()` y `loadContratacion()`
- **Proceso**:
  1. Fetch CSV con UTF-8
  2. Despivotea: transforma filas (fechas) × columnas (puestos) → registros
  3. Valida fechas y jornadas
  4. Verifica si ya existe (SELECT id)
  5. Si NO existe: INSERT en tabla `jornales`
  6. Marca con `origen: 'csv'`
- **Deduplicación**: Por (chapa, fecha, jornada)
- **Error handling**: Log de advertencia, continúa de todos modos

### 2. `syncCensoFromCSV()`
- **Ubicación**: supabase.js:385
- **Disparador**: Automático en `loadCenso()`
- **Proceso**:
  1. Fetch CSV con UTF-8
  2. Parsea: chapa, posicion, color
  3. Valida chapa (número positivo)
  4. UPSERT en tabla `censo` por fecha actual
  5. Mapea colores numéricos
- **Deduplicación**: Por (chapa, fecha)

### 3. `syncPrimasPersonalizadasFromCSV(primasURL)`
- **Ubicación**: supabase.js:497
- **Disparador**: Automático en `loadSueldometro()` al calcular salarios
- **Proceso**:
  1. Fetch CSV de primas personalizadas
  2. Parsea: chapa, fecha, jornada, prima_personalizada, movimientos
  3. Deduplica por (chapa, fecha, jornada) - mantiene ÚLTIMA del CSV
  4. UPSERT en tabla `primas_personalizadas`
  5. Limpia caché de primas
- **Transformación**: Convierte fecha a ISO si es necesario

---

## SISTEMA DE CACHE EN localStorage

### Estructura de claves:

```javascript
// Datos
'supabase_censo_actual'                    // Censo actual (5 min)
'supabase_censo_${fecha}'                  // Censo por fecha (5 min)
'supabase_jornales_${chapa}_all_all_all'   // Jornales de usuario (5 min)
'supabase_primas_${chapa}_*'               // Primas personalizadas (5 min)
'supabase_config_${chapa}'                 // Configuración usuario (5 min)
'supabase_mapeo_puestos'                   // Mapeo de puestos (5 min)
'supabase_tabla_salarios'                  // Tabla de salarios (5 min)
'supabase_foro_${limit}'                   // Mensajes foro (5 min)
'supabase_contrataciones_*'                // Contrataciones (5 min)
'supabase_usuarios'                        // Lista de usuarios (5 min)

// Históricamente (fallback)
'jornales_historico'                       // Histórico local de jornales
'foro_messages'                            // Backup de mensajes
'usuarios_cache'                           // Caché nombres usuario {chapa: nombre}

// Configuración del usuario
'currentChapa'                             // Chapa del usuario logeado
'currentUserName'                          // Nombre del usuario logeado
'password_overrides'                       // Contraseñas personalizadas {chapa: pwd}
'irpf_${chapa}'                            // IRPF guardado del usuario
'irpf_locked_${chapa}'                     // Flag de bloqueo de IRPF
'lockedValuesKey'                          // Valores bloqueados en Sueldómetro

// Metadata
Cada caché tiene estructura: { data: {...}, timestamp: Date.now() }
Duración: 5 minutos (CACHE_DURATION en supabase.js:23)
```

### Funciones de caché:

```javascript
getCachedData(key)          // Obtiene si existe y no está expirado
setCachedData(key, data)    // Guarda con timestamp
clearCache()                // Limpia todo lo que comienza con 'supabase_'
clearCacheByPrefix(prefix)  // Limpia todas las claves que coincidan con prefijo
```

---

## FLUJO AUTOMÁTICO (Auto-Refresh)

Se ejecuta cada 10 minutos cuando el usuario está autenticado:

```javascript
setInterval(autoRefreshData, 600000) // 10 minutos
```

### Qué se actualiza:
1. `getUserConfig(chapa)` → Configuración de IRPF
2. `syncPrimasPersonalizadasFromCSV()` → Primas actualizadas
3. Si está en Sueldómetro: `loadSueldometro()` → Recalcula vista

---

## AUTENTICACIÓN

### Login:
```javascript
handleLogin()
  ↓
1. Obtiene chapa y contraseña del input
2. Busca en getUsuarios() → tabla 'usuarios'
3. Valida contraseña contra:
   - password_overrides en localStorage (personalizada)
   - password_hash en usuarios (por defecto del CSV)
4. Si válido:
   - Guarda en localStorage: currentChapa, currentUserName
   - Marca isAuthenticated = true
   - Llama updateUIForAuthenticatedUser()
   - Inicia auto-refresh
```

### Cambio de contraseña:
- Permite cambiar contraseña personal
- Guarda en `password_overrides` en localStorage
- También intenta guardar en Supabase (campo password_hash)

---

## RESUMEN DE FLUJOS POR PESTAÑA

### 📊 Dashboard
- Carga: Posición en censo + posiciones hasta contratación
- Actualización: Manual al login
- API: getCenso(), getPuertas(), getPosicionesHastaContratacion()

### 📋 Contratación
- Carga: Jornales de hoy, mañana y pasado mañana
- Actualización: Cada vez que abre la pestaña (sincroniza CSV)
- API: getJornalesHistoricoAcumulado()

### 📈 Mis Jornales
- Carga: Histórico completo agrupado por quincenas
- Actualización: Cada vez que abre la pestaña (sincroniza CSV)
- API: getJornalesHistoricoAcumulado(), syncJornalesFromCSV()

### 💰 Sueldómetro
- Carga: Jornales + salarios base + tabla de salarios + primas personalizadas + IRPF
- Actualización: Cada carga (sincroniza primas CSV, limpia caché)
- Cálculo: base × multiplicador + prima - IRPF
- API: getTablaSalarial(), getMapeoPuestos(), getPrimasPersonalizadas()

### 🚪 Puertas
- Carga: Puerta SP y OC por jornada, separadas laborables y festivas
- Actualización: Cada vez que abre la pestaña (lee CSV sin caché)
- API: getPuertas()

### 🗂️ Censo
- Carga: Lista completa con colores de disponibilidad + estadísticas
- Actualización: Cada vez que abre la pestaña (sincroniza CSV)
- API: syncCensoFromCSV(), getCenso()

### 💬 Foro
- Carga: Últimos 50 mensajes con nombres
- Actualización: Manual (cargar página), auto-actualiza nombres
- API: getForoMensajes(), guardarMensajeForo()
- Escritura: INSERT en tabla 'mensajes_foro'

---

## MECANISMOS DE FALLBACK

### Si CSV falla:
- Jornales: Usa datos existentes en Supabase
- Censo: Usa datos existentes en Supabase
- Puertas: Sin fallback (solo CSV disponible)

### Si Supabase falla:
- Jornales: Usa localStorage `jornales_historico`
- Foro: Usa localStorage `foro_messages`
- Censo: Usa caché existente

### Graceful degradation:
- Muestra estado "Cargando..." mientras sincroniza
- Si ambas fuentes fallan, muestra estado vacío con mensaje

---

## DETALLES DE IMPLEMENTACIÓN

### Control de duplicados en Sueldómetro:
1. CSS de Sueldómetro marca celdas editables con cursor
2. Valores editados se guardan en `lockedValuesKey` de localStorage
3. Al recargar, se recuperan valores guardados

### Auto-complete de nombres en Foro:
- Se cargan todos los nombres al abrir foro: `actualizarCacheNombres()`
- Cache se mantiene en localStorage indefinidamente
- Se normaliza chapa (80983 → 983) antes de buscar en cache

### Prioridad de actualización:
1. **Dashboard**: Login time only
2. **Jornales/Contratación**: Al abrir pestaña
3. **Sueldómetro**: Al abrir pestaña + cada 10 min si está activo
4. **Puertas**: Al abrir pestaña, siempre del CSV (sin caché)
5. **Censo**: Al abrir pestaña
6. **Foro**: Al abrir pestaña, nombres cada 10 min

### Compresión de datos:
- No se realiza compresión explícita
- localStorage puede contener ~5MB (navegador dependiente)
- Jornales históricos se limpian automáticamente (años anteriores)

---

## PUNTOS CRÍTICOS Y CONSIDERACIONES

1. **Sincronización en tiempo real**: NO se realiza (solo manual/periódica)
2. **Datos duplicados**: Posible en transición CSV→Supabase (manejado con validación)
3. **Puertas**: Única tabla 100% dependiente de CSV (no existe en Supabase)
4. **IRPF**: Se edita localmente (localStorage), no se sincroniza a Supabase en tiempo real
5. **Primas**: Se sincronizan automáticamente del CSV al cargar Sueldómetro
6. **Autenticación**: Sin cifrado real (passwords en localStorage, hash en Supabase)

