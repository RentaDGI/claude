# 🚀 Guía Rápida de Despliegue

## Resumen
Esta guía te llevará desde cero hasta tener sincronización automática funcionando en **10 minutos**.

---

## ✅ Checklist Rápido

- [ ] Supabase CLI instalado
- [ ] Login en Supabase
- [ ] Proyecto vinculado
- [ ] Tabla `mensajes_foro` creada
- [ ] Edge Function desplegada
- [ ] Service Role Key configurada
- [ ] Cron Job activado
- [ ] Prueba manual exitosa

---

## 📝 Pasos

### 1. Instalar Supabase CLI (1 min)

```bash
npm install -g supabase
```

### 2. Login y Vincular Proyecto (2 min)

```bash
# Login
supabase login

# Vincular proyecto
supabase link --project-ref icszzxkdxatfytpmoviq
```

### 3. Crear Tabla mensajes_foro (1 min)

Ve al **Dashboard de Supabase**:
- SQL Editor
- Copia y pega el contenido de `supabase/schema-mensajes-foro.sql`
- Ejecutar (Run)

### 4. Desplegar Edge Function (2 min)

```bash
cd /ruta/a/PortalEstibaVLC
supabase functions deploy sync-all-tables
```

### 5. Configurar Service Role Key (2 min)

1. Ve al Dashboard: https://supabase.com/dashboard/project/icszzxkdxatfytpmoviq
2. Settings > API
3. Copia el **service_role** key (el secreto, NO el anon key)
4. Settings > Edge Functions > Secrets
5. Añadir Secret:
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: [pega aquí tu service_role key]
6. Save

### 6. Configurar Cron Job (2 min)

Ve al Dashboard > SQL Editor:
- Copia y pega el contenido de `supabase/cron-config.sql`
- Ejecutar (Run)
- Verifica que aparezca: "Successfully scheduled job"

### 7. Probar Manualmente (1 min)

**Opción A: Desde el Dashboard**
- Edge Functions > sync-all-tables
- Invoke function
- Ver resultado

**Opción B: Desde la terminal**
```bash
curl -X POST https://icszzxkdxatfytpmoviq.supabase.co/functions/v1/sync-all-tables \
  -H "Authorization: Bearer [TU_SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json"
```

---

## ✅ Verificación

### Comprobar que el Cron Job está activo

SQL Editor:
```sql
SELECT * FROM cron.job WHERE jobname = 'sync-all-tables-auto';
```

Deberías ver:
- `jobname`: sync-all-tables-auto
- `schedule`: */3 7-15 * * *
- `active`: true

### Comprobar Historial de Ejecuciones

```sql
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 5;
```

Deberías ver ejecuciones cada 3 minutos entre 07:00-15:59.

### Ver Logs de la Edge Function

Dashboard:
- Edge Functions > sync-all-tables
- Logs
- Buscar logs recientes con resultados de sincronización

---

## 🎯 Resultado Esperado

Después de estos pasos:

✅ La Edge Function se ejecuta automáticamente cada 3 minutos entre 07:00-16:00
✅ Los jornales se sincronizan del CSV público sin depender de usuarios
✅ IRPF, Primas y Foro se sincronizan de Google Sheets (temporal)
✅ Deduplicación automática funciona correctamente
✅ Reintentos con backoff exponencial ante fallos

---

## 🔧 Troubleshooting Express

### "Error: Command not found: supabase"
```bash
npm install -g supabase
```

### "Error: Not logged in"
```bash
supabase login
```

### "Error 401: Unauthorized"
- Verifica que configuraste `SUPABASE_SERVICE_ROLE_KEY` en Secrets
- Usa el **service_role** key, NO el anon key

### "Error: pg_cron extension not found"
- Ejecuta en SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### La función no se ejecuta automáticamente
- Verifica horario (solo 07:00-16:00)
- Ejecuta manualmente para verificar
- Revisa logs en Dashboard

---

## 📊 Monitoreo Diario

Cada día, verifica:

1. **Dashboard > Edge Functions > sync-all-tables > Logs**
   - ¿Hay errores?
   - ¿Cuántos jornales se insertan?

2. **SQL Editor:**
```sql
-- Ver última ejecución
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'sync-all-tables-auto')
ORDER BY start_time DESC
LIMIT 1;

-- Ver estadísticas de jornales hoy
SELECT COUNT(*) as total_jornales_hoy
FROM jornales
WHERE fecha = CURRENT_DATE;
```

---

## 🎉 ¡Listo!

Tu sistema de sincronización automática está funcionando. Los jornales se actualizarán automáticamente cada 3 minutos sin depender de que usuarios naveguen la PWA.

**Próximos pasos (opcional):**
- Ajustar frecuencia del cron si es necesario (actualmente cada 3 minutos)
- Monitorear logs durante 1 semana
- Cuando migres completamente a Supabase, eliminar sincronización de Google Sheets
