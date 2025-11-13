# ANÁLISIS DE FLUJO DE DATOS - Portal Estiba VLC

Documentación completa del flujo de datos, arquitectura y sincronización de la aplicación.

## Archivos Generados

Este análisis se compone de 3 documentos:

### 1. **ANALISIS_FLUJO_DATOS.md** (Documento Principal - 2800+ líneas)
Análisis exhaustivo y detallado de cada pestaña/funcionalidad:
- Dashboard: Cálculo de posiciones
- Contratación: Próximas 3 jornadas
- Mis Jornales: Histórico agrupado por quincenas
- Sueldómetro: Cálculo de salarios con IRPF y primas
- Puertas: Información de cola por jornada
- Censo: Disponibilidad de trabajadores
- Foro: Mensajería

Para cada uno: funciones, APIs, origen de datos, transformaciones, caché, sincronización.

### 2. **DIAGRAMA_ARQUITECTURA.md** (Diagramas Visuales - 400+ líneas)
Diagramas de flujo, arquitectura y secuencias:
- Arquitectura general (Frontend + Supabase + CSV)
- Matriz de relaciones (Pestaña ↔ Datos ↔ Fuente)
- Flujos de sincronización CSV ↔ Supabase
- Ciclo de vida de datos por pestaña
- Flujo de caché y expiración
- Secuencias críticas (Login, Guardar Prima, etc.)

### 3. **RESUMEN_RAPIDO.md** (Referencia Rápida - 300+ líneas)
Tablas y resúmenes para búsqueda rápida:
- Tabla rápida de funciones por pestaña
- Tablas de Supabase (campos y sincronización)
- URLs de datos críticas
- Sistema de caché
- Cálculos (Sueldómetro, Posiciones)
- Validaciones en CSV
- Mecanismos de fallback
- Estado de implementación

## Puntos Clave

### Arquitectura

```
Frontend (app.js)
    ↓
Supabase (PostgreSQL) + Google Sheets CSV
    ↓
localStorage (caché 5 min)
```

### Sincronización Automática

| Datos | Fuente | Destino | Cuando |
|-------|--------|---------|--------|
| Jornales | CSV | Supabase | Al abrir pestaña |
| Censo | CSV | Supabase | Al abrir pestaña |
| Primas | CSV | Supabase | Al abrir Sueldómetro |

### Tablas Principales

| Tabla | Uso | Sincronización |
|-------|-----|-----------------|
| `usuarios` | Autenticación, nombres | Manual |
| `jornales` | Histórico de trabajos | CSV automático |
| `censo` | Disponibilidad | CSV automático |
| `tabla_salarios` | Cálculo de sueldos | Manual |
| `mapeo_puestos` | Salarios base | Manual |
| `primas_personalizadas` | Ajustes salariales | CSV automático |
| `configuracion_usuario` | IRPF, preferencias | Manual |
| `mensajes_foro` | Comunicación | Manual |

### URLs de Datos Críticas

```
Jornales:  docs.google.com/spreadsheets/.../2PACX-1vSTtbkA94... (GID: 1388412839)
Censo:     docs.google.com/spreadsheets/.../2PACX-1vTrMuapyb... (GID: 841547354)
Puertas:   docs.google.com/spreadsheets/.../2PACX-1vQrQ5bGZDN... (GID: 3770623)
Primas:    docs.google.com/spreadsheets/.../1j-IaOHXoLEP4bK2h... (GID: 1977235036)
```

## Cómo Usar Este Análisis

### Para Entender el Flujo Completo
1. Leer **ANALISIS_FLUJO_DATOS.md** sección por sección
2. Consultar **DIAGRAMA_ARQUITECTURA.md** para visualizaciones
3. Usar **RESUMEN_RAPIDO.md** como referencia

### Para Buscar Información Específica
- Función: RESUMEN_RAPIDO.md (Tabla Rápida)
- Tabla Supabase: RESUMEN_RAPIDO.md (Tablas Utilizadas)
- Flujo de datos: ANALISIS_FLUJO_DATOS.md (por sección)
- Diagrama visual: DIAGRAMA_ARQUITECTURA.md

### Para Debugging
- Ver "Mecanismos de Fallback" en RESUMEN_RAPIDO.md
- Buscar función en ANALISIS_FLUJO_DATOS.md
- Verificar sincronización en DIAGRAMA_ARQUITECTURA.md

## Funciones Clave por Archivo

### app.js (Lógica de UI)
```javascript
handleLogin()              (línea 433)   - Autenticación
updateUIForAuthenticatedUser() (línea 543) - Actualiza Dashboard
loadContratacion()         (línea 906)   - Próximas 3 jornadas
loadJornales()             (línea 1160)  - Histórico por quincenas
loadPuertas()              (línea 1674)  - Puertas del día
loadCenso()                (línea 1833)  - Disponibilidad
loadForo()                 (línea 2016)  - Mensajes
loadSueldometro()          (línea 2525)  - Cálculo salarios
```

### supabase.js (API de Datos)
```javascript
initSupabase()             (línea 33)    - Inicializa cliente
getCenso()                 (línea 145)   - Lee censo
syncJornalesFromCSV()      (línea 206)   - Sincroniza jornales
syncCensoFromCSV()         (línea 385)   - Sincroniza censo
syncPrimasFromCSV()        (línea 497)   - Sincroniza primas
getPuertas()               (línea 707)   - Lee puertas
getJornales()              (línea 857)   - Lee jornales usuario
getTablaSalarial()         (línea 1186)  - Lee tabla salarios
getMapeoPuestos()          (línea 1161)  - Lee mapeo puestos
getPosicionesHastaCont()   (línea 1495)  - Calcula posiciones
```

## Características Principales

### Autenticación
- Login por chapa + contraseña
- Validación contra Supabase (tabla usuarios)
- Contraseñas personalizadas en localStorage

### Caché
- Duración: 5 minutos
- Estructura: `{ data: {...}, timestamp: Date.now() }`
- Limpieza automática: Elimina expirados

### Sincronización CSV
- Automática al abrir pestaña
- Despivotea CSV de jornales
- Deduplica: (chapa, fecha, jornada)
- Nunca sobreescribe

### Fallback
- CSV falla → usa Supabase
- Supabase falla → usa localStorage
- Ambos fallan → estado vacío

### Cálculos
- **Posiciones**: Distancia a puerta (descuenta rojos)
- **Salario**: base × multiplicador + prima - IRPF
- **Quincena**: 01-15 y 16-último día

## Puntos Críticos

1. **Puertas**: Único dato 100% dependiente de CSV
   - No existe tabla en Supabase
   - Sin fallback
   - Se lee en tiempo real (sin caché)

2. **IRPF**: Se edita localmente
   - Guardado en localStorage
   - No se sincroniza a Supabase en tiempo real
   - Auto-refresh cada 10 minutos desde Supabase

3. **Sincronización**: Manual trigger
   - No es tiempo real
   - Se dispara al abrir pestaña
   - Frecuencia controlable

4. **Autenticación**: Sin cifrado real
   - Passwords en localStorage
   - Hash en Supabase (texto plano)
   - Requiere mejora en producción

## Mejoras Futuras Recomendadas

1. Implementar tabla de Puertas en Supabase
2. Sincronización en tiempo real con websockets
3. Cifrado de passwords con bcrypt
4. Auto-guardado de IRPF en Supabase
5. Compresión de datos en localStorage
6. Versionado de datos para auditoría

## Estadísticas

- **Líneas de código**: app.js (~4000), supabase.js (~1700)
- **Tablas Supabase**: 8 principales + 2 deprecated
- **URLs de datos**: 4 Google Sheets públicos
- **Funciones de API**: 20+ en supabase.js
- **Funciones UI**: 8 cargas principales en app.js

## Versión

Análisis completado: Noviembre 2025
Aplicación: Portal Estiba VLC
Rama: claude/fix-csv-assignments-loading-011CV2ZTN2RZF4KJqmDDwmCh

---

Para más información, consulta los documentos detallados.
