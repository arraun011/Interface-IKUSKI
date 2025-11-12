/**
 * Extrae coordenadas GPS de metadatos EXIF de una imagen
 */
export async function extractGPSFromImage(imageDataUrl: string): Promise<{
  latitude: string | null
  longitude: string | null
  altitude: number | null
  hasGPS: boolean
}> {
  try {
    // Si es una imagen base64 (data URL), convertirla a blob
    const response = await fetch(imageDataUrl)
    const blob = await response.blob()

    // Leer EXIF usando FileReader
    return new Promise((resolve) => {
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer

          // Intentar extraer EXIF usando exifr si está disponible
          if (typeof window !== 'undefined' && (window as any).exifr) {
            const exifr = (window as any).exifr
            const gps = await exifr.gps(arrayBuffer)

            if (gps && gps.latitude && gps.longitude) {
              resolve({
                latitude: gps.latitude.toFixed(6),
                longitude: gps.longitude.toFixed(6),
                altitude: gps.altitude || null,
                hasGPS: true
              })
              return
            }
          }

          // Si no hay GPS o exifr no está disponible, devolver valores nulos
          resolve({
            latitude: null,
            longitude: null,
            altitude: null,
            hasGPS: false
          })
        } catch (error) {
          console.error('Error parsing EXIF:', error)
          resolve({
            latitude: null,
            longitude: null,
            altitude: null,
            hasGPS: false
          })
        }
      }

      reader.onerror = () => {
        resolve({
          latitude: null,
          longitude: null,
          altitude: null,
          hasGPS: false
        })
      }

      reader.readAsArrayBuffer(blob)
    })
  } catch (error) {
    console.error('Error extracting GPS:', error)
    return {
      latitude: null,
      longitude: null,
      altitude: null,
      hasGPS: false
    }
  }
}

/**
 * Genera coordenadas GPS simuladas para imágenes sin metadatos
 * Útil para testing o imágenes sin GPS
 */
export function generateSimulatedGPS(index: number = 0): {
  latitude: string
  longitude: string
  altitude: number
  hasGPS: boolean
} {
  // Coordenadas base (Bilbao, España)
  const baseLat = 43.2627
  const baseLon = -2.9253
  const baseAlt = 40

  // Añadir variación aleatoria
  const latVariation = (Math.random() - 0.5) * 0.01 + (index * 0.001)
  const lonVariation = (Math.random() - 0.5) * 0.01 + (index * 0.001)
  const altVariation = Math.floor(Math.random() * 20)

  return {
    latitude: (baseLat + latVariation).toFixed(6),
    longitude: (baseLon + lonVariation).toFixed(6),
    altitude: baseAlt + altVariation,
    hasGPS: false // Indica que es simulado
  }
}
