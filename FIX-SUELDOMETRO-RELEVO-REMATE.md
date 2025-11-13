# 🔧 Arreglos del Sueldómetro - Relevo, Remate y Auto-Refresh

## ✅ **PROBLEMAS RESUELTOS**

### **1. ❌ Horas de relevo y remate no se guardaban → ✅ RESUELTO**

**Problema:**
- Al marcar horas de relevo/remate en el Sueldómetro, los valores se mostraban correctamente
- Pero al actualizar la página (F5), los valores desaparecían
- El cálculo mostraba importes incorrectos (como 9646.50€)

**Causa:**
En `supabase.js` línea 1560-1561, la función `guardarPrimaPersonalizada()` **NO estaba guardando** los campos `relevo` y `remate` en Supabase, aunque las columnas **SÍ existen** en la tabla `primas_personalizadas`.

```javascript
// ANTES (NO guardaba relevo ni remate)
const { data, error } = await supabase
  .from('primas_personalizadas')
  .upsert([{
    chapa: chapa,
    fecha: fechaISO,
    jornada: jornada,
    prima_personalizada: parseFloat(primaPersonalizada) || 0,
    movimientos_personalizados: parseInt(movimientosPersonalizados) || 0
    // relevo y remate NO incluidos ❌
  }], { onConflict: 'chapa,fecha,jornada' })
```

**Solución:**
Añadidos los campos `relevo` y `remate` al upsert:

```javascript
// AHORA (SÍ guarda relevo y remate)
const { data, error } = await supabase
  .from('primas_personalizadas')
  .upsert([{
    chapa: chapa,
    fecha: fechaISO,
    jornada: jornada,
    prima_personalizada: parseFloat(primaPersonalizada) || 0,
    movimientos_personalizados: parseInt(movimientosPersonalizados) || 0,
    relevo: parseFloat(horasRelevo) || 0,      // ✅ NUEVO
    remate: parseFloat(horasRemate) || 0       // ✅ NUEVO
  }], { onConflict: 'chapa,fecha,jornada' })
```

---

### **2. ❌ Auto-refresh recargaba el Sueldómetro constantemente → ✅ RESUELTO**

**Problema:**
- Al entrar a cualquier sección (especialmente Sueldómetro), la página se actualizaba automáticamente "al poco tiempo"
- Esto causaba que:
  - Se perdieran cambios sin guardar
  - La vista se recargara cada 5 minutos
  - Primera recarga a los 10 segundos después del login

**Causa:**
En `app.js` líneas 278-281, el auto-refresh ejecutaba `loadSueldometro()` automáticamente:

```javascript
// ANTES (recargaba automáticamente)
if (AppState.currentPage === 'sueldometro') {
  console.log('🔄 Usuario en Sueldómetro, actualizando vista...');
  loadSueldometro();  // ❌ Recarga toda la vista
}
```

**Solución:**
Desactivado el reload automático. El auto-refresh actualiza el caché pero **NO recarga la vista**:

```javascript
// AHORA (NO recarga automáticamente)
if (AppState.currentPage === 'sueldometro') {
  console.log('ℹ️ Usuario en Sueldómetro - datos actualizados en caché pero NO recargando vista para evitar perder cambios');
  // ✅ NO llama a loadSueldometro()
}
```

---

## 📋 **QUÉ HACER AHORA**

### **PASO 1: Actualizar archivos en tu servidor**

Sube los archivos actualizados a tu servidor de hosting:

1. **`supabase.js`** - Ahora guarda relevo y remate correctamente
2. **`app.js`** - Ya no recarga el Sueldómetro automáticamente

### **PASO 2: Limpiar caché del navegador**

Después de subir los archivos:

1. Abre la PWA en el navegador
2. Presiona **Ctrl + Shift + R** (Windows/Linux) o **Cmd + Shift + R** (Mac)
3. Esto forzará la recarga sin caché

### **PASO 3: Verificar que funciona**

#### **Test 1: Horas de relevo/remate se guardan**

1. Abre el **Sueldómetro**
2. Marca **horas de relevo** (checkbox) en un jornal
3. Selecciona **horas de remate** (dropdown) en el mismo jornal
4. Verifica que el **total** incluya los importes correctos
5. **Actualiza la página** (F5)
6. ✅ **Los valores deben mantenerse** (checkbox marcado, dropdown con el valor correcto)

#### **Test 2: No hay auto-refresh molesto**

1. Abre el **Sueldómetro**
2. Edita algún valor (prima, movimientos, relevo, remate)
3. **NO guardes** todavía
4. Espera **10-20 segundos**
5. ✅ **La página NO debe recargarse automáticamente**
6. Tus cambios sin guardar deben seguir ahí

---

## 🔍 **VERIFICACIÓN EN CONSOLA**

Abre **DevTools** (F12) → **Console** y busca estos mensajes:

### **Al guardar una prima con relevo/remate:**

```
💾 Guardando prima en Supabase: {
  chapa: "702",
  fecha: "10/11/2025",
  jornada: "08-14",
  prima_personalizada: 150,
  movimientos_personalizados: 120,
  relevo: 1,        ← ✅ Debe aparecer
  remate: 2         ← ✅ Debe aparecer
}
✅ Prima guardada en Supabase correctamente
```

### **Al ejecutarse el auto-refresh (cada 5 min):**

```
🔄 Auto-refresh: Actualizando primas e IRPF desde Supabase...
✅ Auto-refresh completado: { irpf: 15, primas: 45 }
ℹ️ Usuario en Sueldómetro - datos actualizados en caché pero NO recargando vista para evitar perder cambios
```

**NO debe aparecer:**
```
🔄 Usuario en Sueldómetro, actualizando vista...  ← ❌ Ya no debe aparecer
```

---

## 📊 **ESTRUCTURA DE DATOS EN SUPABASE**

La tabla `primas_personalizadas` tiene esta estructura:

```sql
CREATE TABLE primas_personalizadas (
  id SERIAL PRIMARY KEY,
  chapa TEXT NOT NULL,
  fecha DATE NOT NULL,
  jornada TEXT NOT NULL,
  prima_personalizada DECIMAL(10,2) DEFAULT 0,
  movimientos_personalizados INTEGER DEFAULT 0,
  relevo DECIMAL(5,2) DEFAULT 0,      -- Horas de relevo (0, 1, 2...)
  remate DECIMAL(5,2) DEFAULT 0,      -- Horas de remate (0, 1, 2...)
  ultima_actualizacion TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(chapa, fecha, jornada)
);
```

---

## 🎯 **RESULTADO ESPERADO**

### **Antes:**

❌ Marcas 1h relevo → Total: 350€
❌ Actualizas página (F5) → relevo desaparece → Total: 286€ (incorrecto)
❌ Página se recarga sola cada 5 minutos → pierdes cambios

### **Ahora:**

✅ Marcas 1h relevo → Total: 350€ (64.31€ adicionales)
✅ Actualizas página (F5) → **relevo se mantiene** → Total: 350€ ✅
✅ Página **NO se recarga automáticamente** → no pierdes cambios
✅ Seleccionas 2h remate → Total suma correctamente
✅ Actualizas página → **remate se mantiene** ✅

---

## 🐛 **SI SIGUE FALLANDO**

### **Problema: Los valores de relevo/remate siguen sin guardarse**

1. **Verifica que `supabase.js` está actualizado:**
   - Busca la línea ~1563: `relevo: parseFloat(horasRelevo) || 0,`
   - Busca la línea ~1564: `remate: parseFloat(horasRemate) || 0`
   - Si no están, el archivo no se actualizó correctamente

2. **Limpia caché del navegador:**
   - Chrome/Edge: `Ctrl + Shift + Delete` → Limpiar "Archivos e imágenes en caché"
   - Firefox: `Ctrl + Shift + Delete` → Limpiar "Caché"

3. **Verifica en Supabase:**
   - Ve al **Table Editor** → `primas_personalizadas`
   - Busca un registro recién guardado
   - Verifica que las columnas `relevo` y `remate` tienen valores

### **Problema: La página sigue recargándose automáticamente**

1. **Verifica que `app.js` está actualizado:**
   - Busca la línea ~280: debe decir `"datos actualizados en caché pero NO recargando vista"`
   - NO debe decir `loadSueldometro();`

2. **Verifica en la consola:**
   - NO debe aparecer: `"🔄 Usuario en Sueldómetro, actualizando vista..."`
   - SÍ debe aparecer: `"ℹ️ Usuario en Sueldómetro - datos actualizados en caché..."`

---

## ✅ **CHECKLIST FINAL**

- [ ] `supabase.js` actualizado y subido al servidor
- [ ] `app.js` actualizado y subido al servidor
- [ ] Caché del navegador limpiado (Ctrl + Shift + R)
- [ ] Test: Marcar horas de relevo → guardar → actualizar → **valor se mantiene**
- [ ] Test: Seleccionar horas de remate → guardar → actualizar → **valor se mantiene**
- [ ] Test: Esperar 20 segundos en Sueldómetro → **NO se recarga automáticamente**
- [ ] Consola muestra logs correctos (relevo y remate en el upsert)

---

## 🎉 **RESUMEN**

✅ **Horas de relevo y remate ahora se guardan correctamente en Supabase**
✅ **Los valores se mantienen al actualizar la página**
✅ **El Sueldómetro ya NO se recarga automáticamente**
✅ **No se pierden cambios del usuario**
✅ **El cálculo de totales es correcto y persistente**

**¡TODO DEBERÍA FUNCIONAR CORRECTAMENTE AHORA!** 🚀
