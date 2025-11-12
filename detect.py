#!/usr/bin/env python3
"""
Script de detección/inferencia YOLO para IKUSKI
Este script realiza detección de objetos usando modelos YOLO entrenados
"""

import sys
import json
import os
import base64
from pathlib import Path
from ultralytics import YOLO
from PIL import Image
import io


def decode_base64_image(base64_string):
    """
    Decodifica una imagen en base64 a un objeto PIL Image

    Args:
        base64_string (str): String base64 de la imagen (puede incluir el prefijo data:image)

    Returns:
        PIL.Image: Imagen decodificada
    """
    # Remover el prefijo "data:image/...;base64," si existe
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]

    # Decodificar
    image_data = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_data))

    return image


def detect_objects(config):
    """
    Realiza detección de objetos en imágenes usando YOLO

    Args:
        config (dict): Configuración con las siguientes claves:
            - model: Ruta al modelo .pt
            - images: Lista de imágenes (base64 strings o rutas)
            - confidence: Umbral de confianza (por defecto: 0.5)
            - iou: Umbral IoU para NMS (por defecto: 0.45)
            - imgsz: Tamaño de imagen (por defecto: 640)

    Returns:
        dict: Resultados de la detección
    """
    try:
        # Validar configuración
        if not config.get('model'):
            raise ValueError("No se especificó el modelo")
        if not config.get('images'):
            raise ValueError("No se especificaron imágenes")

        # Configuración
        model_path = config.get('model')
        images = config.get('images', [])
        confidence = config.get('confidence', 0.5)
        iou = config.get('iou', 0.45)
        imgsz = config.get('imgsz', 640)

        # Validar que el modelo existe
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"No se encuentra el modelo: {model_path}")

        print(f"🔍 Iniciando detección con YOLO")
        print(f"📦 Modelo: {model_path}")
        print(f"🖼️  Imágenes: {len(images)}")
        print(f"⚙️  Confianza: {confidence}, IoU: {iou}, ImgSize: {imgsz}")
        print("-" * 60)

        # Cargar modelo
        model = YOLO(model_path)

        # Obtener nombres de clases del modelo
        class_names = model.names if hasattr(model, 'names') else {}

        # Procesar cada imagen
        all_detections = []

        for idx, image_data in enumerate(images):
            try:
                # Determinar si es base64 o ruta de archivo
                if isinstance(image_data, dict):
                    image_src = image_data.get('url') or image_data.get('path')
                    filename = image_data.get('filename', f'image_{idx}.jpg')
                else:
                    image_src = image_data
                    filename = f'image_{idx}.jpg'

                # Cargar imagen
                if image_src.startswith('data:image') or len(image_src) > 500:
                    # Es base64
                    image = decode_base64_image(image_src)
                    print(f"📸 Procesando imagen {idx + 1}/{len(images)}: {filename} (base64)")
                else:
                    # Es ruta de archivo
                    image = image_src
                    print(f"📸 Procesando imagen {idx + 1}/{len(images)}: {filename}")

                # Realizar detección
                results = model.predict(
                    source=image,
                    conf=confidence,
                    iou=iou,
                    imgsz=imgsz,
                    verbose=False
                )

                # Procesar resultados
                for result in results:
                    boxes = result.boxes

                    if boxes is not None and len(boxes) > 0:
                        for box in boxes:
                            # Extraer datos del box
                            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                            conf = float(box.conf[0].cpu().numpy())
                            cls = int(box.cls[0].cpu().numpy())

                            # Convertir a formato xywh
                            x = float(x1)
                            y = float(y1)
                            w = float(x2 - x1)
                            h = float(y2 - y1)

                            # Obtener nombre de la clase
                            class_name = class_names.get(cls, f"class_{cls}")

                            # Determinar severidad (esto debería venir del modelo)
                            # Por ahora, usamos la clase como severidad
                            severity = class_name.lower()
                            if severity not in ['alto', 'medio', 'bajo']:
                                # Si el modelo no tiene estas clases específicas,
                                # asignar severidad basada en la confianza
                                if conf >= 0.8:
                                    severity = 'alto'
                                elif conf >= 0.6:
                                    severity = 'medio'
                                else:
                                    severity = 'bajo'

                            detection = {
                                'filename': filename,
                                'class_id': cls,
                                'class_name': class_name,
                                'severity': severity,
                                'confidence': conf,
                                'bbox': {
                                    'x': x,
                                    'y': y,
                                    'w': w,
                                    'h': h
                                }
                            }

                            all_detections.append(detection)
                            print(f"   ✓ Detección: {class_name} ({severity}) - Confianza: {conf:.2%}")
                    else:
                        print(f"   ℹ No se encontraron detecciones")

            except Exception as e:
                print(f"   ⚠️  Error procesando imagen {idx + 1}: {str(e)}")
                continue

        print("\n" + "=" * 60)
        print(f"✅ Detección completada: {len(all_detections)} objetos detectados")
        print("=" * 60)

        return {
            "success": True,
            "detections": all_detections,
            "total_images": len(images),
            "total_detections": len(all_detections),
            "class_names": class_names
        }

    except Exception as e:
        print(f"\n❌ Error durante la detección: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":
    # Leer configuración desde argumentos o stdin
    if len(sys.argv) > 1:
        # Configuración desde argumentos JSON
        config_json = sys.argv[1]
        config = json.loads(config_json)
    else:
        # Leer desde stdin
        config_json = sys.stdin.read()
        config = json.loads(config_json)

    # Ejecutar detección
    result = detect_objects(config)

    # Imprimir resultado como JSON
    print("\n__RESULT_JSON__")
    print(json.dumps(result))

    # Exit code
    sys.exit(0 if result["success"] else 1)
