/**
 * Dibuja bounding boxes sobre una imagen y retorna la imagen compuesta en base64
 */

interface BoundingBox {
  x: number
  y: number
  w: number
  h: number
  label?: string
  confidence?: number
  severity?: "alto" | "medio" | "bajo"
}

/**
 * Convierte una imagen con bounding boxes a base64
 */
export async function drawBoxesOnImage(
  imageUrl: string,
  boxes: BoundingBox[]
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        // Crear canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('No se pudo obtener contexto del canvas'))
          return
        }

        // Establecer tamaño del canvas igual a la imagen
        canvas.width = img.width
        canvas.height = img.height

        // Dibujar la imagen original
        ctx.drawImage(img, 0, 0)

        // Dibujar cada bounding box
        boxes.forEach(box => {
          // Detectar si las coordenadas están normalizadas (0-1) o en píxeles
          const isNormalized = box.x <= 1 && box.y <= 1 && box.w <= 1 && box.h <= 1

          // Calcular coordenadas en píxeles
          const x = isNormalized ? box.x * img.width : box.x
          const y = isNormalized ? box.y * img.height : box.y
          const w = isNormalized ? box.w * img.width : box.w
          const h = isNormalized ? box.h * img.height : box.h

          // Determinar color según severidad
          let color = '#10b981' // verde (bajo)
          if (box.severity === 'alto') {
            color = '#ef4444' // rojo
          } else if (box.severity === 'medio') {
            color = '#f59e0b' // naranja
          }

          // Dibujar rectángulo
          ctx.strokeStyle = color
          ctx.lineWidth = 3
          ctx.strokeRect(x, y, w, h)

          // Dibujar fondo semi-transparente para la etiqueta
          const label = box.label || 'Corrosión'
          const confidence = box.confidence ? `${(box.confidence * 100).toFixed(1)}%` : ''
          const text = confidence ? `${label} ${confidence}` : label

          // Medir texto para el fondo
          ctx.font = 'bold 14px Arial'
          const textMetrics = ctx.measureText(text)
          const textWidth = textMetrics.width
          const textHeight = 20

          // Dibujar fondo de la etiqueta
          ctx.fillStyle = color
          ctx.fillRect(x, y - textHeight - 4, textWidth + 12, textHeight + 4)

          // Dibujar texto
          ctx.fillStyle = '#ffffff'
          ctx.textBaseline = 'top'
          ctx.fillText(text, x + 6, y - textHeight)
        })

        // Convertir canvas a base64
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
        resolve(dataUrl)
      }

      img.onerror = () => {
        reject(new Error('Error cargando imagen'))
      }

      img.src = imageUrl
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Procesa múltiples imágenes con sus bounding boxes
 */
export async function processImagesWithBoxes(
  images: Array<{
    url: string
    boxes: BoundingBox[]
  }>
): Promise<Map<string, string>> {
  const processedImages = new Map<string, string>()

  for (const image of images) {
    try {
      if (image.boxes.length > 0) {
        // Si tiene boxes, dibujarlos sobre la imagen
        const imageWithBoxes = await drawBoxesOnImage(image.url, image.boxes)
        processedImages.set(image.url, imageWithBoxes)
      } else {
        // Si no tiene boxes, usar imagen original
        processedImages.set(image.url, image.url)
      }
    } catch (error) {
      console.error('Error procesando imagen:', error)
      // En caso de error, usar imagen original
      processedImages.set(image.url, image.url)
    }
  }

  return processedImages
}
