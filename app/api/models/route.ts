import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const pesoDir = path.join(process.cwd(), 'peso')

    // Verificar si la carpeta existe
    try {
      await fs.access(pesoDir)
    } catch {
      // Si no existe, crearla
      await fs.mkdir(pesoDir, { recursive: true })
      return NextResponse.json({ models: [] })
    }

    // Leer archivos .pt y .pth
    const files = await fs.readdir(pesoDir)
    const ptFiles = files.filter(file => file.endsWith('.pt') || file.endsWith('.pth'))

    // Obtener información de cada archivo
    const models = await Promise.all(
      ptFiles.map(async (file) => {
        const filePath = path.join(pesoDir, file)
        const stats = await fs.stat(filePath)

        return {
          name: file,
          size: stats.size,
          sizeFormatted: formatBytes(stats.size),
          date: stats.mtime.toISOString().split('T')[0],
          path: filePath
        }
      })
    )

    // Ordenar por fecha (más reciente primero)
    models.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({ models })
  } catch (error) {
    console.error('Error reading models:', error)
    return NextResponse.json(
      { error: 'Error al leer modelos' },
      { status: 500 }
    )
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
