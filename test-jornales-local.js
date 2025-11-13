// Script de prueba LOCAL para debug de jornales
// Ejecutar: node test-jornales-local.js

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSTtbkA94xqjf81lsR7bLKKtyES2YBDKs8J2T4UrSEan7e5Z_eaptShCA78R1wqUyYyASJxmHj3gDnY/pub?gid=1388412839&single=true&output=csv'

const PUESTO_MAP = {
  'T': 'Trincador',
  'TC': 'Trincador de Coches',
  'C1': 'Conductor de 1a',
  'B': 'Conductor de 2a',
  'E': 'Especialista'
}

function convertirFechaEspañolAISO(fechaEsp) {
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

function parseCSV(csvText) {
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

async function testJornales() {
  console.log('🔍 ====== TEST DE SINCRONIZACIÓN DE JORNALES ======\n')

  try {
    // PASO 1: Fetch CSV
    console.log('📥 PASO 1: Descargando CSV...')
    const response = await fetch(CSV_URL)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()
    console.log(`✅ CSV descargado: ${csvText.length} caracteres, ${csvText.split('\n').length} líneas\n`)

    // PASO 2: Parse headers
    console.log('📊 PASO 2: Parseando CSV...')
    const { headers, rows } = parseCSV(csvText)
    console.log(`✅ Headers encontrados (${headers.length}):`)
    console.log(`   ${headers.join(', ')}\n`)

    // PASO 3: Primeras filas
    console.log('📋 PASO 3: Primeras 3 filas del CSV:')
    rows.slice(0, 3).forEach((row, i) => {
      console.log(`\n   Fila ${i + 1}:`)
      headers.forEach((h, j) => {
        console.log(`     ${h}: "${row[j]}"`)
      })
    })
    console.log('')

    // PASO 4: Índices
    console.log('🔢 PASO 4: Índices de columnas:')
    const indices = {}
    headers.forEach((header, idx) => {
      indices[header.toLowerCase()] = idx
      console.log(`   ${header.toLowerCase()} → índice ${idx}`)
    })
    console.log('')

    // PASO 5: Despivotear
    console.log('🔄 PASO 5: Despivotando jornales...')
    const jornales = []
    let filas_procesadas = 0
    let filas_saltadas = 0
    const problemas = []

    for (const values of rows) {
      filas_procesadas++

      if (values.length < headers.length) {
        filas_saltadas++
        problemas.push(`Fila ${filas_procesadas}: Columnas insuficientes (${values.length} < ${headers.length})`)
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
        problemas.push(`Fila ${filas_procesadas}: Fecha inválida "${fecha}"`)
        continue
      }

      // Validar jornada
      const jornadaLimpia = jornada.replace(/\s+/g, '').toLowerCase()
      const jornadasValidas = ['02-08', '08-14', '14-20', '20-02', 'festivo', '02a08', '08a14', '14a20', '20a02']
      if (!jornadaLimpia || !jornadasValidas.some(j => jornadaLimpia.includes(j.replace('-', '')))) {
        problemas.push(`Fila ${filas_procesadas}: Jornada inválida "${jornada}"`)
        continue
      }

      // Despivotear por cada puesto
      for (const [codigoPuesto, nombrePuesto] of Object.entries(PUESTO_MAP)) {
        const idx = indices[codigoPuesto.toLowerCase()]
        if (idx === undefined) {
          problemas.push(`Fila ${filas_procesadas}: Puesto ${codigoPuesto} no encontrado`)
          continue
        }

        const chapa = values[idx]
        if (!chapa || chapa.trim() === '') {
          continue // Normal - no todos los puestos tienen chapa
        }

        const chapaNum = parseInt(chapa.trim())
        if (isNaN(chapaNum) || chapaNum <= 0) {
          problemas.push(`Fila ${filas_procesadas}: Chapa inválida "${chapa}" para puesto ${codigoPuesto}`)
          continue
        }

        const fechaISO = convertirFechaEspañolAISO(fecha)
        if (!fechaISO) {
          problemas.push(`Fila ${filas_procesadas}: Error convirtiendo fecha "${fecha}"`)
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
      }
    }

    console.log(`✅ Resultado del despivotado:`)
    console.log(`   - Filas procesadas: ${filas_procesadas}`)
    console.log(`   - Filas saltadas: ${filas_saltadas}`)
    console.log(`   - Jornales generados: ${jornales.length}\n`)

    // PASO 6: Mostrar primeros 10 jornales
    console.log('📦 PASO 6: Primeros 10 jornales generados:')
    jornales.slice(0, 10).forEach((j, i) => {
      console.log(`\n   Jornal ${i + 1}:`)
      console.log(`     Fecha: ${j.fecha}`)
      console.log(`     Chapa: ${j.chapa}`)
      console.log(`     Puesto: ${j.puesto}`)
      console.log(`     Jornada: ${j.jornada}`)
      console.log(`     Empresa: ${j.empresa}`)
      console.log(`     Buque: ${j.buque}`)
    })
    console.log('')

    // PASO 7: Mostrar problemas encontrados
    if (problemas.length > 0) {
      console.log('⚠️  PASO 7: Problemas encontrados (primeros 20):')
      problemas.slice(0, 20).forEach(p => console.log(`   ${p}`))
      console.log(`   ... total: ${problemas.length} problemas\n`)
    }

    // RESUMEN FINAL
    console.log('📊 ====== RESUMEN ======')
    console.log(`✅ CSV descargado correctamente: ${csvText.split('\n').length} líneas`)
    console.log(`✅ Headers parseados: ${headers.length} columnas`)
    console.log(`✅ Filas procesadas: ${filas_procesadas}`)
    console.log(`✅ Jornales generados: ${jornales.length}`)
    console.log(`⚠️  Problemas encontrados: ${problemas.length}`)

    if (jornales.length === 0) {
      console.log('\n❌ ERROR: NO SE GENERARON JORNALES')
      console.log('   Esto explica por qué no se insertan datos en Supabase.')
      console.log('   Revisa los problemas encontrados arriba.')
    } else {
      console.log('\n✅ Se generaron jornales correctamente.')
      console.log('   Si estos no se están insertando en Supabase, el problema está en:')
      console.log('   1. Conexión a Supabase')
      console.log('   2. Verificación de duplicados')
      console.log('   3. Permisos de inserción')
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    console.error(error.stack)
  }
}

// Ejecutar
testJornales()
