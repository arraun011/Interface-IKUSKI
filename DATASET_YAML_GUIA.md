# Guía de Carga de Datasets con YAML

## 📋 Descripción

IKUSKI ahora permite cargar configuraciones de datasets mediante archivos YAML, siguiendo el formato estándar de YOLO. Esto facilita la organización y reutilización de datasets para entrenamiento.

## 🎯 Ubicación de la Funcionalidad

**Página:** Entrenamiento → Botón "Cargar Dataset (.yaml)"

## 📄 Formato del Archivo YAML

### Estructura Básica (Requerida)

```yaml
# Ruta base del dataset
path: C:/IKUSKI/data/datasets/rust_detection

# Rutas relativas para imágenes
train: images/train  # Imágenes de entrenamiento
val: images/val      # Imágenes de validación
test: images/test    # Imágenes de prueba (opcional)

# Número de clases
nc: 3

# Nombres de las clases (en orden)
names:
  - bajo    # Clase 0
  - medio   # Clase 1
  - alto    # Clase 2
```

### Campos Requeridos

Los siguientes campos son **obligatorios**:
- `train`: Ruta a imágenes de entrenamiento
- `val`: Ruta a imágenes de validación
- `nc`: Número de clases
- `names`: Lista de nombres de clases

### Campos Opcionales

- `path`: Ruta base del dataset (si no se especifica, se usa el directorio del YAML)
- `test`: Ruta a imágenes de prueba

## 🔧 Cómo Usar

### 1. Preparar tu Dataset

Organiza tu dataset con esta estructura:

```
mi_dataset/
├── dataset.yaml
├── images/
│   ├── train/
│   │   ├── img001.jpg
│   │   ├── img002.jpg
│   │   └── ...
│   ├── val/
│   │   ├── img101.jpg
│   │   ├── img102.jpg
│   │   └── ...
│   └── test/  (opcional)
│       └── ...
└── labels/
    ├── train/
    │   ├── img001.txt
    │   ├── img002.txt
    │   └── ...
    └── val/
        └── ...
```

### 2. Crear el Archivo YAML

Crea un archivo `dataset.yaml` en la raíz de tu dataset:

```yaml
path: ./  # O ruta absoluta: C:/IKUSKI/data/datasets/mi_dataset
train: images/train
val: images/val
test: images/test

nc: 3
names:
  - bajo
  - medio
  - alto
```

### 3. Cargar en IKUSKI

1. Ve a la página **Entrenamiento**
2. Click en **"Cargar Dataset (.yaml)"**
3. Selecciona tu archivo `dataset.yaml`
4. La configuración se mostrará automáticamente

## ✅ Validación

Al cargar el YAML, IKUSKI verifica:
- ✅ Campos requeridos presentes (`train`, `val`, `nc`, `names`)
- ✅ Formato YAML correcto
- ✅ Número de clases coincide con la lista de nombres

Si hay algún error, recibirás una notificación explicativa.

## 📊 Visualización de la Configuración

Una vez cargado, verás un panel destacado con:
- Nombre del archivo
- Número de clases
- Path base
- Rutas de train/val/test
- Lista de clases con sus índices

## 🎨 Ejemplo Completo

### Archivo: `rust_detection.yaml`

```yaml
# Configuración del Dataset IKUSKI - Detección de Corrosión
path: C:/IKUSKI/data/datasets/rust_detection

train: images/train
val: images/val
test: images/test

nc: 3

names:
  - bajo    # Corrosión leve/inicial
  - medio   # Corrosión moderada
  - alto    # Corrosión severa/avanzada

# Información adicional (opcional, para documentación)
metadata:
  description: "Dataset de detección de corrosión"
  version: "1.0.0"
  images_train: 500
  images_val: 100
  images_test: 50
```

## 🔄 Cambiar Dataset

Si necesitas cambiar el dataset cargado:
1. Click en **"Cambiar Dataset"** en el panel de configuración
2. Selecciona un nuevo archivo YAML
3. La nueva configuración reemplazará a la anterior

## 🚀 Integración con Entrenamiento

Una vez cargado el dataset:
1. El modelo usará automáticamente las rutas especificadas
2. Las clases se configurarán según el YAML
3. El número de clases se ajustará en el modelo

## ⚠️ Notas Importantes

### Rutas Relativas vs Absolutas

- **Relativa**: `path: ./dataset` → Relativo al archivo YAML
- **Absoluta**: `path: C:/IKUSKI/data/datasets/rust` → Ruta completa

### Formato de Nombres de Clases

Puedes usar dos formatos:

**Formato Lista (Recomendado):**
```yaml
names:
  - bajo
  - medio
  - alto
```

**Formato Diccionario:**
```yaml
names:
  0: bajo
  1: medio
  2: alto
```

Ambos funcionan, pero el formato lista es más simple.

## 📝 Archivo de Ejemplo Incluido

IKUSKI incluye un archivo de ejemplo en:
```
C:/Users/Jon/IdeaProjects/Interface-IKUSKI/dataset/dataset.yaml
```

Puedes usar este archivo como plantilla o para probar la funcionalidad.

## 🐛 Solución de Problemas

### Error: "El archivo YAML no tiene la estructura correcta"
- Verifica que incluyas los campos: `train`, `val`, `nc`, `names`
- Revisa la sintaxis YAML (indentación correcta)

### Error: "No se pudo leer el archivo YAML"
- Verifica que el archivo tenga extensión `.yaml` o `.yml`
- Asegúrate de que el archivo no esté corrupto
- Revisa que no haya caracteres especiales inválidos

### Las rutas no se encuentran
- Usa rutas absolutas si tienes problemas con rutas relativas
- Verifica que las carpetas `images/train` y `images/val` existan
- En Windows, usa `/` o `\\` en las rutas

## 💡 Consejos

1. **Mantén una copia del YAML**: Guarda tu configuración en control de versiones
2. **Usa rutas absolutas en producción**: Más fiable que rutas relativas
3. **Documenta tus clases**: Añade comentarios para explicar cada clase
4. **Versiona tus datasets**: Incluye metadata con versión y fecha

## 🔗 Compatibilidad

El formato YAML de IKUSKI es compatible con:
- ✅ YOLOv5
- ✅ YOLOv8
- ✅ YOLOv11
- ✅ Ultralytics YOLO en general

Puedes usar el mismo archivo YAML en diferentes frameworks de YOLO.
