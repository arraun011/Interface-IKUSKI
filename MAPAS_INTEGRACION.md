# Integración de Mapas en Informes (Híbrido)

## 📋 Descripción General

Se ha implementado un **sistema híbrido** de mapas tanto en la **interfaz web** como en los **informes exportados** (Word/PDF):

### 🎯 Sistema Híbrido Inteligente:

- **Sin API key**: Usa **OpenStreetMap** (gratuito, sin límites, sin configuración)
- **Con API key**: Usa **Google Maps** (mejor calidad, vista satelital, 28,500 gratis/mes)

Cada fotografía con coordenadas GPS ahora incluye:

1. **Imagen estática del mapa** - OpenStreetMap o Google Maps según configuración
2. **Enlaces duales** - Abre en OpenStreetMap o Google Maps
3. **Visualización en tiempo real** - Carga automática en la página de Informes
4. **Conversión a base64** - Para incluir en documentos Word/PDF

Esto permite que cualquier persona que vea el informe pueda **situar exactamente dónde fue tomada cada foto** con patologías detectadas.

### 🔄 Cambio Automático de Proveedor:

El sistema detecta automáticamente si hay una API key configurada:
- ✅ **API key presente** → Google Maps (alta calidad, satélite)
- ✅ **Sin API key** → OpenStreetMap (gratuito, sin configuración)

### 📝 Guía de Configuración:

Ver **[GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md)** para instrucciones detalladas de cómo obtener y configurar una API key gratuita de Google Maps (5 minutos).

---

## 🎯 Características Implementadas

### 1. Imagen Estática del Mapa
- Vista de mapa **Mapnik** de OpenStreetMap (calles y ubicación)
- Zoom nivel **17** (vista cercana para contexto de estructura)
- Marcador rojo 📍 en la ubicación exacta
- Tamaño 600x400 píxeles para buena visualización

### 2. Enlaces Directos Duales
- **🗺️ OpenStreetMap** - Click para abrir en OpenStreetMap
- **🌍 Google Maps** - Click para abrir en Google Maps
- Ambos se abren en nueva pestaña
- Zoom 17 por defecto

### 3. Validación de Coordenadas
- Solo muestra mapas si las coordenadas GPS son válidas
- Valida rango de latitud (-90° a 90°) y longitud (-180° a 180°)
- Formatea coordenadas con dirección (N/S, E/W)

---

## 📂 Archivos Modificados/Creados

### Nuevo Archivo: `lib/maps-utils.ts`
Utilidades para trabajar con OpenStreetMap y Google Maps:

```typescript
// Funciones principales:
- getStaticMapImageUrl()      // Genera URL de imagen estática de OpenStreetMap
- getStaticMapBase64()        // Convierte imagen del mapa a base64 (para PDFs)
- imageUrlToBase64()          // Convierte cualquier URL de imagen a base64
- getOpenStreetMapUrl()       // Genera enlace para abrir en OpenStreetMap
- getGoogleMapsUrl()          // Genera enlace para abrir en Google Maps
- isValidGPSCoordinates()     // Valida coordenadas GPS
- formatGPSCoordinates()      // Formatea para mostrar (ej: "43.262700° N, 2.925300° W")
- getDistanceBetweenPoints()  // Calcula distancia entre dos puntos GPS
```

### Modificado: `lib/report-export.ts`
- Importa funciones de `maps-utils.ts`
- Integra imagen del mapa **en base64** en cada foto del anexo fotográfico
- Añade enlace clickeable "Abrir en Google Maps"
- Estilos CSS para `.map-container`, `.map-img`, `.map-link`
- Aplica tanto a exportación Word como a impresión
- Validación de coordenadas antes de mostrar mapas

### Modificado: `app/informes/page.tsx`
- Añade estado para almacenar imágenes de mapas en base64 (`imageMaps`)
- Carga automáticamente mapas después de obtener coordenadas GPS
- Muestra mapas en la interfaz de usuario de la página de Informes
- Indicador de carga mientras se descargan los mapas
- Enlaces duales a OpenStreetMap y Google Maps en cada foto
- Incluye `mapImageBase64` en datos de exportación

---

## 🔧 Configuración

### OpenStreetMap (Configuración Actual)
- ✅ **100% gratuito** - Sin límites ni costos
- ✅ **Sin API key necesaria** - Funciona de inmediato
- ✅ **Sin watermarks** - Mapas profesionales
- ✅ **Sin restricciones** - Uso ilimitado

### Servicio Usado:
- **Proveedor**: [staticmap.openstreetmap.de](https://staticmap.openstreetmap.de/)
- **Estilo de mapa**: Mapnik (estándar de OpenStreetMap)
- **Resolución**: 600x400 píxeles por defecto
- **Sin registro requerido**: Funciona directamente

---

## 🎨 Personalización

### Cambiar Estilo de Mapa
OpenStreetMap ofrece diferentes estilos. El actual usa **Mapnik** (estilo estándar). Para cambiar, modifica `lib/maps-utils.ts`:
```typescript
maptype: 'mapnik'    // Estilo actual (calles y ubicación)
// Otros estilos disponibles según el proveedor
```

### Ajustar Nivel de Zoom
```typescript
zoom: 17  // ⬅️ Rango: 0 (mundo) a 21 (edificio)
// 15 - Vista amplia del área
// 17 - Vista cercana (default)
// 19 - Vista muy cercana
```

### Cambiar Tamaño de Imagen
```typescript
width: 600,   // Ancho en píxeles
height: 400   // Alto en píxeles
```

---

## 📍 Ejemplo de Uso en el Informe

Cada fotografía en el **Anexo Fotográfico** ahora muestra:

```
Fotografía 1: IMG_001.jpg
[Imagen de la foto con detecciones]

Coordenadas GPS: 43.262700° N, 2.925300° W | Alt: 45.0m
Fecha y Hora: 2025-11-12 14:30:00

📍 Ubicación Geográfica
[Imagen del mapa de OpenStreetMap con marcador rojo]
🗺️ Abrir en OpenStreetMap | 🌍 Abrir en Google Maps (links clickeables)
Coordenadas: 43.262700, -2.925300

Detecciones:
[Tabla de detecciones...]
```

---

## 🔍 Validación de Coordenadas

El sistema **valida automáticamente** las coordenadas GPS:
- Si las coordenadas son válidas → Muestra mapa
- Si las coordenadas son nulas o inválidas → Omite sección de mapa

Esto evita errores cuando las imágenes no tienen metadatos GPS.

---

## 🚀 Próximos Pasos (Opcionales)

### 1. Añadir Múltiples Marcadores
Si quieres mostrar **todas las fotos en un solo mapa**:
```typescript
markers: `color:red|label:1|${lat1},${lon1}|color:blue|label:2|${lat2},${lon2}`
```

### 2. Vista Satelital con Detecciones
Cambiar a vista satelital para mejor contexto de estructuras industriales.

### 3. Mapa de Resumen
Crear un mapa general al inicio del informe mostrando **todas las ubicaciones** de las fotos.

### 4. Integración con Street View
Añadir vista de Street View si está disponible en la ubicación.

---

## ⚠️ Notas Importantes

1. **Conexión a Internet Requerida**: Las imágenes del mapa se cargan desde servidores de OpenStreetMap
2. **100% Gratuito**: OpenStreetMap es completamente gratuito, sin límites ni costos
3. **Open-Source**: Los datos de mapas son mantenidos por una comunidad global
4. **Coordenadas Simuladas**: Si usas `generateSimulatedGPS()`, el mapa mostrará ubicaciones de prueba en Bilbao
5. **Conversión a Base64**: Los mapas se convierten automáticamente a base64 para incluirlos en documentos Word/PDF
6. **Carga Asíncrona**: Los mapas se cargan en segundo plano, verás un indicador de "Cargando mapa..." mientras se descargan
7. **Sin Restricciones**: A diferencia de Google Maps, no hay límites de peticiones diarias

---

## 🔄 Flujo de Trabajo

### En la Página de Informes:

1. **Carga de Imágenes**: Al marcar imágenes en Análisis y navegar a Informes
2. **Extracción GPS**: Se extraen automáticamente las coordenadas GPS de los metadatos EXIF
3. **Descarga de Mapas**: Se solicitan las imágenes estáticas a OpenStreetMap
4. **Conversión a Base64**: Las imágenes se convierten a base64 para su uso en exportación
5. **Visualización**: Los mapas aparecen en la interfaz debajo de cada fotografía
6. **Exportación**: Al exportar a Word, los mapas en base64 se incluyen en el documento

### Rendimiento:

- **Carga Paralela**: Todas las imágenes de mapas se cargan simultáneamente
- **Caché**: Los mapas se almacenan en memoria durante la sesión
- **Sin Recarga**: Una vez cargados, no se vuelven a descargar hasta refrescar la página

---

## 📞 Recursos y Soporte

### Documentación Oficial:
- **OpenStreetMap**: [https://www.openstreetmap.org/](https://www.openstreetmap.org/)
- **StaticMap Service**: [https://staticmap.openstreetmap.de/](https://staticmap.openstreetmap.de/)
- **OSM Wiki**: [https://wiki.openstreetmap.org/](https://wiki.openstreetmap.org/)

### Si Necesitas:
- ✅ Personalizar la apariencia de los mapas
- ✅ Añadir funcionalidades adicionales
- ✅ Cambiar el proveedor de mapas
- ✅ Ajustar zoom o tamaño de imágenes

Todo está configurado en `lib/maps-utils.ts` y es fácilmente personalizable.
