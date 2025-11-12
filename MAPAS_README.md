# 🗺️ Sistema de Mapas - IKUSKI

## ✅ Estado Actual: SISTEMA HÍBRIDO FUNCIONANDO

El sistema de mapas está **completamente implementado y funcionando** con dos opciones:

### 📊 Configuración Actual:
```
🟢 OpenStreetMap: ACTIVO (por defecto, sin API key)
🟡 Google Maps: DISPONIBLE (requiere configurar API key)
```

---

## 🚀 Quick Start

### Opción 1: Usar OpenStreetMap (Ya está funcionando)
✅ **Ya está configurado** - No necesitas hacer nada
- Gratuito sin límites
- Sin API key necesaria
- Mapas de buena calidad

### Opción 2: Cambiar a Google Maps (Mejor calidad)
1. Obtén una API key gratuita (5 minutos)
2. Crea archivo `.env.local` en la raíz:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
   ```
3. Reinicia el servidor: `npm run dev`

**Instrucciones detalladas**: Ver [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md)

---

## 📂 Documentación

| Archivo | Descripción |
|---------|-------------|
| **[MAPAS_INTEGRACION.md](./MAPAS_INTEGRACION.md)** | Documentación técnica completa del sistema |
| **[GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md)** | Guía paso a paso para configurar Google Maps |
| **[.env.local.example](./.env.local.example)** | Plantilla para configurar API key |

---

## 🎯 ¿Qué Hace el Sistema?

### En la Interfaz Web (Página de Informes):
1. **Detecta coordenadas GPS** de cada foto automáticamente
2. **Descarga mapas** del proveedor configurado (OSM o Google)
3. **Muestra el mapa** debajo de cada fotografía
4. **Enlaces clickeables** a OpenStreetMap y Google Maps
5. **Indicador de carga** mientras descarga los mapas

### En Documentos Exportados (Word/PDF):
1. **Convierte mapas a base64** para embeber en el documento
2. **Incluye imagen del mapa** en cada fotografía
3. **Enlaces clickeables** para abrir en navegador
4. **Coordenadas formateadas** (ej: "43.262700° N, 2.925300° W")

---

## 🔄 Comparación de Proveedores

| Característica | OpenStreetMap | Google Maps |
|---------------|---------------|-------------|
| **Costo** | 🟢 Gratis ilimitado | 🟡 28,500 gratis/mes |
| **API Key** | 🟢 No necesaria | 🟡 Requerida |
| **Calidad** | 🟢 Muy buena | 🟢 Excelente |
| **Vista satélite** | ❌ No | ✅ Sí |
| **Restricciones** | 🟢 Ninguna | 🟡 Límites mensuales |
| **Configuración** | 🟢 0 minutos | 🟡 5 minutos |
| **Resolución** | 🟡 Estándar | 🟢 Alta (scale=2) |

**Recomendación**:
- Para desarrollo/testing → OpenStreetMap
- Para producción/cliente final → Google Maps (mejor calidad)

---

## ⚙️ Cómo Funciona (Técnico)

### Detección Automática del Proveedor:
```typescript
// En lib/maps-utils.ts
if (apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
  // Usar Google Maps
  return `https://maps.googleapis.com/maps/api/staticmap?...`
} else {
  // Usar OpenStreetMap
  return `https://staticmap.openstreetmap.de/staticmap.php?...`
}
```

### Flujo de Carga de Mapas:
1. Usuario marca imágenes en Análisis
2. Navega a Informes
3. Sistema extrae GPS de metadatos EXIF
4. `useEffect` detecta coordenadas y llama `getStaticMapBase64()`
5. Función detecta proveedor (Google vs OSM)
6. Descarga imagen del mapa
7. Convierte a base64
8. Almacena en estado `imageMaps`
9. Renderiza en la UI

---

## 🎨 Personalización

### Cambiar Zoom:
```typescript
// En app/informes/page.tsx, línea ~146
zoom: 17  // Cambiar a: 15 (más lejos), 19 (más cerca)
```

### Cambiar Tipo de Mapa (Solo Google Maps):
```typescript
mapType: 'roadmap'    // Calles (default)
mapType: 'satellite'  // Vista satelital
mapType: 'hybrid'     // Satélite + calles
mapType: 'terrain'    // Terreno
```

### Cambiar Tamaño de Imagen:
```typescript
width: 600,   // Ancho en píxeles
height: 400   // Alto en píxeles
```

---

## 🐛 Solución de Problemas

### Los mapas no cargan
1. ✅ Verifica conexión a internet
2. ✅ Abre consola del navegador (F12) y busca errores
3. ✅ Si usas Google Maps, verifica que la API key esté configurada
4. ✅ Reinicia el servidor

### Error: "API key not valid" (Google Maps)
1. Verifica que copiaste la API key completa en `.env.local`
2. Asegúrate de haber habilitado "Maps Static API" en Google Cloud
3. Reinicia el servidor completamente
4. Espera unos minutos (propagación de la key)

### Los mapas muestran coordenadas pero no la imagen
1. Verifica que las coordenadas sean válidas (lat/lon dentro de rangos)
2. Abre la URL del mapa directamente en el navegador para ver el error
3. Si es Google Maps sin API key, cambiará automáticamente a OSM

---

## 📊 Estado de Implementación

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Extracción GPS | ✅ | Lee metadatos EXIF de fotos |
| OpenStreetMap | ✅ | Funciona sin API key |
| Google Maps | ✅ | Funciona con API key |
| Detección automática | ✅ | Cambia entre OSM/Google |
| UI en Informes | ✅ | Muestra mapas y enlaces |
| Exportación Word | ✅ | Incluye mapas en base64 |
| Exportación PDF | ✅ | Incluye mapas en base64 |
| Impresión | ✅ | Mapas visibles al imprimir |
| Enlaces duales | ✅ | OSM + Google Maps |
| Validación GPS | ✅ | Solo muestra si coords válidas |
| Indicador de carga | ✅ | "Cargando mapa..." |
| Formato coordenadas | ✅ | 43.262700° N, 2.925300° W |

---

## 🎯 Próximos Pasos Sugeridos

1. **Obtener Google Maps API key** (5 min) → Mejor calidad
2. **Probar con fotos reales** con GPS → Ver mapas en ubicaciones reales
3. **Ajustar zoom/tamaño** según preferencias → Personalización
4. **(Opcional) Vista satelital** → Ideal para estructuras industriales

---

## 📞 Ayuda y Recursos

### Documentación:
- [MAPAS_INTEGRACION.md](./MAPAS_INTEGRACION.md) - Documentación técnica
- [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md) - Configurar Google Maps

### APIs Oficiales:
- OpenStreetMap: https://www.openstreetmap.org/
- Google Maps Static API: https://developers.google.com/maps/documentation/maps-static

### Archivos Clave:
- `lib/maps-utils.ts` - Funciones de mapas
- `lib/report-export.ts` - Generación de informes
- `app/informes/page.tsx` - UI de informes
- `.env.local` - Configuración de API key (crear si no existe)

---

## 🎉 Resumen

✅ **El sistema de mapas está completamente funcional**
✅ **Funciona con OpenStreetMap sin configuración**
✅ **Puedes cambiar a Google Maps configurando una API key**
✅ **Ambos proveedores funcionan perfectamente**
✅ **Los mapas se incluyen en informes exportados**

**¿Listo para usar?** Sí, ya puedes generar informes con mapas incluidos.
