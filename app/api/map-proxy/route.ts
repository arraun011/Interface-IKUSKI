/**
 * API Proxy para cargar imágenes de Google Maps
 * Soluciona problemas de CORS al cargar mapas estáticos
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mapUrl = searchParams.get('url')

    if (!mapUrl) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      )
    }

    // Validar que la URL sea de un proveedor de mapas válido
    const validProviders = [
      'maps.googleapis.com',
      'staticmap.openstreetmap.de',
      'maps.geoapify.com',
      'api.maptiler.com',
      'api.mapbox.com'
    ]

    const isValidProvider = validProviders.some(provider =>
      mapUrl.includes(provider)
    )

    if (!isValidProvider) {
      console.error('[Map Proxy] Invalid provider. URL:', mapUrl)
      return NextResponse.json(
        { error: 'Invalid map provider', url: mapUrl },
        { status: 400 }
      )
    }

    // Realizar la petición al servicio de mapas
    console.log('Fetching map from:', mapUrl)

    const response = await fetch(mapUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'http://localhost:3000'
      }
    })

    if (!response.ok) {
      // Leer el cuerpo de la respuesta para ver el error exacto
      const errorText = await response.text()
      console.error(`Map fetch failed: ${response.status} ${response.statusText}`)
      console.error('Error details:', errorText)

      return NextResponse.json(
        {
          error: `Failed to fetch map: ${response.statusText}`,
          details: errorText,
          url: mapUrl
        },
        { status: response.status }
      )
    }

    // Obtener la imagen como buffer
    const imageBuffer = await response.arrayBuffer()

    // Devolver la imagen con los headers correctos
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/png',
        'Cache-Control': 'public, max-age=86400', // Cache por 24 horas
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('Error in map proxy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
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
