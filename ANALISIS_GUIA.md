# Guía de Análisis con YOLO en IKUSKI

## 📋 Descripción

La página de Análisis en IKUSKI permite realizar detección de corrosión en imágenes usando modelos YOLO entrenados. Ahora puedes seleccionar el modelo específico que quieres usar para el análisis.

## 🎯 Funcionalidades

### 1. Cargar Imágenes
- **Cargar Imágenes**: Selecciona imágenes individuales (.jpg, .png, etc.)
- **Cargar Carpeta**: Carga todas las imágenes de una carpeta completa
- Las imágenes se muestran en la galería lateral con metadatos

### 2. Seleccionar Modelo
- **Botón "Cargar Modelo (.pt)"**: Permite seleccionar el modelo YOLO a usar
- Acepta archivos `.pt` o `.pth`
- El modelo seleccionado se muestra con un checkmark ✓
- El nombre del modelo aparece en la barra de información

### 3. Realizar Análisis
- **Botón "Analizar"**: Inicia el análisis con el modelo seleccionado
- Valida que hayas cargado:
  - ✅ Al menos una imagen
  - ✅ Un modelo .pt
- Muestra progreso en tiempo real
- Resultados se visualizan con bounding boxes

### 4. Visualización de Resultados
- **Bounding boxes coloreados** según severidad:
  - 🔴 Rojo: Alto (corrosión severa)
  - 🟡 Amarillo: Medio (corrosión moderada)
  - 🟢 Verde: Bajo (corrosión leve)
- **Zoom y Pan**: Navega por las imágenes con controles
- **Información detallada**: Confianza, clase, coordenadas

### 5. Exportar Resultados
- **Botón "Exportar Resultados"**: Genera archivo CSV
- Incluye: archivo, severidad, confianza, coordenadas, timestamp
- Formato compatible con Excel y otras herramientas

## 🚀 Flujo de Trabajo

### Paso 1: Cargar Imágenes
```
1. Click en "Cargar Imágenes" o "Cargar Carpeta"
2. Selecciona las imágenes desde tu sistema
3. Las imágenes aparecen en la galería lateral
```

### Paso 2: Seleccionar Modelo
```
1. Click en "Cargar Modelo (.pt)"
2. Navega a tu modelo entrenado (ej: rust_detection_best.pt)
3. El botón cambia a "✓ Modelo: nombre_modelo.pt"
```

### Paso 3: Analizar
```
1. Click en "Analizar"
2. Espera a que se procesen las imágenes
3. Las detecciones aparecen como bounding boxes
```

### Paso 4: Revisar Resultados
```
1. Click en cada imagen de la galería para verla en detalle
2. Usa zoom/pan para inspeccionar las detecciones
3. Revisa las estadísticas en la barra inferior:
   - Total de imágenes analizadas
   - Total de detecciones
   - Confianza media
   - Distribución por severidad (alto/medio/bajo)
```

### Paso 5: Exportar (Opcional)
```
1. Click en "Exportar Resultados"
2. Se descarga un archivo CSV con todas las detecciones
```

## ⚙️ Configuración del Análisis

Los siguientes parámetros se toman de la página de **Configuración**:

### Umbral de Confianza
- **Por defecto**: 0.5 (50%)
- **Descripción**: Mínima confianza para considerar una detección
- **Rango**: 0.0 - 1.0
- **Ejemplo**: Con 0.7, solo se muestran detecciones con >70% de confianza

### Umbral IoU (NMS)
- **Por defecto**: 0.45 (45%)
- **Descripción**: Umbral para Non-Maximum Suppression
- **Rango**: 0.0 - 1.0
- **Uso**: Elimina detecciones duplicadas/superpuestas

### Tamaño de Imagen
- **Por defecto**: 640
- **Opciones**: 320, 640, 1280
- **Descripción**: Resolución para procesar las imágenes
- **Trade-off**: Mayor tamaño = más precisión pero más lento

## 📊 Interpretación de Resultados

### Severidad de Corrosión

Las detecciones se clasifican en tres niveles:

| Severidad | Color | Descripción | Acción Recomendada |
|-----------|-------|-------------|-------------------|
| **Alto** | 🔴 Rojo | Corrosión severa/avanzada | Reparación urgente |
| **Medio** | 🟡 Amarillo | Corrosión moderada | Monitoreo y mantenimiento |
| **Bajo** | 🟢 Verde | Corrosión leve/inicial | Prevención |

### Confianza

- **90-100%**: Detección muy confiable
- **70-90%**: Detección confiable
- **50-70%**: Detección probable (revisar manualmente)
- **<50%**: No se muestra (bajo umbral configurado)

## 🔧 Requisitos Técnicos

### Para el Análisis

1. **Python 3.8+** instalado
2. **Ultralytics YOLO** instalado:
   ```bash
   pip install ultralytics
   ```
3. **Modelo entrenado**: Archivo .pt o .pth
4. **Imágenes**: Formatos soportados: JPG, PNG, BMP, TIFF, WEBP

### Hardware Recomendado

| Componente | Mínimo | Recomendado | Óptimo |
|------------|--------|-------------|--------|
| RAM | 4GB | 8GB | 16GB+ |
| CPU | Dual Core | Quad Core | 8+ Cores |
| GPU | - | GTX 1060 | RTX 3060+ |
| Disco | HDD | SSD | NVMe SSD |

## 📝 Formato de Resultados

### Bounding Box
Cada detección incluye:
```json
{
  "id": 1,
  "filename": "imagen001.jpg",
  "class_name": "medio",
  "severity": "medio",
  "confidence": 0.87,
  "bbox": {
    "x": 120,     // Coordenada X (top-left)
    "y": 80,      // Coordenada Y (top-left)
    "w": 150,     // Ancho
    "h": 100      // Alto
  },
  "timestamp": "2024-01-15 14:30"
}
```

### Archivo CSV Exportado
```csv
Archivo,Severidad,Confianza,BBox_X,BBox_Y,BBox_W,BBox_H,Timestamp
imagen001.jpg,medio,0.870,120,80,150,100,2024-01-15 14:30
imagen001.jpg,bajo,0.650,300,200,80,60,2024-01-15 14:30
imagen002.jpg,alto,0.920,50,100,200,180,2024-01-15 14:31
```

## 🎨 Modelos Compatibles

### Modelos YOLO Soportados
- ✅ YOLOv5
- ✅ YOLOv8
- ✅ YOLOv11 (YOLO11)
- ✅ Cualquier modelo entrenado con Ultralytics

### Clases Esperadas

Para detección de corrosión, tu modelo debe tener una de estas estructuras:

**Opción 1: Clases de Severidad**
```yaml
names:
  0: bajo
  1: medio
  2: alto
```

**Opción 2: Clase General**
```yaml
names:
  0: corrosion
```
*En este caso, la severidad se asigna según la confianza*

## 🐛 Solución de Problemas

### Error: "Debes cargar un modelo .pt antes de analizar"
- **Causa**: No has seleccionado un modelo
- **Solución**: Click en "Cargar Modelo (.pt)" y selecciona tu archivo .pt

### Error: "No se pudieron encontrar detecciones"
- **Causas posibles**:
  1. El modelo no está entrenado para estas imágenes
  2. Umbral de confianza muy alto
  3. Imágenes de muy mala calidad
- **Soluciones**:
  1. Usa un modelo apropiado para tu caso de uso
  2. Reduce el umbral de confianza en Configuración
  3. Usa imágenes de mejor calidad

### Análisis muy lento
- **Con GPU disponible**: Verifica que CUDA esté instalado
- **Sin GPU**:
  - Reduce el tamaño de imagen (320 en lugar de 640)
  - Procesa menos imágenes a la vez
  - Usa un modelo más ligero (YOLOv11n)

### Detecciones incorrectas
- **Falsos positivos**: Aumenta el umbral de confianza
- **Detecciones perdidas**: Reduce el umbral de confianza
- **Modelo confundido**: Reentrenar con más datos de calidad

## 💡 Consejos Prácticos

### Para Mejores Resultados

1. **Calidad de Imágenes**
   - Usa buena iluminación
   - Evita imágenes borrosas
   - Resolución mínima recomendada: 640x480

2. **Selección de Modelo**
   - Usa el modelo entrenado con datos similares
   - Modelos más grandes = más precisos pero más lentos
   - Modelos más pequeños = más rápidos pero menos precisos

3. **Configuración de Umbrales**
   - **Inspección inicial**: Confianza = 0.3-0.5 (ver todas las detecciones)
   - **Producción**: Confianza = 0.6-0.8 (solo detecciones confiables)
   - **Crítico**: Confianza = 0.8-0.9 (máxima confianza)

4. **Flujo de Trabajo Eficiente**
   - Agrupa imágenes similares
   - Usa el mismo modelo para casos similares
   - Exporta resultados regularmente

## 📈 Estadísticas en Tiempo Real

La barra inferior muestra:

- **Imágenes Cargadas**: Total de imágenes en la galería
- **Detecciones**: Total de objetos detectados
- **Confianza Media**: Promedio de confianza de todas las detecciones
- **Distribución por Severidad**:
  - 🔴 Cantidad de detecciones "alto"
  - 🟡 Cantidad de detecciones "medio"
  - 🟢 Cantidad de detecciones "bajo"
- **Modelo**: Nombre del modelo usado para el análisis

## 🔗 Integración con Otras Páginas

### Con Etiquetado
- Puedes etiquetar nuevas imágenes basándote en los resultados del análisis
- Usa las detecciones como punto de partida para refinamiento manual

### Con Entrenamiento
- Los resultados del análisis ayudan a identificar casos difíciles
- Usa imágenes con bajas confianzas para mejorar el entrenamiento

### Con Informes
- Los resultados exportados pueden incluirse en informes
- Genera informes PDF con las estadísticas del análisis

### Con Configuración
- Ajusta umbrales basándote en los resultados
- Cambia el modelo activo según el tipo de análisis

## 📚 Ejemplos de Uso

### Caso 1: Inspección de Puente
```
1. Cargar carpeta con 50 fotos del puente
2. Seleccionar modelo: puente_rust_detection_v2.pt
3. Configurar confianza: 0.7 (alta confianza)
4. Analizar todas las imágenes
5. Revisar detecciones "alto" prioritariamente
6. Exportar resultados para informe
```

### Caso 2: Evaluación de Tuberías
```
1. Cargar imágenes individuales de secciones críticas
2. Seleccionar modelo: pipeline_corrosion_v1.pt
3. Configurar confianza: 0.5 (ver todas las posibles áreas)
4. Analizar y revisar cada detección manualmente
5. Ajustar umbral según resultados
```

### Caso 3: Monitoreo Regular
```
1. Cargar imágenes del mes
2. Usar modelo estándar: rust_detection_general.pt
3. Análisis automático con configuración estándar
4. Exportar CSV para tracking histórico
5. Comparar con meses anteriores
```

---

**¿Listo para analizar?** Ve a la página de Análisis, carga tu modelo y comienza a detectar corrosión con IA.
