import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface BoundingBox {
  id: string
  x: number
  y: number
  width: number
  height: number
  severity: "bajo" | "medio" | "alto"
}

interface ImageAnnotation {
  filename: string
  image: string
  boxes: BoundingBox[]
}

export async function POST(request: Request) {
  try {
    const { images }: { images: ImageAnnotation[] } = await request.json()

    // Filtrar imágenes con anotaciones
    const annotatedImages = images.filter(img => img.boxes.length > 0)

    if (annotatedImages.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No hay imágenes anotadas'
      }, { status: 400 })
    }

    // Dividir dataset: 80% train, 20% val
    const shuffled = [...annotatedImages].sort(() => Math.random() - 0.5)
    const trainCount = Math.floor(shuffled.length * 0.8)
    const trainImages = shuffled.slice(0, trainCount)
    const valImages = shuffled.slice(trainCount)

    // Rutas de carpetas
    const datasetPath = path.join(process.cwd(), 'dataset')
    const trainImgPath = path.join(datasetPath, 'images', 'train')
    const valImgPath = path.join(datasetPath, 'images', 'val')
    const trainLabelPath = path.join(datasetPath, 'labels', 'train')
    const valLabelPath = path.join(datasetPath, 'labels', 'val')

    // Crear directorios si no existen
    await fs.mkdir(trainImgPath, { recursive: true })
    await fs.mkdir(valImgPath, { recursive: true })
    await fs.mkdir(trainLabelPath, { recursive: true })
    await fs.mkdir(valLabelPath, { recursive: true })

    // Mapa de clases
    const classMap = {
      'bajo': 0,
      'medio': 1,
      'alto': 2
    }

    // Guardar imágenes de entrenamiento
    for (const imgData of trainImages) {
      // Guardar imagen
      const base64Data = imgData.image.replace(/^data:image\/\w+;base64,/, '')
      const imageBuffer = Buffer.from(base64Data, 'base64')
      const imagePath = path.join(trainImgPath, imgData.filename)
      await fs.writeFile(imagePath, imageBuffer)

      // Convertir a formato YOLO y guardar
      const yoloAnnotations = await convertToYOLO(imgData, imageBuffer)
      const labelFilename = imgData.filename.replace(/\.[^/.]+$/, '.txt')
      const labelPath = path.join(trainLabelPath, labelFilename)
      await fs.writeFile(labelPath, yoloAnnotations)
    }

    // Guardar imágenes de validación
    for (const imgData of valImages) {
      // Guardar imagen
      const base64Data = imgData.image.replace(/^data:image\/\w+;base64,/, '')
      const imageBuffer = Buffer.from(base64Data, 'base64')
      const imagePath = path.join(valImgPath, imgData.filename)
      await fs.writeFile(imagePath, imageBuffer)

      // Convertir a formato YOLO y guardar
      const yoloAnnotations = await convertToYOLO(imgData, imageBuffer)
      const labelFilename = imgData.filename.replace(/\.[^/.]+$/, '.txt')
      const labelPath = path.join(valLabelPath, labelFilename)
      await fs.writeFile(labelPath, yoloAnnotations)
    }

    return NextResponse.json({
      success: true,
      stats: {
        total: annotatedImages.length,
        train: trainImages.length,
        val: valImages.length
      }
    })

  } catch (error) {
    console.error('Error exporting dataset:', error)
    return NextResponse.json(
      { success: false, error: 'Error al exportar dataset' },
      { status: 500 }
    )
  }
}

// Convertir anotaciones a formato YOLO
async function convertToYOLO(imgData: ImageAnnotation, imageBuffer: Buffer): Promise<string> {
  // Obtener dimensiones de la imagen
  const dimensions = await getImageDimensions(imageBuffer)
  const imgWidth = dimensions.width
  const imgHeight = dimensions.height

  const classMap = {
    'bajo': 0,
    'medio': 1,
    'alto': 2
  }

  // Convertir cada bounding box
  const yoloLines = imgData.boxes.map(box => {
    // Normalizar coordenadas (YOLO usa coordenadas relativas 0-1)
    const xCenter = (box.x + box.width / 2) / imgWidth
    const yCenter = (box.y + box.height / 2) / imgHeight
    const width = box.width / imgWidth
    const height = box.height / imgHeight

    const classId = classMap[box.severity]

    // Formato YOLO: <class> <x_center> <y_center> <width> <height>
    return `${classId} ${xCenter.toFixed(6)} ${yCenter.toFixed(6)} ${width.toFixed(6)} ${height.toFixed(6)}`
  })

  return yoloLines.join('\n')
}

// Obtener dimensiones de la imagen desde el buffer
async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  // Para JPG
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    let i = 2
    while (i < buffer.length) {
      if (buffer[i] === 0xFF) {
        if (buffer[i + 1] === 0xC0 || buffer[i + 1] === 0xC2) {
          return {
            height: buffer.readUInt16BE(i + 5),
            width: buffer.readUInt16BE(i + 7)
          }
        }
        i += 2 + buffer.readUInt16BE(i + 2)
      } else {
        i++
      }
    }
  }

  // Para PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20)
    }
  }

  // Dimensión por defecto
  return { width: 640, height: 640 }
}
