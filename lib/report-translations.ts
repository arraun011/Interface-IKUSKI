export interface ReportTranslations {
  title: string
  subtitle: string
  projectData: string
  workNumber: string
  orderNumber: string
  projectName: string
  location: string
  inspectionDate: string
  reportDate: string
  inspector: string
  reviewer: string
  client: string
  introduction: string
  technicalSummary: string
  totalDetections: string
  highSeverity: string
  mediumSeverity: string
  lowSeverity: string
  avgConfidence: string
  photographic: string
  annex: string
  photo: string
  gpsCoordinates: string
  detectedAreas: string
  severity: string
  extensive: string
  moderate: string
  slight: string
  confidence: string
  technicalAnalysis: string
  noAnalysisGenerated: string
  conclusions: string
  highAreasFound: string
  highAreasNotFound: string
  mediumAreasFound: string
  periodicInspection: string
  generatedBy: string
  generationDate: string
  detectionNumber: string
  // Prompts de IA
  aiSystemPrompt: string
  aiUserPromptTemplate: string
  // Portada
  coverTitle: string
  coverSubtitle: string
  coverInspectionType: string
  coverLocation: string
  coverCity: string
  coverCountry: string
  coverDate: string
}

const translations: Record<'es' | 'en' | 'pt', ReportTranslations> = {
  es: {
    title: 'INFORME DE INSPECCIÓN',
    subtitle: 'Detección de Corrosión mediante IA',
    projectData: 'DATOS DEL PROYECTO',
    workNumber: 'Nº de Obra',
    orderNumber: 'Nº de Pedido',
    projectName: 'Nombre del Proyecto',
    location: 'Localización',
    inspectionDate: 'Fecha de Inspección',
    reportDate: 'Fecha del Informe',
    inspector: 'Elaborado por',
    reviewer: 'Revisado por',
    client: 'Cliente',
    introduction: 'INTRODUCCIÓN',
    technicalSummary: 'RESUMEN TÉCNICO',
    totalDetections: 'Total de detecciones',
    highSeverity: 'Corrosión Extensa',
    mediumSeverity: 'Corrosión Moderada',
    lowSeverity: 'Corrosión Leve',
    avgConfidence: 'Confianza promedio',
    photographic: 'ANEXO FOTOGRÁFICO',
    annex: 'CON ANÁLISIS',
    photo: 'Foto',
    gpsCoordinates: 'Coordenadas GPS',
    detectedAreas: 'Áreas detectadas',
    severity: 'Nivel',
    extensive: 'Extensa',
    moderate: 'Moderada',
    slight: 'Leve',
    confidence: 'Confianza',
    technicalAnalysis: 'Análisis Técnico:',
    noAnalysisGenerated: 'Sin análisis generado',
    conclusions: 'CONCLUSIONES Y RECOMENDACIONES',
    highAreasFound: 'área(s) de severidad alta que requieren intervención inmediata.',
    highAreasNotFound: 'No se identificaron áreas de severidad alta.',
    mediumAreasFound: 'área(s) de severidad media, recomendándose planificar mantenimiento preventivo.',
    periodicInspection: 'Se recomienda realizar inspecciones periódicas mediante dron para monitorear la evolución de las áreas afectadas.',
    generatedBy: 'Generado por IKUSKI - Sistema de Detección de Corrosión mediante IA',
    generationDate: 'Fecha de generación',
    detectionNumber: 'Detección',
    aiSystemPrompt: 'Eres un ingeniero experto en inspección de infraestructuras. Estás analizando imágenes de inspección con dron de gaseoductos en exterior, buscando óxido y deterioro de pintura. Proporciona análisis técnicos precisos y objetivos sin mencionar la fiabilidad del modelo de detección.',
    aiUserPromptTemplate: `Analiza esta imagen de una estructura metálica inspeccionada. El sistema de IA ha detectado {detections} área(s) con presencia de corrosión u oxidación.

Por favor, proporciona un análisis técnico profesional conciso (máximo 3-4 líneas) que describa:
1. Las características de la corrosión u oxidación observada (ubicación, extensión, tipo de deterioro)
2. Posibles causas del deterioro y factores contribuyentes
3. Recomendaciones específicas de intervención o mantenimiento

Enfócate en la corrosión detectada de forma objetiva y técnica, sin hacer referencia a niveles de severidad predefinidos ni describir el estado general de la estructura. El análisis debe ser preciso y orientado a la acción.`,
    coverTitle: 'INFORME DE INSPECCIÓN',
    coverSubtitle: 'Sistema de Detección de Corrosión mediante IA',
    coverInspectionType: 'Inspección de Gaseoducto con Dron',
    coverLocation: 'Localización',
    coverCity: 'Población',
    coverCountry: 'País',
    coverDate: 'Fecha de Inspección'
  },
  en: {
    title: 'INSPECTION REPORT',
    subtitle: 'AI-based Corrosion Detection',
    projectData: 'PROJECT DATA',
    workNumber: 'Work No.',
    orderNumber: 'Order No.',
    projectName: 'Project Name',
    location: 'Location',
    inspectionDate: 'Inspection Date',
    reportDate: 'Report Date',
    inspector: 'Prepared by',
    reviewer: 'Reviewed by',
    client: 'Client',
    introduction: 'INTRODUCTION',
    technicalSummary: 'TECHNICAL SUMMARY',
    totalDetections: 'Total detections',
    highSeverity: 'Extensive Corrosion',
    mediumSeverity: 'Moderate Corrosion',
    lowSeverity: 'Slight Corrosion',
    avgConfidence: 'Average confidence',
    photographic: 'PHOTOGRAPHIC',
    annex: 'ANNEX WITH ANALYSIS',
    photo: 'Photo',
    gpsCoordinates: 'GPS Coordinates',
    detectedAreas: 'Detected areas',
    severity: 'Level',
    extensive: 'Extensive',
    moderate: 'Moderate',
    slight: 'Slight',
    confidence: 'Confidence',
    technicalAnalysis: 'Technical Analysis:',
    noAnalysisGenerated: 'No analysis generated',
    conclusions: 'CONCLUSIONS AND RECOMMENDATIONS',
    highAreasFound: 'high severity area(s) requiring immediate intervention.',
    highAreasNotFound: 'No high severity areas identified.',
    mediumAreasFound: 'medium severity area(s), recommending preventive maintenance planning.',
    periodicInspection: 'Regular drone inspections are recommended to monitor the evolution of affected areas.',
    generatedBy: 'Generated by IKUSKI - AI Corrosion Detection System',
    generationDate: 'Generation date',
    detectionNumber: 'Detection',
    aiSystemPrompt: 'You are an expert engineer in infrastructure inspection. You are analyzing drone inspection images of outdoor gas pipelines, looking for rust and paint deterioration. Provide precise and objective technical analysis without mentioning the detection model reliability.',
    aiUserPromptTemplate: `Analyze this image of an inspected metal structure. The AI system has detected {detections} area(s) with presence of corrosion or oxidation.

Please provide a concise professional technical analysis (maximum 3-4 lines) describing:
1. The characteristics of the observed corrosion or oxidation (location, extent, type of deterioration)
2. Possible causes of deterioration and contributing factors
3. Specific intervention or maintenance recommendations

Focus on the detected corrosion in an objective and technical manner, without referring to predefined severity levels or describing the general condition of the structure. The analysis should be precise and action-oriented.`,
    coverTitle: 'INSPECTION REPORT',
    coverSubtitle: 'AI-based Corrosion Detection System',
    coverInspectionType: 'Drone Gas Pipeline Inspection',
    coverLocation: 'Location',
    coverCity: 'City',
    coverCountry: 'Country',
    coverDate: 'Inspection Date'
  },
  pt: {
    title: 'RELATÓRIO DE INSPEÇÃO',
    subtitle: 'Detecção de Corrosão por IA',
    projectData: 'DADOS DO PROJETO',
    workNumber: 'Nº de Obra',
    orderNumber: 'Nº de Pedido',
    projectName: 'Nome do Projeto',
    location: 'Localização',
    inspectionDate: 'Data de Inspeção',
    reportDate: 'Data do Relatório',
    inspector: 'Elaborado por',
    reviewer: 'Revisado por',
    client: 'Cliente',
    introduction: 'INTRODUÇÃO',
    technicalSummary: 'RESUMO TÉCNICO',
    totalDetections: 'Total de detecções',
    highSeverity: 'Corrosão Extensa',
    mediumSeverity: 'Corrosão Moderada',
    lowSeverity: 'Corrosão Leve',
    avgConfidence: 'Confiança média',
    photographic: 'ANEXO FOTOGRÁFICO',
    annex: 'COM ANÁLISE',
    photo: 'Foto',
    gpsCoordinates: 'Coordenadas GPS',
    detectedAreas: 'Áreas detectadas',
    severity: 'Nível',
    extensive: 'Extensa',
    moderate: 'Moderada',
    slight: 'Leve',
    confidence: 'Confiança',
    technicalAnalysis: 'Análise Técnica:',
    noAnalysisGenerated: 'Sem análise gerada',
    conclusions: 'CONCLUSÕES E RECOMENDAÇÕES',
    highAreasFound: 'área(s) de severidade alta que requerem intervenção imediata.',
    highAreasNotFound: 'Não foram identificadas áreas de severidade alta.',
    mediumAreasFound: 'área(s) de severidade média, recomendando-se planejar manutenção preventiva.',
    periodicInspection: 'Recomenda-se realizar inspeções periódicas com drone para monitorar a evolução das áreas afetadas.',
    generatedBy: 'Gerado por IKUSKI - Sistema de Detecção de Corrosão por IA',
    generationDate: 'Data de geração',
    detectionNumber: 'Detecção',
    aiSystemPrompt: 'Você é um engenheiro especialista em inspeção de infraestruturas. Está analisando imagens de inspeção com drone de gasodutos em exterior, procurando ferrugem e deterioração de pintura. Forneça análises técnicas precisas e objetivas sem mencionar a confiabilidade do modelo de detecção.',
    aiUserPromptTemplate: `Analise esta imagem de uma estrutura metálica inspecionada. O sistema de IA detectou {detections} área(s) com presença de corrosão ou oxidação.

Por favor, forneça uma análise técnica profissional concisa (máximo 3-4 linhas) que descreva:
1. As características da corrosão ou oxidação observada (localização, extensão, tipo de deterioração)
2. Possíveis causas da deterioração e fatores contribuintes
3. Recomendações específicas de intervenção ou manutenção

Foque na corrosão detectada de forma objetiva e técnica, sem fazer referência a níveis de severidade predefinidos nem descrever o estado geral da estrutura. A análise deve ser precisa e orientada à ação.`,
    coverTitle: 'RELATÓRIO DE INSPEÇÃO',
    coverSubtitle: 'Sistema de Detecção de Corrosão por IA',
    coverInspectionType: 'Inspeção de Gasoduto com Drone',
    coverLocation: 'Localização',
    coverCity: 'Cidade',
    coverCountry: 'País',
    coverDate: 'Data de Inspeção'
  }
}

export function getTranslations(language: 'es' | 'en' | 'pt'): ReportTranslations {
  return translations[language]
}
