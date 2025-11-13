import { NextResponse } from 'next/server'
import { getTranslations } from '@/lib/report-translations'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { detections, severityCounts, avgConfidence, imageBase64, language = 'es' } = body

    const t = getTranslations(language as 'es' | 'en' | 'pt')

    // Obtener API key de variables de entorno
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables')
      throw new Error('OpenAI API key not configured')
    }

    console.log('Generating analysis with OpenAI Vision...')
    console.log('Detections:', detections)
    console.log('Severity counts:', severityCounts)
    console.log('Has image:', !!imageBase64)

    if (imageBase64) {
      const sizeInKB = Math.round(imageBase64.length / 1024)
      console.log(`Image Base64 size: ${sizeInKB} KB`)

      if (sizeInKB > 5000) {
        console.warn(`⚠️  Large image detected (${sizeInKB} KB). This may cause issues with OpenAI API.`)
      }
    }

    // Preparar prompt para ChatGPT con visión usando traducciones
    const textPrompt = t.aiUserPromptTemplate.replace('{detections}', detections.toString())

    // Construir mensajes con o sin imagen según disponibilidad
    const messages: any[] = [
      {
        role: 'system',
        content: t.aiSystemPrompt
      }
    ]

    // Si hay imagen en base64, usar el modelo de visión
    if (imageBase64) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: textPrompt
          },
          {
            type: 'image_url',
            image_url: {
              url: imageBase64,
              detail: 'high'
            }
          }
        ]
      })
    } else {
      // Sin imagen, usar solo texto
      messages.push({
        role: 'user',
        content: textPrompt
      })
    }

    // Llamar a la API de OpenAI usando Chat Completions con Vision
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: imageBase64 ? 'gpt-4o-mini' : 'gpt-4o-mini', // gpt-4o-mini soporta visión
        messages,
        temperature: 0.7,
        max_tokens: 400
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API Error Status:', response.status)
      console.error('OpenAI API Error Response:', errorText)

      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: { message: errorText } }
      }

      throw new Error(`OpenAI API error (${response.status}): ${errorData.error?.message || response.statusText}`)
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
