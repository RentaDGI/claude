/**
 * APPS SCRIPT: Sincronización de Primas e IRPF desde Google Sheets → Supabase
 *
 * Este script lee datos de Google Sheets y los sincroniza con Supabase cada 5 minutos.
 * Se ejecuta automáticamente mediante un trigger temporal.
 *
 * INSTALACIÓN:
 * 1. Abre tu Google Sheet
 * 2. Ve a Extensiones > Apps Script
 * 3. Copia este código en un nuevo archivo
 * 4. Configura SUPABASE_URL y SUPABASE_SERVICE_KEY
 * 5. Ejecuta setupTrigger() manualmente UNA VEZ
 * 6. El script se ejecutará automáticamente cada 5 minutos
 */

// ============================================================================
// CONFIGURACIÓN DE SUPABASE
// ============================================================================

const SUPABASE_URL = 'https://icszzxkdxatfytpmoviq.supabase.co';
const SUPABASE_SERVICE_KEY = 'TU_SERVICE_ROLE_KEY_AQUI'; // IMPORTANTE: Usar SERVICE ROLE KEY, no ANON KEY

// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

/**
 * Función principal que sincroniza primas e IRPF con Supabase
 * Se ejecuta automáticamente cada 5 minutos
 */
function sincronizarPrimasEIRPF() {
  console.log('🔄 Iniciando sincronización de primas e IRPF con Supabase...');

  const startTime = new Date();

  try {
    // 1. Sincronizar configuracion_usuario (IRPF)
    const resultConfig = sincronizarConfiguracionUsuario();
    console.log(`✅ Configuración usuario: ${resultConfig.insertados} insertados, ${resultConfig.actualizados} actualizados, ${resultConfig.errores} errores`);

    // 2. Sincronizar primas_personalizadas
    const resultPrimas = sincronizarPrimasPersonalizadas();
    console.log(`✅ Primas personalizadas: ${resultPrimas.insertados} insertados, ${resultPrimas.actualizados} actualizados, ${resultPrimas.errores} errores`);

    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;

    console.log(`✅ Sincronización completada en ${duration.toFixed(2)}s`);

  } catch (error) {
    console.error('❌ Error en sincronización:', error);
  }
}

/**
 * Sincroniza configuracion_usuario (IRPF) desde Sheets a Supabase
 */
function sincronizarConfiguracionUsuario() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('configuracion_usuario');

  if (!sheet) {
    console.warn('⚠️ Hoja "configuracion_usuario" no encontrada');
    return { insertados: 0, actualizados: 0, errores: 0 };
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  // Encontrar índices de columnas
  const chapaIdx = headers.indexOf('chapa');
  const irpfIdx = headers.indexOf('irpf_porcentaje');

  if (chapaIdx === -1 || irpfIdx === -1) {
    console.error('❌ Columnas requeridas no encontradas en configuracion_usuario');
    return { insertados: 0, actualizados: 0, errores: 0 };
  }

  let insertados = 0;
  let actualizados = 0;
  let errores = 0;

  // Procesar cada fila (saltar header)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const chapa = row[chapaIdx]?.toString().trim();
    const irpf = parseFloat(row[irpfIdx]);

    if (!chapa || isNaN(irpf)) {
      continue; // Saltar filas vacías o inválidas
    }

    try {
      const resultado = upsertConfiguracionUsuario(chapa, irpf);
      if (resultado.success) {
        if (resultado.accion === 'insert') {
          insertados++;
        } else {
          actualizados++;
        }
      } else {
        errores++;
      }
    } catch (error) {
      console.error(`❌ Error procesando chapa ${chapa}:`, error);
      errores++;
    }
  }

  return { insertados, actualizados, errores };
}

/**
 * Sincroniza primas_personalizadas desde Sheets a Supabase
 */
function sincronizarPrimasPersonalizadas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('primas_personalizadas');

  if (!sheet) {
    console.warn('⚠️ Hoja "primas_personalizadas" no encontrada');
    return { insertados: 0, actualizados: 0, errores: 0 };
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  // Encontrar índices de columnas
  const chapaIdx = headers.indexOf('chapa');
  const fechaIdx = headers.indexOf('fecha');
  const jornadaIdx = headers.indexOf('jornada');
  const primaIdx = headers.indexOf('prima_personalizada');
  const movimientosIdx = headers.indexOf('movimientos_personalizados');

  if (chapaIdx === -1 || fechaIdx === -1 || jornadaIdx === -1) {
    console.error('❌ Columnas requeridas no encontradas en primas_personalizadas');
    return { insertados: 0, actualizados: 0, errores: 0 };
  }

  let insertados = 0;
  let actualizados = 0;
  let errores = 0;

  // Procesar cada fila (saltar header)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const chapa = row[chapaIdx]?.toString().trim();
    const fecha = convertirFechaAISO(row[fechaIdx]);
    const jornada = row[jornadaIdx]?.toString().trim();
    const prima = primaIdx !== -1 ? parseFloat(row[primaIdx]) || 0 : 0;
    const movimientos = movimientosIdx !== -1 ? parseInt(row[movimientosIdx]) || 0 : 0;

    if (!chapa || !fecha || !jornada) {
      continue; // Saltar filas vacías o inválidas
    }

    try {
      const resultado = upsertPrimaPersonalizada(chapa, fecha, jornada, prima, movimientos);
      if (resultado.success) {
        if (resultado.accion === 'insert') {
          insertados++;
        } else {
          actualizados++;
        }
      } else {
        errores++;
      }
    } catch (error) {
      console.error(`❌ Error procesando ${chapa} ${fecha} ${jornada}:`, error);
      errores++;
    }
  }

  return { insertados, actualizados, errores };
}

// ============================================================================
// FUNCIONES DE SUPABASE
// ============================================================================

/**
 * Inserta o actualiza configuración de usuario en Supabase
 */
function upsertConfiguracionUsuario(chapa, irpf) {
  const url = `${SUPABASE_URL}/rest/v1/configuracion_usuario`;

  const payload = {
    chapa: chapa,
    irpf_porcentaje: parseFloat(irpf)
  };

  const options = {
    method: 'post',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates' // Upsert: insertar o actualizar
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();

    if (statusCode === 200 || statusCode === 201) {
      return { success: true, accion: statusCode === 201 ? 'insert' : 'update' };
    } else {
      console.error(`Error HTTP ${statusCode}:`, response.getContentText());
      return { success: false };
    }
  } catch (error) {
    console.error('Error en upsert configuración:', error);
    return { success: false };
  }
}

/**
 * Inserta o actualiza prima personalizada en Supabase
 * NOTA: Solo incluye campos que existen en la tabla actual
 */
function upsertPrimaPersonalizada(chapa, fecha, jornada, prima, movimientos) {
  const url = `${SUPABASE_URL}/rest/v1/primas_personalizadas`;

  const payload = {
    chapa: chapa,
    fecha: fecha, // Ya debe estar en formato ISO (yyyy-mm-dd)
    jornada: jornada,
    prima_personalizada: parseFloat(prima) || 0,
    movimientos_personalizados: parseInt(movimientos) || 0
    // horas_relevo y horas_remate: NO incluidas (no existen en la tabla)
  };

  const options = {
    method: 'post',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates' // Upsert: insertar o actualizar
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();

    if (statusCode === 200 || statusCode === 201) {
      return { success: true, accion: statusCode === 201 ? 'insert' : 'update' };
    } else {
      console.error(`Error HTTP ${statusCode}:`, response.getContentText());
      return { success: false };
    }
  } catch (error) {
    console.error('Error en upsert prima:', error);
    return { success: false };
  }
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Convierte fecha de Sheets a formato ISO (yyyy-mm-dd)
 */
function convertirFechaAISO(fecha) {
  if (!fecha) return null;

  // Si ya es un objeto Date
  if (fecha instanceof Date) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Si es string en formato dd/mm/yyyy
  const fechaStr = fecha.toString();
  if (fechaStr.includes('/')) {
    const [day, month, year] = fechaStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Si ya está en formato ISO
  if (fechaStr.includes('-')) {
    return fechaStr;
  }

  return null;
}

// ============================================================================
// CONFIGURACIÓN DE TRIGGER
// ============================================================================

/**
 * Configura el trigger para ejecutar la sincronización cada 5 minutos
 * EJECUTAR ESTA FUNCIÓN MANUALMENTE UNA SOLA VEZ
 */
function setupTrigger() {
  // Eliminar triggers anteriores
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'sincronizarPrimasEIRPF') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Crear nuevo trigger cada 5 minutos
  ScriptApp.newTrigger('sincronizarPrimasEIRPF')
    .timeBased()
    .everyMinutes(5)
    .create();

  console.log('✅ Trigger configurado: sincronizarPrimasEIRPF cada 5 minutos');
}

/**
 * Elimina el trigger de sincronización
 */
function deleteTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'sincronizarPrimasEIRPF') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  console.log('✅ Trigger eliminado');
}
