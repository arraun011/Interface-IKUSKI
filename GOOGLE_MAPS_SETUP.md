# Configuración de Google Maps API Key

## 🎯 Estado Actual del Sistema

El sistema está configurado en **modo híbrido**:

- ✅ **Sin API key**: Usa OpenStreetMap (gratuito, sin límites)
- ✅ **Con API key**: Usa Google Maps (mejor calidad, 28,500 mapas gratis/mes)

**Actualmente está usando**: OpenStreetMap (porque no hay API key configurada)

---

## 📝 Cómo Obtener Google Maps API Key (5 minutos)

### Paso 1: Ir a Google Cloud Console
Abre: **https://console.cloud.google.com/**

### Paso 2: Crear Proyecto
1. Click en selector de proyectos (arriba)
2. Click en **"Nuevo Proyecto"**
3. Nombre: `"IKUSKI-Mapas"` o similar
4. Click **"Crear"**

### Paso 3: Habilitar Maps Static API
1. Menú (☰) → **APIs y servicios** → **Biblioteca**
2. Buscar: `"Maps Static API"`
3. Click en **"Maps Static API"**
4. Click **"Habilitar"**

### Paso 4: Crear API Key
1. Menú → **APIs y servicios** → **Credenciales**
2. Click **"+ Crear credenciales"**
3. Seleccionar **"Clave de API"**
4. **¡COPIAR LA KEY!** (ejemplo: `AIzaSyD...`)

### Paso 5 (Opcional): Restringir API Key
Para mayor seguridad:
1. Click en **"Restringir clave"**
2. En "Restricciones de API", seleccionar **"Restringir clave"**
3. Marcar solo: **"Maps Static API"**
4. Click **"Guardar"**

---

## ⚙️ Cómo Configurar la API Key en el Proyecto

### Opción 1: Usando archivo .env.local (RECOMENDADO)

1. **Crea un archivo** llamado `.env.local` en la raíz del proyecto
2. **Copia y pega** esto dentro del archivo:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
   ```
3. **Reemplaza** `TU_API_KEY_AQUI` con tu API key real
4. **Guarda** el archivo
5. **Reinicia** el servidor de desarrollo (`npm run dev`)

**Ejemplo de .env.local:**
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuv
```

### Opción 2: Variables de entorno del sistema

**Windows:**
```cmd
setx NEXT_PUBLIC_GOOGLE_MAPS_API_KEY "TU_API_KEY_AQUI"
```

**Linux/Mac:**
```bash
export NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="TU_API_KEY_AQUI"
```

---

## ✅ Verificar que Funciona

Después de configurar la API key:

1. **Reinicia** el servidor: Para el proceso y ejecuta `npm run dev` de nuevo
2. Ve a la página de **Informes**
3. Los mapas deberían cargar desde **Google Maps** en lugar de OpenStreetMap
4. En la consola del navegador (F12), busca mensajes relacionados con mapas

---

## 🔍 Diferencias entre Google Maps y OpenStreetMap

| Característica | Google Maps | OpenStreetMap |
|---------------|-------------|---------------|
| **Costo** | Gratis hasta 28,500/mes | 100% gratis |
| **API Key** | Requerida | No necesaria |
| **Calidad** | Excelente | Muy buena |
| **Actualización** | Frecuente | Frecuente (comunidad) |
| **Restricciones** | Límites mensuales | Sin límites |
| **Estilos** | Roadmap, Satellite, Hybrid, Terrain | Mapnik |
| **Resolución** | Alta (scale=2) | Estándar |
| **Vista satélite** | ✅ Disponible | ❌ No disponible |

---

## 🎨 Personalización

### Cambiar Tipo de Mapa (Solo Google Maps)

En `lib/report-export.ts` o cuando uses `getStaticMapBase64()`:

```typescript
mapType: 'roadmap'    // Calles y ubicación (default)
mapType: 'satellite'  // Vista satelital (ideal para estructuras)
mapType: 'hybrid'     // Satélite + nombres de calles
mapType: 'terrain'    // Vista de terreno
```

### Ajustar Zoom

```typescript
zoom: 15  // Vista amplia del área
zoom: 17  // Vista cercana (default)
zoom: 19  // Vista muy cercana
```

---

## 🔒 Seguridad

### ⚠️ IMPORTANTE: No subas tu API key a Git

El archivo `.env.local` ya está en `.gitignore`, pero verifica:

1. **NUNCA** subas `.env.local` a GitHub
2. **NUNCA** incluyas la API key directamente en el código
3. Usa restricciones de API en Google Cloud Console

### Si accidentalmente subes la API key:

1. Ve a Google Cloud Console
2. **Credenciales** → Encuentra tu API key
3. Click en **"Regenerar"** o **"Eliminar"**
4. Crea una nueva key

---

## 🐛 Solución de Problemas

### Los mapas no cargan después de configurar la API key

1. **Verifica** que el archivo `.env.local` está en la raíz del proyecto
2. **Reinicia** completamente el servidor (Ctrl+C y `npm run dev`)
3. **Limpia caché** del navegador (Ctrl+Shift+R)
4. Abre la consola del navegador (F12) y busca errores

### Error: "API key not valid"

1. Verifica que copiaste la API key completa
2. Asegúrate de haber **habilitado** "Maps Static API" en Google Cloud
3. Espera unos minutos (puede tardar en propagarse)

### Aparece watermark "For development purposes only"

Esto significa que la API key no está configurada correctamente o tiene restricciones:
1. Verifica en Google Cloud Console que no hay restricciones de dominio
2. Asegúrate de que Maps Static API está habilitada

---

## 💰 Límites y Costos

### Plan Gratuito de Google Maps:
- **28,500 cargas de mapa gratis** por mes
- Después de eso: **$2 por cada 1,000 cargas**
- Necesitas tarjeta de crédito para activar (pero no se cobrará si no superas el límite)

### Monitoreo de Uso:
Ve a Google Cloud Console → **APIs y servicios** → **Panel de control** para ver tu uso mensual.

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas:
1. Verifica los pasos anteriores
2. Revisa la consola del navegador (F12) en busca de errores
3. Consulta la [documentación oficial](https://developers.google.com/maps/documentation/maps-static/start)

---

## ✨ Bonus: Ver Qué Proveedor Está Activo

Abre la consola del navegador (F12) y ejecuta:

```javascript
console.log('Proveedor de mapas:',
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    ? 'Google Maps'
    : 'OpenStreetMap'
)
```

O mira los metadatos de las imágenes de mapa en la página de Informes:
- Google Maps URL: `maps.googleapis.com`
- OpenStreetMap URL: `staticmap.openstreetmap.de`
