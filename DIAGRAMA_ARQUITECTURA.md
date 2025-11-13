# DIAGRAMA DE ARQUITECTURA DEL FLUJO DE DATOS

## ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────┐
│                    PORTAL ESTIBA VLC                        │
│  Frontend (JavaScript vanilla + HTML/CSS + localStorage)    │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
        ┌───────────▼────────┐  ┌────▼──────────────┐
        │   Supabase (SQL)   │  │ Google Sheets CSV│
        │  PostgreSQL DB     │  │   (Público)       │
        │                    │  │                   │
        │ - usuarios         │  │ - Jornales        │
        │ - jornales         │  │ - Censo           │
        │ - censo            │  │ - Puertas         │
        │ - primas_custom    │  │ - Primas Custom   │
        │ - config_usuario   │  │                   │
        │ - mensajes_foro    │  └───────────────────┘
        │ - tabla_salarios   │
        │ - mapeo_puestos    │
        └────────────────────┘
```

---

## MATRIZ DE RELACIÓN: PESTAÑA ↔ DATOS ↔ FUENTE

```
┌──────────────────┬──────────────────────┬──────────────────┬───────────────┐
│     PESTAÑA      │    TABLA SUPABASE    │   CSV PÚBLICO    │  localStorage │
├──────────────────┼──────────────────────┼──────────────────┼───────────────┤
│ Dashboard        │ censo                │ puertas          │ usuarios_cache│
│                  │ usuarios             │                  │               │
├──────────────────┼──────────────────────┼──────────────────┼───────────────┤
│ Contratación     │ jornales             │ jornales         │ jornales_hist │
│                  │ usuarios             │                  │               │
├──────────────────┼──────────────────────┼──────────────────┼───────────────┤
│ Mis Jornales     │ jornales             │ jornales         │ jornales_hist │
│                  │ usuarios             │                  │               │
├──────────────────┼──────────────────────┼──────────────────┼───────────────┤
│ Sueldómetro      │ jornales             │ primas_custom    │ irpf_${chapa} │
│                  │ mapeo_puestos        │                  │ locked_values │
│                  │ tabla_salarios       │                  │               │
│                  │ primas_personalizadas│                  │               │
│                  │ configuracion_usuario│                  │               │
├──────────────────┼──────────────────────┼──────────────────┼───────────────┤
│ Puertas          │ ❌ (no existe)       │ puertas          │ (sin caché)   │
├──────────────────┼──────────────────────┼──────────────────┼───────────────┤
│ Censo            │ censo                │ censo            │ censo_actual  │
│                  │ usuarios             │                  │               │
├──────────────────┼──────────────────────┼──────────────────┼───────────────┤
│ Foro             │ mensajes_foro        │ ❌               │ foro_messages │
│                  │ usuarios             │                  │ usuarios_cache│
└──────────────────┴──────────────────────┴──────────────────┴───────────────┘
```

---

## FLUJO DE SINCRONIZACIÓN: CSV ↔ SUPABASE

```
JORNALES
─────────
CSV (Pivotado)                 SUPABASE
   │                              │
   ├─ Despivotea                  │
   │  (fecha × puesto)            │
   │  ↓                           │
   ├─ Valida formato              │
   │  (fechas, jornadas)          │
   │  ↓                           │
   ├─ Busca si existe             │
   │  SELECT * WHERE              │
   │  chapa+fecha+jornada         │
   │  ↓                           │
   ├─ Si NO existe → INSERT       │
   │  origen='csv'                │
   │  ↓                           │
   └──────────────────────────────┤
                                   ↓
                            Tabla: jornales
                            (chapa, fecha, jornada,
                             puesto, empresa,
                             buque, parte, origen)


CENSO
─────
CSV (Simple)                   SUPABASE
   │                              │
   ├─ Parsea                      │
   │  (chapa, posicion, color)    │
   │  ↓                           │
   ├─ Valida                      │
   │  (chapa numeric)             │
   │  ↓                           │
   ├─ UPSERT por fecha            │
   │  UPDATE si existe            │
   │  INSERT si no existe         │
   │  ↓                           │
   └──────────────────────────────┤
                                   ↓
                            Tabla: censo
                            (chapa, posicion,
                             color, fecha)


PRIMAS PERSONALIZADAS
──────────────────────
CSV                            SUPABASE
   │                              │
   ├─ Parsea                      │
   │  (chapa, fecha, jornada,     │
   │   prima, movimientos)        │
   │  ↓                           │
   ├─ Deduplica                   │
   │  Por (chapa+fecha+jornada)   │
   │  Mantiene ÚLTIMO             │
   │  ↓                           │
   ├─ UPSERT                      │
   │  UPDATE si existe            │
   │  INSERT si no existe         │
   │  ↓                           │
   └──────────────────────────────┤
                                   ↓
                       Tabla: primas_personalizadas
                       (chapa, fecha, jornada,
                        prima_personalizada,
                        movimientos_personalizados)
```

---

## CICLO DE VIDA DE DATOS POR PESTAÑA

### 1. DASHBOARD (Información de posición)

```
┌─ LOGIN (handleLogin)
│   │
│   ├─ Valida credenciales
│   │
│   ├─ Guarda en localStorage
│   │   • currentChapa
│   │   • currentUserName
│   │
│   └─ Llama → updateUIForAuthenticatedUser()
│       │
│       └─ Obtiene posiciones
│           │
│           ├─ getPosicionesHastaContratacion(chapa)
│           │   │
│           │   ├─ getPosicionChapa(chapa)
│           │   │   └─ getCenso() → Supabase tabla 'censo'
│           │   │
│           │   ├─ getPuertas() → CSV sin caché
│           │   │
│           │   └─ Calcula posiciones descuento rojos
│           │
│           └─ Renderiza en welcome-message
│               📍 X posiciones a puerta laborable
│               📍 Y posiciones a puerta festiva
```

### 2. CONTRATACIÓN (Próximas 3 jornadas)

```
┌─ ABRE PESTAÑA "Contratación"
│   │
│   └─ loadContratacion()
│       │
│       ├─ Obtiene hoy, mañana, pasado mañana
│       │
│       ├─ Consulta getJornalesHistoricoAcumulado(chapa)
│       │   │
│       │   └─ getJornales(chapa) → Supabase
│       │       │
│       │       └─ Cache: supabase_jornales_${chapa}_*
│       │
│       ├─ Filtra por fechas
│       │
│       ├─ Ordena por fecha + jornada
│       │
│       └─ Renderiza tarjetas con:
│           • Fecha, jornada, puesto
│           • Empresa (con logo)
│           • Buque, parte
```

### 3. MIS JORNALES (Histórico por quincenas)

```
┌─ ABRE PESTAÑA "Mis Jornales"
│   │
│   └─ loadJornales()
│       │
│       ├─ syncJornalesFromCSV()
│       │   │
│       │   ├─ Fetch CSV jornales
│       │   ├─ Despivotea
│       │   ├─ Valida
│       │   └─ INSERT en Supabase (si no existe)
│       │
│       ├─ getJornalesHistoricoAcumulado(chapa)
│       │   └─ Supabase tabla 'jornales'
│       │       └─ Cache: supabase_jornales_${chapa}
│       │
│       ├─ Agrupa por quincena
│       │
│       └─ Renderiza tabla con:
│           • Jornada
│           • Puesto
│           • Estadísticas por quincena
│           • Total jornales, horas, etc.
```

### 4. SUELDÓMETRO (Cálculo de salario)

```
┌─ ABRE PESTAÑA "Sueldómetro"
│   │
│   └─ loadSueldometro()
│       │
│       ├─ Limpia caché de:
│       │   • supabase_jornales_${chapa}
│       │   • supabase_primas_${chapa}
│       │   • supabase_mapeo_puestos
│       │   • supabase_tabla_salarios
│       │
│       ├─ syncPrimasPersonalizadasFromCSV(primasURL)
│       │   │
│       │   ├─ Fetch CSV primas
│       │   ├─ Parsea y deduplica
│       │   └─ UPSERT en Supabase
│       │
│       ├─ Promise.all([
│       │   getJornalesHistoricoAcumulado(chapa),
│       │   getMapeoPuestos(),
│       │   getTablaSalarial()
│       │ ])
│       │
│       ├─ Cálculo para cada jornal:
│       │   │
│       │   ├─ Busca puesto → salario_base
│       │   ├─ Busca jornada → multiplicador
│       │   ├─ base = salario_base × multiplicador
│       │   ├─ prima = prima_personalizada || prima_defecto
│       │   ├─ bruto = base + prima
│       │   ├─ IRPF = bruto × (porcentaje / 100)
│       │   └─ neto = bruto - IRPF
│       │
│       ├─ Agrupa por quincena
│       │
│       ├─ Carga IRPF:
│       │   └─ getUserConfig(chapa) → Supabase
│       │       └─ Fallback localStorage: irpf_${chapa}
│       │
│       └─ Renderiza tabla editable con:
│           • Bases, primas, bruto, IRPF, neto
│           • Bloqueo de IRPF
│           • Estadísticas por quincena
```

### 5. PUERTAS (Posiciones en cola)

```
┌─ ABRE PESTAÑA "Puertas"
│   │
│   └─ loadPuertas()
│       │
│       ├─ getPuertas()
│       │   │
│       │   ├─ Fetch CSV puertas (NO caché)
│       │   │   cache: 'no-store'
│       │   │
│       │   ├─ Parsea CSV:
│       │   │   • Busca fecha en primeras 5 líneas
│       │   │   • Identifica columnas
│       │   │   • Filtra líneas inválidas
│       │   │
│       │   └─ Devuelve puertas por jornada
│       │
│       └─ Renderiza 2 tablas:
│           │
│           ├─ LABORABLES
│           │   (02-08, 08-14, 14-20, 20-02)
│           │
│           └─ FESTIVAS
│               (Festivo)
│
│               Cada fila: Jornada | Puerta SP | Puerta OC
```

### 6. CENSO (Disponibilidad)

```
┌─ ABRE PESTAÑA "Censo"
│   │
│   └─ loadCenso()
│       │
│       ├─ syncCensoFromCSV()
│       │   │
│       │   ├─ Fetch CSV censo
│       │   ├─ Parsea (chapa, posicion, color)
│       │   ├─ Valida
│       │   └─ UPSERT en Supabase por fecha
│       │
│       ├─ getCenso()
│       │   └─ Supabase tabla 'censo'
│       │       └─ Cache: supabase_censo_actual
│       │
│       ├─ Mapea colores numéricos
│       │   0 → red, 1 → orange, 2 → yellow, 3 → blue, 4 → green
│       │
│       ├─ Calcula estadísticas por color
│       │
│       └─ Renderiza:
│           │
│           ├─ Cards de estadísticas
│           │   (count y porcentaje por color)
│           │
│           └─ Tabla completa
│               (Chapa, Posición, Color)
│               Ordenada por posición
```

### 7. FORO (Mensajería)

```
┌─ ABRE PESTAÑA "Foro"
│   │
│   └─ loadForo()
│       │
│       ├─ actualizarCacheNombres()
│       │   │
│       │   ├─ getUsuarios() → Supabase tabla 'usuarios'
│       │   │
│       │   └─ Guarda en localStorage: usuarios_cache
│       │       { chapa: nombre, ... }
│       │
│       ├─ getForoMensajes()
│       │   │
│       │   ├─ Supabase tabla 'mensajes_foro' (últimos 50)
│       │   │
│       │   └─ Cache: supabase_foro_50
│       │
│       │   Fallback: localStorage 'foro_messages'
│       │
│       ├─ Normaliza chapas
│       │   80983 → 983, 0983 → 983
│       │
│       ├─ Obtiene nombre del cache
│       │
│       ├─ Ordena por timestamp (ASC)
│       │
│       └─ Renderiza mensajes con:
│           Nombre | Mensaje | Hora
│
│
├─ ENVIAR MENSAJE (sendForoMessage)
│   │
│   ├─ Valida texto no vacío
│   │
│   ├─ guardarMensajeForo(chapa, texto)
│   │   │
│   │   └─ INSERT en tabla 'mensajes_foro'
│   │
│   ├─ Limpia caché de foro
│   │
│   ├─ Recarga mensajes
│   │
│   └─ Scroll al final
```

---

## FLUJO DE CACHÉ Y EXPIRACIÓN

```
┌─ Datos solicitados
│   │
│   └─ ¿Existe en localStorage con key?
│       │
│       ├─ SÍ ──┐
│       │       │
│       │       ├─ ¿Timestamp < 5 minutos?
│       │       │
│       │       ├─ SÍ → Retorna datos en caché
│       │       │       "Cache HIT ✓"
│       │       │
│       │       └─ NO ──┐
│       │               │
│       │               ├─ Elimina del localStorage
│       │               │  "Cache EXPIRED 🕐"
│       │               │
│       │               └─ Continúa → FETCH
│       │
│       └─ NO → FETCH desde API
│           │
│           ├─ Obtiene datos frescos
│           │
│           ├─ Guarda en localStorage
│           │  { data: {...}, timestamp: Date.now() }
│           │
│           └─ Retorna datos
│               "Cache MISS - LOADED FROM API"
```

---

## PUNTOS DE ENTRADA PRINCIPALES

```
┌──────────────────────────────────────────────────────────┐
│                   ARCHIVO: app.js                        │
├──────────────────────────────────────────────────────────┤
│ Función              │ Línea │ Descripción               │
├──────────────────────┼───────┼──────────────────────────┤
│ handleLogin()        │ 433   │ Autenticación           │
│ updateUIFAuth()      │ 543   │ Actualiza UI + Posiciones│
│ loadContratacion()   │ 906   │ Próximas 3 jornadas     │
│ loadJornales()       │ 1160  │ Histórico por quincenas │
│ loadPuertas()        │ 1674  │ Puertas del día         │
│ loadCenso()          │ 1833  │ Disponibilidad          │
│ loadForo()           │ 2016  │ Mensajes                │
│ loadSueldometro()    │ 2525  │ Cálculo de salarios     │
│ sendForoMessage()    │ 2177  │ Enviar mensaje          │
│ autoRefreshData()    │ 258   │ Auto-actualización 10min│
└──────────────────────┴───────┴──────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                 ARCHIVO: supabase.js                     │
├──────────────────────────────────────────────────────────┤
│ Función                       │ Línea │ Descripción      │
├──────────────────────────────┼───────┼──────────────────┤
│ initSupabase()               │ 33    │ Inicializa client│
│ getCenso(fecha)              │ 145   │ Lee censo        │
│ syncJornalesFromCSV()        │ 206   │ Sync jornales   │
│ syncCensoFromCSV()           │ 385   │ Sync censo      │
│ syncPrimasFromCSV()          │ 497   │ Sync primas     │
│ getPuertas()                 │ 707   │ Lee puertas     │
│ getContrataciones()          │ 823   │ Lee contrata    │
│ getJornales(chapa)           │ 857   │ Lee jornales    │
│ getUsuarios()                │ 948   │ Lee usuarios    │
│ getConfiguracionUsuario()    │ 1030  │ Lee config IRPF │
│ getPrimasPersonalizadas()    │ 1074  │ Lee primas      │
│ getForoMensajes()            │ 1130  │ Lee foro        │
│ getMapeoPuestos()            │ 1161  │ Lee mapeo       │
│ getTablaSalarios()           │ 1186  │ Lee salarios    │
│ guardarMensajeForo()         │ 1216  │ Guarda mensaje  │
│ guardarPrimaPersonalizada()  │ 1276  │ Guarda prima    │
│ guardarJornalManual()        │ 1330  │ Guarda jornal   │
│ getPosicionChapa()           │ 1450  │ Busca posición  │
│ getPosicionesHastaCont()     │ 1495  │ Calcula distancia│
└──────────────────────────────┴───────┴──────────────────┘
```

---

## FLUJO DE ERRORES Y FALLBACK

```
┌─ Solicitud de datos
│   │
│   ├─ TRY → Fetch desde API (Supabase o CSV)
│   │   │
│   │   ├─ ✓ Éxito
│   │   │   └─ Guarda en caché + Retorna
│   │   │
│   │   └─ ✗ Error
│   │       │
│   │       ├─ CSV Error:
│   │       │   └─ Usa Supabase (si está disponible)
│   │       │       └─ Muestra advertencia ⚠️
│   │       │
│   │       ├─ Supabase Error:
│   │       │   └─ Usa localStorage (si existe caché)
│   │       │       └─ Muestra estado vacío o caché antiguo
│   │       │
│   │       └─ Ambas fallan:
│   │           └─ Muestra "Sin datos disponibles"
│   │
│   └─ CATCH
│       └─ Log de error + Graceful degradation
```

---

## URLS DE DATOS CRÍTICAS

| Tipo | URL | Caché | Actualización |
|------|-----|-------|---|
| Jornales CSV | https://docs.google.com/spreadsheets/d/e/2PACX-1vSTtbkA94xqjf81lsR7bLKKtyES2YBDKs8J2T4UrSEan7e5Z_eaptShCA78R1wqUyYyASJxmHj3gDnY/pub?gid=1388412839&single=true&output=csv | 5 min | Manual |
| Censo CSV | https://docs.google.com/spreadsheets/d/e/2PACX-1vTrMuapybwZUEGPR1vsP9p1_nlWvznyl0sPD4xWsNJ7HdXCj1ABY1EpU1um538HHZQyJtoAe5Niwrxq/pub?gid=841547354&single=true&output=csv | 5 min | Manual |
| Puertas CSV | https://docs.google.com/spreadsheets/d/e/2PACX-1vQrQ5bGZDNShEWi1lwx_l1EvOxC0si5kbN8GBxj34rF0FkyGVk6IZOiGk5D91_TZXBHO1mchydFvvUl/pub?gid=3770623&single=true&output=csv | ❌ | Real-time |
| Primas CSV | https://docs.google.com/spreadsheets/d/1j-IaOHXoLEP4bK2hjdn2uAYy8a2chqiQSOw4Nfxoyxc/export?format=csv&gid=1977235036 | 5 min | Sueldómetro |

---

## SECUENCIAS CRÍTICAS

### Secuencia 1: Login → Dashboard

```
Usuario ingresa chapa/pwd
         │
         ├─ handleLogin()
         │   │
         │   ├─ getUsuarios() → Supabase
         │   ├─ Valida credenciales
         │   ├─ Guarda en localStorage
         │   │
         │   └─ updateUIForAuthenticatedUser()
         │       │
         │       └─ getPosicionesHastaContratacion()
         │           │
         │           ├─ getCenso()
         │           ├─ getPuertas()
         │           ├─ Cálculo de posiciones
         │           │
         │           └─ Renderiza welcome-message
         │
         └─ Inicia autoRefreshData (10 min)
```

### Secuencia 2: Sueldómetro → Guardar Prima Personalizada

```
Usuario edita prima en tabla
         │
         ├─ Evento: change/blur en celda
         │
         ├─ guardarPrimaPersonalizada()
         │   │
         │   ├─ Convierte fecha a ISO
         │   │
         │   ├─ UPSERT en Supabase
         │   │   primas_personalizadas
         │   │   (chapa, fecha, jornada)
         │   │
         │   ├─ Limpia caché
         │   │   supabase_primas_${chapa}
         │   │
         │   └─ Recalcula tabla
         │
         └─ Renderiza valor actualizado
```

### Secuencia 3: Abrir Pestaña → Sincronizar CSV

```
Usuario hace click en pestaña
         │
         ├─ loadXXX() (loadJornales, loadCenso, etc)
         │   │
         │   ├─ syncXXXFromCSV()
         │   │   │
         │   │   ├─ Fetch CSV
         │   │   ├─ Parsea datos
         │   │   ├─ Verifica que no exista
         │   │   │   SELECT id WHERE (claves únicas)
         │   │   │
         │   │   └─ Si NO existe → INSERT/UPSERT
         │   │
         │   ├─ getXXX() → Lee desde Supabase
         │   │
         │   └─ Renderiza vista
         │
         └─ Muestra datos sincronizados
```

