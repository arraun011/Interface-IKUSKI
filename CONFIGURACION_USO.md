# Guía de Uso del Sistema de Configuración

El sistema de configuración de IKUSKI permite que todos los cambios realizados en la página de Configuración afecten al comportamiento de la aplicación.

## 📋 Configuraciones Disponibles

### 1. Configuración del Modelo
- **Modelo Activo**: `yolov8n`, `yolov8s`, `yolov8m`, `yolov8l`
- **Umbral de Confianza**: 0.0 - 1.0 (por defecto: 0.5)
- **Umbral IoU (NMS)**: 0.0 - 1.0 (por defecto: 0.45)
- **Tamaño de Imagen**: `320`, `640`, `1280` píxeles
- **Filtro pHash**: Activar/desactivar detección de duplicados
- **Corrección CLAHE**: Activar/desactivar mejora de contraste

### 2. Claves API
- **OpenAI API Key**: Para generación de informes con GPT-4
- **Azure Computer Vision**: Opcional, para análisis adicional

### 3. Rutas y Directorios
- **Ruta de Datasets**: Ubicación de los conjuntos de datos
- **Ruta de Modelos**: Ubicación de los modelos entrenados
- **Ruta de Informes**: Ubicación donde se guardan los informes

### 4. Apariencia
- **Tema**: Claro, Oscuro o Automático
- **Idioma**: Español, Euskera o Inglés

## 🔧 Cómo Usar la Configuración en Tu Código

### Importar el Hook de Configuración

```typescript
import { useConfig, useModelConfig, useApiKeys, usePaths, useAppearance } from "@/contexts/config-context"
```

### Ejemplos de Uso

#### 1. Usar toda la configuración
```typescript
function MiComponente() {
  const { config, updateConfig } = useConfig()

  // Acceder a valores
  console.log(config.model.activeModel) // "yolov8n"
  console.log(config.paths.datasets) // "C:/IKUSKI/data/datasets"

  // Actualizar valores
  updateConfig({
    model: { ...config.model, confidenceThreshold: 0.7 }
  })
}
```

#### 2. Usar solo la configuración del modelo
```typescript
function AnalisisPage() {
  const modelConfig = useModelConfig()

  // Usar en análisis
  if (detection.confidence >= modelConfig.confidenceThreshold) {
    // Procesar detección
  }

  console.log(`Modelo activo: ${modelConfig.activeModel}`)
  console.log(`Tamaño de imagen: ${modelConfig.imageSize}`)
  console.log(`pHash habilitado: ${modelConfig.enablePHash}`)
}
```

#### 3. Usar solo las claves API
```typescript
function InformesPage() {
  const apiKeys = useApiKeys()

  // Usar API Key de OpenAI
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Authorization': `Bearer ${apiKeys.openai}`
    }
  })
}
```

#### 4. Usar solo las rutas
```typescript
function EntrenamientoPage() {
  const paths = usePaths()

  // Guardar dataset
  const datasetPath = `${paths.datasets}/nuevo_dataset`

  // Cargar modelo
  const modelPath = `${paths.models}/yolov8n_rust_v3.pt`

  // Generar informe
  const reportPath = `${paths.reports}/informe_2024_01_15.pdf`
}
```

## 💾 Persistencia

La configuración se guarda automáticamente en `localStorage` cada vez que cambias un valor. No necesitas llamar manualmente a `saveConfig()` - esto se hace automáticamente.

### Restablecer Configuración

Si necesitas restablecer a valores por defecto:

```typescript
const { resetConfig } = useConfig()

resetConfig() // Restaura todos los valores por defecto
```

## 🎯 Valores por Defecto

```typescript
{
  model: {
    activeModel: "yolov8n",
    confidenceThreshold: 0.5,
    iouThreshold: 0.45,
    imageSize: "640",
    enablePHash: true,
    enableCLAHE: true
  },
  apiKeys: {
    openai: "",
    azure: ""
  },
  paths: {
    datasets: "C:/IKUSKI/data/datasets",
    models: "C:/IKUSKI/data/models",
    reports: "C:/IKUSKI/reports"
  },
  appearance: {
    theme: "light",
    language: "es"
  },
  severity: {
    low: { min: 0, max: 30 },
    medium: { min: 30, max: 70 },
    high: { min: 70, max: 100 }
  }
}
```

## ✅ Páginas que Usan la Configuración

### Análisis (`app/analisis/page.tsx`)
- ✅ Muestra el modelo activo en el panel de estadísticas
- ✅ Usa el umbral de confianza para filtrar detecciones
- ✅ Muestra el nombre del modelo en uso

### Configuración (`app/configuracion/page.tsx`)
- ✅ Todos los campos están conectados al contexto
- ✅ Los cambios se guardan automáticamente
- ✅ Botón para restablecer valores por defecto

### Próximas Integraciones

Para integrar en otras páginas:

**Entrenamiento:**
```typescript
const modelConfig = useModelConfig()
const paths = usePaths()

// Usar tamaño de imagen configurado
trainModel({
  imageSize: parseInt(modelConfig.imageSize),
  datasetPath: paths.datasets
})
```

**Informes:**
```typescript
const apiKeys = useApiKeys()
const paths = usePaths()

// Generar informe con GPT-4
generateReport({
  apiKey: apiKeys.openai,
  outputPath: paths.reports
})
```

## 🔒 Notas de Seguridad

- Las claves API se almacenan en localStorage del navegador
- No se envían a ningún servidor externo
- Son visibles solo en el cliente actual
- Para producción, considera usar variables de entorno o un servicio de secrets management
