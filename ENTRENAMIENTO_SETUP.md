# Guía de Configuración para Entrenamiento YOLO

## 📋 Descripción

IKUSKI ahora ejecuta entrenamientos reales de YOLO mediante un script Python. Esta guía te ayudará a configurar el entorno necesario para entrenar modelos de detección de corrosión.

## 🎯 Requisitos del Sistema

### Hardware Recomendado
- **GPU**: NVIDIA con soporte CUDA (recomendado para entrenamiento rápido)
- **RAM**: Mínimo 8GB, recomendado 16GB o más
- **Espacio en Disco**: Mínimo 10GB libres para datasets y modelos

### Software Necesario
- **Python**: Versión 3.8 o superior
- **pip**: Gestor de paquetes de Python
- **CUDA** (opcional): Para entrenamiento con GPU

## 🔧 Instalación

### 1. Instalar Python

Si no tienes Python instalado:

**Windows:**
1. Descarga Python desde https://www.python.org/downloads/
2. Ejecuta el instalador
3. **IMPORTANTE**: Marca la opción "Add Python to PATH"
4. Verifica la instalación:
```bash
python --version
```

**Linux/Mac:**
```bash
# Verificar si Python está instalado
python3 --version

# Si no está instalado (Ubuntu/Debian)
sudo apt update
sudo apt install python3 python3-pip
```

### 2. Instalar Ultralytics YOLO

Abre una terminal/cmd y ejecuta:

```bash
pip install ultralytics
```

Este comando instalará automáticamente todas las dependencias necesarias:
- torch (PyTorch)
- torchvision
- opencv-python
- numpy
- pandas
- matplotlib
- pillow
- pyyaml

### 3. Verificar la Instalación

Ejecuta este comando para verificar que YOLO está instalado correctamente:

```bash
python -c "from ultralytics import YOLO; print('YOLO instalado correctamente')"
```

Si ves el mensaje "YOLO instalado correctamente", ¡todo está listo!

### 4. Instalar CUDA (Opcional - Para GPU)

Si tienes una GPU NVIDIA y quieres acelerar el entrenamiento:

1. Descarga CUDA Toolkit desde: https://developer.nvidia.com/cuda-downloads
2. Instala siguiendo las instrucciones para tu sistema operativo
3. Verifica la instalación:
```bash
nvidia-smi
```

## 🚀 Cómo Usar el Entrenamiento en IKUSKI

### Flujo de Trabajo

1. **Cargar Dataset YAML**
   - Ve a la página de Entrenamiento
   - Click en "Cargar Dataset (.yaml)"
   - Selecciona tu archivo de configuración del dataset
   - Verifica que aparezca la información del dataset

2. **Cargar Modelo Base**
   - Click en "Cargar Modelo (.pt)"
   - Selecciona un modelo YOLO preentrenado (.pt)
   - Ejemplos: `yolo11n.pt`, `yolo11s.pt`, `yolo11m.pt`

3. **Iniciar Entrenamiento**
   - Click en "Iniciar Entrenamiento"
   - El sistema validará que tengas dataset y modelo cargados
   - El entrenamiento comenzará automáticamente

4. **Monitorear Progreso**
   - El progreso se mostrará en la interfaz
   - Los gráficos de métricas se actualizarán en tiempo real
   - Los pesos se guardarán en la carpeta `/peso`

### Configuración del Entrenamiento

El entrenamiento usa estos parámetros por defecto:

```python
{
    "epochs": 100,      # Número de épocas
    "imgsz": 640,       # Tamaño de imagen (píxeles)
    "batch": 16,        # Tamaño del batch
    "patience": 50,     # Early stopping
    "save_period": 10   # Guardar checkpoint cada 10 épocas
}
```

## 📁 Estructura de Archivos

Después del entrenamiento, encontrarás:

```
peso/
└── rust_detection_2024-01-15/
    ├── weights/
    │   ├── best.pt           # Mejor modelo
    │   ├── last.pt           # Último checkpoint
    │   └── epoch_*.pt        # Checkpoints intermedios
    ├── results.png           # Gráficos de métricas
    ├── confusion_matrix.png  # Matriz de confusión
    ├── train_batch*.jpg      # Ejemplos de entrenamiento
    └── val_batch*.jpg        # Ejemplos de validación
```

## 🎯 Descargar Modelos YOLO Preentrenados

Puedes descargar modelos preentrenados desde:

```bash
# Opción 1: Usando CLI de YOLO
yolo download model=yolo11n.pt
yolo download model=yolo11s.pt
yolo download model=yolo11m.pt
yolo download model=yolo11l.pt

# Opción 2: Usando Python
from ultralytics import YOLO
model = YOLO("yolo11n.pt")  # Se descarga automáticamente
```

O desde el repositorio oficial:
https://github.com/ultralytics/assets/releases

### Modelos Disponibles

| Modelo | Tamaño | Velocidad | mAP | Uso Recomendado |
|--------|--------|-----------|-----|-----------------|
| YOLOv11n | 2.6MB | Muy Rápido | 39.5% | Desarrollo/Testing |
| YOLOv11s | 9.4MB | Rápido | 47.0% | Producción ligera |
| YOLOv11m | 20.1MB | Medio | 51.5% | Equilibrado |
| YOLOv11l | 25.3MB | Lento | 53.4% | Alta precisión |
| YOLOv11x | 56.9MB | Muy Lento | 54.7% | Máxima precisión |

## 🐛 Solución de Problemas

### Error: "python no se reconoce como comando"
- **Solución**: Reinstala Python y marca "Add Python to PATH"
- O usa `python3` en lugar de `python`

### Error: "ModuleNotFoundError: No module named 'ultralytics'"
- **Solución**: Ejecuta `pip install ultralytics`

### Error: "CUDA out of memory"
- **Solución 1**: Reduce el batch size en la configuración
- **Solución 2**: Usa un modelo más pequeño (yolo11n en lugar de yolo11l)
- **Solución 3**: Reduce el tamaño de imagen (320 en lugar de 640)

### Entrenamiento muy lento
- **Con GPU**: Verifica que CUDA esté instalado correctamente
- **Sin GPU**: Considera usar Google Colab o reducir épocas/batch size

### Error: "No se encuentra el dataset"
- **Solución**: Verifica que las rutas en el YAML sean correctas
- Usa rutas absolutas en Windows: `C:/IKUSKI/data/datasets/rust`

## 💡 Consejos para Mejorar el Entrenamiento

### 1. Tamaño del Dataset
- **Mínimo**: 100 imágenes por clase
- **Recomendado**: 500+ imágenes por clase
- **Óptimo**: 1000+ imágenes por clase

### 2. Augmentación de Datos
YOLO aplica augmentación automática, pero puedes personalizarla en el script:
```python
results = model.train(
    data="dataset.yaml",
    augment=True,
    hsv_h=0.015,      # Ajuste de hue
    hsv_s=0.7,        # Ajuste de saturación
    hsv_v=0.4,        # Ajuste de brillo
    degrees=0.0,      # Rotación
    translate=0.1,    # Traslación
    scale=0.5,        # Escala
    flipud=0.0,       # Volteo vertical
    fliplr=0.5        # Volteo horizontal
)
```

### 3. Early Stopping
El parámetro `patience=50` detiene el entrenamiento si no hay mejora en 50 épocas.

### 4. Transfer Learning
Usar un modelo preentrenado (.pt) es **MUCHO** mejor que entrenar desde cero (YAML).

## 📊 Interpretación de Métricas

- **mAP@50**: Precisión media a IoU 0.50 (objetivo: >0.8)
- **mAP@50-95**: Precisión media promedio (objetivo: >0.6)
- **Precision**: Porcentaje de detecciones correctas (objetivo: >0.85)
- **Recall**: Porcentaje de objetos detectados (objetivo: >0.80)
- **Loss**: Función de pérdida (debe disminuir con el tiempo)

## 🔗 Recursos Adicionales

- **Documentación YOLO**: https://docs.ultralytics.com/
- **GitHub Ultralytics**: https://github.com/ultralytics/ultralytics
- **Tutoriales**: https://docs.ultralytics.com/tutorials/
- **Foro de la Comunidad**: https://community.ultralytics.com/

## 📝 Notas Importantes

1. **Backup de Datos**: Haz copias de seguridad de tus datasets antes de entrenar
2. **Monitoreo**: Supervisa el uso de GPU/RAM durante el entrenamiento
3. **Versionado**: Guarda diferentes versiones de tus modelos con nombres descriptivos
4. **Evaluación**: Siempre evalúa tu modelo con un conjunto de test independiente

## ✅ Checklist Antes de Entrenar

- [ ] Python 3.8+ instalado
- [ ] Ultralytics YOLO instalado (`pip install ultralytics`)
- [ ] Dataset organizado correctamente
- [ ] Archivo dataset.yaml configurado
- [ ] Modelo base (.pt) descargado
- [ ] Espacio en disco suficiente (>10GB)
- [ ] CUDA instalado (opcional, para GPU)

---

**¿Listo para entrenar?** Ve a la página de Entrenamiento en IKUSKI y comienza a detectar corrosión con IA.
