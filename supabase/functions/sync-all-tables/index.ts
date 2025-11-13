// Edge Function para sincronizar automáticamente todas las tablas
// Se ejecuta cada 3 minutos entre 07:00-16:00 (hora de España)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// URLs de fuentes de datos
const URLS = {
  // CSV públicos de la empresa
  jornales: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSTtbkA94xqjf81lsR7bLKKtyES2YBDKs8J2T4UrSEan7e5Z_eaptShCA78R1wqUyYyASJxmHj3gDnY/pub?gid=1388412839&single=true&output=csv',

  // Google Sheets privados (temporalmente hasta migración completa)
  irpf: 'https://docs.google.com/spreadsheets/d/1j-IaOHXoLEP4bK2hjdn2uAYy8a2chqiQSOw4Nfxoyxc/export?format=csv&gid=988244680',
  primas: 'https://docs.google.com/spreadsheets/d/1j-IaOHXoLEP4bK2hjdn2uAYy8a2chqiQSOw4Nfxoyxc/export?format=csv&gid=1977235036',
  foro: 'https://docs.google.com/spreadsheets/d/1j-IaOHXoLEP4bK2hjdn2uAYy8a2chqiQSOw4Nfxoyxc/export?format=csv&gid=464918425'
}

// Mapeo de códigos de puesto a nombres completos
const PUESTO_MAP = {
  'T': 'Trincador',
  'TC': 'Trincador de Coches',
  'C1': 'Conductor de 1a',
  'B': 'Conductor de 2a',
  'E': 'Especialista'
}

interface SyncResult {
  tabla: string
  exito: boolean
  insertados: number
  duplicados: number
  errores: number
  mensaje?: string
}

// Verificar si estamos en horario laboral (07:00-16:00 hora de España)
function esHorarioLaboral(): boolean {
  const ahora = new Date()

  // Convertir a hora de España (UTC+1 en invierno, UTC+2 en verano)
  const opciones: Intl.DateTimeFormatOptions = {
    timeZone: 'Europe/Madrid',
    hour: 'numeric',
    hour12: false
  }
  const horaEspana = parseInt(ahora.toLocaleString('es-ES', opciones))

  return horaEspana >= 7 && horaEspana < 16
}

// Fetch con reintentos y backoff exponencial
async function fetchConReintentos(url: string, maxRetries = 3): Promise<string> {
  for (let intento = 1; intento <= maxRetries; intento++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'text/csv,text/plain,*/*',
          'Accept-Charset': 'utf-8',
          'User-Agent': 'Mozilla/5.0 (compatible; SupabaseEdgeFunction/1.0)'
        },
        cache: 'no-store',
        redirect: 'follow'
      })

      if (response.ok) {
        const buffer = await response.arrayBuffer()
        const decoder = new TextDecoder('utf-8')
        return decoder.decode(buffer)
      }

      if (intento < maxRetries) {
        const waitTime = Math.pow(2, intento) * 1000
        console.warn(`⚠️ Intento ${intento} falló (status: ${response.status}), reintentando en ${waitTime/1000}s...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      if (intento < maxRetries) {
        const waitTime = Math.pow(2, intento) * 1000
        console.warn(`⚠️ Error en intento ${intento}: ${error.message}, reintentando en ${waitTime/1000}s...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      } else {
        throw error
      }
    }
  }

  throw new Error('Máximo de reintentos alcanzado')
}

// Convertir fecha española (dd/mm/yyyy) a ISO (yyyy-mm-dd)
function convertirFechaEspañolAISO(fechaEsp: string): string | null {
  const partes = fechaEsp.trim().split('/')
  if (partes.length !== 3) return null

  const [dia, mes, año] = partes
  const añoCompleto = año.length === 2 ? `20${año}` : año

  const diaNum = parseInt(dia)
  const mesNum = parseInt(mes)
  const añoNum = parseInt(añoCompleto)

  if (isNaN(diaNum) || isNaN(mesNum) || isNaN(añoNum)) return null
  if (diaNum < 1 || diaNum > 31 || mesNum < 1 || mesNum > 12) return null

  const diaStr = diaNum.toString().padStart(2, '0')
  const mesStr = mesNum.toString().padStart(2, '0')

  return `${añoNum}-${mesStr}-${diaStr}`
}

// Parsear CSV genérico (maneja campos con comillas y comas dentro de campos)
function parseCSV(csvText: string): { headers: string[], rows: string[][] } {
  const lines = csvText.split('\n').map(l => l.trim()).filter(l => l !== '')

  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }

  // Función para parsear una línea CSV considerando comillas
  const parseLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        // Toggle estado de comillas
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        // Coma fuera de comillas = separador
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    // Agregar el último campo
    result.push(current.trim())

    return result
  }

  const headers = parseLine(lines[0])
  const rows = lines.slice(1).map(line => parseLine(line))

  return { headers, rows }
}

// 1. SINCRONIZAR JORNALES desde CSV pivotado público
async function sincronizarJornales(supabase: any): Promise<SyncResult> {
  try {
    console.log('📥 Sincronizando jornales desde CSV pivotado...')
    console.log('📍 URL:', URLS.jornales)

    const csvText = await fetchConReintentos(URLS.jornales)
    console.log(`✅ CSV descargado: ${csvText.length} caracteres, ${csvText.split('\n').length} líneas`)
    console.log(`📄 Primeros 200 chars: ${csvText.substring(0, 200)}`)

    const { headers, rows } = parseCSV(csvText)
    console.log(`📊 Headers (${headers.length}): ${headers.join(', ')}`)
    console.log(`📋 Filas parseadas: ${rows.length}`)

    if (rows.length === 0) {
      console.error('❌ CSV vacío después de parsear')
      return { tabla: 'jornales', exito: false, insertados: 0, duplicados: 0, errores: 0, mensaje: 'CSV vacío' }
    }

    // Mapeo flexible de headers del CSV a campos esperados
    const headerMap: Record<string, string[]> = {
      'fecha': ['fc', 'fecha', 'date'],
      'jornada': ['cshorario', 'jornada', 'horario', 'turno'],
      'empresa': ['nomcliabr', 'empresa', 'cliente', 'client'],
      'parte': ['parte', 'part'],
      'buque': ['buque', 'ship', 'vessel'],
      'orden': ['orden', 'order']
    }

    // Identificar índices de columnas con mapeo flexible
    const indices: Record<string, number> = {}
    headers.forEach((header, idx) => {
      const headerLower = header.toLowerCase().trim()

      // Buscar coincidencia en el mapa
      for (const [campo, variantes] of Object.entries(headerMap)) {
        if (variantes.includes(headerLower)) {
          indices[campo] = idx
          break
        }
      }

      // Para puestos (T, TC, C1, B, E) - mantener el código original exacto
      const headerUpper = header.toUpperCase().trim()
      if (Object.keys(PUESTO_MAP).includes(headerUpper)) {
        indices[headerUpper.toLowerCase()] = idx
      }
    })

    console.log(`🗺️ Índices mapeados:`, indices)

    // Despivotear jornales
    const jornales = []
    let filasIgnoradas = 0

    for (const values of rows) {
      // Validar que la fila tenga datos mínimos
      if (values.length < 5) {
        filasIgnoradas++
        continue
      }

      const fecha = values[indices['fecha']] || ''
      const jornada = values[indices['jornada']] || ''
      const empresa = values[indices['empresa']] || ''
      const parte = values[indices['parte']] || ''
      const buque = values[indices['buque']] || '--'

      // Validar fecha (dd/mm/yyyy o dd/mm/yy)
      const fechaRegex = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/
      if (!fecha || !fechaRegex.test(fecha.trim())) {
        filasIgnoradas++
        continue
      }

      // Validar parte (debe ser número)
      const parteNum = parseInt(parte.trim())
      if (!parte || isNaN(parteNum) || parteNum <= 0) {
        filasIgnoradas++
        continue
      }

      // Validar jornada (formatos: "20 a 02", "20-02", "20a02", "02-08", etc.)
      const jornadaLimpia = jornada.replace(/\s+/g, '').toLowerCase()
      const jornadasValidas = ['02-08', '08-14', '14-20', '20-02', 'festivo', '02a08', '08a14', '14a20', '20a02']
      if (!jornadaLimpia || !jornadasValidas.some(j => jornadaLimpia.includes(j.replace('-', '')))) {
        filasIgnoradas++
        continue
      }

      // Despivotear por cada puesto
      for (const [codigoPuesto, nombrePuesto] of Object.entries(PUESTO_MAP)) {
        const idx = indices[codigoPuesto.toLowerCase()]
        if (idx === undefined) continue

        const chapa = values[idx]
        if (!chapa || chapa.trim() === '') continue

        const chapaNum = parseInt(chapa.trim())
        if (isNaN(chapaNum) || chapaNum <= 0) continue

        const fechaISO = convertirFechaEspañolAISO(fecha)
        if (!fechaISO || fechaISO === fecha) continue

        jornales.push({
          fecha: fechaISO,
          chapa: chapa.trim(),
          puesto: nombrePuesto,
          jornada: jornada,
          empresa: empresa,
          buque: buque,
          parte: parte,
          origen: 'csv'
        })
      }
    }

    console.log(`✅ ${jornales.length} jornales despivotados`)
    console.log(`⚠️ ${filasIgnoradas} filas ignoradas (datos inválidos o incompletos)`)

    if (jornales.length > 0) {
      console.log(`📦 Ejemplo de jornal despivotado:`, JSON.stringify(jornales[0], null, 2))
    }

    // Insertar usando upsert (MUCHO más rápido que SELECT + INSERT)
    let insertados = 0
    let actualizados = 0
    let errores = 0

    // Insertar en lotes de 100 para mayor velocidad
    const BATCH_SIZE = 100
    for (let i = 0; i < jornales.length; i += BATCH_SIZE) {
      const batch = jornales.slice(i, i + BATCH_SIZE)

      try {
        const { data, error } = await supabase
          .from('jornales')
          .upsert(batch, {
            onConflict: 'fecha,chapa,jornada',
            ignoreDuplicates: false  // Actualiza si existe
          })
          .select()

        if (error) {
          console.error(`❌ Error en lote ${i}-${i + batch.length}:`, {
            error: error.message,
            code: error.code
          })
          errores += batch.length
        } else {
          // Si data existe, son inserciones nuevas
          insertados += data?.length || batch.length
        }
      } catch (error) {
        console.error(`❌ Excepción en lote ${i}-${i + batch.length}:`, error)
        errores += batch.length
      }
    }

    console.log(`✅ Jornales: ${insertados} procesados (nuevos o actualizados), ${errores} errores`)

    return {
      tabla: 'jornales',
      exito: true,
      insertados,
      duplicados: 0,  // upsert no diferencia duplicados
      errores
    }
  } catch (error) {
    console.error('❌ Error sincronizando jornales:', {
      message: error.message,
      stack: error.stack,
      url: URLS.jornales
    })
    return {
      tabla: 'jornales',
      exito: false,
      insertados: 0,
      duplicados: 0,
      errores: 1,
      mensaje: `Error: ${error.message}`
    }
  }
}

// 2. SINCRONIZAR IRPF desde Google Sheets
async function sincronizarIRPF(supabase: any): Promise<SyncResult> {
  try {
    console.log('📥 Sincronizando IRPF desde Google Sheets...')

    const csvText = await fetchConReintentos(URLS.irpf)
    const { headers, rows } = parseCSV(csvText)

    if (rows.length === 0) {
      return { tabla: 'configuracion_usuario', exito: false, insertados: 0, duplicados: 0, errores: 0, mensaje: 'CSV vacío' }
    }

    // Identificar índices: Chapa, IRPF_Porcentaje, Ultima_Actualizacion
    const indices: Record<string, number> = {}
    headers.forEach((header, idx) => {
      const key = header.toLowerCase().replace(/_/g, '').replace(/porcentaje/g, '').replace(/ultima/g, '').replace(/actualizacion/g, '')
      indices[key] = idx
    })

    let insertados = 0
    let duplicados = 0
    let errores = 0

    for (const values of rows) {
      if (values.length < headers.length) continue

      const chapa = values[indices['chapa'] || 0]
      const irpfStr = values[indices['irpf'] || 1]

      if (!chapa || !irpfStr) continue

      const chapaNum = parseInt(chapa.trim())
      const irpfNum = parseFloat(irpfStr.trim())

      if (isNaN(chapaNum) || isNaN(irpfNum)) continue

      try {
        // Usar upsert para actualizar o insertar
        const { error } = await supabase
          .from('configuracion_usuario')
          .upsert({
            chapa: chapa.trim(),
            irpf_porcentaje: irpfNum
          }, {
            onConflict: 'chapa'
          })

        if (error) {
          console.error(`Error upsert IRPF para chapa ${chapa}:`, error)
          errores++
        } else {
          insertados++
        }
      } catch (error) {
        console.error(`Error procesando IRPF:`, error)
        errores++
      }
    }

    console.log(`✅ IRPF: ${insertados} procesados, ${errores} errores`)

    return {
      tabla: 'configuracion_usuario',
      exito: true,
      insertados,
      duplicados: 0,
      errores
    }
  } catch (error) {
    console.error('❌ Error sincronizando IRPF:', error)
    return {
      tabla: 'configuracion_usuario',
      exito: false,
      insertados: 0,
      duplicados: 0,
      errores: 1,
      mensaje: error.message
    }
  }
}

// 3. SINCRONIZAR PRIMAS PERSONALIZADAS desde Google Sheets
async function sincronizarPrimas(supabase: any): Promise<SyncResult> {
  try {
    console.log('📥 Sincronizando primas desde Google Sheets...')

    const csvText = await fetchConReintentos(URLS.primas)
    const { headers, rows } = parseCSV(csvText)

    if (rows.length === 0) {
      return { tabla: 'primas_personalizadas', exito: false, insertados: 0, duplicados: 0, errores: 0, mensaje: 'CSV vacío' }
    }

    console.log(`📊 Headers de primas (${headers.length}): ${headers.join(', ')}`)
    console.log(`📋 Filas de primas: ${rows.length}`)

    // Mapeo flexible de headers (con y sin espacios, guiones bajos, etc.)
    const headerMap: Record<string, string[]> = {
      'chapa': ['chapa'],
      'fecha': ['fecha', 'date'],
      'jornada': ['jornada', 'turno', 'horario'],
      'prima_personalizada': ['prima_personalizada', 'primapersonalizada', 'prima personalizada'],
      'movimientos_personalizados': ['movimientos_personalizados', 'movimientospersonalizados', 'movimientos personalizados'],
      'relevo': ['relevo'],
      'remate': ['remate']
    }

    // Identificar índices de columnas
    const indices: Record<string, number> = {}
    headers.forEach((header, idx) => {
      const headerLower = header.toLowerCase().trim().replace(/\s+/g, '').replace(/_/g, '')

      for (const [campo, variantes] of Object.entries(headerMap)) {
        const variantesNormalizadas = variantes.map(v => v.toLowerCase().replace(/\s+/g, '').replace(/_/g, ''))
        if (variantesNormalizadas.includes(headerLower)) {
          indices[campo] = idx
          break
        }
      }
    })

    console.log(`🗺️ Índices de primas mapeados:`, indices)

    // Función para convertir números con coma decimal a formato JS (punto)
    const parseNumeroDecimal = (valor: string): number => {
      if (!valor || valor.trim() === '') return 0
      // Reemplazar coma por punto para parseFloat
      const valorNormalizado = valor.trim().replace(',', '.')
      const numero = parseFloat(valorNormalizado)
      return isNaN(numero) ? 0 : numero
    }

    let insertados = 0
    let errores = 0
    let filasIgnoradas = 0

    for (const values of rows) {
      if (values.length < 7) {
        filasIgnoradas++
        continue
      }

      const chapa = values[indices['chapa']] || ''
      const fecha = values[indices['fecha']] || ''
      const jornada = values[indices['jornada']] || ''
      const primaPersonalizada = parseNumeroDecimal(values[indices['prima_personalizada']] || '0')
      const movimientosPersonalizados = parseNumeroDecimal(values[indices['movimientos_personalizados']] || '0')
      const relevo = parseNumeroDecimal(values[indices['relevo']] || '0')
      const remate = parseNumeroDecimal(values[indices['remate']] || '0')

      if (!chapa || !fecha || !jornada) {
        filasIgnoradas++
        continue
      }

      // Convertir fecha de dd/mm/yyyy a yyyy-mm-dd
      const fechaISO = convertirFechaEspañolAISO(fecha)
      if (!fechaISO) {
        filasIgnoradas++
        continue
      }

      try {
        // Usar upsert para actualizar o insertar
        const { error } = await supabase
          .from('primas_personalizadas')
          .upsert({
            chapa: chapa.trim(),
            fecha: fechaISO,
            jornada: jornada.trim(),
            prima_personalizada: primaPersonalizada,
            movimientos_personalizados: movimientosPersonalizados,
            relevo: relevo,
            remate: remate
          }, {
            onConflict: 'chapa,fecha,jornada'
          })

        if (error) {
          console.error(`❌ Error upsert prima (chapa ${chapa}, fecha ${fecha}):`, error)
          errores++
        } else {
          insertados++
        }
      } catch (error) {
        console.error(`❌ Error procesando prima (chapa ${chapa}):`, error)
        errores++
      }
    }

    console.log(`✅ Primas: ${insertados} procesadas, ${errores} errores, ${filasIgnoradas} filas ignoradas`)

    // Log de ejemplo si hay datos
    if (insertados > 0) {
      console.log(`📦 Ejemplo: chapa 582 -> Prima: ${rows[0]?.[indices['prima_personalizada']]}, Movimientos: ${rows[0]?.[indices['movimientos_personalizados']]}, Relevo: ${rows[0]?.[indices['relevo']]}`)
    }

    return {
      tabla: 'primas_personalizadas',
      exito: true,
      insertados,
      duplicados: 0,
      errores
    }
  } catch (error) {
    console.error('❌ Error sincronizando primas:', error)
    return {
      tabla: 'primas_personalizadas',
      exito: false,
      insertados: 0,
      duplicados: 0,
      errores: 1,
      mensaje: error.message
    }
  }
}

// 4. SINCRONIZAR MENSAJES DEL FORO desde Google Sheets
async function sincronizarForo(supabase: any): Promise<SyncResult> {
  try {
    console.log('📥 Sincronizando mensajes del foro desde Google Sheets...')

    const csvText = await fetchConReintentos(URLS.foro)
    const { headers, rows } = parseCSV(csvText)

    if (rows.length === 0) {
      return { tabla: 'mensajes_foro', exito: false, insertados: 0, duplicados: 0, errores: 0, mensaje: 'CSV vacío' }
    }

    console.log(`📊 Headers de foro: ${headers.join(', ')}`)
    console.log(`📋 Total de filas: ${rows.length}`)

    // Detectar índices de columnas automáticamente
    const indices: Record<string, number> = {}
    headers.forEach((header, idx) => {
      const h = header.toLowerCase().trim()
      if (h === 'timestamp' || h.includes('fecha') || h.includes('time')) {
        indices['timestamp'] = idx
      } else if (h === 'chapa') {
        indices['chapa'] = idx
      } else if (h === 'texto' || h === 'mensaje' || h === 'message') {
        indices['texto'] = idx
      }
    })

    console.log(`🔍 Índices detectados:`, indices)

    // Si no se detectaron, asumir orden: timestamp, chapa, texto
    if (!indices['timestamp']) indices['timestamp'] = 0
    if (!indices['chapa']) indices['chapa'] = 1
    if (!indices['texto']) indices['texto'] = 2

    let insertados = 0
    let errores = 0
    const mensajes = []

    // Validar timestamp ISO 8601: YYYY-MM-DDTHH:MM:SS o similar
    const timestampRegex = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/

    for (const values of rows) {
      if (values.length < 3) {
        console.warn(`⚠️ Fila con pocas columnas (${values.length}): ${values.join(',')}`)
        continue
      }

      const timestamp = values[indices['timestamp']]
      const chapa = values[indices['chapa']]
      const texto = values[indices['texto']]

      if (!timestamp || !chapa || !texto) {
        console.warn(`⚠️ Datos incompletos: timestamp="${timestamp}", chapa="${chapa}", texto="${texto?.substring(0, 30)}..."`)
        continue
      }

      // Validar que timestamp sea válido (no una chapa u otro dato)
      if (!timestampRegex.test(timestamp)) {
        console.warn(`⚠️ Timestamp inválido: "${timestamp}" (parece ser ${isNaN(parseInt(timestamp)) ? 'texto' : 'número'})`)
        errores++
        continue
      }

      // Validar que chapa sea un número
      const chapaNum = parseInt(chapa.trim())
      if (isNaN(chapaNum)) {
        console.warn(`⚠️ Chapa inválida: "${chapa}"`)
        errores++
        continue
      }

      mensajes.push({
        timestamp: timestamp.trim(),
        chapa: chapa.trim(),
        texto: texto.trim()
      })
    }

    console.log(`✅ ${mensajes.length} mensajes válidos para insertar`)

    if (mensajes.length > 0) {
      console.log(`📦 Ejemplo de mensaje:`, JSON.stringify(mensajes[0], null, 2))
    }

    // Insertar en lotes usando upsert para evitar duplicados
    const BATCH_SIZE = 50
    for (let i = 0; i < mensajes.length; i += BATCH_SIZE) {
      const batch = mensajes.slice(i, i + BATCH_SIZE)

      try {
        const { data, error } = await supabase
          .from('mensajes_foro')
          .upsert(batch, {
            onConflict: 'timestamp,chapa',
            ignoreDuplicates: true  // Ignorar duplicados sin actualizar
          })
          .select()

        if (error) {
          console.error(`❌ Error en lote de foro ${i}-${i + batch.length}:`, {
            error: error.message,
            code: error.code,
            details: error.details
          })
          errores += batch.length
        } else {
          insertados += data?.length || 0
        }
      } catch (error) {
        console.error(`❌ Excepción en lote de foro ${i}-${i + batch.length}:`, error)
        errores += batch.length
      }
    }

    console.log(`✅ Foro: ${insertados} mensajes procesados, ${errores} errores`)

    return {
      tabla: 'mensajes_foro',
      exito: true,
      insertados,
      duplicados: 0,  // upsert con ignoreDuplicates no los cuenta
      errores
    }
  } catch (error) {
    console.error('❌ Error sincronizando foro:', error)
    return {
      tabla: 'mensajes_foro',
      exito: false,
      insertados: 0,
      duplicados: 0,
      errores: 1,
      mensaje: error.message
    }
  }
}

// Handler principal
serve(async (req) => {
  try {
    // Verificar horario laboral
    if (!esHorarioLaboral()) {
      console.log('⏰ Fuera de horario laboral (07:00-16:00), saltando sincronización')
      return new Response(
        JSON.stringify({
          mensaje: 'Fuera de horario laboral',
          horario: '07:00-16:00 (Europa/Madrid)'
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    console.log('🚀 Iniciando sincronización automática...')

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Ejecutar todas las sincronizaciones en paralelo
    const resultados = await Promise.all([
      sincronizarJornales(supabase),
      sincronizarIRPF(supabase),
      sincronizarPrimas(supabase),
      sincronizarForo(supabase)
    ])

    console.log('✅ Sincronización completada')

    return new Response(
      JSON.stringify({
        exito: true,
        timestamp: new Date().toISOString(),
        resultados
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('❌ Error en sincronización:', error)
    return new Response(
      JSON.stringify({
        exito: false,
        error: error.message
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
