/**
 * Utilidades para integración con Google Maps
 */

export interface MapOptions {
  latitude: string | number
  longitude: string | number
  zoom?: number
  width?: number
  height?: number
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain'
  apiKey?: string
}

/**
 * Convierte coordenada a string válido
 */
function toCoordinateString(coord: string | number | undefined | null): string {
  if (coord === undefined || coord === null) {
    console.error('Invalid coordinate: undefined or null')
    return '0'
  }

  const coordStr = typeof coord === 'number' ? coord.toString() : coord
  const coordNum = parseFloat(coordStr)

  if (isNaN(coordNum)) {
    console.error('Invalid coordinate: NaN', coord)
    return '0'
  }

  return coordStr
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

  // Convertir coordenadas a strings válidos
  const lat = toCoordinateString(latitude)
  const lon = toCoordinateString(longitude)

  console.log('[Maps] Generating map URL for coordinates:', { lat, lon })

  // Usar Google Maps si hay API key disponible
  const useGoogleMaps = true // Activado con nueva API key

  // Si hay API key Y está habilitado, usar Google Maps
  if (useGoogleMaps && (apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)) {
    const key = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap'

    const params = new URLSearchParams({
      center: `${lat},${lon}`,
      zoom: zoom.toString(),
      size: `${width}x${height}`,
      maptype: mapType,
      markers: `color:red|label:📍|${lat},${lon}`,
      scale: '2', // Alta resolución
      key: key!
    })

    const url = `${baseUrl}?${params.toString()}`
    console.log('[Maps] Google Maps URL:', url)
    return url
  }

  // SOLUCIÓN TEMPORAL: Usar API interna para generar imagen de mapa
  // Esto generará una imagen con las coordenadas y un tile de OSM de fondo
  const url = `/api/map-proxy/generate?lat=${lat}&lon=${lon}&zoom=${zoom}&width=${width}&height=${height}`

  console.log('[Maps] Internal map generator URL:', url)
  return url
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
export function getOpenStreetMapUrl(latitude: string | number, longitude: string | number): string {
  const lat = toCoordinateString(latitude)
  const lon = toCoordinateString(longitude)
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=17#map=17/${lat}/${lon}`
}

/**
 * Genera URL para abrir ubicación en Google Maps (navegador)
 * @param latitude - Latitud
 * @param longitude - Longitud
 * @returns URL para abrir en navegador
 */
export function getGoogleMapsUrl(latitude: string | number, longitude: string | number): string {
  const lat = toCoordinateString(latitude)
  const lon = toCoordinateString(longitude)
  return `https://www.google.com/maps?q=${lat},${lon}&z=17`
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
 * Redimensiona una imagen manteniendo su aspecto ratio
 * @param img - Elemento de imagen
 * @param maxWidth - Ancho máximo (default: 1024)
 * @param maxHeight - Alto máximo (default: 1024)
 * @returns Canvas con la imagen redimensionada
 */
function resizeImage(img: HTMLImageElement, maxWidth: number = 1024, maxHeight: number = 1024): HTMLCanvasElement {
  let width = img.width
  let height = img.height

  // Calcular nuevas dimensiones manteniendo el aspect ratio
  if (width > height) {
    if (width > maxWidth) {
      height = (height * maxWidth) / width
      width = maxWidth
    }
  } else {
    if (height > maxHeight) {
      width = (width * maxHeight) / height
      height = maxHeight
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  ctx.drawImage(img, 0, 0, width, height)
  return canvas
}

/**
 * Convierte una imagen de URL a base64
 * Necesario para incluir imágenes de Google Maps en documentos exportados
 * Usa un proxy para evitar problemas de CORS
 * REDIMENSIONA la imagen a 1024px máximo para reducir tamaño del payload
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

        // Crear imagen desde blob para redimensionar
        const img = new Image()
        const imageUrl = URL.createObjectURL(blob)

        return new Promise((resolve, reject) => {
          img.onload = () => {
            try {
              URL.revokeObjectURL(imageUrl)
              const canvas = resizeImage(img)
              const base64 = canvas.toDataURL('image/jpeg', 0.85) // JPEG con 85% calidad para reducir tamaño
              resolve(base64)
            } catch (error) {
              reject(error)
            }
          }
          img.onerror = reject
          img.src = imageUrl
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
          const canvas = resizeImage(img)
          const base64 = canvas.toDataURL('image/jpeg', 0.85) // JPEG con 85% calidad
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

  // Si ya es una URL interna, devolverla directamente (sin proxy)
  if (mapUrl.startsWith('/')) {
    console.log('[Maps] Using internal map generator:', mapUrl)
    return mapUrl
  }

  const proxyUrl = `/api/map-proxy?url=${encodeURIComponent(mapUrl)}`
  console.log('[Maps] Proxy URL generated:', proxyUrl)
  return proxyUrl
}

/**
 * Convierte coordenadas GPS a dirección usando Google Geocoding API
 * @returns Dirección formateada como "Ciudad, Provincia/Estado, País"
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<{
  formatted: string
  city: string
  state: string
  country: string
} | null> {
  try {
    const apiKey = 'AIzaSyArUGYRVac29Jq9inE0bLbFYnAatXEUUJk'
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=es`

    console.log('[Geocoding] Reverse geocoding:', { latitude, longitude })

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.warn('[Geocoding] No results found')
      return null
    }

    const result = data.results[0]
    let city = ''
    let state = ''
    let country = ''

    // Extraer componentes de la dirección
    for (const component of result.address_components) {
      const types = component.types

      if (types.includes('locality')) {
        city = component.long_name
      } else if (types.includes('administrative_area_level_2') && !city) {
        city = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name
      } else if (types.includes('country')) {
        country = component.long_name
      }
    }

    // Formato: "Bilbao, Bizkaia, España"
    const parts = [city, state, country].filter(Boolean)
    const formatted = parts.join(', ')

    console.log('[Geocoding] Result:', { formatted, city, state, country })

    return { formatted, city, state, country }
  } catch (error) {
    console.error('[Geocoding] Error:', error)
    return null
  }
}
