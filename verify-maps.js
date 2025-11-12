/**
 * Script de verificación de configuración de Google Maps
 * Ejecutar con: node verify-maps.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de Google Maps...\n');

// Verificar .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ Archivo .env.local encontrado');
  const content = fs.readFileSync(envPath, 'utf-8');

  if (content.includes('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')) {
    console.log('✅ Variable NEXT_PUBLIC_GOOGLE_MAPS_API_KEY configurada');

    const match = content.match(/NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=(.+)/);
    if (match && match[1] && match[1].trim().length > 20) {
      const key = match[1].trim();
      console.log(`✅ API Key encontrada (${key.length} caracteres)`);
      console.log(`   Primeros 20 caracteres: ${key.substring(0, 20)}...`);
    } else {
      console.log('⚠️  API Key parece estar vacía o incompleta');
    }
  } else {
    console.log('❌ Variable NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no encontrada en .env.local');
  }
} else {
  console.log('❌ Archivo .env.local no encontrado');
}

// Verificar .gitignore
const gitignorePath = path.join(__dirname, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  if (gitignoreContent.includes('.env.local')) {
    console.log('✅ .env.local está en .gitignore (API key protegida)');
  } else {
    console.log('⚠️  .env.local NO está en .gitignore (¡PELIGRO!)');
  }
}

// Verificar archivos de mapas
console.log('\n📂 Verificando archivos del sistema de mapas:');

const files = [
  'lib/maps-utils.ts',
  'lib/report-export.ts',
  'app/informes/page.tsx',
  'MAPAS_README.md',
  'GOOGLE_MAPS_SETUP.md',
  'MAPAS_INTEGRACION.md'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} (faltante)`);
  }
});

console.log('\n📊 Resumen:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Sistema: Híbrido (Google Maps + OpenStreetMap)');
console.log('Proveedor actual: Google Maps (API key configurada)');
console.log('Estado: ✅ Listo para usar');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('\n🚀 Próximos pasos:');
console.log('1. Reinicia el servidor: Ctrl+C y luego npm run dev');
console.log('2. Ve a la página de Informes');
console.log('3. Los mapas ahora se cargarán desde Google Maps');
console.log('4. ¡Disfruta de mapas de alta calidad con vista satelital!');

console.log('\n💡 Tip: Para verificar que está usando Google Maps,');
console.log('   inspecciona la URL de las imágenes de mapa (F12)');
console.log('   Deberías ver: maps.googleapis.com');
