# 📖 Flujo de Trabajo IKUSKI

Este documento explica el flujo completo de trabajo del sistema IKUSKI para detección de corrosión.

## 🔄 Flujo Completo

```
1. ETIQUETADO → 2. ENTRENAMIENTO → 3. ANÁLISIS → 4. INFORMES
```

---

## 1️⃣ MÓDULO ETIQUETADO (`/etiquetado`)

### Objetivo
Crear datasets anotados con bounding boxes en formato YOLO.

### Pasos

#### 1. Cargar Imágenes
- Click en **"Cargar Imágenes"**
- Selecciona múltiples archivos JPG/PNG/TIFF

#### 2. Anotar Imágenes
1. Selecciona el **nivel de severidad** (Bajo/Medio/Alto)
2. Dibuja bounding boxes sobre las áreas de corrosión:
   - Click y arrastra sobre la imagen
   - Repite para múltiples áreas
3. Usa los botones de navegación (◀ ▶) para pasar entre imágenes

#### 3. Exportar Dataset
- Click en **"Exportar YOLO"**
- El sistema divide automáticamente:
  - **80%** → `dataset/images/train` + `dataset/labels/train`
  - **20%** → `dataset/images/val` + `dataset/labels/val`

### Formato de Salida YOLO
```
dataset/
├── images/
│   ├── train/     # Imágenes de entrenamiento
│   └── val/       # Imágenes de validación
├── labels/
│   ├── train/     # Anotaciones .txt
│   └── val/       # Anotaciones .txt
└── dataset.yaml   # Configuración YOLO
```

Cada archivo `.txt` contiene:
```
<class_id> <x_center> <y_center> <width> <height>
```
Donde:
- `class_id`: 0=bajo, 1=medio, 2=alto
- Coordenadas normalizadas (0-1)

---

## 2️⃣ MÓDULO ENTRENAMIENTO (`/entrenamiento`)

### Objetivo
Entrenar modelos YOLO con el dataset anotado.

### Configuración Actual
- **Modelo Base**: YOLOv8n
- **Dataset**: `./dataset/dataset.yaml`
- **Pesos guardados en**: `./peso/*.pt`
- **Clases**: 3 (bajo, medio, alto)

### Pasos

#### 1. Cargar Dataset
- Click en **"Cargar Dataset"**
- Selecciona la carpeta `/dataset`

#### 2. Iniciar Entrenamiento
- Click en **"Iniciar Entrenamiento"**
- Monitorea:
  - Progreso de épocas
  - mAP@50 (precisión)
  - Loss (pérdida)

#### 3. Modelos Generados
Los pesos se guardan en `/peso`:
- `best.pt` - Mejor modelo según mAP
- `last.pt` - Último checkpoint

### Para Integrar Entrenamiento Real

Modifica `handleStartTraining` en `/app/entrenamiento/page.tsx` (línea 61):

```typescript
const handleStartTraining = async () => {
  // Ejemplo con Python + YOLO
  const response = await fetch('/api/train', {
    method: 'POST',
    body: JSON.stringify({
      data: './dataset/dataset.yaml',
      epochs: 100,
      imgsz: 640,
      batch: 16,
      project: './peso',
      name: 'rust_detection'
    })
  })
}
```

---

## 3️⃣ MÓDULO ANÁLISIS (`/analisis`)

### Objetivo
Detectar corrosión en nuevas imágenes usando modelos entrenados.

### Pasos

#### 1. Cargar Imágenes
Dos opciones:
- **"Cargar Imágenes"**: Selecciona archivos individuales
- **"Cargar Carpeta"**: Selecciona carpeta completa de imágenes

#### 2. Analizar
- Click en **"Analizar"**
- El sistema procesa todas las imágenes con el modelo
- Opciones de procesamiento:
  - ✓ Filtro de duplicados (pHash)
  - ✓ Corrección CLAHE
  - ☐ Extraer metadatos EXIF

#### 3. Ver Resultados
- Lista de detecciones por severidad
- Click en una detección para ver la imagen
- Información de bounding box y confianza

#### 4. Exportar
- Click en **"Exportar Resultados"**
- Descarga CSV con todas las detecciones

### Para Integrar Inferencia Real

Modifica `handleAnalyze` en `/app/analisis/page.tsx` (línea 105):

```typescript
const handleAnalyze = async () => {
  const response = await fetch('/api/inference', {
    method: 'POST',
    body: JSON.stringify({
      images: loadedImages,
      model: './peso/best.pt',
      conf: 0.25  // Confidence threshold
    })
  })

  const { detections } = await response.json()
  setDetections(detections)
}
```

---

## 4️⃣ MÓDULO INFORMES (`/informes`)

### Objetivo
Generar informes técnicos profesionales en PDF/DOCX.

### Pasos

1. Completa los **datos del proyecto**:
   - Nº de obra / pedido
   - Nombre del proyecto
   - Localización
   - Fechas
   - Inspector/Revisor

2. Configura **secciones del informe**:
   - ✓ Portada
   - ✓ Índice
   - ✓ Metodología (Dron + IA)
   - ✓ Resultados
   - ✓ Anexo fotográfico
   - ✓ Conclusiones

3. Click en **"Generar Informe"**

4. Exporta en:
   - PDF
   - DOCX
   - Ambos

---

## 📁 Estructura de Archivos

```
Interface-IKUSKI/
├── dataset/              # Datasets para entrenamiento
│   ├── images/
│   │   ├── train/
│   │   └── val/
│   ├── labels/
│   │   ├── train/
│   │   └── val/
│   └── dataset.yaml
│
├── peso/                 # Modelos entrenados (.pt)
│   ├── best.pt
│   └── last.pt
│
├── app/
│   ├── etiquetado/      # Módulo 1
│   ├── entrenamiento/   # Módulo 2
│   ├── analisis/        # Módulo 3
│   └── informes/        # Módulo 4
│
└── app/api/
    ├── models/          # Listar modelos .pt
    └── dataset/export/  # Exportar a YOLO
```

---

## 🔌 Puntos de Integración

### Backend Python (YOLO)

```python
# train.py
from ultralytics import YOLO

model = YOLO('yolov8n.pt')
results = model.train(
    data='./dataset/dataset.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    project='./peso',
    name='rust_detection'
)
```

### Inferencia

```python
# inference.py
from ultralytics import YOLO

model = YOLO('./peso/best.pt')
results = model('./ruta/imagen.jpg')

for r in results:
    for box in r.boxes:
        class_id = int(box.cls[0])
        confidence = float(box.conf[0])
        x, y, w, h = box.xywh[0]
```

---

## ✅ Checklist de Validación

### Etiquetado
- [ ] Imágenes cargadas correctamente
- [ ] Bounding boxes dibujados
- [ ] Severidades asignadas
- [ ] Dataset exportado (train/val separados)

### Entrenamiento
- [ ] Dataset cargado desde `/dataset`
- [ ] Configuración YOLO válida
- [ ] Modelos .pt generados en `/peso`
- [ ] mAP > 85%

### Análisis
- [ ] Carpeta de imágenes cargada
- [ ] Detecciones generadas
- [ ] Resultados exportados a CSV

### Informes
- [ ] Datos del proyecto completos
- [ ] Secciones configuradas
- [ ] PDF/DOCX generado correctamente

---

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Iniciar producción
npm start

# Ver estructura dataset
ls -R dataset/

# Ver modelos entrenados
ls -lh peso/*.pt
```

---

## 📊 Métricas de Calidad

| Módulo | Métrica Clave | Objetivo |
|--------|---------------|----------|
| Etiquetado | Anotaciones por imagen | > 1 |
| Entrenamiento | mAP@50 | > 85% |
| Análisis | Confianza media | > 80% |
| Informes | Detecciones incluidas | 100% |

---

## 🐛 Solución de Problemas

### Etiquetado
- **No se ven las imágenes**: Verifica formato (JPG/PNG/TIFF)
- **Bounding boxes no se dibujan**: Selecciona severidad primero

### Entrenamiento
- **Error al cargar dataset**: Verifica `dataset.yaml`
- **Out of memory**: Reduce batch size

### Análisis
- **Carpeta no se carga**: Usa "Cargar Carpeta" (no "Cargar Imágenes")
- **No hay detecciones**: Verifica modelo en `/peso`

---

## 📞 Soporte

Para problemas o dudas, revisa:
- `dataset/dataset.yaml` - Configuración YOLO
- `peso/*.pt` - Modelos entrenados
- Logs del servidor en consola
