# Solución de Errores de Entrenamiento

## Errores Comunes y Soluciones

### ❌ "Script de entrenamiento no encontrado"

**Problema**: No existe el archivo `train.py` en la raíz del proyecto.

**Solución**:
1. Asegúrate de que `train.py` existe en: `C:\Users\Jon\IdeaProjects\Interface-IKUSKI\train.py`
2. Si no existe, consulta `ENTRENAMIENTO_SETUP.md` para crear el script

---

### ❌ "Python no está disponible en el sistema"

**Problema**: Python no está instalado o no está en el PATH.

**Solución**:
1. Instala Python 3.8 o superior desde [python.org](https://www.python.org/downloads/)
2. Durante la instalación, marca "Add Python to PATH"
3. Verifica la instalación:
   ```bash
   python --version
   ```

---

### ❌ "Faltan dependencias de Python"

**Problema**: No están instaladas las librerías necesarias.

**Solución**:
```bash
pip install ultralytics opencv-python pillow pyyaml
```

---

### ❌ "No se encontró el archivo de dataset"

**Problema**: El archivo YAML del dataset no existe o la ruta es incorrecta.

**Solución**:
1. Verifica que el archivo `.yaml` del dataset existe
2. Asegúrate de que las rutas en el YAML son correctas
3. Consulta `DATASET_YAML_GUIA.md` para el formato correcto

Ejemplo de dataset.yaml correcto:
```yaml
path: C:/Users/Jon/IdeaProjects/Interface-IKUSKI/dataset
train: images/train
val: images/val

names:
  0: rust
```

---

### ❌ "Error con GPU/CUDA"

**Problema**: Error relacionado con CUDA o GPU.

**Solución 1** - Entrenar con CPU:
1. En la configuración de entrenamiento, usa `device: cpu`

**Solución 2** - Instalar CUDA (si tienes GPU NVIDIA):
1. Instala [CUDA Toolkit](https://developer.nvidia.com/cuda-downloads)
2. Instala PyTorch con soporte CUDA:
   ```bash
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
   ```

---

## Verificación del Sistema

Antes de entrenar, verifica que todo está correcto:

```bash
# 1. Verificar Python
python --version

# 2. Verificar dependencias
pip list | findstr ultralytics

# 3. Verificar que train.py existe
dir train.py

# 4. Verificar dataset
dir dataset\images\train
dir dataset\images\val
```

---

## Logs y Depuración

### Ver logs en la consola del navegador
1. Abre DevTools (F12)
2. Ve a la pestaña "Console"
3. Busca mensajes de error detallados

### Ver logs del servidor
1. Abre la terminal donde corre `npm run dev`
2. Verás la salida completa de Python
3. Los errores aparecerán en rojo

---

## Flujo de Trabajo Recomendado

1. ✅ Verificar Python instalado
2. ✅ Instalar dependencias
3. ✅ Preparar dataset y YAML
4. ✅ Colocar train.py en la raíz
5. ✅ Cargar dataset en la UI
6. ✅ Configurar parámetros
7. ✅ Iniciar entrenamiento
8. ✅ Monitorear progreso en consola

---

## Ejemplo de train.py Básico

Si no tienes `train.py`, aquí está un ejemplo básico:

```python
import json
import sys
from ultralytics import YOLO

# Leer configuración desde stdin
config = json.loads(sys.stdin.read())

# Crear modelo
model = YOLO(config['model'])

# Entrenar
results = model.train(
    data=config['data'],
    epochs=config['epochs'],
    imgsz=config['imgsz'],
    batch=config['batch'],
    name=config['name'],
    project=config['project']
)

# Imprimir resultado
print('__RESULT_JSON__')
print(json.dumps({
    'success': True,
    'output_path': f"{config['project']}/{config['name']}/weights/best.pt"
}))
```

Guarda esto como `train.py` en la raíz del proyecto.

---

## Contacto y Ayuda

Si continúas teniendo problemas:
1. Revisa los logs completos en la consola
2. Verifica que seguiste todos los pasos de `ENTRENAMIENTO_SETUP.md`
3. Consulta la documentación de [Ultralytics](https://docs.ultralytics.com/)
