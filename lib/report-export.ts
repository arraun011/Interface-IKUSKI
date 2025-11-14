/**
 * Utilidades para exportar informes a Word y funcionalidad de impresión
 * Soporte multiidioma y logos personalizables
 */

import {
  getStaticMapImageUrl,
  getStaticMapBase64,
  getOpenStreetMapUrl,
  getGoogleMapsUrl,
  isValidGPSCoordinates,
  formatGPSCoordinates
} from './maps-utils'
import { getTranslations, type ReportTranslations } from './report-translations'

export interface ReportData {
  projectData: {
    workNumber: string
    orderNumber: string
    projectName: string
    location: string
    city?: string
    country?: string
    inspector: string
    reviewer: string
    client: string
    inspectionDate: string
    reportDate: string
    introduction: string
  }
  images: Array<{
    id: string
    filename: string
    url: string
    urlWithBoxes?: string // Imagen con bounding boxes dibujados
    timestamp: string
    gps: {
      latitude: string
      longitude: string
      altitude: number
    }
    detections: Array<{
      severity: string
      confidence: number
    }>
    analysis: string
    mapImageBase64?: string | null // Imagen del mapa en base64
  }>
  language?: 'es' | 'en' | 'pt'
  rdtLogoBase64?: string
  clientLogoBase64?: string
  coverImageBase64?: string // Imagen aérea para la portada
}

/**
 * Genera y descarga un informe en formato Word (.doc)
 */
export async function exportToWord(data: ReportData): Promise<void> {
  try {
    const language = data.language || 'es'
    const t = getTranslations(language)

    // Crear el HTML del documento
    const htmlContent = generateReportHTML(data, t)

    // Crear blob con el contenido HTML en formato compatible con Word
    const blob = new Blob(
      [`
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${t.title} - ${data.projectData.projectName}</title>
  ${generateStyles()}
</head>
<body>
  ${htmlContent}
</body>
</html>
      `],
      { type: 'application/msword' }
    )

    // Crear enlace de descarga
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    const fileName = `Informe_${data.projectData.projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.doc`
    link.download = fileName

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

  } catch (error) {
    console.error('Error exporting to Word:', error)
    throw new Error('No se pudo exportar el informe a Word')
  }
}

/**
 * Genera los estilos CSS del documento
 */
export function generateStyles(): string {
  return `
  <style>
    @page {
      size: A4;
      margin: 1cm 1.5cm 1.5cm 1.5cm;
    }

    body {
      font-family: Calibri, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      margin: 0;
      padding: 0;
    }

    .page-header {
      width: 100%;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 3px;
      margin-bottom: 8px;
    }

    .header-logos {
      display: table;
      width: 100%;
      margin-bottom: 5px;
    }

    .header-logo-left {
      display: table-cell;
      width: 50%;
      text-align: left;
      vertical-align: middle;
    }

    .header-logo-right {
      display: table-cell;
      width: 50%;
      text-align: right;
      vertical-align: middle;
    }

    .header-logo-left img,
    .header-logo-right img {
      max-height: 50px;
      max-width: 150px;
      height: auto;
      width: auto;
    }

    h1 {
      font-size: 16pt;
      font-weight: bold;
      color: #2563eb;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 8px;
      margin-top: 10px;
      margin-bottom: 15px;
      text-align: center;
    }

    h2 {
      font-size: 13pt;
      font-weight: bold;
      color: #1e40af;
      margin-top: 15px;
      margin-bottom: 8px;
    }

    h3 {
      font-size: 11pt;
      font-weight: bold;
      margin-top: 10px;
      margin-bottom: 5px;
    }

    h4 {
      font-size: 10pt;
      font-weight: bold;
      margin-top: 8px;
      margin-bottom: 3px;
    }

    p {
      margin: 8px 0;
      text-align: justify;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 5px 0 10px 0;
    }

    td, th {
      border: 1px solid #000;
      padding: 5px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background-color: #e5e7eb;
      font-weight: bold;
    }

    .photo-section {
      page-break-before: always;
      margin-top: 20px;
    }

    .photo-container {
      page-break-before: always;
      page-break-after: always;
      margin: 0;
      padding: 10px 0;
    }

    .photo-img {
      width: 100%;
      max-width: 100%;
      max-height: 550px;
      height: auto;
      border: 1px solid #ccc;
      margin: 5px 0;
      object-fit: contain;
    }

    .map-container {
      margin: 15px 0;
      border: 1px solid #ddd;
      padding: 10px;
      background-color: #f9fafb;
      page-break-inside: avoid;
    }

    .map-img {
      width: 100%;
      max-width: 600px;
      height: auto;
      border: 1px solid #ccc;
      display: block;
      margin: 10px auto;
    }

    .metadata {
      font-size: 9pt;
      color: #666;
      margin: 3px 0;
    }

    .metadata p {
      margin: 2px 0;
    }

    .severity-high {
      color: #dc2626;
      font-weight: bold;
    }

    .severity-medium {
      color: #f59e0b;
      font-weight: bold;
    }

    .severity-low {
      color: #10b981;
      font-weight: bold;
    }

    .footer {
      margin-top: 40px;
      border-top: 1px solid #ccc;
      padding-top: 10px;
      font-size: 9pt;
      text-align: center;
      color: #666;
    }

    .cover-page {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      text-align: center;
      position: relative;
      padding: 40px 20px;
    }

    .cover-logos {
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      display: table;
      width: calc(100% - 40px);
    }

    .cover-logo-left {
      display: table-cell;
      width: 50%;
      text-align: left;
      vertical-align: middle;
    }

    .cover-logo-right {
      display: table-cell;
      width: 50%;
      text-align: right;
      vertical-align: middle;
    }

    .cover-logo-left img,
    .cover-logo-right img {
      max-height: 70px;
      max-width: 200px;
      height: auto;
      width: auto;
    }

    .cover-content {
      z-index: 1;
      margin-top: 100px;
    }

    .cover-title {
      font-size: 32pt;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 10px;
      text-transform: uppercase;
    }

    .cover-subtitle {
      font-size: 16pt;
      color: #2563eb;
      margin-bottom: 40px;
    }

    .cover-image {
      width: 100%;
      max-width: 600px;
      max-height: 400px;
      object-fit: cover;
      border: 3px solid #2563eb;
      border-radius: 8px;
      margin: 30px auto;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .cover-info {
      margin-top: 40px;
      background-color: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .cover-info-row {
      display: table;
      width: 100%;
      margin: 8px 0;
      text-align: left;
    }

    .cover-info-label {
      display: table-cell;
      font-weight: bold;
      color: #1e40af;
      width: 40%;
      padding: 5px 10px;
    }

    .cover-info-value {
      display: table-cell;
      color: #374151;
      width: 60%;
      padding: 5px 10px;
    }

    .cover-inspection-type {
      font-size: 18pt;
      font-weight: bold;
      color: #059669;
      margin: 20px 0;
      text-transform: uppercase;
    }
  </style>
  `
}

/**
 * Genera el contenido HTML del informe
 */
export function generateReportHTML(data: ReportData, t: ReportTranslations): string {
  const { projectData, images, rdtLogoBase64, clientLogoBase64, coverImageBase64 } = data

  // Calcular estadísticas generales
  const totalDetections = images.reduce((sum, img) => sum + img.detections.length, 0)
  const severityCounts = {
    alto: 0,
    medio: 0,
    bajo: 0
  }

  images.forEach(img => {
    img.detections.forEach(det => {
      if (det.severity === 'alto') severityCounts.alto++
      else if (det.severity === 'medio') severityCounts.medio++
      else if (det.severity === 'bajo') severityCounts.bajo++
    })
  })

  const avgConfidence = totalDetections > 0
    ? (images.reduce((sum, img) => sum + img.detections.reduce((s, d) => s + d.confidence, 0), 0) / totalDetections * 100).toFixed(1)
    : '0'

  // Obtener imagen aérea de portada (usar coverImageBase64 o el primer mapa disponible)
  const coverImage = coverImageBase64 || images.find(img => img.mapImageBase64)?.mapImageBase64

  return `
    <!-- PORTADA -->
    <div class="cover-page">
      <div class="cover-logos">
        ${clientLogoBase64 ? `
        <div class="cover-logo-left">
          <img src="${clientLogoBase64}" alt="Client Logo">
        </div>
        ` : '<div class="cover-logo-left"></div>'}
        ${rdtLogoBase64 ? `
        <div class="cover-logo-right">
          <img src="${rdtLogoBase64}" alt="RDT Logo">
        </div>
        ` : '<div class="cover-logo-right"></div>'}
      </div>

      <div class="cover-content">
        <h1 class="cover-title">${t.coverTitle}</h1>
        <p class="cover-subtitle">${t.coverSubtitle}</p>

        <p class="cover-inspection-type">${t.coverInspectionType}</p>

        ${coverImage ? `
        <img src="${coverImage}" class="cover-image" alt="Vista aérea de la ubicación">
        ` : ''}

        <div class="cover-info">
          ${projectData.location ? `
          <div class="cover-info-row">
            <div class="cover-info-label">${t.coverLocation}:</div>
            <div class="cover-info-value">${projectData.location}</div>
          </div>
          ` : ''}
          <div class="cover-info-row">
            <div class="cover-info-label">${t.coverDate}:</div>
            <div class="cover-info-value">${new Date(projectData.inspectionDate).toLocaleDateString(data.language === 'en' ? 'en-US' : data.language === 'pt' ? 'pt-PT' : 'es-ES')}</div>
          </div>
          <div class="cover-info-row">
            <div class="cover-info-label">${t.client}:</div>
            <div class="cover-info-value">${projectData.client}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- INICIO DEL INFORME - Segunda página -->
    <div class="content-page">
      <div class="page-header">
        <div class="header-logos">
          ${clientLogoBase64 ? `
          <div class="header-logo-left">
            <img src="${clientLogoBase64}" alt="Client Logo">
          </div>
          ` : '<div class="header-logo-left"></div>'}
          ${rdtLogoBase64 ? `
          <div class="header-logo-right">
            <img src="${rdtLogoBase64}" alt="RDT Logo">
          </div>
          ` : '<div class="header-logo-right"></div>'}
        </div>
      </div>

      <h1>${t.title}</h1>
    <p style="text-align: center; font-size: 12pt; color: #666; margin-bottom: 20px; margin-top: 5px;">
      ${t.subtitle}
    </p>

    <h2>1. ${t.projectData}</h2>
    <table>
      <tr>
        <th width="30%">${t.projectName}</th>
        <td width="70%">${projectData.projectName}</td>
      </tr>
      <tr>
        <th>${t.workNumber}</th>
        <td>${projectData.workNumber}</td>
      </tr>
      <tr>
        <th>${t.orderNumber}</th>
        <td>${projectData.orderNumber}</td>
      </tr>
      <tr>
        <th>${t.client}</th>
        <td>${projectData.client}</td>
      </tr>
      <tr>
        <th>${t.location}</th>
        <td>${projectData.location}</td>
      </tr>
      <tr>
        <th>${t.inspectionDate}</th>
        <td>${new Date(projectData.inspectionDate).toLocaleDateString(data.language === 'en' ? 'en-US' : data.language === 'pt' ? 'pt-PT' : 'es-ES')}</td>
      </tr>
      <tr>
        <th>${t.reportDate}</th>
        <td>${new Date(projectData.reportDate).toLocaleDateString(data.language === 'en' ? 'en-US' : data.language === 'pt' ? 'pt-PT' : 'es-ES')}</td>
      </tr>
      <tr>
        <th>${t.inspector}</th>
        <td>${projectData.inspector}</td>
      </tr>
      <tr>
        <th>${t.reviewer}</th>
        <td>${projectData.reviewer}</td>
      </tr>
    </table>

    ${projectData.introduction ? `
    <h2>2. ${t.introduction}</h2>
    <p style="line-height: 1.6;">
      ${projectData.introduction.replace(/\n/g, '<br>')}
    </p>
    ` : ''}

    <h2>${projectData.introduction ? '3' : '2'}. ${t.detectionMethodology}</h2>
    <p style="line-height: 1.6;">
      ${t.methodologyIntro}
    </p>

    <h3>${t.severityCriteria}</h3>
    <p style="margin-left: 15px; line-height: 1.6;">
      <strong class="severity-high">• ${t.severityCriteriaExtensive}</strong>
    </p>
    <p style="margin-left: 15px; line-height: 1.6;">
      <strong class="severity-medium">• ${t.severityCriteriaModerate}</strong>
    </p>
    <p style="margin-left: 15px; line-height: 1.6;">
      <strong class="severity-low">• ${t.severityCriteriaSlight}</strong>
    </p>

    <h3>${t.confidenceLevel}</h3>
    <p style="line-height: 1.6;">
      ${t.confidenceLevelExplanation}
    </p>

    <h4>${t.lowConfidenceProtocol}</h4>
    <p style="line-height: 1.6; background-color: #fef3c7; padding: 10px; border-left: 4px solid #f59e0b; margin: 10px 0;">
      <strong>${t.qualityProtocol}</strong>
    </p>

    <div class="photo-section">
      <h2>${projectData.introduction ? '4' : '3'}. ${t.photographic} ${t.annex}</h2>
      ${images.map((img, index) => `
        <div class="photo-container">
          <h3>${t.photo} ${index + 1}: ${img.filename}</h3>

          <img src="${img.urlWithBoxes || img.url}" class="photo-img" alt="${t.photo} ${index + 1}">

          <div class="metadata">
            <p><strong>${t.gpsCoordinates}:</strong> ${formatGPSCoordinates(img.gps.latitude, img.gps.longitude, img.gps.altitude)}</p>
            <p><strong>${data.language === 'en' ? 'Date and Time' : data.language === 'pt' ? 'Data e Hora' : 'Fecha y Hora'}:</strong> ${img.timestamp}</p>
          </div>

          ${isValidGPSCoordinates(img.gps.latitude, img.gps.longitude) && img.mapImageBase64 ? `
          <div class="map-container">
            <h4>📍 ${data.language === 'en' ? 'Geographic Location' : data.language === 'pt' ? 'Localização Geográfica' : 'Ubicación Geográfica'}</h4>
            <img
              src="${img.mapImageBase64}"
              class="map-img"
              alt="${data.language === 'en' ? 'Location map' : data.language === 'pt' ? 'Mapa de localização' : 'Mapa de ubicación'}"
            >
            <p style="text-align: center; font-size: 9pt; color: #666; margin-top: 5px;">
              ${t.gpsCoordinates}: ${img.gps.latitude}, ${img.gps.longitude}
            </p>
          </div>
          ` : ''}

          <h4>${t.detectedAreas}:</h4>
          <table>
            <tr>
              <th>${t.detectionNumber}</th>
              <th>${t.severity}</th>
              <th>${t.confidence}</th>
            </tr>
            ${img.detections.map((det, detIndex) => `
            <tr>
              <td>${detIndex + 1}</td>
              <td class="severity-${det.severity === 'alto' ? 'high' : det.severity === 'medio' ? 'medium' : 'low'}">
                ${det.severity === 'alto' ? t.extensive : det.severity === 'medio' ? t.moderate : t.slight}
              </td>
              <td>${(det.confidence * 100).toFixed(1)}%</td>
            </tr>
            `).join('')}
          </table>

          <h4>${t.technicalAnalysis}</h4>
          <p>${img.analysis || t.noAnalysisGenerated}</p>
        </div>
      `).join('')}
    </div>

    <h2>${projectData.introduction ? '5' : '4'}. ${t.conclusions}</h2>
    <p>
      ${severityCounts.alto > 0
        ? `${data.language === 'en' ? 'Identified' : data.language === 'pt' ? 'Identificaram-se' : 'Se identificaron'} ${severityCounts.alto} ${t.highAreasFound}`
        : t.highAreasNotFound}
    </p>
    ${severityCounts.medio > 0 ? `
    <p>
      ${data.language === 'en' ? 'Detected' : data.language === 'pt' ? 'Detectaram-se' : 'Se detectaron'} ${severityCounts.medio} ${t.mediumAreasFound}
    </p>
    ` : ''}
    <p>
      ${t.periodicInspection}
    </p>

    <div class="footer">
      <p>${t.generatedBy}</p>
      <p>${t.generationDate}: ${new Date().toLocaleDateString(data.language === 'en' ? 'en-US' : data.language === 'pt' ? 'pt-PT' : 'es-ES')} - ${new Date().toLocaleTimeString(data.language === 'en' ? 'en-US' : data.language === 'pt' ? 'pt-PT' : 'es-ES')}</p>
    </div>
    </div><!-- Cierre de content-page -->
  `
}

/**
 * Abre el diálogo de impresión del navegador
 */
export function printReport(data: ReportData, existingWindow?: Window | null): void {
  try {
    const language = data.language || 'es'
    const t = getTranslations(language)

    const printWindow = existingWindow || window.open('', '_blank', 'width=800,height=600')

    if (!printWindow) {
      throw new Error('No se pudo abrir la ventana de impresión.')
    }

    const loadingText = language === 'en' ? 'Generating inspection report...' : language === 'pt' ? 'Gerando relatório de inspeção...' : 'Generando informe de inspección...'
    const processingText = language === 'en' ? 'Processing' : language === 'pt' ? 'Processando' : 'Procesando'
    const imagesText = language === 'en' ? 'images with bounding boxes' : language === 'pt' ? 'imagens com caixas delimitadoras' : 'imágenes con bounding boxes'
    const waitText = language === 'en' ? 'Please wait, this may take a few moments.' : language === 'pt' ? 'Por favor aguarde, isto pode demorar alguns momentos.' : 'Por favor espera, esto puede tomar unos momentos.'

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${loadingText}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #f3f4f6;
          }
          .loader { text-align: center; }
          .spinner {
            border: 4px solid #f3f4f6;
            border-top: 4px solid #2563eb;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="loader">
          <div class="spinner"></div>
          <h2>${loadingText}</h2>
          <p>${processingText} ${data.images.length} ${imagesText}</p>
          <p>${waitText}</p>
        </div>
      </body>
      </html>
    `)

    const htmlContent = generateReportHTML(data, t)

    setTimeout(() => {
      printWindow.document.open()
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${t.title} - ${data.projectData.projectName}</title>
          ${generatePrintStyles()}
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `)
      printWindow.document.close()

      const imageCount = data.images.length
      const loadTime = Math.min(imageCount * 100, 5000)

      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print()
          printWindow.onafterprint = function() {
            printWindow.close()
          }
        }, loadTime)
      }
    }, 100)

  } catch (error) {
    console.error('Error printing report:', error)
    throw new Error('No se pudo imprimir el informe')
  }
}

/**
 * Genera estilos específicos para impresión
 */
function generatePrintStyles(): string {
  return `
  <style>
    @media print {
      @page {
        size: A4;
        margin: 3cm 2cm 2cm 2cm;
      }
      body {
        font-family: Calibri, Arial, sans-serif;
        font-size: 10pt;
        line-height: 1.4;
      }
      /* Portada: mostrar solo los logos integrados, página completa */
      .cover-page {
        page-break-after: always;
        min-height: 100vh;
      }
      .cover-page .cover-logos {
        display: table !important;
        position: absolute;
        top: 20px;
        left: 20px;
        right: 20px;
        width: calc(100% - 40px);
      }
      /* Content-page: ocultar el encabezado redundante */
      .content-page .page-header {
        display: none !important;
      }
      .photo-section {
        page-break-before: always;
      }
      .photo-container {
        page-break-inside: avoid;
        margin-bottom: 30px;
      }
    }

    body {
      font-family: Calibri, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      margin: 20px;
    }

    .header-logos {
      display: table;
      width: 100%;
    }

    .header-logo-left {
      display: table-cell;
      width: 50%;
      text-align: left;
      vertical-align: middle;
    }

    .header-logo-right {
      display: table-cell;
      width: 50%;
      text-align: right;
      vertical-align: middle;
    }

    .header-logo-left img,
    .header-logo-right img {
      max-height: 60px;
      max-width: 150px;
      height: auto;
      width: auto;
    }

    h1 {
      font-size: 18pt;
      font-weight: bold;
      color: #2563eb;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 10px;
      margin-top: 20px;
      text-align: center;
    }

    h2 {
      font-size: 14pt;
      font-weight: bold;
      color: #1e40af;
      margin-top: 15px;
    }

    h3 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 10px;
    }

    h4 {
      font-size: 11pt;
      font-weight: bold;
      margin-top: 8px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }

    td, th {
      border: 1px solid #000;
      padding: 8px;
      text-align: left;
    }

    th {
      background-color: #e5e7eb;
      font-weight: bold;
    }

    .photo-img {
      width: 100%;
      max-width: 100%;
      max-height: 550px;
      height: auto;
      border: 1px solid #ccc;
      margin: 5px 0;
      object-fit: contain;
    }

    .map-container {
      margin: 15px 0;
      border: 1px solid #ddd;
      padding: 10px;
      background-color: #f9fafb;
      page-break-inside: avoid;
    }

    .map-img {
      width: 100%;
      max-width: 600px;
      height: auto;
      border: 1px solid #ccc;
      display: block;
      margin: 10px auto;
    }

    .metadata {
      font-size: 9pt;
      color: #666;
      margin: 3px 0;
    }

    .metadata p {
      margin: 2px 0;
    }

    .severity-high {
      color: #dc2626;
      font-weight: bold;
    }

    .severity-medium {
      color: #f59e0b;
      font-weight: bold;
    }

    .severity-low {
      color: #10b981;
      font-weight: bold;
    }

    .footer {
      margin-top: 40px;
      border-top: 1px solid #ccc;
      padding-top: 10px;
      font-size: 9pt;
      text-align: center;
      color: #666;
    }

    /* Estilos para la portada */
    .cover-page {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      text-align: center;
      position: relative;
      padding: 40px 20px;
    }

    .cover-logos {
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      display: table;
      width: calc(100% - 40px);
    }

    .cover-logo-left {
      display: table-cell;
      width: 50%;
      text-align: left;
      vertical-align: middle;
    }

    .cover-logo-right {
      display: table-cell;
      width: 50%;
      text-align: right;
      vertical-align: middle;
    }

    .cover-logo-left img,
    .cover-logo-right img {
      max-height: 70px;
      max-width: 200px;
      height: auto;
      width: auto;
    }

    .cover-content {
      z-index: 1;
      margin-top: 100px;
    }

    .cover-title {
      font-size: 32pt;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 10px;
      text-transform: uppercase;
      border-bottom: none;
    }

    .cover-subtitle {
      font-size: 16pt;
      color: #2563eb;
      margin-bottom: 40px;
    }

    .cover-inspection-type {
      font-size: 18pt;
      font-weight: bold;
      color: #059669;
      margin: 20px 0;
      text-transform: uppercase;
    }

    .cover-image {
      width: 100%;
      max-width: 600px;
      max-height: 400px;
      object-fit: cover;
      border: 3px solid #2563eb;
      border-radius: 8px;
      margin: 30px auto;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .cover-info {
      margin-top: 40px;
      background-color: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .cover-info-row {
      display: table;
      width: 100%;
      margin: 8px 0;
      text-align: left;
    }

    .cover-info-label {
      display: table-cell;
      font-weight: bold;
      color: #1e40af;
      width: 40%;
      padding: 5px 10px;
    }

    .cover-info-value {
      display: table-cell;
      color: #374151;
      width: 60%;
      padding: 5px 10px;
    }

    .content-page {
      page-break-before: auto;
    }
  </style>
  `
}
