# Guía de Uso: Sistema de Informes

## 📋 Descripción General

El sistema de informes permite generar documentos profesionales con análisis de corrosión detectada mediante IA, incluyendo imágenes con bounding boxes, coordenadas GPS y análisis técnicos editables.

## 🚀 Flujo de Trabajo

### 1. Análisis de Imágenes

1. **Cargar Imágenes**: En la página de Análisis, carga las imágenes usando:
   - "Cargar Imágenes" para archivos individuales
   - "Cargar Carpeta" para cargar una carpeta completa

2. **Seleccionar Modelo**: Carga un modelo .pt entrenado

3. **Ejecutar Análisis**: Haz clic en "Analizar" para detectar corrosión

4. **Marcar para Informe**:
   - Los checkboxes aparecen automáticamente en la galería de imágenes
   - Marca las imágenes que quieres incluir en el informe
   - El contador mostrará cuántas imágenes están marcadas

### 2. Generación de Informes

1. **Acceder a Informes**: Ve a la página "Informes" desde el menú lateral

2. **Rellenar Datos del Proyecto**:
   - Nº de Obra
   - Nº de Pedido
   - Nombre del Proyecto
   - Localización
   - Cliente
   - Elaborado por
   - Revisado por

3. **Generar Análisis con IA** (Opcional):
   - Haz clic en "Generar Análisis IA" para todas las imágenes
   - O genera análisis individual por cada imagen
   - Los análisis son completamente editables

4. **Editar Análisis**:
   - Cada imagen tiene un campo de texto editable
   - Puedes modificar o complementar el análisis generado por IA
   - Escribe análisis técnicos personalizados

5. **Exportar o Imprimir**:
   - **Exportar a Word**: Genera un documento .doc descargable
   - **Imprimir**: Abre el diálogo de impresión del navegador

## 📊 Características del Informe

### Datos Incluidos por Imagen

- ✅ **Imagen con Bounding Boxes**: Visualización de todas las detecciones
- ✅ **Coordenadas GPS**: Extraídas automáticamente de metadatos EXIF
  - Si la imagen no tiene GPS, se generan coordenadas simuladas
- ✅ **Estadísticas de Detección**:
  - Total de detecciones
  - Conteo por severidad (Alta, Media, Baja)
- ✅ **Metadata**:
  - Nombre del archivo
  - Fecha y hora de captura
  - Coordenadas GPS y altitud
- ✅ **Análisis Técnico**: Generado por IA o escrito manualmente

### Estructura del Informe

1. **Datos del Proyecto**
2. **Resumen Ejecutivo**
   - Total de imágenes analizadas
   - Estadísticas generales de detecciones
   - Distribución por severidad
3. **Anexo Fotográfico y Análisis Detallado**
   - Una sección por cada imagen marcada
   - Imagen con bounding boxes
   - Coordenadas GPS
   - Estadísticas de detección
   - Análisis técnico
4. **Conclusiones y Recomendaciones**

## 🔧 Configuración de IA (Opcional)

Para habilitar la generación automática de análisis con ChatGPT:

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Agrega tu API key de OpenAI:
   ```
   OPENAI_API_KEY=tu-api-key-aqui
   ```
3. Reinicia el servidor de desarrollo

Si no configuras la API key, el sistema generará análisis básicos sin IA.

## 📸 Extracción de Coordenadas GPS

### Imágenes con Metadatos GPS

Si tus imágenes tienen metadatos EXIF con información GPS (como fotos de drones DJI):
- Las coordenadas se extraen automáticamente
- Se muestra latitud, longitud y altitud reales
- Se indica con GPS real en el informe

### Imágenes sin GPS

Si las imágenes no tienen metadatos GPS:
- Se generan coordenadas simuladas basadas en Bilbao, España
- Útil para testing y demostración
- Puedes editarlas manualmente en el código si necesitas otras coordenadas base

## 💡 Consejos de Uso

1. **Marca solo las mejores imágenes**: El informe incluirá solo las imágenes marcadas, selecciona las más representativas

2. **Revisa los análisis IA**: Aunque la IA genera buenos análisis, siempre revísalos y edítalos según tu criterio profesional

3. **Completa todos los datos**: Asegúrate de rellenar todos los campos del proyecto para un informe completo

4. **Trabaja en una sesión continua**: Las imágenes se mantienen en memoria mientras no cambies de página. Para el mejor flujo:
   - Carga y analiza todas tus imágenes en Análisis
   - Marca las que quieres en el informe
   - Ve directamente a Informes y genera el documento
   - Evita navegar entre páginas una vez tengas todo listo

5. **Exporta inmediatamente**: Una vez tengas tu informe listo, expórtalo a Word de inmediato para no perder el trabajo

## 🐛 Solución de Problemas

### No veo los checkboxes para marcar imágenes
- Asegúrate de haber cargado imágenes en Análisis
- Los checkboxes aparecen automáticamente cuando hay imágenes

### El análisis IA no funciona
- Verifica que hayas configurado `OPENAI_API_KEY` en `.env.local`
- El sistema usará análisis básico como fallback

### La exportación a Word no incluye las imágenes correctamente
- Las imágenes se incrustan en base64
- Para archivos muy grandes, considera reducir el número de imágenes

### Las coordenadas GPS son incorrectas
- Si son simuladas, edita `generateSimulatedGPS()` en `lib/exif-utils.ts`
- Usa imágenes con metadatos EXIF para coordenadas reales

## 📝 Notas Técnicas

- **Formato Word**: Genera archivos .doc compatibles con Microsoft Word y LibreOffice
- **Impresión**: Optimizada para papel A4 con márgenes de 2cm
- **GPS**: Usa la librería exifr cargada desde CDN
- **Persistencia**: Los datos se guardan en sessionStorage durante la sesión

## 🎯 Próximas Mejoras

- [ ] Exportación a PDF nativo
- [ ] Templates de informe personalizables
- [ ] Integración con Google Maps para visualizar ubicaciones
- [ ] Guardar/cargar plantillas de datos de proyecto
- [ ] Exportación masiva de múltiples informes
