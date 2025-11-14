<<<<<<< HEAD
# 🚀 Re-Desplegar Edge Function Actualizada

## ✅ PROBLEMA SOLUCIONADO

He actualizado la Edge Function con:
- ✅ Headers HTTP correctos para acceder al CSV
- ✅ Logging detallado paso a paso
- ✅ Campo `irpf_porcentaje` corregido
- ✅ Estructura de primas corregida
- ✅ Mejor manejo de errores

**El CSV SÍ funciona desde tu navegador**, solo falla desde mi entorno sandbox. Con los headers HTTP actualizados, la Edge Function de Supabase debería poder acceder sin problemas.

---

## 📝 CÓMO RE-DESPLEGAR

### Opción 1: Dashboard de Supabase (MÁS FÁCIL) ⭐

1. **Ve al Dashboard**:
   https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions

2. **Abre la función `swift-function`**:
   - Click en "swift-function" en la lista

3. **Editar código**:
   - Click en "Edit function"
   - **Borra TODO el código actual**
   - Abre el archivo: `supabase/functions/sync-all-tables/index.ts`
   - **Copia TODO el contenido** del archivo
   - **Pégalo** en el editor del Dashboard

4. **Deploy**:
   - Click en "Deploy"
   - Espera a que termine (~30 segundos)
   - Deberías ver: "Successfully deployed"

---

## 🧪 PROBAR LA FUNCIÓN

### Método 1: Desde el Dashboard

1. En la página de la función, click en **"Invoke"**
2. Deja el body vacío: `{}`
3. Click "Send"
4. Verás el resultado y los logs

### Método 2: Desde la terminal

```bash
curl -X POST https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/swift-function \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljc3p6eGtkeGF0Znl0cG1vdmlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzOTY2NSwiZXhwIjoyMDc4MjE1NjY1fQ.LnNbC1ndNvSTSlwYYbcZwXM3iF30IqB5m6mII7IA50I" \
  -H "Content-Type: application/json"
```

---

## 📊 QUÉ BUSCAR EN LOS LOGS

Después de invocar la función, ve a **Logs** en el Dashboard.

### ✅ SI FUNCIONA, DEBERÍAS VER:

```
📥 Sincronizando jornales desde CSV pivotado...
📍 URL: https://docs.google.com/spreadsheets/...
✅ CSV descargado: 15234 caracteres, 120 líneas
📄 Primeros 200 chars: Fecha,Jornada,Empresa,Parte,Buque,orden,T,TC,C1,B,E...
📊 Headers (11): Fecha, Jornada, Empresa, Parte, Buque, orden, T, TC, C1, B, E
📋 Filas parseadas: 119
✅ 245 jornales despivotados
📦 Ejemplo de jornal despivotado: {
  "fecha": "2025-11-12",
  "chapa": "246",
  "puesto": "Conductor de 1a",
  "jornada": "14 a 20",
  "empresa": "APM",
  "buque": "MAERSK HERRERA",
  "parte": "32871",
  "origen": "csv"
}
✅ Jornales: 150 insertados, 95 duplicados, 0 errores
```

### ❌ SI FALLA CON EL CSV, VERÁS:

```
❌ Error sincronizando jornales: {
  message: "HTTP error! status: 403",
  url: "https://docs.google.com/spreadsheets/..."
}
```

### ⚠️ SI HAY ERRORES DE INSERCIÓN, VERÁS:

```
❌ Error insertando jornal: {
  jornal: { fecha: "2025-11-12", chapa: "246", ... },
  error: "column base_sueldo expected",
  code: "23502",
  details: "..."
}
```

---

## 🔍 VERIFICAR QUE SE INSERTARON DATOS

Ve al **Table Editor** de Supabase:

```sql
-- Ver jornales de hoy
SELECT COUNT(*) as jornales_hoy
FROM jornales
WHERE fecha >= CURRENT_DATE;

-- Ver últimos 10 jornales insertados
SELECT *
FROM jornales
ORDER BY id DESC
LIMIT 10;
```

---

## 🔧 SI EL CSV SIGUE DANDO 403

Si después de re-desplegar sigues viendo error 403 en los logs, significa que Google está bloqueando también a Supabase.

En ese caso, tendrías que:
1. Contactar al administrador del Google Sheet para que lo haga público
2. O usar Google Sheets API con credenciales (más complejo)

**PERO** primero prueba con esta versión actualizada, porque los headers HTTP deberían solucionar el problema.

---

## ✅ RESULTADO ESPERADO

Después de re-desplegar y ejecutar:

1. **Jornales**: Debería insertar jornales nuevos del CSV
2. **IRPF**: Debería actualizar valores de `irpf_porcentaje`
3. **Primas**: Debería insertar/actualizar con columnas correctas
4. **Foro**: Debería insertar mensajes nuevos

**Logs detallados** te dirán exactamente qué funcionó y qué falló.

---

## 📞 SIGUIENTE PASO

Después de re-desplegar y probar, **copia y pega aquí**:
1. ✅ El resultado de la invocación (JSON)
2. ✅ Los logs completos

Y te diré si está funcionando correctamente o qué falta arreglar.
=======
# 🚀 Re-Desplegar Edge Function Actualizada

## ✅ PROBLEMA SOLUCIONADO

He actualizado la Edge Function con:
- ✅ Headers HTTP correctos para acceder al CSV
- ✅ Logging detallado paso a paso
- ✅ Campo `irpf_porcentaje` corregido
- ✅ Estructura de primas corregida
- ✅ Mejor manejo de errores

**El CSV SÍ funciona desde tu navegador**, solo falla desde mi entorno sandbox. Con los headers HTTP actualizados, la Edge Function de Supabase debería poder acceder sin problemas.

---

## 📝 CÓMO RE-DESPLEGAR

### Opción 1: Dashboard de Supabase (MÁS FÁCIL) ⭐

1. **Ve al Dashboard**:
   https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq/functions

2. **Abre la función `swift-function`**:
   - Click en "swift-function" en la lista

3. **Editar código**:
   - Click en "Edit function"
   - **Borra TODO el código actual**
   - Abre el archivo: `supabase/functions/sync-all-tables/index.ts`
   - **Copia TODO el contenido** del archivo
   - **Pégalo** en el editor del Dashboard

4. **Deploy**:
   - Click en "Deploy"
   - Espera a que termine (~30 segundos)
   - Deberías ver: "Successfully deployed"

---

## 🧪 PROBAR LA FUNCIÓN

### Método 1: Desde el Dashboard

1. En la página de la función, click en **"Invoke"**
2. Deja el body vacío: `{}`
3. Click "Send"
4. Verás el resultado y los logs

### Método 2: Desde la terminal

```bash
curl -X POST https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/swift-function \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljc3p6eGtkeGF0Znl0cG1vdmlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzOTY2NSwiZXhwIjoyMDc4MjE1NjY1fQ.LnNbC1ndNvSTSlwYYbcZwXM3iF30IqB5m6mII7IA50I" \
  -H "Content-Type: application/json"
```

---

## 📊 QUÉ BUSCAR EN LOS LOGS

Después de invocar la función, ve a **Logs** en el Dashboard.

### ✅ SI FUNCIONA, DEBERÍAS VER:

```
📥 Sincronizando jornales desde CSV pivotado...
📍 URL: https://docs.google.com/spreadsheets/...
✅ CSV descargado: 15234 caracteres, 120 líneas
📄 Primeros 200 chars: Fecha,Jornada,Empresa,Parte,Buque,orden,T,TC,C1,B,E...
📊 Headers (11): Fecha, Jornada, Empresa, Parte, Buque, orden, T, TC, C1, B, E
📋 Filas parseadas: 119
✅ 245 jornales despivotados
📦 Ejemplo de jornal despivotado: {
  "fecha": "2025-11-12",
  "chapa": "246",
  "puesto": "Conductor de 1a",
  "jornada": "14 a 20",
  "empresa": "APM",
  "buque": "MAERSK HERRERA",
  "parte": "32871",
  "origen": "csv"
}
✅ Jornales: 150 insertados, 95 duplicados, 0 errores
```

### ❌ SI FALLA CON EL CSV, VERÁS:

```
❌ Error sincronizando jornales: {
  message: "HTTP error! status: 403",
  url: "https://docs.google.com/spreadsheets/..."
}
```

### ⚠️ SI HAY ERRORES DE INSERCIÓN, VERÁS:

```
❌ Error insertando jornal: {
  jornal: { fecha: "2025-11-12", chapa: "246", ... },
  error: "column base_sueldo expected",
  code: "23502",
  details: "..."
}
```

---

## 🔍 VERIFICAR QUE SE INSERTARON DATOS

Ve al **Table Editor** de Supabase:

```sql
-- Ver jornales de hoy
SELECT COUNT(*) as jornales_hoy
FROM jornales
WHERE fecha >= CURRENT_DATE;

-- Ver últimos 10 jornales insertados
SELECT *
FROM jornales
ORDER BY id DESC
LIMIT 10;
```

---

## 🔧 SI EL CSV SIGUE DANDO 403

Si después de re-desplegar sigues viendo error 403 en los logs, significa que Google está bloqueando también a Supabase.

En ese caso, tendrías que:
1. Contactar al administrador del Google Sheet para que lo haga público
2. O usar Google Sheets API con credenciales (más complejo)

**PERO** primero prueba con esta versión actualizada, porque los headers HTTP deberían solucionar el problema.

---

## ✅ RESULTADO ESPERADO

Después de re-desplegar y ejecutar:

1. **Jornales**: Debería insertar jornales nuevos del CSV
2. **IRPF**: Debería actualizar valores de `irpf_porcentaje`
3. **Primas**: Debería insertar/actualizar con columnas correctas
4. **Foro**: Debería insertar mensajes nuevos

**Logs detallados** te dirán exactamente qué funcionó y qué falló.

---

## 📞 SIGUIENTE PASO

Después de re-desplegar y probar, **copia y pega aquí**:
1. ✅ El resultado de la invocación (JSON)
2. ✅ Los logs completos

Y te diré si está funcionando correctamente o qué falta arreglar.
>>>>>>> ec0b337 (Initial local commit after zip download, including push notifications setup)
