import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { detections, severityCounts, avgConfidence } = body

    // Obtener API key de variables de entorno
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables')
      throw new Error('OpenAI API key not configured')
    }

    console.log('Generating analysis with OpenAI...')
    console.log('Detections:', detections)
    console.log('Severity counts:', severityCounts)

    // Preparar prompt para ChatGPT
    const userPrompt = `Genera un análisis técnico profesional basado en los siguientes datos de inspección de una estructura metálica:

- Total de áreas con corrosión detectadas: ${detections}
- Severidad alta: ${severityCounts.alto} área(s)
- Severidad media: ${severityCounts.medio} área(s)
- Severidad baja: ${severityCounts.bajo} área(s)
- Confianza promedio del modelo: ${(avgConfidence * 100).toFixed(1)}%

Proporciona un análisis técnico conciso (máximo 4-5 líneas) que incluya:
1. Evaluación del estado general
2. Áreas críticas que requieren atención inmediata
3. Recomendaciones específicas

El análisis debe ser profesional, técnico y orientado a la acción.`

    // Llamar a la API de OpenAI usando Chat Completions
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un ingeniero experto en inspección de estructuras metálicas y análisis de corrosión. Tus respuestas son técnicas, precisas y orientadas a la acción.'
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      console.error('OpenAI API Error Response:', JSON.stringify(errorData, null, 2))
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    console.log('OpenAI Response received successfully')

    const analysis = data.choices?.[0]?.message?.content || 'No se pudo generar el análisis'

    return NextResponse.json({ success: true, analysis })

  } catch (error: any) {
    console.error('Error generating AI analysis:', error.message)
    console.error('Full error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error al generar análisis'
      },
      { status: 500 }
    )
  }
}
