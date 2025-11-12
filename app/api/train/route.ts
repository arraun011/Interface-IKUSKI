import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export const maxDuration = 3600 // 1 hora máximo para entrenamiento

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()

    // Validar configuración mínima
    if (!config.model) {
      return NextResponse.json(
        { success: false, error: 'No se especificó el modelo' },
        { status: 400 }
      )
    }

    if (!config.data) {
      return NextResponse.json(
        { success: false, error: 'No se especificó el dataset YAML' },
        { status: 400 }
      )
    }

    // Ruta al script de entrenamiento
    const scriptPath = path.join(process.cwd(), 'train.py')

    // Verificar si existe el script
    const fs = require('fs')
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Script de entrenamiento no encontrado. Asegúrate de que train.py existe en la raíz del proyecto.',
          details: `Ruta esperada: ${scriptPath}`
        },
        { status: 500 }
      )
    }

    // Configuración por defecto
    const trainingConfig = {
      model: config.model,
      data: config.data,
      epochs: config.epochs || 100,
      imgsz: config.imgsz || 640,
      batch: config.batch || 16,
      name: config.name || 'rust_detection',
      project: config.project || './peso'
    }

    // Ejecutar script Python (sin argumentos, usaremos stdin)
    let pythonProcess
    try {
      pythonProcess = spawn('python', [scriptPath])
    } catch (spawnError: any) {
      return NextResponse.json(
        {
          success: false,
          error: 'No se pudo ejecutar Python. Asegúrate de que Python está instalado y en el PATH.',
          details: spawnError.message
        },
        { status: 500 }
      )
    }

    let stdout = ''
    let stderr = ''

    // Manejar error de spawn
    pythonProcess.on('error', (error) => {
      console.error('Error al iniciar Python:', error)
    })

    // Enviar configuración a través de stdin
    try {
      pythonProcess.stdin.write(JSON.stringify(trainingConfig))
      pythonProcess.stdin.end()
    } catch (stdinError) {
      console.error('Error escribiendo configuración:', stdinError)
    }

    // Capturar salida
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString()
      console.log(data.toString())
    })

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString()
      console.error(data.toString())
    })

    // Esperar a que termine
    const exitCode = await new Promise<number>((resolve) => {
      pythonProcess.on('close', resolve)
      pythonProcess.on('error', () => resolve(-1))
    })

    // Si el proceso no inició correctamente
    if (exitCode === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Python no está disponible en el sistema. Instala Python 3.8+ y las dependencias necesarias (ultralytics, opencv-python, etc.)',
          errorOutput: stderr || 'No se pudo ejecutar el proceso de Python'
        },
        { status: 500 }
      )
    }

    if (exitCode === 0) {
      // Extraer resultado JSON
      const jsonMatch = stdout.match(/__RESULT_JSON__\s*\n(.+)$/s)
      const result = jsonMatch ? JSON.parse(jsonMatch[1]) : { success: true }

      return NextResponse.json({
        success: true,
        message: 'Entrenamiento completado exitosamente',
        output: stdout,
        ...result
      })
    } else {
      // Intentar extraer un mensaje de error más específico
      let errorMessage = 'Error durante el entrenamiento'

      if (stderr.includes('ModuleNotFoundError')) {
        errorMessage = 'Faltan dependencias de Python. Instala: pip install ultralytics opencv-python'
      } else if (stderr.includes('FileNotFoundError')) {
        errorMessage = 'No se encontró el archivo de dataset o las imágenes'
      } else if (stderr.includes('CUDA') || stderr.includes('GPU')) {
        errorMessage = 'Error con GPU/CUDA. Intenta entrenar con CPU (device=cpu)'
      } else if (stderr) {
        // Tomar las últimas líneas del error
        const errorLines = stderr.trim().split('\n').slice(-3)
        errorMessage = errorLines.join(' | ')
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          output: stdout,
          errorOutput: stderr,
          exitCode
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error en API de entrenamiento:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
