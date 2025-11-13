# 📊 FLUJO COMPLETO DE DATOS - Portal Estiba VLC

> Última actualización: 12/11/2025
> Documento maestro para entender cómo funcionan los datos en la PWA

---

## 🎯 RESUMEN EJECUTIVO

Tu aplicación actualmente está en **MODO HÍBRIDO**:
- **Google Sheets**: Fuente primaria de datos (CSV públicos)
- **Supabase**: Base de datos secundaria (sincronización automática)
- **localStorage**: Caché local (5 minutos)

**Estado de migración**: 1% completado (99% todavía en Sheets)

---

## 📋 FLUJO POR PESTAÑA

### 1️⃣ DASHBOARD (Pantalla Principal)

**¿Qué se muestra?**
- Nombre del usuario
- Tu posición en el censo
- Distancia hasta la última puerta contratada (SP y OC separadas)
- Notificaciones y novedades

**Flujo de datos:**
```
Usuario inicia sesión
    ↓
updateUIForAuthenticatedUser()
    ↓
getPosicionesHastaContratacion(chapa)
    ↓
┌─────────────────────────────────────────┐
│ 1. Lee censo desde Supabase (tabla)    │
│ 2. Lee puertas desde CSV de Sheets     │  ← ⚠️ SHEETS TODAVÍA
│ 3. Calcula posiciones SP y OC          │
│ 4. Muestra en pantalla                 │
└─────────────────────────────────────────┘
```

**Origen de datos:**
- `censo` (Supabase) - Posiciones de trabajadores
- CSV Puertas (Sheets) - Última puerta contratada

**Caché:** `supabase_censo_actual` (5 min)

---

### 2️⃣ CONTRATACIÓN (Mis Asignaciones)

**¿Qué se muestra?**
- Tus jornales de HOY, MAÑANA y PASADO MAÑANA
- Tarjetas bonitas con logo empresa, jornada, buque, parte

**Flujo de datos:**
```
Usuario abre "Contratación"
    ↓
loadContratacion()
    ↓
getJornalesHistoricoAcumulado(chapa)
    ↓
┌─────────────────────────────────────────────┐
│ 1. Lee TODOS los jornales desde Supabase   │ ← ✅ SUPABASE
│ 2. Filtra por fechas (hoy, +1, +2)        │
│ 3. Normaliza jornadas (02 a 08 → 02-08)   │
│ 4. Ordena: 02-08 < 08-14 < 14-20 < 20-02  │
│ 5. Mapea logos de empresas                 │
│ 6. Renderiza tarjetas                      │
└─────────────────────────────────────────────┘
```

**⚠️ PROBLEMA IDENTIFICADO: Jornales 20-02 y 02-08 faltantes**

**Causa:** Los jornales no se sincronizan automáticamente en esta pestaña. Solo se leen.

**Origen de datos:**
- `jornales` (Supabase) - Tabla principal

**Caché:** `supabase_jornales_{chapa}_*` (5 min)

**Sincronización:** NO automática en esta pestaña ❌

---

### 3️⃣ MIS JORNALES (Histórico)

**¿Qué se muestra?**
- TODOS tus jornales históricos
- Agrupados por quincenas (1-15 y 16-fin de mes)
- Estadísticas: Total jornales, bruto, neto

**Flujo de datos:**
```
Usuario abre "Mis Jornales"
    ↓
loadJornales()
    ↓
┌─────────────────────────────────────────────┐
│ PASO 1: Sincronización desde CSV           │
│ syncJornalesFromCSV()                       │
│   ↓                                         │
│   Lee CSV pivotado desde Sheets             │ ← ⚠️ SHEETS
│   (columnas = T, TC, C1, B, E)             │
│   ↓                                         │
│   Despivotea: genera 1 jornal por chapa    │
│   ↓                                         │
│   Valida fechas (dd/mm/yyyy)                │
│   Valida jornadas (02-08, 08-14, etc)      │
│   ↓                                         │
│   Verifica duplicados (chapa+fecha+jornada) │
│   ↓                                         │
│   Inserta en Supabase (tabla jornales)      │ ← ✅ SUPABASE
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ PASO 2: Carga y visualización               │
│ getJornalesHistoricoAcumulado(chapa)        │
│   ↓                                         │
│   Lee desde Supabase                        │
│   ↓                                         │
│   Agrupa por quincenas                      │
│   ↓                                         │
│   Calcula estadísticas                      │
│   ↓                                         │
│   Renderiza tablas por quincena             │
└─────────────────────────────────────────────┘
```

**Origen de datos:**
- CSV Jornales (Sheets) - Fuente primaria ← sincroniza a Supabase
- `jornales` (Supabase) - Almacenamiento

**Sincronización:** ✅ AUTOMÁTICA cada vez que abres la pestaña

**CSV URL:**
```
https://docs.google.com/spreadsheets/d/e/2PACX-1vSTtbkA94xqjf81lsR7bLKKtyES2YBDKs8J2T4UrSEan7e5Z_eaptShCA78R1wqUyYyASJxmHj3gDnY/pub?gid=1388412839&single=true&output=csv
```

**Estructura CSV:**
```
| Fecha      | Jornada | Empresa | Parte | Buque | T   | TC  | C1  | B   | E   |
|------------|---------|---------|-------|-------|-----|-----|-----|-----|-----|
| 11/11/2025 | 20 a 02 | CSP     | 32796 | ONE   | 696 | 760 | 808 | 223 | 151 |
```

**Despivoteo:**
```
1 fila CSV → N jornales (1 por cada chapa en columnas T, TC, C1, B, E)
```

---

### 4️⃣ SUELDÓMETRO (Cálculo Salarial)

**¿Qué se muestra?**
- Estimación salarial por cada jornal
- Suma total bruto y neto
- Desglose por jornada

**Flujo de datos:**
```
Usuario abre "Sueldómetro"
    ↓
loadSueldometro()
    ↓
┌─────────────────────────────────────────────┐
│ PASO 1: Sincronizar primas personalizadas  │
│ syncPrimasPersonalizadasFromCSV()           │
│   ↓                                         │
│   Lee CSV primas desde Sheets               │ ← ⚠️ SHEETS
│   ↓                                         │
│   Deduplica por (chapa+fecha+jornada)      │
│   ↓                                         │
│   UPSERT en Supabase                        │ ← ✅ SUPABASE
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ PASO 2: Cargar datos salariales            │
│   - Jornales del usuario                    │
│   - Tabla de salarios (multiplicadores)     │
│   - Mapeo de puestos (salarios base)        │
│   - Primas personalizadas                   │
│   - IRPF del usuario (localStorage)         │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ PASO 3: Cálculo                             │
│ Por cada jornal:                            │
│   salario = base × multiplicador + prima    │
│   neto = salario - (salario × IRPF%)        │
└─────────────────────────────────────────────┘
```

**Fórmula de cálculo:**
```javascript
salario_bruto = salario_base × multiplicador_jornada + prima_personalizada
salario_neto = salario_bruto - (salario_bruto × (IRPF% / 100))
```

**Origen de datos:**
- `jornales` (Supabase)
- `tabla_salarios` (Supabase) - Multiplicadores
- `mapeo_puestos` (Supabase) - Salarios base
- `primas_personalizadas` (Supabase) ← sincroniza desde CSV
- `configuracion_usuario` (Supabase + localStorage) - IRPF

**Sincronización:** ✅ AUTOMÁTICA para primas al abrir pestaña

---

### 5️⃣ PUERTAS (Última Contratada)

**¿Qué se muestra?**
- Última puerta laborable contratada (SP y OC)
- Última puerta festiva contratada (SP y OC)
- Fecha, jornada, posiciones

**Flujo de datos:**
```
Usuario abre "Puertas"
    ↓
loadPuertas()
    ↓
┌─────────────────────────────────────────────┐
│ Lee CSV de puertas desde Sheets             │ ← ⚠️ SHEETS
│   ↓                                         │
│   NO HAY TABLA EN SUPABASE                  │ ← ⚠️ CRÍTICO
│   ↓                                         │
│   Parsea CSV                                │
│   ↓                                         │
│   Separa laborables y festivas              │
│   ↓                                         │
│   Renderiza tarjetas                        │
└─────────────────────────────────────────────┘
```

**⚠️ PUNTO CRÍTICO:** Puertas NO tiene tabla en Supabase. Depende 100% de Sheets.

**CSV URL:**
```
https://docs.google.com/spreadsheets/d/e/2PACX-1vQrQ5bGZDNShEWi1lwx_l1EvOxC0si5kbN8GBxj34rF0FkyGVk6IZOiGk5D91_TZXBHO1mchydFvvUl/pub?gid=3770623&single=true&output=csv
```

**Caché:** ❌ NO tiene caché (siempre lee en vivo)

---

### 6️⃣ CENSO (Disponibilidad)

**¿Qué se muestra?**
- Listado completo de chapas
- Color de disponibilidad (rojo→verde)
- Estadísticas por color

**Flujo de datos:**
```
Usuario abre "Censo"
    ↓
loadCenso()
    ↓
┌─────────────────────────────────────────────┐
│ PASO 1: Sincronización desde CSV           │
│ syncCensoFromCSV()                          │
│   ↓                                         │
│   Lee CSV censo desde Sheets                │ ← ⚠️ SHEETS
│   ↓                                         │
│   Parsea colores (0→rojo, 4→verde)         │
│   ↓                                         │
│   ELIMINA todos los registros anteriores    │
│   ↓                                         │
│   Inserta en lotes de 100 en Supabase      │ ← ✅ SUPABASE
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ PASO 2: Visualización                      │
│ getCenso()                                  │
│   ↓                                         │
│   Lee desde Supabase                        │
│   ↓                                         │
│   Calcula estadísticas por color            │
│   ↓                                         │
│   Renderiza tabla                           │
└─────────────────────────────────────────────┘
```

**Mapeo de colores:**
```javascript
0 → 🔴 rojo (no disponible)
1 → 🟠 naranja
2 → 🟡 amarillo
3 → 🔵 azul
4 → 🟢 verde (disponible)
```

**Origen de datos:**
- CSV Censo (Sheets) ← sincroniza a Supabase
- `censo` (Supabase)

**Sincronización:** ✅ AUTOMÁTICA cada vez que abres la pestaña

**⚠️ COMPORTAMIENTO DESTRUCTIVO:** Elimina todos los datos anteriores y recarga desde CSV.

---

### 7️⃣ FORO (Mensajes)

**¿Qué se muestra?**
- Mensajes de todos los usuarios
- Timestamp, autor, texto
- Últimos 50 mensajes

**Flujo de datos:**
```
Usuario abre "Foro"
    ↓
loadForo()
    ↓
┌─────────────────────────────────────────────┐
│ getForoMensajes(limit=50)                   │
│   ↓                                         │
│   Lee desde Supabase (tabla mensajes_foro)  │ ← ✅ SUPABASE
│   ↓                                         │
│   Ordena por timestamp DESC                 │
│   ↓                                         │
│   Fallback a localStorage si falla          │
│   ↓                                         │
│   Renderiza mensajes                        │
└─────────────────────────────────────────────┘

Usuario envía mensaje
    ↓
sendForoMessage(texto)
    ↓
┌─────────────────────────────────────────────┐
│ guardarMensajeForo(chapa, texto)            │
│   ↓                                         │
│   Inserta en Supabase                       │ ← ✅ SUPABASE
│   ↓                                         │
│   Guarda también en localStorage            │
│   ↓                                         │
│   Recarga foro                              │
└─────────────────────────────────────────────┘
```

**Origen de datos:**
- `mensajes_foro` (Supabase)
- localStorage (fallback)

**Caché:** `supabase_foro_50` (5 min)

---

## 🔄 SISTEMA DE SINCRONIZACIÓN

### Funciones de Sincronización Automática

| Función | CSV Origen | Tabla Destino | Cuando se ejecuta | Comportamiento |
|---------|------------|---------------|-------------------|----------------|
| `syncJornalesFromCSV()` | Jornales pivotado | `jornales` | Al abrir "Mis Jornales" | Acumula (no sobreescribe) |
| `syncCensoFromCSV()` | Censo | `censo` | Al abrir "Censo" | ELIMINA todo y recarga |
| `syncPrimasPersonalizadasFromCSV()` | Primas | `primas_personalizadas` | Al abrir "Sueldómetro" | UPSERT (actualiza si existe) |

### Flujo de Sincronización de Jornales

```
CSV Pivotado en Sheets
    ↓
fetch(CSV_URL)
    ↓
Lectura UTF-8 (ArrayBuffer + TextDecoder)
    ↓
Parseo línea por línea
    ↓
Por cada fila:
  ├─ Validar fecha (dd/mm/yyyy)
  ├─ Validar jornada (02-08, 08-14, 14-20, 20-02, festivo)
  └─ Por cada columna de puesto (T, TC, C1, B, E):
      ├─ Extraer chapa
      ├─ Convertir fecha a ISO (yyyy-mm-dd)
      ├─ Mapear puesto (T→Trincador, etc)
      └─ Crear jornal {fecha, chapa, jornada, puesto, empresa, buque, parte, origen:'csv'}
    ↓
Por cada jornal generado:
  ├─ Verificar si existe en Supabase (chapa + fecha + jornada)
  ├─ Si NO existe → Insertar
  └─ Si existe → Saltar (duplicado)
    ↓
Retornar: {insertados, duplicados, errores}
```

---

## 🗄️ TABLAS DE SUPABASE

### `usuarios`
```sql
chapa (PRIMARY KEY)
nombre
email
posicion (número)
password_hash
censo_tipo (SP/OC)
```

### `jornales`
```sql
id (SERIAL PRIMARY KEY)
fecha (DATE) - Formato: yyyy-mm-dd
chapa (TEXT)
jornada (TEXT) - Ejemplo: "20 a 02"
puesto (TEXT) - Ejemplo: "Conductor de 1a"
empresa (TEXT) - Ejemplo: "CSP"
buque (TEXT)
parte (TEXT)
origen (TEXT) - Valores: 'csv', 'manual'

CONSTRAINT RECOMENDADO:
  UNIQUE(fecha, chapa, jornada)
```

### `censo`
```sql
chapa (TEXT)
posicion (INTEGER)
color (INTEGER) - 0 a 4
fecha (DATE)
```

### `configuracion_usuario`
```sql
chapa (TEXT PRIMARY KEY)
irpf_porcentaje (NUMERIC)
```

### `primas_personalizadas`
```sql
chapa (TEXT)
fecha (DATE)
jornada (TEXT)
prima_personalizada (NUMERIC)
movimientos_personalizados (NUMERIC)

UNIQUE(chapa, fecha, jornada)
```

### `mensajes_foro`
```sql
id (SERIAL PRIMARY KEY)
chapa (TEXT)
texto (TEXT)
timestamp (TIMESTAMP)
```

### `tabla_salarios`
```sql
clave_jornada (TEXT PRIMARY KEY)
descripcion (TEXT)
multiplicador (NUMERIC)
```

### `mapeo_puestos`
```sql
codigo (TEXT PRIMARY KEY)
nombre (TEXT)
salario_base (NUMERIC)
```

---

## 💾 SISTEMA DE CACHÉ (localStorage)

### Estructura de Caché

```javascript
{
  data: {...},
  timestamp: Date.now()
}
```

### Duración: 5 minutos (300000 ms)

### Claves de Caché:

| Clave | Contenido | Duración |
|-------|-----------|----------|
| `supabase_censo_actual` | Censo completo | 5 min |
| `supabase_jornales_{chapa}_*` | Jornales por usuario | 5 min |
| `supabase_foro_50` | Últimos 50 mensajes | 5 min |
| `jornales_historico` | Fallback histórico | ∞ |

### Limpieza de Caché:

- **Automática**: Al expirar (5 min)
- **Manual**: Al guardar datos (`clearCacheByPrefix()`)
- **Sueldómetro**: Limpia todo al cargar

---

## ⚠️ PROBLEMAS IDENTIFICADOS

### 1. Jornales 20-02 y 02-08 no se cargan en Contratación

**Causa:**
- La pestaña "Contratación" NO ejecuta `syncJornalesFromCSV()`
- Solo lee de Supabase
- Si los jornales no están en Supabase, no se muestran

**Solución aplicada:**
- ✅ Agregada sincronización automática en "Mis Jornales"
- ✅ Arreglado error PGRST116 (duplicados)
- ⚠️ FALTA: Agregar sincronización también en "Contratación"

### 2. Dependencia crítica de Sheets en Puertas

**Riesgo:** Si Sheets falla, no hay puertas

**Solución recomendada:**
- Crear tabla `puertas` en Supabase
- Migrar datos
- Agregar sincronización automática

### 3. IRPF no sincroniza en tiempo real

**Problema:** Se guarda en localStorage pero no siempre en Supabase

**Solución recomendada:**
- Forzar guardado en Supabase al editar IRPF
- Leer siempre de Supabase (no localStorage)

### 4. Censo se borra completamente al sincronizar

**Riesgo:** Si CSV falla, se pierden todos los datos

**Solución recomendada:**
- Cambiar de DELETE + INSERT a UPSERT
- Mantener datos existentes si CSV falla

---

## 🚀 MEJORAS PROPUESTAS

### 🔥 ALTA PRIORIDAD

#### 1. Agregar sincronización en Contratación
```javascript
// En loadContratacion() antes de leer jornales:
await SheetsAPI.syncJornalesFromCSV();
```

**Beneficio:** Las jornadas 20-02 y 02-08 se cargarán siempre

---

#### 2. Migrar Puertas a Supabase

**Crear tabla:**
```sql
CREATE TABLE puertas (
  id SERIAL PRIMARY KEY,
  fecha DATE,
  jornada TEXT,
  tipo TEXT, -- 'laborable' o 'festivo'
  censo_tipo TEXT, -- 'SP' o 'OC'
  posicion INTEGER,
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);
```

**Agregar función de sincronización:**
```javascript
async function syncPuertasFromCSV() {
  // Similar a syncJornalesFromCSV()
  // Lee CSV, parsea, UPSERT en Supabase
}
```

**Beneficio:** Eliminación de dependencia crítica de Sheets

---

#### 3. Agregar constraint UNIQUE a jornales

```sql
ALTER TABLE jornales
ADD CONSTRAINT jornales_unique_fecha_chapa_jornada
UNIQUE (fecha, chapa, jornada);
```

**Beneficio:** Prevenir duplicados a nivel de base de datos

---

#### 4. Mejorar sincronización de Censo

**Cambiar de DELETE + INSERT a UPSERT:**
```javascript
// En lugar de:
await supabase.from('censo').delete();
await supabase.from('censo').insert(data);

// Usar:
await supabase.from('censo').upsert(data, {
  onConflict: 'chapa,fecha'
});
```

**Beneficio:** No se pierden datos si CSV falla

---

### ⚡ MEDIA PRIORIDAD

#### 5. Sincronizar IRPF siempre en Supabase

**Modificar función de guardado:**
```javascript
async function guardarIRPF(chapa, porcentaje) {
  // Guardar en Supabase
  await supabase
    .from('configuracion_usuario')
    .upsert({ chapa, irpf_porcentaje: porcentaje });

  // Luego guardar en localStorage como caché
  localStorage.setItem(`irpf_${chapa}`, porcentaje);
}
```

---

#### 6. Agregar sistema de logs de sincronización

**Crear tabla:**
```sql
CREATE TABLE logs_sincronizacion (
  id SERIAL PRIMARY KEY,
  tipo TEXT, -- 'jornales', 'censo', 'primas'
  fecha_sync TIMESTAMP DEFAULT NOW(),
  registros_insertados INTEGER,
  registros_duplicados INTEGER,
  errores INTEGER,
  mensaje TEXT
);
```

**Beneficio:** Trazabilidad de sincronizaciones

---

#### 7. Botón de sincronización manual global

**En el header, agregar botón:**
```html
<button id="sync-all-btn">🔄 Sincronizar Todo</button>
```

**Función:**
```javascript
async function syncAll() {
  await syncJornalesFromCSV();
  await syncCensoFromCSV();
  await syncPrimasPersonalizadasFromCSV();
  // Si implementas: await syncPuertasFromCSV();
  alert('✅ Sincronización completa');
}
```

---

### 💡 BAJA PRIORIDAD (Mejoras UX)

#### 8. Indicador de sincronización en tiempo real

**Mostrar en pantalla:**
```
🔄 Sincronizando jornales... (21 nuevos, 109 duplicados)
✅ Sincronización completa
```

---

#### 9. Notificaciones push cuando hay nuevas contrataciones

**Usar Service Worker:**
```javascript
// Cuando se sincronicen jornales nuevos para hoy/mañana
if (nuevosJornalesProximos > 0) {
  showNotification('📋 Tienes nueva contratación!');
}
```

---

#### 10. Exportar jornales a PDF

**Agregar botón en "Mis Jornales":**
```html
<button id="export-pdf-btn">📄 Exportar PDF</button>
```

**Usar librería jsPDF para generar PDF con los jornales**

---

#### 11. Gráficos de estadísticas

**En Dashboard, agregar:**
- Jornales por mes (gráfico de barras)
- Distribución por jornada (gráfico circular)
- Evolución de posición en censo

**Librería recomendada:** Chart.js

---

#### 12. Modo offline mejorado

**Guardar más datos en localStorage:**
- Últimas 2 semanas de jornales
- Puertas actuales
- Censo actual

**Service Worker con estrategia Network First, Cache Fallback**

---

## 📦 PLAN DE MIGRACIÓN A SUPABASE 100%

### Fase 1: Preparación (1-2 días)
- ✅ Implementar constraints UNIQUE
- ✅ Limpiar duplicados existentes
- ✅ Crear tabla `puertas` en Supabase
- ✅ Probar sincronizaciones

### Fase 2: Sincronización Dual (1 semana)
- ✅ Mantener Sheets como fuente
- ✅ Sincronizar TODO a Supabase
- ✅ Verificar integridad de datos
- ✅ Monitorear logs

### Fase 3: Cambio de Fuente (1 día)
- 🔄 Cambiar app para leer de Supabase PRIMERO
- 🔄 Sheets como fallback
- 🔄 Monitorear errores

### Fase 4: Desconexión de Sheets (cuando estés seguro)
- 🔄 Eliminar dependencias de CSV
- 🔄 Solo Supabase como fuente
- 🔄 Sheets solo como backup manual

---

## 🔧 COMANDOS ÚTILES

### Limpiar caché completo
```javascript
// En consola del navegador:
Object.keys(localStorage)
  .filter(key => key.startsWith('supabase_'))
  .forEach(key => localStorage.removeItem(key));
```

### Forzar sincronización manual
```javascript
// En consola:
await SheetsAPI.syncJornalesFromCSV();
await SheetsAPI.syncCensoFromCSV();
await SheetsAPI.syncPrimasPersonalizadasFromCSV();
```

### Ver datos de caché
```javascript
// Ver censo cacheado:
JSON.parse(localStorage.getItem('supabase_censo_actual'))

// Ver jornales cacheados:
Object.keys(localStorage)
  .filter(key => key.includes('jornales'))
  .forEach(key => console.log(key, JSON.parse(localStorage.getItem(key))));
```

---

## 📞 SOPORTE

**Documentos generados:**
- `README_ANALISIS.md` - Guía de inicio
- `ANALISIS_FLUJO_DATOS.md` - Análisis detallado por pestaña
- `DIAGRAMA_ARQUITECTURA.md` - Diagramas visuales
- `RESUMEN_RAPIDO.md` - Referencia rápida
- `FLUJO_COMPLETO_Y_MEJORAS.md` - Este documento

---

**Última actualización:** 12/11/2025 🚢⚓
