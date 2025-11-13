/**
 * Utilidades para guardar y cargar sesiones de trabajo
 */

// Interfaz para una sesión de análisis
export interface AnalysisSession {
  id: string
  name: string
  date: string
  images: Array<{
    id: string
    filename: string
    url: string  // Solo para compatibilidad, no se guarda en export
    file?: File
  }>
  detections: Array<{
    image: string
    class_name: string
    severity: string
    confidence: number
    bbox: { x: number; y: number; w: number; h: number }
  }>
  modelPath: string
  confidenceThreshold: number
  iouThreshold: number
}

// Interfaz para exportación (sin URLs base64)
export interface AnalysisSessionExport {
  name: string
  date: string
  imageFilenames: string[]  // Solo nombres de archivo
  detections: Array<{
    filename: string  // Referencia al nombre del archivo
    class_name: string
    severity: string
    confidence: number
    bbox: { x: number; y: number; w: number; h: number }
  }>
  modelPath: string
  confidenceThreshold: number
  iouThreshold: number
}

// Interfaz para un borrador de informe
export interface ReportDraft {
  id: string
  name: string
  date: string
  projectData: {
    workNumber: string
    orderNumber: string
    projectName: string
    location: string
    inspector: string
    reviewer: string
    client: string
    inspectionDate: string
    reportDate: string
    introduction: string
  }
  markedImages: Array<{
    id: string
    filename: string
    url: string
  }>
  detections: Array<{
    image: string
    class_name: string
    severity: string
    confidence: number
    bbox: { x: number; y: number; w: number; h: number }
  }>
}

const ANALYSIS_SESSIONS_KEY = 'ikuski_analysis_sessions'
const REPORT_DRAFTS_KEY = 'ikuski_report_drafts'

/**
 * Guarda una sesión de análisis
 */
export function saveAnalysisSession(session: Omit<AnalysisSession, 'id' | 'date'>): string {
  const sessions = getAnalysisSessions()

  const newSession: AnalysisSession = {
    ...session,
    id: Date.now().toString(),
    date: new Date().toISOString()
  }

  sessions.push(newSession)

  try {
    const serialized = JSON.stringify(sessions)

    // Verificar tamaño (localStorage tiene límite de ~5-10MB)
    const sizeInMB = new Blob([serialized]).size / (1024 * 1024)
    if (sizeInMB > 5) {
      throw new Error(`La sesión es demasiado grande (${sizeInMB.toFixed(2)}MB). Las imágenes en base64 ocupan mucho espacio. Intenta con menos imágenes.`)
    }

    localStorage.setItem(ANALYSIS_SESSIONS_KEY, serialized)
  } catch (error: any) {
    // Si es error de cuota de localStorage
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      throw new Error('No hay suficiente espacio en localStorage. Elimina sesiones antiguas o usa menos imágenes.')
    }
    throw error
  }

  return newSession.id
}

/**
 * Obtiene todas las sesiones de análisis guardadas
 */
export function getAnalysisSessions(): AnalysisSession[] {
  if (typeof window === 'undefined') return []

  const stored = localStorage.getItem(ANALYSIS_SESSIONS_KEY)
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error parsing analysis sessions:', error)
    return []
  }
}

/**
 * Carga una sesión de análisis específica
 */
export function loadAnalysisSession(id: string): AnalysisSession | null {
  const sessions = getAnalysisSessions()
  return sessions.find(s => s.id === id) || null
}

/**
 * Elimina una sesión de análisis
 */
export function deleteAnalysisSession(id: string): void {
  const sessions = getAnalysisSessions()
  const filtered = sessions.filter(s => s.id !== id)
  localStorage.setItem(ANALYSIS_SESSIONS_KEY, JSON.stringify(filtered))
}

/**
 * Guarda un borrador de informe
 */
export function saveReportDraft(draft: Omit<ReportDraft, 'id' | 'date'>): string {
  const drafts = getReportDrafts()

  const newDraft: ReportDraft = {
    ...draft,
    id: Date.now().toString(),
    date: new Date().toISOString()
  }

  drafts.push(newDraft)

  try {
    const serialized = JSON.stringify(drafts)

    // Verificar tamaño
    const sizeInMB = new Blob([serialized]).size / (1024 * 1024)
    if (sizeInMB > 5) {
      throw new Error(`El borrador es demasiado grande (${sizeInMB.toFixed(2)}MB). Las imágenes ocupan mucho espacio. Intenta con menos imágenes.`)
    }

    localStorage.setItem(REPORT_DRAFTS_KEY, serialized)
  } catch (error: any) {
    // Si es error de cuota de localStorage
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      throw new Error('No hay suficiente espacio en localStorage. Elimina borradores antiguos o usa menos imágenes.')
    }
    throw error
  }

  return newDraft.id
}

/**
 * Obtiene todos los borradores de informe guardados
 */
export function getReportDrafts(): ReportDraft[] {
  if (typeof window === 'undefined') return []

  const stored = localStorage.getItem(REPORT_DRAFTS_KEY)
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error parsing report drafts:', error)
    return []
  }
}

/**
 * Carga un borrador de informe específico
 */
export function loadReportDraft(id: string): ReportDraft | null {
  const drafts = getReportDrafts()
  return drafts.find(d => d.id === id) || null
}

/**
 * Elimina un borrador de informe
 */
export function deleteReportDraft(id: string): void {
  const drafts = getReportDrafts()
  const filtered = drafts.filter(d => d.id !== id)
  localStorage.setItem(REPORT_DRAFTS_KEY, JSON.stringify(filtered))
}

/**
 * Actualiza un borrador existente
 */
export function updateReportDraft(id: string, draft: Omit<ReportDraft, 'id' | 'date'>): void {
  const drafts = getReportDrafts()
  const index = drafts.findIndex(d => d.id === id)

  if (index !== -1) {
    drafts[index] = {
      ...draft,
      id,
      date: new Date().toISOString()
    }
    localStorage.setItem(REPORT_DRAFTS_KEY, JSON.stringify(drafts))
  }
}

/**
 * Actualiza una sesión existente
 */
export function updateAnalysisSession(id: string, session: Omit<AnalysisSession, 'id' | 'date'>): void {
  const sessions = getAnalysisSessions()
  const index = sessions.findIndex(s => s.id === id)

  if (index !== -1) {
    sessions[index] = {
      ...session,
      id,
      date: new Date().toISOString()
    }
    localStorage.setItem(ANALYSIS_SESSIONS_KEY, JSON.stringify(sessions))
  }
}

/**
 * Exporta una sesión a archivo JSON (sin imágenes base64)
 */
export function exportSessionToFile(session: AnalysisSession): void {
  console.log('exportSessionToFile called with session:', session)

  // Crear un mapa de URL a filename para las detecciones
  const urlToFilename = new Map<string, string>()
  session.images.forEach(img => {
    urlToFilename.set(img.url, img.filename)
  })

  const exportData: AnalysisSessionExport = {
    name: session.name,
    date: session.date,
    imageFilenames: session.images.map(img => img.filename),
    detections: session.detections.map(d => ({
      filename: urlToFilename.get(d.image) || 'unknown',
      class_name: d.class_name,
      severity: d.severity,
      confidence: d.confidence,
      bbox: d.bbox
    })),
    modelPath: session.modelPath,
    confidenceThreshold: session.confidenceThreshold,
    iouThreshold: session.iouThreshold
  }

  console.log('Export data prepared:', exportData)

  // Crear y descargar archivo JSON
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const filename = `sesion_${session.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
  a.download = filename
  console.log('Downloading file:', filename)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  console.log('File download triggered')
}

/**
 * Crea una plantilla para importar sesión
 * Devuelve datos de la sesión que luego se combinará con las imágenes cargadas
 */
export function parseSessionFile(jsonContent: string): AnalysisSessionExport {
  try {
    const data = JSON.parse(jsonContent) as AnalysisSessionExport

    // Validar estructura
    if (!data.name || !data.imageFilenames || !data.detections) {
      throw new Error('Archivo de sesión inválido')
    }

    return data
  } catch (error) {
    throw new Error('No se pudo leer el archivo de sesión. Verifica que sea un archivo JSON válido.')
  }
}
