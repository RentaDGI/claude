# 🧹 Limpiar Datos Incorrectos de Relevo y Remate

## 🐛 **PROBLEMA**

La tabla `primas_personalizadas` en Supabase tiene datos antiguos con valores incorrectos en las columnas `relevo` y `remate`. Probablemente se cargaron antes de las mejoras recientes y contienen valores que no deberían estar ahí (como primas multiplicadas en lugar de horas).

**Ejemplo de dato incorrecto:**
```
relevo: 150.25  ← Esto parece una prima, no horas (debería ser 0, 1 o 2)
remate: 350.50  ← Esto parece un importe, no horas (debería ser 0, 1 o 2)
```

**Valores correctos deberían ser:**
```
relevo: 0 o 1  ← Horas (0 = sin relevo, 1 = 1 hora de relevo)
remate: 0, 1 o 2  ← Horas (0 = sin remate, 1 = 1h, 2 = 2h)
```

---

## ✅ **SOLUCIÓN: Limpiar y Recargar**

### **PASO 1: Ejecutar Script SQL en Supabase**

1. **Ve al Dashboard de Supabase**:
   ```
   https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq
   ```

2. **Abre SQL Editor**:
   - En el menú lateral: **SQL Editor**
   - Click en **"New query"**

3. **Copia y pega este SQL**:

```sql
-- Ver cuántos registros tienen valores incorrectos
SELECT
  COUNT(*) as total_registros,
  COUNT(CASE WHEN relevo > 0 THEN 1 END) as con_relevo,
  COUNT(CASE WHEN remate > 0 THEN 1 END) as con_remate,
  AVG(relevo) as promedio_relevo,
  AVG(remate) as promedio_remate,
  MAX(relevo) as max_relevo,
  MAX(remate) as max_remate
FROM primas_personalizadas;
```

4. **Click en "Run" (o Ctrl+Enter)**

5. **Verás algo como:**
```
total_registros: 150
con_relevo: 45        ← Hay 45 registros con relevo > 0
con_remate: 38        ← Hay 38 registros con remate > 0
promedio_relevo: 120.5  ← INCORRECTO (debería ser 0-1)
promedio_remate: 250.8  ← INCORRECTO (debería ser 0-2)
max_relevo: 350.25    ← INCORRECTO (debería ser máximo 1)
max_remate: 450.50    ← INCORRECTO (debería ser máximo 2)
```

Si ves valores como estos (>10), confirma que están incorrectos.

---

### **PASO 2: Ver Ejemplos de Datos Incorrectos**

```sql
-- Ver algunos ejemplos antes de limpiar
SELECT
  chapa,
  fecha,
  jornada,
  prima_personalizada,
  movimientos_personalizados,
  relevo,
  remate
FROM primas_personalizadas
WHERE relevo > 0 OR remate > 0
ORDER BY relevo DESC, remate DESC
LIMIT 10;
```

**Resultado esperado (datos INCORRECTOS):**
```
chapa  | fecha      | jornada | prima | movimientos | relevo  | remate
-------|------------|---------|-------|-------------|---------|--------
702    | 2025-11-10 | 08-14   | 150   | 120         | 150.25  | 85.50
705    | 2025-11-11 | 14-20   | 180   | 140         | 180.00  | 0
708    | 2025-11-12 | 20-02   | 200   | 150         | 0       | 200.00
```

👆 **Ves cómo relevo y remate tienen valores que parecen primas/importes en lugar de horas?**

---

### **PASO 3: LIMPIAR (Resetear a 0)**

```sql
-- LIMPIAR todos los valores de relevo y remate
UPDATE primas_personalizadas
SET
  relevo = 0,
  remate = 0,
  ultima_actualizacion = NOW()
WHERE relevo > 0 OR remate > 0;
```

**Click "Run"**

**Resultado esperado:**
```
UPDATE 83  ← Actualizó 83 registros
```

---

### **PASO 4: Verificar que se limpiaron**

```sql
-- Verificar que ahora todos están en 0
SELECT
  COUNT(*) as total_registros,
  COUNT(CASE WHEN relevo > 0 THEN 1 END) as con_relevo,
  COUNT(CASE WHEN remate > 0 THEN 1 END) as con_remate
FROM primas_personalizadas;
```

**Resultado esperado (CORRECTO):**
```
total_registros: 150
con_relevo: 0     ← ✅ Todos en 0
con_remate: 0     ← ✅ Todos en 0
```

---

### **PASO 5: Recargar datos desde CSV (Opcional)**

Si tienes un Google Sheet con datos correctos de relevo/remate, vamos a sincronizar:

#### **Opción A: Desde Edge Function (Automático cada 3 min)**

La Edge Function ya está configurada para sincronizar primas desde:
```
https://docs.google.com/spreadsheets/d/1j-IaOHXoLEP4bK2hjdn2uAYy8a2chqiQSOw4Nfxoyxc/export?format=csv&gid=1977235036
```

Espera 3 minutos o invoca manualmente:

```bash
curl -X POST https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/swift-function \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljc3p6eGtkeGF0Znl0cG1vdmlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzOTY2NSwiZXhwIjoyMDc4MjE1NjY1fQ.LnNbC1ndNvSTSlwYYbcZwXM3iF30IqB5m6mII7IA50I" \
  -H "Content-Type: application/json"
```

#### **Opción B: Desde PWA (Manual)**

1. Abre la PWA
2. Ve a **Sueldómetro**
3. Los datos se recargarán automáticamente desde Supabase
4. Ahora todos los valores de relevo/remate estarán en 0
5. **Marca manualmente** las horas de relevo/remate que correspondan
6. Se guardarán correctamente en Supabase

---

## 🔍 **VERIFICAR QUE FUNCIONA**

### **Test 1: Marcar horas de relevo**

1. Abre **Sueldómetro**
2. Busca un jornal de la jornada **08-14**, **14-20** o **20-02** (NO 02-08)
3. Marca el **checkbox de relevo** (H. Relevo)
4. Verifica que el total **suma correctamente** (+ 64.31€ o + 93.55€)
5. **Guarda** (el sistema guarda automáticamente)
6. **Actualiza la página** (F5)
7. ✅ El checkbox debe seguir marcado
8. ✅ El total debe ser el mismo

### **Test 2: Seleccionar horas de remate**

1. En el mismo jornal, selecciona **"1h"** en el dropdown de remate
2. Verifica que el total **suma correctamente** (+ tarifa de remate según jornada)
3. **Actualiza la página** (F5)
4. ✅ El dropdown debe mostrar **"1h"** seleccionado
5. ✅ El total debe ser el mismo

### **Test 3: Verificar en Supabase**

```sql
-- Ver el jornal que acabas de editar
SELECT
  chapa,
  fecha,
  jornada,
  prima_personalizada,
  movimientos_personalizados,
  relevo,
  remate
FROM primas_personalizadas
WHERE chapa = '702'  -- Tu chapa
  AND fecha >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY fecha DESC, jornada
LIMIT 5;
```

**Resultado esperado (CORRECTO):**
```
chapa | fecha      | jornada | prima | movimientos | relevo | remate
------|------------|---------|-------|-------------|--------|--------
702   | 2025-11-13 | 08-14   | 150   | 120         | 1      | 0
702   | 2025-11-13 | 14-20   | 180   | 140         | 0      | 1
702   | 2025-11-12 | 20-02   | 200   | 150         | 1      | 2
```

👆 **Ahora relevo y remate tienen valores correctos (0, 1 o 2 horas)**

---

## 🧮 **CÁLCULO CORRECTO DE IMPORTES**

### **Horas de Relevo:**

**Tarifa normal (64.31€/h):**
- Laborables: 08-14, 14-20, 20-02
- Sábados: 08-14

**Tarifa especial (93.55€/h):**
- Festivos y domingos: todas las jornadas
- Sábados: 14-20 y 20-02

**Ejemplo:**
```
Jornal: 14-20 SÁBADO
Base + Prima: 286.50€
+ Relevo (1h): + 93.55€
= Total: 380.05€
```

### **Horas de Remate:**

Varía según jornada y tipo de día. Ejemplo:

```
Jornal: 14-20 SÁBADO
Base + Prima: 286.50€
+ Remate (2h): + (78.37€ × 2) = + 156.74€
= Total: 443.24€
```

---

## 📊 **ESTRUCTURA CORRECTA EN SUPABASE**

```sql
CREATE TABLE primas_personalizadas (
  id SERIAL PRIMARY KEY,
  chapa TEXT NOT NULL,
  fecha DATE NOT NULL,
  jornada TEXT NOT NULL,
  prima_personalizada DECIMAL(10,2) DEFAULT 0,
  movimientos_personalizados INTEGER DEFAULT 0,
  relevo DECIMAL(5,2) DEFAULT 0,    -- HORAS (0, 1, 2...) NO importes
  remate DECIMAL(5,2) DEFAULT 0,    -- HORAS (0, 1, 2...) NO importes
  ultima_actualizacion TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(chapa, fecha, jornada)
);
```

**Valores válidos:**
- `relevo`: 0 o 1 (horas)
- `remate`: 0, 1 o 2 (horas)

**Valores INCORRECTOS (datos antiguos):**
- `relevo`: 64.31, 93.55, 150.25 ← Estos son importes, no horas ❌
- `remate`: 78.37, 156.74, 250.50 ← Estos son importes, no horas ❌

---

## ✅ **CHECKLIST**

- [ ] Ejecutar SQL para ver datos incorrectos (PASO 1-2)
- [ ] Ejecutar SQL para limpiar (PASO 3)
- [ ] Verificar que todos están en 0 (PASO 4)
- [ ] Actualizar archivos en servidor (supabase.js y app.js)
- [ ] Limpiar caché del navegador (Ctrl + Shift + R)
- [ ] Probar marcar relevo → actualizar → valor se mantiene ✅
- [ ] Probar seleccionar remate → actualizar → valor se mantiene ✅
- [ ] Verificar en Supabase que valores son 0, 1 o 2 (no >10)

---

## 🎯 **RESUMEN**

**Problema:** Datos antiguos con valores incorrectos (importes en lugar de horas)
**Solución:** Limpiar todos a 0 con UPDATE
**Resultado:** Ahora se pueden marcar correctamente desde el Sueldómetro
**Persistencia:** Los valores se guardan en Supabase con el código actualizado

**¡Ejecuta el SQL y prueba!** 🚀
