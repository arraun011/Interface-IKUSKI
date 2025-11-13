/**
 * Generador de mapas estáticos usando tiles de OpenStreetMap
 * Sin necesidad de API keys externas
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lon = parseFloat(searchParams.get('lon') || '0')
    const zoom = parseInt(searchParams.get('zoom') || '17')
    const width = parseInt(searchParams.get('width') || '600')
    const height = parseInt(searchParams.get('height') || '400')

    console.log('[Map Generator] Generating map:', { lat, lon, zoom, width, height })

    // Generar SVG con mapa embebido usando iframes de OSM
    // Esto es más confiable que intentar renderizar tiles
    return createInteractiveMapSVG(lat, lon, zoom, width, height)
  } catch (error) {
    console.error('[Map Generator] Error:', error)

    // Retornar imagen placeholder en caso de error
    const lat = parseFloat(request.nextUrl.searchParams.get('lat') || '0')
    const lon = parseFloat(request.nextUrl.searchParams.get('lon') || '0')
    const width = parseInt(request.nextUrl.searchParams.get('width') || '600')
    const height = parseInt(request.nextUrl.searchParams.get('height') || '400')

    return createPlaceholderImage(lat, lon, width, height)
  }
}

/**
 * Crea un SVG con múltiples tiles de OSM combinados y un marcador
 */
function createInteractiveMapSVG(lat: number, lon: number, zoom: number, width: number, height: number) {
  // Calcular el tile central
  const tileSize = 256
  const scale = Math.pow(2, zoom)

  const centerX = ((lon + 180) / 360) * scale
  const centerY = ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) * scale

  // Calcular cuántos tiles necesitamos
  const tilesX = Math.ceil(width / tileSize) + 1
  const tilesY = Math.ceil(height / tileSize) + 1

  const centerTileX = Math.floor(centerX)
  const centerTileY = Math.floor(centerY)

  // Posición del marcador en el centro del mapa
  const markerX = width / 2
  const markerY = height / 2

  // Construir SVG con tiles
  let tileImages = ''

  const startTileX = centerTileX - Math.floor(tilesX / 2)
  const startTileY = centerTileY - Math.floor(tilesY / 2)

  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const tileX = startTileX + tx
      const tileY = startTileY + ty
      const tileUrl = `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`

      const offsetX = (centerX - centerTileX) * tileSize
      const offsetY = (centerY - centerTileY) * tileSize

      const x = tx * tileSize - offsetX - (tilesX * tileSize - width) / 2
      const y = ty * tileSize - offsetY - (tilesY * tileSize - height) / 2

      tileImages += `
        <image
          href="${tileUrl}"
          x="${x}"
          y="${y}"
          width="${tileSize}"
          height="${tileSize}"
        />
      `
    }
  }

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <clipPath id="mapBounds">
          <rect width="${width}" height="${height}"/>
        </clipPath>
      </defs>

      <g clip-path="url(#mapBounds)">
        ${tileImages}
      </g>

      <!-- Marcador rojo -->
      <g transform="translate(${markerX}, ${markerY})">
        <!-- Sombra del marcador -->
        <ellipse cx="0" cy="30" rx="8" ry="3" fill="rgba(0,0,0,0.3)"/>

        <!-- Pin del marcador -->
        <path d="M 0,-30 C -8,-30 -15,-23 -15,-15 C -15,-5 0,5 0,5 C 0,5 15,-5 15,-15 C 15,-23 8,-30 0,-30 Z"
              fill="#ef4444"
              stroke="#b91c1c"
              stroke-width="1.5"/>

        <!-- Círculo interno blanco -->
        <circle cx="0" cy="-15" r="5" fill="white"/>
      </g>

      <!-- Créditos de OSM -->
      <text x="${width - 5}" y="${height - 5}"
            text-anchor="end"
            font-family="Arial"
            font-size="10"
            fill="#666"
            opacity="0.8">
        © OpenStreetMap
      </text>

      <!-- Coordenadas -->
      <rect x="5" y="5" width="200" height="30" fill="white" fill-opacity="0.9" rx="5"/>
      <text x="10" y="23"
            font-family="Arial"
            font-size="12"
            fill="#374151">
        📍 ${lat.toFixed(6)}°, ${lon.toFixed(6)}°
      </text>
    </svg>
  `

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    }
  })
}

/**
 * Crea una imagen SVG placeholder con las coordenadas
 */
function createPlaceholderImage(lat: number, lon: number, width: number, height: number) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
      <circle cx="${width / 2}" cy="${height / 2 - 20}" r="20" fill="#ef4444"/>
      <text x="${width / 2}" y="${height / 2 + 30}"
            text-anchor="middle"
            font-family="Arial"
            font-size="16"
            fill="#374151">
        📍 ${lat.toFixed(6)}°, ${lon.toFixed(6)}°
      </text>
      <text x="${width / 2}" y="${height / 2 + 55}"
            text-anchor="middle"
            font-family="Arial"
            font-size="12"
            fill="#6b7280">
        Click en los enlaces para ver el mapa completo
      </text>
    </svg>
  `

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    }
  })
}

// Permitir CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
