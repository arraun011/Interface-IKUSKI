/**
 * Utilidades para guardar y cargar la biblioteca de imágenes desde archivos JSON
 */

export interface LibraryImageData {
  id: string
  filename: string
  filePath: string
  size?: string
  timestamp?: string
  markedForReport: boolean
}

export interface LibraryData {
  version: string
  savedAt: string
  images: LibraryImageData[]
}

/**
 * Exporta la biblioteca de imágenes a un archivo JSON
 */
export async function exportLibraryToJSON(
  images: Array<{ id: string; filename: string; filePath?: string; size?: string; timestamp?: string }>,
  markedForReport: string[]
): Promise<void> {
  const libraryData: LibraryData = {
    version: '1.0',
    savedAt: new Date().toISOString(),
    images: images.map(img => ({
      id: img.id,
      filename: img.filename,
      filePath: img.filePath || img.filename,
      size: img.size,
      timestamp: img.timestamp,
      markedForReport: markedForReport.includes(img.id)
    }))
  }

  const jsonStr = JSON.stringify(libraryData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `ikuski-biblioteca-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Importa la biblioteca de imágenes desde un archivo JSON
 * Retorna las rutas de los archivos para que se puedan recargar
 */
export async function importLibraryFromJSON(file: File): Promise<LibraryData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonStr = e.target?.result as string
        const libraryData: LibraryData = JSON.parse(jsonStr)

        // Validar estructura
        if (!libraryData.version || !libraryData.images || !Array.isArray(libraryData.images)) {
          throw new Error('Formato de archivo JSON inválido')
        }

        resolve(libraryData)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsText(file)
  })
}

/**
 * Carga imágenes desde rutas de archivo
 * Retorna las imágenes cargadas con sus URLs en base64
 */
export async function loadImagesFromPaths(
  libraryData: LibraryData
): Promise<{
  images: Array<{ id: string; url: string; filename: string; filePath: string; size?: string; timestamp?: string }>
  markedIds: string[]
}> {
  const images: Array<{ id: string; url: string; filename: string; filePath: string; size?: string; timestamp?: string }> = []
  const markedIds: string[] = []

  // En el navegador, no podemos acceder directamente a rutas del sistema de archivos
  // por razones de seguridad. En su lugar, necesitamos que el usuario seleccione los archivos
  console.warn('[Library] No se pueden cargar automáticamente rutas de archivo desde el navegador.')
  console.warn('[Library] El usuario debe seleccionar manualmente los archivos.')

  // Retornar los metadatos para que el usuario sepa qué archivos debe cargar
  libraryData.images.forEach(img => {
    if (img.markedForReport) {
      markedIds.push(img.id)
    }
  })

  return { images, markedIds }
}

/**
 * Valida si un nombre de archivo coincide con uno de la biblioteca
 */
export function matchFileName(filename: string, libraryFilename: string): boolean {
  // Comparación simple por nombre
  return filename === libraryFilename || filename.endsWith(libraryFilename)
}

/**
 * Reconstruye el estado de la biblioteca a partir de archivos cargados manualmente
 * y los metadatos del JSON
 */
export function reconstructLibraryFromFiles(
  files: File[],
  libraryData: LibraryData
): {
  images: Array<{ id: string; file: File; filename: string; filePath: string; size?: string; timestamp?: string }>
  markedIds: string[]
} {
  const images: Array<{ id: string; file: File; filename: string; filePath: string; size?: string; timestamp?: string }> = []
  const markedIds: string[] = []

  // Mapear archivos a metadatos de la biblioteca
  files.forEach(file => {
    const matchedImage = libraryData.images.find(img =>
      matchFileName(file.name, img.filename)
    )

    if (matchedImage) {
      images.push({
        id: matchedImage.id,
        file,
        filename: matchedImage.filename,
        filePath: matchedImage.filePath,
        size: matchedImage.size,
        timestamp: matchedImage.timestamp
      })

      if (matchedImage.markedForReport) {
        markedIds.push(matchedImage.id)
      }
    } else {
      // Archivo no encontrado en la biblioteca, crear nuevo ID
      const newId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      images.push({
        id: newId,
        file,
        filename: file.name,
        filePath: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        timestamp: new Date().toLocaleString('es-ES')
      })
    }
  })

  return { images, markedIds }
}
