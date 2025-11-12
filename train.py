#!/usr/bin/env python3
"""
Script de entrenamiento YOLO para IKUSKI
Este script se ejecuta desde la interfaz web para entrenar modelos de detección de corrosión
"""

import sys
import json
import os
from pathlib import Path
from ultralytics import YOLO


def train_model(config):
    """
    Entrena un modelo YOLO con la configuración especificada

    Args:
        config (dict): Configuración del entrenamiento con las siguientes claves:
            - model: Ruta al modelo base (.pt o .yaml)
            - data: Ruta al archivo YAML del dataset
            - epochs: Número de épocas
            - imgsz: Tamaño de imagen
            - batch: Tamaño del batch
            - name: Nombre del experimento
            - project: Carpeta de salida (por defecto: ./peso)
    """
    try:
        # Validar configuración
        if not config.get('model'):
            raise ValueError("No se especificó el modelo")
        if not config.get('data'):
            raise ValueError("No se especificó el dataset YAML")

        # Configuración por defecto
        model_path = config.get('model', 'yolo11n.pt')
        data_path = config.get('data')
        epochs = config.get('epochs', 100)
        imgsz = config.get('imgsz', 640)
        batch = config.get('batch', 16)
        name = config.get('name', 'rust_detection')
        project = config.get('project', './peso')

        # Validar que los archivos existen
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"No se encuentra el modelo: {model_path}")
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"No se encuentra el dataset: {data_path}")

        print(f"🚀 Iniciando entrenamiento de YOLO")
        print(f"📦 Modelo: {model_path}")
        print(f"📊 Dataset: {data_path}")
        print(f"⚙️  Épocas: {epochs}, Batch: {batch}, ImgSize: {imgsz}")
        print(f"💾 Resultados en: {project}/{name}")
        print("-" * 60)

        # Cargar modelo
        model = YOLO(model_path)

        # Entrenar
        results = model.train(
            data=data_path,
            epochs=epochs,
            imgsz=imgsz,
            batch=batch,
            name=name,
            project=project,
            patience=50,  # Early stopping
            save=True,
            save_period=10,  # Guardar checkpoint cada 10 épocas
            plots=True,  # Generar gráficos
            verbose=True
        )

        print("\n" + "=" * 60)
        print("✅ Entrenamiento completado exitosamente")
        print(f"📁 Pesos guardados en: {project}/{name}")
        print("=" * 60)

        return {
            "success": True,
            "message": "Entrenamiento completado",
            "output_path": f"{project}/{name}"
        }

    except Exception as e:
        print(f"\n❌ Error durante el entrenamiento: {str(e)}", file=sys.stderr)
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

    # Ejecutar entrenamiento
    result = train_model(config)

    # Imprimir resultado como JSON
    print("\n__RESULT_JSON__")
    print(json.dumps(result))

    # Exit code
    sys.exit(0 if result["success"] else 1)
