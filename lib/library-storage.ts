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
  imageData?: string // Base64 de la imagen para persistencia completa
}

export interface LibraryData {
  version: string
  savedAt: string
  instructions: string
  mode: 'metadata' | 'full' // 'metadata' = solo rutas, 'full' = con imágenes base64
  images: LibraryImageData[]
}

/**
 * Exporta la biblioteca de imágenes a un archivo JSON
 * @param mode 'metadata' = solo rutas (ligero), 'full' = con imágenes base64 (pesado pero portable)
 */
export async function exportLibraryToJSON(
  images: Array<{ id: string; filename: string; filePath?: string; size?: string; timestamp?: string; url?: string }>,
  markedForReport: string[],
  mode: 'metadata' | 'full' = 'full'
): Promise<void> {
  // Agrupar imágenes por carpeta (extraer directorio de filePath)
  const folders = new Set<string>()
  images.forEach(img => {
    const path = img.filePath || img.filename
    const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
    if (lastSlash > 0) {
      folders.add(path.substring(0, lastSlash))
    }
  })

  const folderList = Array.from(folders)
  const instructions = mode === 'full'
    ? 'Biblioteca completa con imágenes incluidas. Usa "Cargar Biblioteca" para restaurar automáticamente.'
    : folderList.length > 0
    ? `IMPORTANTE: Para cargar esta biblioteca, usa "Cargar Carpeta" en Análisis y selecciona la carpeta que contiene las imágenes. Carpetas detectadas: ${folderList.join(', ')}`
    : 'IMPORTANTE: Para cargar esta biblioteca, usa "Cargar Carpeta" en Análisis y selecciona la carpeta que contiene las imágenes.'

  const libraryData: LibraryData = {
    version: '1.0',
    savedAt: new Date().toISOString(),
    instructions,
    mode,
    images: images.map(img => ({
      id: img.id,
      filename: img.filename,
      filePath: img.filePath || img.filename,
      size: img.size,
      timestamp: img.timestamp,
      markedForReport: markedForReport.includes(img.id),
      imageData: mode === 'full' ? img.url : undefined // Guardar base64 completo en modo 'full'
    }))
  }

  const jsonStr = JSON.stringify(libraryData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `ikuski-biblioteca-${mode}-${new Date().toISOString().split('T')[0]}.json`
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
 * Carga imágenes desde datos guardados en la biblioteca
 * Si el modo es 'full', carga directamente desde base64
 * Si el modo es 'metadata', requiere que el usuario seleccione los archivos
 */
export async function loadImagesFromLibrary(
  libraryData: LibraryData
): Promise<{
  images: Array<{ id: string; url: string; filename: string; filePath: string; size?: string; timestamp?: string }>
  markedIds: string[]
  needsFileSelection: boolean
}> {
  const images: Array<{ id: string; url: string; filename: string; filePath: string; size?: string; timestamp?: string }> = []
  const markedIds: string[] = []

  // Recopilar IDs marcados
  libraryData.images.forEach(img => {
    if (img.markedForReport) {
      markedIds.push(img.id)
    }
  })

  // Si el modo es 'full', cargar imágenes directamente desde base64
  if (libraryData.mode === 'full') {
    libraryData.images.forEach(img => {
      if (img.imageData) {
        images.push({
          id: img.id,
          url: img.imageData,
          filename: img.filename,
          filePath: img.filePath,
          size: img.size,
          timestamp: img.timestamp
        })
      }
    })
    console.log('[Library] Cargadas', images.length, 'imágenes desde base64')
    return { images, markedIds, needsFileSelection: false }
  }

  // Si el modo es 'metadata', el usuario debe seleccionar los archivos manualmente
  console.warn('[Library] Modo metadata: el usuario debe seleccionar los archivos manualmente')
  return { images, markedIds, needsFileSelection: true }
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
