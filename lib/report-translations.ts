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
  // Metodología y criterios de detección
  detectionMethodology: string
  methodologyIntro: string
  severityCriteria: string
  severityCriteriaExtensive: string
  severityCriteriaModerate: string
  severityCriteriaSlight: string
  confidenceLevel: string
  confidenceLevelExplanation: string
  lowConfidenceProtocol: string
  qualityProtocol: string
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
    coverDate: 'Fecha de Inspección',
    detectionMethodology: 'METODOLOGÍA Y CRITERIOS DE DETECCIÓN',
    methodologyIntro: 'El sistema de detección de corrosión mediante IA utiliza modelos de visión artificial entrenados específicamente para identificar y clasificar deterioro en estructuras metálicas. La evaluación se basa en dos parámetros fundamentales:',
    severityCriteria: 'Criterios de Severidad',
    severityCriteriaExtensive: 'Corrosión Extensa: Áreas con deterioro significativo de la superficie metálica, pérdida avanzada de recubrimiento protector y presencia de oxidación profunda que compromete la integridad estructural.',
    severityCriteriaModerate: 'Corrosión Moderada: Zonas con deterioro visible del recubrimiento, presencia de óxido superficial a medio y áreas que requieren atención preventiva para evitar progresión.',
    severityCriteriaSlight: 'Corrosión Leve: Deterioro incipiente del recubrimiento protector, manchas de óxido superficial y áreas en etapa inicial de degradación.',
    confidenceLevel: 'Nivel de Confianza',
    confidenceLevelExplanation: 'El nivel de confianza indica la certeza del sistema en la identificación de cada detección, expresado en porcentaje. Valores superiores al 70% indican alta certeza en la identificación. Una baja puntuación de confianza (por ejemplo, menor al 50%) no necesariamente significa que la detección sea incorrecta, sino que las condiciones de la imagen (como iluminación subóptima, desenfoque, sombras oclusivas o suciedad) han dificultado la clasificación al máximo nivel de certeza. No obstante, esto no anula el hallazgo de la patología pese a la baja puntuación de confianza del sistema.',
    lowConfidenceProtocol: 'Protocolo de Baja Confianza',
    qualityProtocol: 'En cumplimiento con nuestros protocolos de calidad, todo hallazgo con baja confianza (<70%) se trata como un riesgo potencial que debe ser priorizado para una inspección visual humana in situ para su validación final y confirmación de la severidad.'
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
    coverDate: 'Inspection Date',
    detectionMethodology: 'DETECTION METHODOLOGY AND CRITERIA',
    methodologyIntro: 'The AI-based corrosion detection system uses computer vision models specifically trained to identify and classify deterioration in metal structures. The evaluation is based on two fundamental parameters:',
    severityCriteria: 'Severity Criteria',
    severityCriteriaExtensive: 'Extensive Corrosion: Areas with significant deterioration of the metal surface, advanced loss of protective coating and presence of deep oxidation that compromises structural integrity.',
    severityCriteriaModerate: 'Moderate Corrosion: Zones with visible coating deterioration, presence of surface to medium rust and areas requiring preventive attention to avoid progression.',
    severityCriteriaSlight: 'Slight Corrosion: Incipient deterioration of the protective coating, surface rust stains and areas in early stages of degradation.',
    confidenceLevel: 'Confidence Level',
    confidenceLevelExplanation: 'The confidence level indicates the system\'s certainty in identifying each detection, expressed as a percentage. Values above 70% indicate high certainty in identification. A low confidence score (e.g., below 50%) does not necessarily mean that the detection is incorrect, but rather that the image conditions (such as suboptimal lighting, blur, occlusive shadows, or dirt) have made classification at the highest level of certainty difficult. Nevertheless, this does not invalidate the finding of the pathology despite the system\'s low confidence score.',
    lowConfidenceProtocol: 'Low Confidence Protocol',
    qualityProtocol: 'In compliance with our quality protocols, every finding with low confidence (<70%) is treated as a potential risk that must be prioritized for on-site human visual inspection for final validation and severity confirmation.'
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
    coverDate: 'Data de Inspeção',
    detectionMethodology: 'METODOLOGIA E CRITÉRIOS DE DETECÇÃO',
    methodologyIntro: 'O sistema de detecção de corrosão por IA utiliza modelos de visão artificial treinados especificamente para identificar e classificar deterioração em estruturas metálicas. A avaliação baseia-se em dois parâmetros fundamentais:',
    severityCriteria: 'Critérios de Severidade',
    severityCriteriaExtensive: 'Corrosão Extensa: Áreas com deterioração significativa da superfície metálica, perda avançada de revestimento protetor e presença de oxidação profunda que compromete a integridade estrutural.',
    severityCriteriaModerate: 'Corrosão Moderada: Zonas com deterioração visível do revestimento, presença de ferrugem superficial a média e áreas que requerem atenção preventiva para evitar progressão.',
    severityCriteriaSlight: 'Corrosão Leve: Deterioração incipiente do revestimento protetor, manchas de ferrugem superficial e áreas em estágio inicial de degradação.',
    confidenceLevel: 'Nível de Confiança',
    confidenceLevelExplanation: 'O nível de confiança indica a certeza do sistema na identificação de cada detecção, expresso em percentagem. Valores superiores a 70% indicam alta certeza na identificação. Uma baixa pontuação de confiança (por exemplo, inferior a 50%) não significa necessariamente que a detecção seja incorreta, mas sim que as condições da imagem (como iluminação subótima, desfoque, sombras oclusivas ou sujidade) dificultaram a classificação ao máximo nível de certeza. No entanto, isto não anula a descoberta da patologia apesar da baixa pontuação de confiança do sistema.',
    lowConfidenceProtocol: 'Protocolo de Baixa Confiança',
    qualityProtocol: 'Em cumprimento com nossos protocolos de qualidade, toda descoberta com baixa confiança (<70%) é tratada como um risco potencial que deve ser priorizado para uma inspeção visual humana in situ para sua validação final e confirmação da severidade.'
  }
}

export function getTranslations(language: 'es' | 'en' | 'pt'): ReportTranslations {
  return translations[language]
}
