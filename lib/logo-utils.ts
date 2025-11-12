/**
 * Convierte el logo a base64 para incrustarlo en documentos exportados
 */
export async function getLogoBase64(): Promise<string> {
  try {
    // Intentar cargar el logo desde public/images
    const response = await fetch('/images/ikuski-logo-full.jpg')

    if (!response.ok) {
      throw new Error('Logo no encontrado')
    }

    const blob = await response.blob()

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error cargando logo:', error)
    // Retornar un placeholder SVG si falla
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjYwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjM2IiBmaWxsPSIjMjU2M2ViIj5JS1VTS0k8L3RleHQ+PC9zdmc+'
  }
}
