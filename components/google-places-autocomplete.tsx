'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PlaceResult {
  address: string
  city: string
  country: string
  latitude: number
  longitude: number
}

interface GooglePlacesAutocompleteProps {
  onPlaceSelected: (place: PlaceResult) => void
  placeholder?: string
  label?: string
}

export function GooglePlacesAutocomplete({
  onPlaceSelected,
  placeholder = "Buscar dirección...",
  label = "Localización"
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Verificar si Google Maps ya está cargado
    if (typeof window !== 'undefined' && window.google?.maps?.places) {
      console.log('[Places] Google Maps API already loaded')
      setIsLoaded(true)
      initializeAutocomplete()
      return
    }

    // Verificar si ya existe un script de Google Maps en la página
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      console.log('[Places] Google Maps script already exists, waiting for load...')
      // Esperar a que se cargue
      const checkInterval = setInterval(() => {
        if (window.google?.maps?.places) {
          console.log('[Places] Google Maps API loaded from existing script')
          setIsLoaded(true)
          initializeAutocomplete()
          clearInterval(checkInterval)
        }
      }, 100)

      // Timeout después de 10 segundos
      setTimeout(() => clearInterval(checkInterval), 10000)
      return
    }

    // Cargar el script de Google Maps si no está cargado
    console.log('[Places] Loading Google Maps API...')
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyArUGYRVac29Jq9inE0bLbFYnAatXEUUJk&libraries=places`
    script.async = true
    script.defer = true
    script.id = 'google-maps-script'

    script.onload = () => {
      console.log('[Places] Google Maps API loaded successfully')
      setIsLoaded(true)
      initializeAutocomplete()
    }

    script.onerror = () => {
      console.error('[Places] Error loading Google Maps script')
    }

    document.head.appendChild(script)

    return () => {
      // No remover el script al desmontar, ya que puede ser usado por otros componentes
      console.log('[Places] Component unmounted, keeping Google Maps script')
    }
  }, [])

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places) return

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      fields: ['formatted_address', 'address_components', 'geometry']
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()

      if (!place.geometry || !place.address_components) {
        console.warn('[Places] No details available for selected place')
        return
      }

      // Extraer información de los componentes de dirección
      let city = ''
      let country = ''

      for (const component of place.address_components) {
        const types = component.types

        if (types.includes('locality')) {
          city = component.long_name
        } else if (types.includes('administrative_area_level_2') && !city) {
          city = component.long_name
        } else if (types.includes('country')) {
          country = component.long_name
        }
      }

      const result: PlaceResult = {
        address: place.formatted_address || '',
        city,
        country,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng()
      }

      console.log('[Places] Place selected:', result)
      onPlaceSelected(result)
    })
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="place-autocomplete">{label}</Label>
      <Input
        ref={inputRef}
        id="place-autocomplete"
        type="text"
        placeholder={isLoaded ? placeholder : "Cargando Google Maps..."}
        disabled={!isLoaded}
        className="w-full"
      />
      {!isLoaded && (
        <p className="text-xs text-muted-foreground">
          Cargando servicio de búsqueda de direcciones...
        </p>
      )}
    </div>
  )
}

// Tipos globales para Google Maps
declare global {
  interface Window {
    google: any
  }
}
