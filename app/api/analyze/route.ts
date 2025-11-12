import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export const maxDuration = 300 // 5 minutos máximo para análisis

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()

    // Validar configuración mínima
    if (!config.model) {
      return NextResponse.json(
        { error: 'No se especificó el modelo' },
        { status: 400 }
      )
    }

    if (!config.images || !Array.isArray(config.images) || config.images.length === 0) {
      return NextResponse.json(
        { error: 'No se especificaron imágenes para analizar' },
        { status: 400 }
      )
    }

    // Ruta al script de detección
    const scriptPath = path.join(process.cwd(), 'detect.py')

    // Configuración del análisis
    const analysisConfig = {
      model: config.model,
      images: config.images,
      confidence: config.confidence || 0.5,
      iou: config.iou || 0.45,
      imgsz: config.imgsz || 640
    }

    console.log('Iniciando análisis con configuración:', {
      model: analysisConfig.model,
      num_images: analysisConfig.images.length,
      confidence: analysisConfig.confidence,
      iou: analysisConfig.iou,
      imgsz: analysisConfig.imgsz
    })

    // Ejecutar script Python (sin argumentos, usaremos stdin)
    const pythonProcess = spawn('python', [scriptPath])

    let stdout = ''
    let stderr = ''

    // Enviar configuración a través de stdin
    pythonProcess.stdin.write(JSON.stringify(analysisConfig))
    pythonProcess.stdin.end()

    // Capturar salida
    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString()
      stdout += output
      console.log(output)
    })

    pythonProcess.stderr.on('data', (data) => {
      const output = data.toString()
      stderr += output
      console.error(output)
    })

    // Esperar a que termine
    const exitCode = await new Promise<number>((resolve) => {
      pythonProcess.on('close', resolve)
    })

    if (exitCode === 0) {
      // Extraer resultado JSON
      const jsonMatch = stdout.match(/__RESULT_JSON__\s*\n(.+)$/s)

      if (!jsonMatch) {
        console.error('No se encontró resultado JSON en la salida')
        return NextResponse.json(
          {
            success: false,
            error: 'No se pudo obtener el resultado del análisis',
            output: stdout
          },
          { status: 500 }
        )
      }

      const result = JSON.parse(jsonMatch[1])

      return NextResponse.json({
        success: true,
        message: `Análisis completado: ${result.total_detections} detecciones en ${result.total_images} imágenes`,
        detections: result.detections,
        total_images: result.total_images,
        total_detections: result.total_detections,
        class_names: result.class_names,
        output: stdout
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Error durante el análisis',
          output: stdout,
          errorOutput: stderr
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error en API de análisis:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
