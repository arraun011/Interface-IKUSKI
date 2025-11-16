/**
 * Utilidades para comprimir y redimensionar imágenes para reducir tamaño de archivo
 */

/**
 * Comprime una imagen base64 reduciendo su calidad y tamaño
 * @param base64Image - Imagen en formato base64
 * @param maxWidth - Ancho máximo (default: 1200px)
 * @param maxHeight - Alto máximo (default: 1200px)
 * @param quality - Calidad de compresión 0-1 (default: 0.7)
 * @returns Imagen comprimida en base64
 */
export async function compressImage(
  base64Image: string,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspecto
      let width = img.width
      let height = img.height

      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height

        if (width > height) {
          width = maxWidth
          height = width / aspectRatio
        } else {
          height = maxHeight
          width = height * aspectRatio
        }
      }

      // Crear canvas y redimensionar
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('No se pudo obtener contexto del canvas'))
        return
      }

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height)

      // Convertir a base64 con compresión
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
      resolve(compressedBase64)
    }

    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'))
    }

    img.src = base64Image
  })
}

/**
 * Comprime múltiples imágenes en paralelo
 */
export async function compressImages(
  images: string[],
  maxWidth?: number,
  maxHeight?: number,
  quality?: number,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const compressed: string[] = []

  for (let i = 0; i < images.length; i++) {
    try {
      const compressedImage = await compressImage(images[i], maxWidth, maxHeight, quality)
      compressed.push(compressedImage)

      if (onProgress) {
        onProgress(i + 1, images.length)
      }
    } catch (error) {
      console.error(`Error comprimiendo imagen ${i}:`, error)
      // Usar imagen original si falla la compresión
      compressed.push(images[i])
    }
  }

  return compressed
}

/**
 * Calcula el tamaño aproximado de una imagen base64 en MB
 */
export function getBase64Size(base64: string): number {
  // Eliminar header data:image/...;base64,
  const base64Data = base64.split(',')[1] || base64
  const sizeInBytes = (base64Data.length * 3) / 4
  return sizeInBytes / (1024 * 1024) // Convertir a MB
}

/**
 * Calcula el tamaño total de un array de imágenes base64
 */
export function getTotalImagesSize(images: string[]): number {
  return images.reduce((total, img) => total + getBase64Size(img), 0)
}
