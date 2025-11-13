// Edge Function para DEBUG de sincronización de jornales
// Muestra paso a paso qué está pasando

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSTtbkA94xqjf81lsR7bLKKtyES2YBDKs8J2T4UrSEan7e5Z_eaptShCA78R1wqUyYyASJxmHj3gDnY/pub?gid=1388412839&single=true&output=csv'

const PUESTO_MAP = {
  'T': 'Trincador',
  'TC': 'Trincador de Coches',
  'C1': 'Conductor de 1a',
  'B': 'Conductor de 2a',
  'E': 'Especialista'
}

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

function parseCSV(csvText: string): { headers: string[], rows: string[][] } {
  const lines = csvText.split('\n').map(l => l.trim()).filter(l => l !== '')

  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const rows = lines.slice(1).map(line =>
    line.split(',').map(v => v.trim().replace(/"/g, ''))
  )

  return { headers, rows }
}

serve(async (req) => {
  const debug = {
    paso1_fetch: '',
    paso2_headers: [] as string[],
    paso3_primeras_filas: [] as any[],
    paso4_indices: {} as any,
    paso5_jornales_despivotados: [] as any[],
    paso6_validaciones: [] as string[],
    paso7_inserciones: [] as any[],
    errores: [] as string[]
  }

  try {
    // PASO 1: Fetch CSV
    console.log('🔍 PASO 1: Fetching CSV...')
    const response = await fetch(CSV_URL, {
      headers: { 'Accept-Charset': 'utf-8' },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const buffer = await response.arrayBuffer()
    const decoder = new TextDecoder('utf-8')
    const csvText = decoder.decode(buffer)

    debug.paso1_fetch = `✅ CSV descargado: ${csvText.length} caracteres, ${csvText.split('\n').length} líneas`
    console.log(debug.paso1_fetch)

    // PASO 2: Parse headers
    console.log('🔍 PASO 2: Parsing headers...')
    const { headers, rows } = parseCSV(csvText)
    debug.paso2_headers = headers
    console.log(`✅ Headers encontrados: ${headers.join(', ')}`)

    // PASO 3: Mostrar primeras 3 filas
    console.log('🔍 PASO 3: Primeras filas...')
    debug.paso3_primeras_filas = rows.slice(0, 3).map(row => {
      const obj: any = {}
      headers.forEach((h, i) => obj[h] = row[i])
      return obj
    })
    console.log(`✅ Primeras ${debug.paso3_primeras_filas.length} filas parseadas`)

    // PASO 4: Identificar índices
    console.log('🔍 PASO 4: Identificando índices de columnas...')
    const indices: Record<string, number> = {}
    headers.forEach((header, idx) => {
      indices[header.toLowerCase()] = idx
    })
    debug.paso4_indices = indices
    console.log(`✅ Índices: ${JSON.stringify(indices)}`)

    // PASO 5: Despivotear jornales
    console.log('🔍 PASO 5: Despivotando jornales...')
    const jornales = []
    let filas_procesadas = 0
    let filas_saltadas = 0
    let jornales_generados = 0

    for (const values of rows) {
      filas_procesadas++

      if (values.length < headers.length) {
        filas_saltadas++
        debug.paso6_validaciones.push(`Fila ${filas_procesadas}: Saltada - Columnas insuficientes (${values.length} < ${headers.length})`)
        continue
      }

      const fecha = values[indices['fecha']] || ''
      const jornada = values[indices['jornada']] || ''
      const empresa = values[indices['empresa']] || ''
      const parte = values[indices['parte']] || '1'
      const buque = values[indices['buque']] || '--'

      // Validar fecha
      const fechaRegex = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/
      if (!fecha || !fechaRegex.test(fecha)) {
        debug.paso6_validaciones.push(`Fila ${filas_procesadas}: Fecha inválida "${fecha}"`)
        continue
      }

      // Validar jornada
      const jornadaLimpia = jornada.replace(/\s+/g, '').toLowerCase()
      const jornadasValidas = ['02-08', '08-14', '14-20', '20-02', 'festivo', '02a08', '08a14', '14a20', '20a02']
      if (!jornadaLimpia || !jornadasValidas.some(j => jornadaLimpia.includes(j.replace('-', '')))) {
        debug.paso6_validaciones.push(`Fila ${filas_procesadas}: Jornada inválida "${jornada}"`)
        continue
      }

      // Despivotear por cada puesto
      for (const [codigoPuesto, nombrePuesto] of Object.entries(PUESTO_MAP)) {
        const idx = indices[codigoPuesto.toLowerCase()]
        if (idx === undefined) {
          debug.paso6_validaciones.push(`Fila ${filas_procesadas}: Puesto ${codigoPuesto} no encontrado en headers`)
          continue
        }

        const chapa = values[idx]
        if (!chapa || chapa.trim() === '') {
          continue // Esto es normal, no todos los puestos tienen chapa en cada fila
        }

        const chapaNum = parseInt(chapa.trim())
        if (isNaN(chapaNum) || chapaNum <= 0) {
          debug.paso6_validaciones.push(`Fila ${filas_procesadas}: Chapa inválida "${chapa}" para puesto ${codigoPuesto}`)
          continue
        }

        const fechaISO = convertirFechaEspañolAISO(fecha)
        if (!fechaISO) {
          debug.paso6_validaciones.push(`Fila ${filas_procesadas}: Error convirtiendo fecha "${fecha}" a ISO`)
          continue
        }

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
        jornales_generados++
      }
    }

    debug.paso5_jornales_despivotados = jornales.slice(0, 10) // Primeros 10 para debug
    console.log(`✅ Jornales despivotados: ${jornales.length}`)
    console.log(`   - Filas procesadas: ${filas_procesadas}`)
    console.log(`   - Filas saltadas: ${filas_saltadas}`)
    console.log(`   - Jornales generados: ${jornales_generados}`)

    // PASO 6: Conectar a Supabase e intentar insertar
    console.log('🔍 PASO 6: Conectando a Supabase...')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Verificar conexión
    const { data: testData, error: testError } = await supabase
      .from('jornales')
      .select('id')
      .limit(1)

    if (testError) {
      throw new Error(`Error conectando a Supabase: ${testError.message}`)
    }

    console.log(`✅ Conexión a Supabase OK`)

    // PASO 7: Intentar insertar primeros 5 jornales (para debug)
    console.log('🔍 PASO 7: Intentando insertar primeros 5 jornales...')
    let insertados = 0
    let duplicados = 0
    let errores_insert = 0

    const jornalesParaInsertar = jornales.slice(0, 5)

    for (const jornal of jornalesParaInsertar) {
      try {
        // Verificar si existe
        const { data: existente, error: errorBuscar } = await supabase
          .from('jornales')
          .select('id')
          .eq('fecha', jornal.fecha)
          .eq('chapa', jornal.chapa)
          .eq('jornada', jornal.jornada)
          .maybeSingle()

        if (errorBuscar) {
          debug.paso7_inserciones.push({
            jornal,
            resultado: 'error_buscar',
            error: errorBuscar.message
          })
          errores_insert++
          continue
        }

        if (existente) {
          debug.paso7_inserciones.push({
            jornal,
            resultado: 'duplicado',
            id_existente: existente.id
          })
          duplicados++
          continue
        }

        // Insertar
        const { data: insertData, error: errorInsertar } = await supabase
          .from('jornales')
          .insert([jornal])
          .select()

        if (errorInsertar) {
          debug.paso7_inserciones.push({
            jornal,
            resultado: 'error_insertar',
            error: errorInsertar.message
          })
          errores_insert++
        } else {
          debug.paso7_inserciones.push({
            jornal,
            resultado: 'insertado',
            data: insertData
          })
          insertados++
        }
      } catch (error: any) {
        debug.paso7_inserciones.push({
          jornal,
          resultado: 'excepcion',
          error: error.message
        })
        errores_insert++
      }
    }

    console.log(`✅ Prueba de inserción completada: ${insertados} insertados, ${duplicados} duplicados, ${errores_insert} errores`)

    return new Response(
      JSON.stringify({
        exito: true,
        resumen: {
          total_jornales: jornales.length,
          jornales_probados: jornalesParaInsertar.length,
          insertados,
          duplicados,
          errores: errores_insert
        },
        debug
      }, null, 2),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error: any) {
    console.error('❌ Error en debug:', error)
    debug.errores.push(error.message)

    return new Response(
      JSON.stringify({
        exito: false,
        error: error.message,
        stack: error.stack,
        debug
      }, null, 2),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
