# 🔍 Cómo Desplegar y Ejecutar la Función de Debug de Jornales

## Opción 1: Desplegar desde Dashboard (MÁS FÁCIL)

1. **Ve al Dashboard de Supabase**:
   https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq

2. **Edge Functions > Create a new function**:
   - Name: `debug-jornales`
   - Click "Create function"

3. **Copia el código**:
   - Abre el archivo: `supabase/functions/debug-jornales/index.ts`
   - Copia TODO el contenido
   - Pégalo en el editor del Dashboard
   - Click "Deploy"

4. **Ejecutar la función**:
   - En el Dashboard, click en "Invoke function"
   - O usa este comando:

```bash
curl -X POST https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/debug-jornales \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljc3p6eGtkeGF0Znl0cG1vdmlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzOTY2NSwiZXhwIjoyMDc4MjE1NjY1fQ.LnNbC1ndNvSTSlwYYbcZwXM3iF30IqB5m6mII7IA50I" \
  -H "Content-Type: application/json" | jq
```

---

## Opción 2: Crear archivo local y copiar (SI TIENES SUPABASE CLI)

Si ya tienes Supabase CLI instalado:

```bash
cd /home/user/PortalEstibaVLC
supabase functions deploy debug-jornales
```

Luego ejecutar:

```bash
curl -X POST https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/debug-jornales \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljc3p6eGtkeGF0Znl0cG1vdmlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYzOTY2NSwiZXhwIjoyMDc4MjE1NjY1fQ.LnNbC1ndNvSTSlwYYbcZwXM3iF30IqB5m6mII7IA50I" \
  -H "Content-Type: application/json"
```

---

## ¿Qué hace esta función?

Esta función de DEBUG te mostrará **exactamente** qué está pasando con la sincronización de jornales:

1. **Paso 1**: Descarga el CSV y muestra cuántas líneas tiene
2. **Paso 2**: Parsea los headers y te muestra qué columnas encontró
3. **Paso 3**: Te muestra las primeras 3 filas del CSV
4. **Paso 4**: Identifica los índices de cada columna
5. **Paso 5**: Despivota los jornales y te dice cuántos generó
6. **Paso 6**: Se conecta a Supabase y verifica que funcione
7. **Paso 7**: Intenta insertar los **primeros 5 jornales** y te dice:
   - ✅ Cuántos se insertaron
   - 🔁 Cuántos eran duplicados
   - ❌ Cuántos dieron error y POR QUÉ

---

## Salida Esperada

```json
{
  "exito": true,
  "resumen": {
    "total_jornales": 150,
    "jornales_probados": 5,
    "insertados": 3,
    "duplicados": 2,
    "errores": 0
  },
  "debug": {
    "paso1_fetch": "✅ CSV descargado: 12345 caracteres, 50 líneas",
    "paso2_headers": ["Fecha", "Jornada", "Empresa", "Parte", "Buque", "T", "TC", "C1", "B", "E"],
    "paso3_primeras_filas": [
      { "Fecha": "10/11/24", "Jornada": "02-08", "T": "702", ... },
      { "Fecha": "10/11/24", "Jornada": "08-14", "T": "705", ... },
      { "Fecha": "10/11/24", "Jornada": "14-20", "T": "", ... }
    ],
    "paso4_indices": {
      "fecha": 0,
      "jornada": 1,
      "t": 5,
      "tc": 6,
      ...
    },
    "paso5_jornales_despivotados": [
      {
        "fecha": "2024-11-10",
        "chapa": "702",
        "puesto": "Trincador",
        "jornada": "02-08",
        "empresa": "DGI",
        "buque": "MSC MASHA",
        "parte": "1",
        "origen": "csv"
      },
      ...
    ],
    "paso6_validaciones": [
      "Fila 3: Fecha inválida 'N/A'",
      "Fila 5: Jornada inválida 'Descanso'"
    ],
    "paso7_inserciones": [
      {
        "jornal": { "fecha": "2024-11-10", "chapa": "702", ... },
        "resultado": "insertado",
        "data": { "id": 1234 }
      },
      {
        "jornal": { "fecha": "2024-11-10", "chapa": "705", ... },
        "resultado": "duplicado",
        "id_existente": 999
      },
      {
        "jornal": { "fecha": "2024-11-11", "chapa": "708", ... },
        "resultado": "error_insertar",
        "error": "column base_sueldo expected but missing"
      }
    ]
  }
}
```

---

## ¿Qué buscar en la salida?

### Si `total_jornales` es 0:
- Problema en el parsing del CSV
- Revisa `paso2_headers` y `paso3_primeras_filas`

### Si `total_jornales` > 0 pero `insertados` = 0:
- Todos son duplicados → Revisa `paso7_inserciones`
- Errores al insertar → Revisa `paso7_inserciones[].error`

### Si `errores` > 0:
- Revisa `paso7_inserciones[].error` para ver el mensaje exacto

---

## Siguientes Pasos

Una vez ejecutes esta función de debug, **copia y pega la salida completa** y te diré exactamente qué está fallando y cómo arreglarlo.
