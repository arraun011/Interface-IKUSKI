/**
 * Utilidades para integración con Google Maps
 */

export interface MapOptions {
  latitude: string
  longitude: string
  zoom?: number
  width?: number
  height?: number
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain'
  apiKey?: string
}

/**
 * Genera URL para imagen estática de mapa
 * TEMPORALMENTE usa solo OpenStreetMap hasta resolver problema con Google Maps
 * @param options - Opciones de configuración del mapa
 * @returns URL de la imagen estática del mapa
 */
export function getStaticMapImageUrl(options: MapOptions): string {
  const {
    latitude,
    longitude,
    zoom = 17, // Zoom cercano para ver el contexto de la estructura
    width = 600,
    height = 400,
    mapType = 'roadmap',
    apiKey
  } = options

  // TEMPORALMENTE: Usar solo OpenStreetMap (sin problemas de facturación/CORS)
  // TODO: Volver a Google Maps cuando se habilite facturación en Google Cloud
  const useGoogleMaps = false // Cambiar a true cuando funcione

  // Si hay API key Y está habilitado, usar Google Maps
  if (useGoogleMaps && (apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)) {
    const key = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap'

    const params = new URLSearchParams({
      center: `${latitude},${longitude}`,
      zoom: zoom.toString(),
      size: `${width}x${height}`,
      maptype: mapType,
      markers: `color:red|label:📍|${latitude},${longitude}`,
      scale: '2', // Alta resolución
      key: key!
    })

    return `${baseUrl}?${params.toString()}`
  }

  // Usar OpenStreetMap (gratuito, sin restricciones)
  // https://staticmap.openstreetmap.de/
  const baseUrl = 'https://staticmap.openstreetmap.de/staticmap.php'

  const params = new URLSearchParams({
    center: `${latitude},${longitude}`,
    zoom: zoom.toString(),
    size: `${width}x${height}`,
    maptype: 'mapnik', // Estilo de mapa estándar de OSM
    markers: `${latitude},${longitude},red-pushpin` // Marcador rojo
  })

  return `${baseUrl}?${params.toString()}`
}

/**
 * Detecta si hay API key de Google Maps configurada
 * @returns true si hay API key disponible
 */
export function hasGoogleMapsApiKey(): boolean {
  return !!(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
}

/**
 * Obtiene el nombre del proveedor de mapas actual
 * @returns "Google Maps" o "OpenStreetMap"
 */
export function getMapProvider(): string {
  return hasGoogleMapsApiKey() ? 'Google Maps' : 'OpenStreetMap'
}

/**
 * Genera URL para abrir ubicación en OpenStreetMap (navegador)
 * @param latitude - Latitud
 * @param longitude - Longitud
 * @returns URL para abrir en navegador
 */
export function getOpenStreetMapUrl(latitude: string, longitude: string): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=17#map=17/${latitude}/${longitude}`
}

/**
 * Genera URL para abrir ubicación en Google Maps (navegador)
 * @param latitude - Latitud
 * @param longitude - Longitud
 * @returns URL para abrir en navegador
 */
export function getGoogleMapsUrl(latitude: string, longitude: string): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}&z=17`
}

/**
 * Genera URL para Google Maps con marcador personalizado
 * @param latitude - Latitud
 * @param longitude - Longitud
 * @param label - Etiqueta del marcador (ej: "Foto 1")
 * @returns URL con marcador personalizado
 */
export function getGoogleMapsUrlWithMarker(
  latitude: string,
  longitude: string,
  label?: string
): string {
  const baseUrl = 'https://www.google.com/maps/search/'
  const coords = `${latitude},${longitude}`

  if (label) {
    return `${baseUrl}?api=1&query=${coords}&query_place_id=${encodeURIComponent(label)}`
  }

  return `${baseUrl}?api=1&query=${coords}`
}

/**
 * Valida si las coordenadas GPS son válidas
 * @param latitude - Latitud (como string)
 * @param longitude - Longitud (como string)
 * @returns true si las coordenadas son válidas
 */
export function isValidGPSCoordinates(latitude: string | null, longitude: string | null): boolean {
  if (!latitude || !longitude) return false

  const lat = parseFloat(latitude)
  const lon = parseFloat(longitude)

  return (
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  )
}

/**
 * Formatea coordenadas GPS para mostrar en el informe
 * @param latitude - Latitud
 * @param longitude - Longitud
 * @param altitude - Altitud (opcional)
 * @returns String formateado de coordenadas
 */
export function formatGPSCoordinates(
  latitude: string,
  longitude: string,
  altitude?: number
): string {
  const lat = parseFloat(latitude)
  const lon = parseFloat(longitude)

  const latDir = lat >= 0 ? 'N' : 'S'
  const lonDir = lon >= 0 ? 'E' : 'W'

  let formatted = `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lon).toFixed(6)}° ${lonDir}`

  if (altitude !== null && altitude !== undefined) {
    formatted += ` | Alt: ${altitude.toFixed(1)}m`
  }

  return formatted
}

/**
 * Obtiene la distancia aproximada entre dos puntos GPS (en metros)
 * Usa la fórmula de Haversine
 */
export function getDistanceBetweenPoints(
  lat1: string,
  lon1: string,
  lat2: string,
  lon2: string
): number {
  const R = 6371e3 // Radio de la Tierra en metros
  const φ1 = (parseFloat(lat1) * Math.PI) / 180
  const φ2 = (parseFloat(lat2) * Math.PI) / 180
  const Δφ = ((parseFloat(lat2) - parseFloat(lat1)) * Math.PI) / 180
  const Δλ = ((parseFloat(lon2) - parseFloat(lon1)) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distancia en metros
}

/**
 * Convierte una imagen de URL a base64
 * Necesario para incluir imágenes de Google Maps en documentos exportados
 * Usa un proxy para evitar problemas de CORS
 */
export async function imageUrlToBase64(url: string): Promise<string> {
  try {
    // Método 1: Intentar fetch directo (funciona con OpenStreetMap)
    try {
      const response = await fetch(url, {
        mode: 'cors',
        cache: 'no-cache'
      })

      if (response.ok) {
        const blob = await response.blob()
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64 = reader.result as string
            resolve(base64)
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      }
    } catch (fetchError) {
      console.warn('Direct fetch failed, trying alternative method:', fetchError)
    }

    // Método 2: Usar Image() para cargar y convertir a canvas
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          ctx.drawImage(img, 0, 0)
          const base64 = canvas.toDataURL('image/png')
          resolve(base64)
        } catch (canvasError) {
          reject(canvasError)
        }
      }

      img.onerror = (error) => {
        console.error('Image load error:', error)
        reject(new Error(`Failed to load image: ${url}`))
      }

      // Añadir timestamp para evitar cache
      const urlWithTimestamp = url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`
      img.src = urlWithTimestamp
    })
  } catch (error) {
    console.error('Error converting image to base64:', error)
    throw error
  }
}

/**
 * Obtiene imagen de mapa en base64 para incluir en documentos
 * Usa el proxy API para evitar problemas de CORS
 * @param options - Opciones del mapa
 * @returns Imagen del mapa en formato base64
 */
export async function getStaticMapBase64(options: MapOptions): Promise<string | null> {
  try {
    const mapUrl = getStaticMapImageUrl(options)

    // Usar proxy API para evitar CORS
    const proxyUrl = `/api/map-proxy?url=${encodeURIComponent(mapUrl)}`

    const base64 = await imageUrlToBase64(proxyUrl)
    return base64
  } catch (error) {
    console.error('Error fetching map image:', error)
    return null
  }
}

/**
 * Obtiene URL del mapa usando el proxy (para mostrar en UI)
 * @param options - Opciones del mapa
 * @returns URL del proxy con la imagen del mapa
 */
export function getStaticMapProxyUrl(options: MapOptions): string {
  const mapUrl = getStaticMapImageUrl(options)
  return `/api/map-proxy?url=${encodeURIComponent(mapUrl)}`
}
