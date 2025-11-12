# 🚨 Error 403 de Google Maps - Solución

## ❌ Problema Actual

Google Maps devuelve **403 Forbidden** al intentar cargar mapas estáticos. Esto significa que **la API key no tiene los permisos necesarios** o **falta habilitar la facturación**.

---

## 🔍 Causa del Error 403

Google Maps requiere **facturación habilitada** en Google Cloud, incluso para usar el tier gratuito (28,500 mapas/mes gratis). Sin facturación, todas las peticiones son rechazadas con 403.

---

## ✅ Solución Temporal Implementada

**El sistema ahora usa OpenStreetMap** temporalmente hasta que se habilite la facturación en Google Cloud:

- ✅ **Funciona sin API key**
- ✅ **Sin costos**
- ✅ **Sin restricciones**
- ✅ **Mapas de buena calidad**

---

## 🔧 Cómo Habilitar Google Maps (Pasos Completos)

### Paso 1: Ir a Google Cloud Console
Ve a: https://console.cloud.google.com/

### Paso 2: Seleccionar tu Proyecto
En la parte superior, selecciona el proyecto donde creaste la API key.

### Paso 3: Habilitar Facturación

1. En el menú lateral (☰), ve a: **Facturación** → **Información general de facturación**
2. Si no tienes una cuenta de facturación:
   - Click en **"Crear cuenta de facturación"**
   - Completa el formulario:
     - País/región
     - **Tarjeta de crédito** (requerida, pero NO se cobrará si estás en el tier gratuito)
   - Acepta los términos
   - Click en **"Iniciar mi prueba gratuita"**

3. Si ya tienes cuenta de facturación pero no está vinculada:
   - Click en **"Vincular una cuenta de facturación"**
   - Selecciona tu cuenta de facturación existente

### Paso 4: Verificar que Maps Static API esté Habilitada

1. Menú (☰) → **APIs y servicios** → **Biblioteca**
2. Busca: `"Maps Static API"`
3. Asegúrate de que esté **"Habilitada"** (botón verde)

### Paso 5: Verificar Restricciones de la API Key

1. Menú (☰) → **APIs y servicios** → **Credenciales**
2. Click en tu API key
3. En **"Restricciones de la aplicación"**:
   - Opción 1 (Desarrollo): Selecciona **"Ninguna"**
   - Opción 2 (Producción): Selecciona **"Referentes HTTP"** y añade:
     ```
     http://localhost:3000/*
     http://192.168.1.34:3000/*
     ```

4. En **"Restricciones de API"**:
   - Selecciona **"Restringir clave"**
   - Marca solo: ✅ **Maps Static API**

5. Click en **"Guardar"**

### Paso 6: Esperar Propagación
Espera 5-10 minutos para que los cambios se propaguen.

### Paso 7: Activar Google Maps en el Código

Edita `lib/maps-utils.ts` línea 34:
```typescript
const useGoogleMaps = true // ⬅️ Cambiar de false a true
```

### Paso 8: Reiniciar el Servidor
```bash
npm run dev
```

---

## 🎯 Cómo Verificar que Funciona

### En la Terminal del Servidor:
Busca este log:
```
Fetching map from: https://maps.googleapis.com/maps/api/staticmap?...
```

Si ves **200 OK**, Google Maps está funcionando.
Si ves **403 Forbidden**, revisa los pasos anteriores.

### En la Página de Informes:
1. Abre http://localhost:3000/informes
2. Los mapas deberían aparecer
3. Click derecho en el mapa → Inspeccionar
4. Verifica la URL de la imagen

---

## 💰 Costos de Google Maps

### Tier Gratuito:
- ✅ **$200 de crédito mensual**
- ✅ **28,500 cargas de mapa gratis** (equivalente a $200)
- ✅ **$0.002 por cada carga** después del límite

### Ejemplo de Uso:
- 100 imágenes por informe
- 10 informes por mes
- = 1,000 cargas de mapa
- **Costo: $0** (dentro del tier gratuito)

### Protección:
Puedes configurar alertas en Google Cloud para recibir notificaciones si te acercas al límite:
1. Google Cloud Console → **Facturación** → **Presupuestos y alertas**
2. Crear presupuesto con límite de $200/mes

---

## 🔄 Estado Actual del Sistema

```
┌─────────────────────────────────────┐
│  Proveedor Actual: OpenStreetMap    │
│  Razón: Google Maps 403 Forbidden   │
│  Solución: Habilitar facturación    │
│  Estado: ✅ Funcional con OSM       │
└─────────────────────────────────────┘
```

---

## 📊 Comparación: OpenStreetMap vs Google Maps

| Característica | OpenStreetMap | Google Maps |
|---------------|---------------|-------------|
| **Costo** | 🟢 $0 siempre | 🟢 $0 (hasta 28,500/mes) |
| **Facturación** | 🟢 No requerida | 🔴 Requerida (con tarjeta) |
| **Calidad** | 🟢 Muy buena | 🟢 Excelente |
| **Vista satélite** | ❌ No | ✅ Sí |
| **Restricciones** | 🟢 Ninguna | 🟡 API key + facturación |

---

## 🎯 Recomendación

### Para Desarrollo/Testing:
✅ **Usar OpenStreetMap** (actual)
- Sin configuración adicional
- Sin costos
- Sin restricciones

### Para Producción/Cliente Final:
✅ **Habilitar Google Maps**
- Mejor calidad visual
- Vista satelital disponible
- Más opciones de personalización

---

## 🐛 Problemas Comunes

### Error: "API key not valid"
- Verifica que copiaste la key completa en `.env.local`
- Reinicia el servidor completamente

### Error: "This API project is not authorized"
- Habilita "Maps Static API" en Google Cloud Console
- Espera 5-10 minutos

### Error: "Billing must be enabled"
- Sigue los pasos de "Habilitar Facturación" arriba
- Google requiere tarjeta incluso para tier gratuito

### Los mapas no aparecen después de habilitar facturación:
1. Verifica en la terminal del servidor si hay errores
2. Cambia `useGoogleMaps = true` en `maps-utils.ts`
3. Reinicia el servidor
4. Limpia caché del navegador (Ctrl+Shift+R)

---

## 📞 Ayuda Adicional

Si después de seguir todos los pasos Google Maps sigue sin funcionar:

1. **Revisa la consola del servidor** (terminal donde corre `npm run dev`)
2. **Copia el mensaje de error completo**
3. **Verifica tu panel de Google Cloud** → APIs y servicios → Dashboard
   - Deberías ver peticiones a "Maps Static API"
   - Si ves "0 peticiones", la API no está recibiendo las llamadas

---

## ✨ Resumen

- ✅ **Actualmente funcionando con OpenStreetMap**
- 📋 **Para usar Google Maps**: Habilitar facturación en Google Cloud
- 🔄 **Cambio rápido**: Solo cambiar `useGoogleMaps = true` cuando esté listo
- 💰 **Sin costos**: Ambas opciones son gratuitas para uso normal

**El sistema funciona perfectamente con OpenStreetMap.** Puedes habilitar Google Maps más adelante si necesitas vista satelital.
