# RESUMEN RÁPIDO DEL FLUJO DE DATOS

## Tabla Rápida: Funciones Clave por Pestaña

| Pestaña | Función Principal | API Clave | Fuente de Datos | Caché |
|---------|-------------------|-----------|-----------------|-------|
| **Dashboard** | `updateUIForAuthenticatedUser()` | `getPosicionesHastaContratacion()` | Supabase (censo) + CSV (puertas) | `supabase_censo_actual` |
| **Contratación** | `loadContratacion()` | `getJornalesHistoricoAcumulado()` | Supabase (jornales) | `supabase_jornales_${chapa}` |
| **Mis Jornales** | `loadJornales()` | `syncJornalesFromCSV()` + `getJornales()` | CSV + Supabase | `supabase_jornales_${chapa}` |
| **Sueldómetro** | `loadSueldometro()` | `getTablaSalarial()` + `getMapeoPuestos()` | Supabase + CSV | Limpia caché al cargar |
| **Puertas** | `loadPuertas()` | `getPuertas()` | CSV (sin caché) | ❌ SIN CACHÉ |
| **Censo** | `loadCenso()` | `syncCensoFromCSV()` + `getCenso()` | CSV + Supabase | `supabase_censo_actual` |
| **Foro** | `loadForo()` | `getForoMensajes()` + `guardarMensajeForo()` | Supabase | `supabase_foro_50` |

---

## Tablas de Supabase Utilizadas

| Tabla | Campos Clave | Sincronización | Fallback |
|-------|--------------|-----------------|----------|
| `usuarios` | chapa, nombre, email, posicion, password_hash | Manual | CSV |
| `jornales` | fecha, chapa, jornada, puesto, empresa, buque, parte, origen | CSV → Supabase automático | localStorage |
| `censo` | chapa, posicion, color, fecha | CSV → Supabase automático | caché |
| `configuracion_usuario` | chapa, irpf_porcentaje | Manual | localStorage |
| `primas_personalizadas` | chapa, fecha, jornada, prima_personalizada, movimientos | CSV → Supabase automático | N/A |
| `mensajes_foro` | chapa, texto, timestamp | Manual | localStorage |
| `mapeo_puestos` | codigo, nombre, salario_base | Manual (CSV) | N/A |
| `tabla_salarios` | clave_jornada, descripcion, multiplicador | Manual | N/A |

---

## URLs de Datos Críticas

| Recurso | URL | Actualización |
|---------|-----|---|
| **Jornales** | `2PACX-1vSTtbkA94xqjf81lsR7bLKKtyES2YBDKs8J2T4UrSEan7e5Z_eaptShCA78R1wqUyYyASJxmHj3gDnY` (GID: 1388412839) | Manual |
| **Censo** | `2PACX-1vTrMuapybwZUEGPR1vsP9p1_nlWvznyl0sPD4xWsNJ7HdXCj1ABY1EpU1um538HHZQyJtoAe5Niwrxq` (GID: 841547354) | Manual |
| **Puertas** | `2PACX-1vQrQ5bGZDNShEWi1lwx_l1EvOxC0si5kbN8GBxj34rF0FkyGVk6IZOiGk5D91_TZXBHO1mchydFvvUl` (GID: 3770623) | Diario |
| **Primas** | `1j-IaOHXoLEP4bK2hjdn2uAYy8a2chqiQSOw4Nfxoyxc` (GID: 1977235036) | Manual |

---

## Funciones de Sincronización

```javascript
// Archivo: supabase.js

// JORNALES: Despivotea CSV y sincroniza con Supabase
syncJornalesFromCSV()           // Línea 206
  - Entrada: CSV pivotado (filas=fechas, cols=puestos)
  - Salida: Registros individuales en tabla 'jornales'
  - Deduplicación: Por (chapa, fecha, jornada)
  - Marca: origen='csv'

// CENSO: Parsea CSV y sincroniza con Supabase
syncCensoFromCSV()              // Línea 385
  - Entrada: CSV (chapa, posicion, color)
  - Salida: UPSERT en tabla 'censo'
  - Deduplicación: Por (chapa, fecha)
  - Mapeo: 0→red, 1→orange, 2→yellow, 3→blue, 4→green

// PRIMAS: Parsea CSV y deduplica
syncPrimasPersonalizadasFromCSV() // Línea 497
  - Entrada: CSV primas personalizadas
  - Salida: UPSERT en tabla 'primas_personalizadas'
  - Deduplicación: Por (chapa, fecha, jornada) - mantiene ÚLTIMO
```

---

## Sistema de Caché (localStorage)

### Estructura básica:
```javascript
localStorage.setItem(key, JSON.stringify({
  data: {...},
  timestamp: Date.now()
}))
```

### Duración: 5 minutos

### Limpieza automática:
- Al cargar Sueldómetro: limpia jornales, primas, mapeo, tabla_salarios
- Después de guardar: limpia caché de la entidad afectada

---

## Flujos de Lectura/Escritura

### LECTURA (GET)
1. ¿Existe en localStorage con timestamp válido?
   - SÍ → Retorna caché (Cache HIT)
   - NO → Continúa
2. Fetch desde API (Supabase)
3. Guarda en localStorage
4. Retorna datos

### ESCRITURA (INSERT/UPDATE)
1. Realiza operación en Supabase
2. Limpia caché relevante
3. Retorna resultado
4. Frontend recarga vista si es necesario

---

## Flujo Temporal: Qué se actualiza cuándo

```
USER LOGIN
   └─ updateUIForAuthenticatedUser()
      ├─ getCenso()
      ├─ getPuertas()
      └─ getPosicionesHastaContratacion()
           └─ Renderiza posiciones en Dashboard

CADA 10 MINUTOS (autoRefreshData)
   ├─ getUserConfig(chapa)     → IRPF actualizado
   ├─ syncPrimasFromCSV()      → Primas actualizadas
   └─ Si está en Sueldómetro: loadSueldometro()

AL ABRIR PESTAÑA
   ├─ loadContratacion()       → sincroniza jornales CSV
   ├─ loadJornales()           → sincroniza jornales CSV
   ├─ loadPuertas()            → lee CSV sin caché
   ├─ loadCenso()              → sincroniza censo CSV
   ├─ loadForo()               → carga de Supabase
   └─ loadSueldometro()        → sincroniza primas CSV + limpia caché
```

---

## Cálculo del Sueldómetro

```javascript
// Para cada jornal del usuario:

1. Obtén salario_base de mapeo_puestos
2. Obtén multiplicador de tabla_salarios (por jornada)
3. base = salario_base * multiplicador
4. Busca prima_personalizada para (chapa, fecha, jornada)
5. prima = prima_personalizada || prima_defecto
6. bruto = base + prima
7. irpf = bruto * (porcentaje / 100)
8. neto = bruto - irpf

// Complementos especiales:
- Trincador: +46,94€
- Trincador de Coches: +46,94€

// Agrupación:
- Quincena 1: 01-15
- Quincena 2: 16-último día del mes
```

---

## Cálculo de Posiciones (Dashboard)

```javascript
// Determine si usuario es SP (≤449) u OC (450-535)

// Para puertas laborables:
1. Obtén posición del usuario desde censo
2. Obtén última jornada contratada (máxima puerta)
3. Calcula diferencia
4. Descuenta trabajadores en rojo (no disponibles)

// Resultado: posiciones hasta siguiente contratación
```

---

## Validaciones en CSV

### Jornales:
- Fecha: formato dd/mm/yyyy regex `/^\d{1,2}\/\d{1,2}\/\d{2,4}$/`
- Jornada: debe estar en ['02-08', '08-14', '14-20', '20-02', 'festivo']
- Chapa: número positivo > 0

### Censo:
- Chapa: número positivo
- Posición: número
- Color: numérico 0-4

### Primas:
- Chapa: string
- Fecha: formato dd/mm/yyyy
- Prima: numérico convertible

---

## Mecanismos de Fallback

```
SI FALLA CSV:
├─ Jornales:  usa Supabase + localStorage
├─ Censo:     usa Supabase + caché
├─ Primas:    usa Supabase
└─ Puertas:   SIN FALLBACK (crítico)

SI FALLA SUPABASE:
├─ Jornales:  usa localStorage 'jornales_historico'
├─ Foro:      usa localStorage 'foro_messages'
└─ Otro:      usa caché existente o estado vacío

SI FALLAN AMBOS:
└─ Muestra estado vacío con mensaje de error
```

---

## Campos clave de localStorage

```javascript
// Autenticación
'currentChapa'              // Chapa del usuario actual
'currentUserName'           // Nombre del usuario

// Configuración
'password_overrides'        // Contraseñas personalizadas
'irpf_${chapa}'            // IRPF del usuario
'irpf_locked_${chapa}'     // Flag de bloqueo de IRPF

// Datos
'supabase_censo_actual'    // Cache de censo
'supabase_jornales_${chapa}_*' // Cache de jornales
'supabase_primas_${chapa}_*'   // Cache de primas
'supabase_foro_50'         // Cache de mensajes
'usuarios_cache'           // Mapeo chapa→nombre

// Fallback
'jornales_historico'       // Histórico local de jornales
'foro_messages'            // Backup de mensajes
'lockedValuesKey'          // Valores bloqueados en Sueldómetro
```

---

## Configuración de Supabase

```javascript
// En supabase.js línea 17-24:

const SUPABASE_CONFIG = {
  URL: 'https://icszzxkdxatfytpmoviq.supabase.co',
  ANON_KEY: '[anon key público para lectura]',
  CACHE_DURATION: 5 * 60 * 1000  // 5 minutos
};

// Cliente se inicializa automáticamente al cargar DOM:
window.supabase.createClient(URL, ANON_KEY)
```

---

## Orden de Prioridad de Datos

```
Lectura:
1. localStorage (si existe y no expiró)
2. Supabase (si está disponible)
3. CSV (si está disponible)
4. localStorage antiguo (sin timestamp)
5. Estado vacío

Escritura:
1. Supabase (siempre)
2. localStorage (fallback para ciertos campos)
3. Caché de navegador (automático en fetch)
```

---

## Normalización de Datos

### Fechas:
- CSV/entrada: dd/mm/yyyy
- Supabase interno: yyyy-mm-dd
- Salida al usuario: dd/mm/yyyy

### Chapas:
- Entrada: Cualquier formato
- Normalización en foro: 80983 → 983, 0983 → 983
- Búsqueda: por valor exacto

### Jornadas:
- Entrada: Flexible ("02-08", "02 a 08", "02a08")
- Normalización: "02-08" (formato canónico)

### Colores (Censo):
- Entrada CSV: 0, 1, 2, 3, 4
- Almacenamiento: como está
- Salida: red, orange, yellow, blue, green

---

## Dependencias Externas

- **Supabase**: SDK desde CDN
- **Google Sheets**: URLs de export CSV
- **No hay librerías JS adicionales** (vanilla JavaScript)

---

## Estado de Implementación

| Función | Completitud | Nota |
|---------|-------------|------|
| Lectura de Supabase | ✅ 100% | Todas las tablas implementadas |
| Sincronización CSV | ✅ 100% | Jornales, Censo, Primas personalizadas |
| Caché | ✅ 100% | localStorage con expiración 5 min |
| Autenticación | ✅ 80% | Sin cifrado real (passwords en localStorage) |
| Fallback | ✅ 90% | Excepto Puertas (solo CSV) |
| Escritura Supabase | ✅ 95% | Foro, Primas, Jornales manuales |
| IRPF | ✅ 70% | Local (localStorage), no sincronizado en tiempo real |

---

## Próximas Mejoras Sugeridas

1. **Tabla de Puertas en Supabase**: Actualmente solo CSV
2. **Sincronización en tiempo real**: Usar websockets de Supabase
3. **Cifrado de passwords**: Implementar bcrypt o Supabase Auth
4. **Auto-sincronización IRPF**: Guardar en Supabase al editar
5. **Compresión de datos**: Para optimizar localStorage
6. **Versionado de datos**: Para auditoría de cambios

