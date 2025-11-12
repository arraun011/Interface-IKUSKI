/**
 * Perceptual Hash (pHash) para detección de imágenes duplicadas
 */

export interface ImageHash {
  imageId: string
  hash: string
  filename: string
}

export interface DuplicateGroup {
  hash: string
  images: Array<{
    id: string
    filename: string
    url: string
  }>
}

/**
 * Calcula el pHash de una imagen
 * Basado en DCT (Discrete Cosine Transform)
 */
export async function calculatePHash(imageDataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        // Crear canvas y reducir imagen a 32x32
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('No se pudo obtener contexto del canvas'))
          return
        }

        const size = 32
        canvas.width = size
        canvas.height = size

        // Dibujar imagen redimensionada en escala de grises
        ctx.drawImage(img, 0, 0, size, size)
        const imageData = ctx.getImageData(0, 0, size, size)
        const pixels = imageData.data

        // Convertir a escala de grises
        const grayscale: number[] = []
        for (let i = 0; i < pixels.length; i += 4) {
          const gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]
          grayscale.push(gray)
        }

        // Aplicar DCT simplificada (solo primeros 8x8)
        const dctSize = 8
        const dct = applyDCT(grayscale, size, dctSize)

        // Calcular promedio (excluyendo DC component)
        let sum = 0
        let count = 0
        for (let i = 0; i < dctSize * dctSize; i++) {
          if (i !== 0) { // Skip DC component
            sum += dct[i]
            count++
          }
        }
        const avg = sum / count

        // Generar hash binario
        let hash = ''
        for (let i = 0; i < dctSize * dctSize; i++) {
          if (i !== 0) {
            hash += dct[i] > avg ? '1' : '0'
          }
        }

        // Convertir a hexadecimal
        const hexHash = binaryToHex(hash)
        resolve(hexHash)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Error cargando imagen para pHash'))
    }

    img.src = imageDataUrl
  })
}

/**
 * Aplica DCT (Discrete Cosine Transform) simplificada
 */
function applyDCT(pixels: number[], size: number, dctSize: number): number[] {
  const dct: number[] = []

  for (let u = 0; u < dctSize; u++) {
    for (let v = 0; v < dctSize; v++) {
      let sum = 0
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          const pixel = pixels[y * size + x]
          sum += pixel *
            Math.cos((Math.PI / size) * u * (x + 0.5)) *
            Math.cos((Math.PI / size) * v * (y + 0.5))
        }
      }
      dct.push(sum)
    }
  }

  return dct
}

/**
 * Convierte string binario a hexadecimal
 */
function binaryToHex(binary: string): string {
  let hex = ''
  for (let i = 0; i < binary.length; i += 4) {
    const chunk = binary.substr(i, 4)
    hex += parseInt(chunk, 2).toString(16)
  }
  return hex
}

/**
 * Calcula la distancia de Hamming entre dos hashes
 */
export function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) {
    return Infinity
  }

  let distance = 0
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) {
      distance++
    }
  }
  return distance
}

/**
 * Encuentra grupos de imágenes duplicadas
 * @param hashes Array de hashes calculados
 * @param threshold Umbral de similitud (0-16, menor = más estricto)
 */
export function findDuplicates(
  hashes: ImageHash[],
  threshold: number = 5
): DuplicateGroup[] {
  const groups: Map<string, DuplicateGroup> = new Map()
  const processed = new Set<string>()

  for (let i = 0; i < hashes.length; i++) {
    if (processed.has(hashes[i].imageId)) continue

    const similarImages = [hashes[i]]
    processed.add(hashes[i].imageId)

    for (let j = i + 1; j < hashes.length; j++) {
      if (processed.has(hashes[j].imageId)) continue

      const distance = hammingDistance(hashes[i].hash, hashes[j].hash)

      if (distance <= threshold) {
        similarImages.push(hashes[j])
        processed.add(hashes[j].imageId)
      }
    }

    // Solo agregar si hay duplicados
    if (similarImages.length > 1) {
      const groupKey = `group-${i}`
      groups.set(groupKey, {
        hash: hashes[i].hash,
        images: similarImages.map(h => ({
          id: h.imageId,
          filename: h.filename,
          url: '' // Se llenará después
        }))
      })
    }
  }

  return Array.from(groups.values())
}

/**
 * Procesa un array de imágenes y encuentra duplicados
 */
export async function detectDuplicates(
  images: Array<{ id: string; url: string; filename: string }>,
  threshold: number = 5
): Promise<DuplicateGroup[]> {
  // Calcular hashes para todas las imágenes
  const hashes: ImageHash[] = []

  for (const img of images) {
    try {
      const hash = await calculatePHash(img.url)
      hashes.push({
        imageId: img.id,
        hash,
        filename: img.filename
      })
    } catch (error) {
      console.error(`Error calculando pHash para ${img.filename}:`, error)
    }
  }

  // Encontrar duplicados
  const duplicateGroups = findDuplicates(hashes, threshold)

  // Rellenar URLs de las imágenes
  duplicateGroups.forEach(group => {
    group.images.forEach(img => {
      const original = images.find(i => i.id === img.id)
      if (original) {
        img.url = original.url
      }
    })
  })

  return duplicateGroups
}
