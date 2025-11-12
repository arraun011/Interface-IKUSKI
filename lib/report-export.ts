/**
 * Utilidades para exportar informes a Word y funcionalidad de impresión
 */

import {
  getStaticMapImageUrl,
  getStaticMapBase64,
  getOpenStreetMapUrl,
  getGoogleMapsUrl,
  isValidGPSCoordinates,
  formatGPSCoordinates
} from './maps-utils'

interface ReportData {
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
  }
  images: Array<{
    id: string
    filename: string
    url: string
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
}

/**
 * Genera y descarga un informe en formato Word (.docx)
 */
export async function exportToWord(data: ReportData, logoBase64?: string): Promise<void> {
  try {
    // Crear el HTML del documento
    const htmlContent = generateReportHTML(data, logoBase64)

    // Crear blob con el contenido HTML en formato compatible con Word
    const blob = new Blob(
      [
        `
        <html xmlns:o='urn:schemas-microsoft-com:office:office'
              xmlns:w='urn:schemas-microsoft-com:office:word'
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Informe de Inspección - ${data.projectData.projectName}</title>
          <style>
            body {
              font-family: Calibri, Arial, sans-serif;
              font-size: 11pt;
              line-height: 1.5;
              margin: 2cm;
            }
            h1 {
              font-size: 18pt;
              font-weight: bold;
              color: #2563eb;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 10px;
              margin-top: 20px;
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
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              max-width: 250px;
              height: auto;
              margin: 0 auto 20px auto;
              display: block;
            }
            .photo-section {
              page-break-before: always;
              margin-top: 20px;
            }
            .photo-container {
              margin: 20px 0;
              page-break-inside: avoid;
            }
            .photo-img {
              width: 100%;
              max-width: 100%;
              height: auto;
              border: 1px solid #ccc;
            }
            .map-container {
              margin: 15px 0;
              border: 1px solid #ddd;
              padding: 10px;
              background-color: #f9fafb;
            }
            .map-img {
              width: 100%;
              max-width: 600px;
              height: auto;
              border: 1px solid #ccc;
              display: block;
              margin: 10px auto;
            }
            .map-link {
              display: block;
              text-align: center;
              color: #2563eb;
              text-decoration: none;
              font-size: 10pt;
              margin-top: 5px;
              font-weight: bold;
            }
            .map-link:hover {
              text-decoration: underline;
            }
            .metadata {
              font-size: 9pt;
              color: #666;
              margin-top: 5px;
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
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `
      ],
      {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
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
 * Genera el contenido HTML del informe
 */
function generateReportHTML(data: ReportData, logoBase64?: string): string {
  const { projectData, images } = data

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

  return `
    <div class="header">
      ${logoBase64 ? `<img src="${logoBase64}" alt="IKUSKI Logo" class="logo">` : ''}
      <h1>INFORME DE INSPECCIÓN</h1>
      <h2>Detección de Corrosión mediante IA</h2>
    </div>

    <h2>1. DATOS DEL PROYECTO</h2>
    <table>
      <tr>
        <th width="30%">Campo</th>
        <th width="70%">Valor</th>
      </tr>
      <tr>
        <td>Nombre del Proyecto</td>
        <td>${projectData.projectName}</td>
      </tr>
      <tr>
        <td>Nº de Obra</td>
        <td>${projectData.workNumber}</td>
      </tr>
      <tr>
        <td>Nº de Pedido</td>
        <td>${projectData.orderNumber}</td>
      </tr>
      <tr>
        <td>Cliente</td>
        <td>${projectData.client}</td>
      </tr>
      <tr>
        <td>Localización</td>
        <td>${projectData.location}</td>
      </tr>
      <tr>
        <td>Fecha de Inspección</td>
        <td>${new Date(projectData.inspectionDate).toLocaleDateString('es-ES')}</td>
      </tr>
      <tr>
        <td>Fecha del Informe</td>
        <td>${new Date(projectData.reportDate).toLocaleDateString('es-ES')}</td>
      </tr>
      <tr>
        <td>Elaborado por</td>
        <td>${projectData.inspector}</td>
      </tr>
      <tr>
        <td>Revisado por</td>
        <td>${projectData.reviewer}</td>
      </tr>
    </table>

    <h2>2. RESUMEN EJECUTIVO</h2>
    <p>
      Se realizó una inspección mediante captura aérea con dron de la estructura ubicada en ${projectData.location}.
      Las imágenes capturadas fueron procesadas mediante sistema de visión artificial para detectar automáticamente
      áreas con presencia de corrosión.
    </p>

    <h3>2.1 Resultados Generales</h3>
    <table>
      <tr>
        <th>Total de Imágenes Analizadas</th>
        <td>${images.length}</td>
      </tr>
      <tr>
        <th>Total de Detecciones</th>
        <td>${totalDetections}</td>
      </tr>
      <tr>
        <th class="severity-high">Severidad Alta</th>
        <td class="severity-high">${severityCounts.alto} (${((severityCounts.alto / totalDetections) * 100).toFixed(1)}%)</td>
      </tr>
      <tr>
        <th class="severity-medium">Severidad Media</th>
        <td class="severity-medium">${severityCounts.medio} (${((severityCounts.medio / totalDetections) * 100).toFixed(1)}%)</td>
      </tr>
      <tr>
        <th class="severity-low">Severidad Baja</th>
        <td class="severity-low">${severityCounts.bajo} (${((severityCounts.bajo / totalDetections) * 100).toFixed(1)}%)</td>
      </tr>
    </table>

    <div class="photo-section">
      <h2>3. ANEXO FOTOGRÁFICO Y ANÁLISIS DETALLADO</h2>
      ${images.map((img, index) => `
        <div class="photo-container">
          <h3>Fotografía ${index + 1}: ${img.filename}</h3>

          <img src="${img.url}" class="photo-img" alt="Fotografía ${index + 1}">

          <div class="metadata">
            <p><strong>Coordenadas GPS:</strong> ${formatGPSCoordinates(img.gps.latitude, img.gps.longitude, img.gps.altitude)}</p>
            <p><strong>Fecha y Hora:</strong> ${img.timestamp}</p>
          </div>

          ${isValidGPSCoordinates(img.gps.latitude, img.gps.longitude) && img.mapImageBase64 ? `
          <div class="map-container">
            <h4>📍 Ubicación Geográfica</h4>
            <img
              src="${img.mapImageBase64}"
              class="map-img"
              alt="Mapa de ubicación"
            >
            <div style="text-align: center; margin-top: 8px;">
              <a
                href="${getOpenStreetMapUrl(img.gps.latitude, img.gps.longitude)}"
                target="_blank"
                class="map-link"
                style="margin-right: 15px;"
              >
                🗺️ Abrir en OpenStreetMap
              </a>
              <a
                href="${getGoogleMapsUrl(img.gps.latitude, img.gps.longitude)}"
                target="_blank"
                class="map-link"
              >
                🌍 Abrir en Google Maps
              </a>
            </div>
            <p style="text-align: center; font-size: 9pt; color: #666; margin-top: 5px;">
              Coordenadas: ${img.gps.latitude}, ${img.gps.longitude}
            </p>
          </div>
          ` : ''}

          <h4>Detecciones:</h4>
          <table>
            <tr>
              <th>Total Detecciones</th>
              <th>Alta</th>
              <th>Media</th>
              <th>Baja</th>
            </tr>
            <tr>
              <td>${img.detections.length}</td>
              <td class="severity-high">${img.detections.filter(d => d.severity === 'alto').length}</td>
              <td class="severity-medium">${img.detections.filter(d => d.severity === 'medio').length}</td>
              <td class="severity-low">${img.detections.filter(d => d.severity === 'bajo').length}</td>
            </tr>
          </table>

          <h4>Análisis Técnico:</h4>
          <p>${img.analysis || 'Sin análisis generado'}</p>
        </div>
      `).join('')}
    </div>

    <h2>4. CONCLUSIONES Y RECOMENDACIONES</h2>
    <p>
      ${severityCounts.alto > 0
        ? `Se identificaron ${severityCounts.alto} área(s) de severidad alta que requieren intervención inmediata.`
        : 'No se identificaron áreas de severidad alta.'}
    </p>
    <p>
      ${severityCounts.medio > 0
        ? `Se detectaron ${severityCounts.medio} área(s) de severidad media, recomendándose planificar mantenimiento preventivo.`
        : ''}
    </p>
    <p>
      Se recomienda realizar inspecciones periódicas mediante dron para monitorear la evolución de las áreas afectadas.
    </p>

    <div class="footer">
      <p>Generado por IKUSKI - Sistema de Detección de Corrosión mediante IA</p>
      <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES')} - ${new Date().toLocaleTimeString('es-ES')}</p>
    </div>
  `
}

/**
 * Abre el diálogo de impresión del navegador
 */
export function printReport(data: ReportData, logoBase64?: string): void {
  try {
    // Crear una ventana nueva para imprimir
    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      throw new Error('No se pudo abrir la ventana de impresión. Verifica que no esté bloqueada por el navegador.')
    }

    const htmlContent = generateReportHTML(data, logoBase64)

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Informe de Inspección - ${data.projectData.projectName}</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 2cm;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 10pt;
              line-height: 1.4;
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
            font-family: Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            margin: 20px;
          }
          h1 {
            font-size: 18pt;
            font-weight: bold;
            color: #2563eb;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
            margin-top: 20px;
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
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .photo-img {
            width: 100%;
            max-width: 100%;
            height: auto;
            border: 1px solid #ccc;
            margin: 10px 0;
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
          .map-link {
            display: block;
            text-align: center;
            color: #2563eb;
            text-decoration: none;
            font-size: 10pt;
            margin-top: 5px;
            font-weight: bold;
          }
          .metadata {
            font-size: 9pt;
            color: #666;
            margin: 5px 0;
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
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `)

    printWindow.document.close()

    // Esperar a que se carguen las imágenes antes de imprimir
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }

  } catch (error) {
    console.error('Error printing report:', error)
    throw new Error('No se pudo imprimir el informe')
  }
}
