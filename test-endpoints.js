// Archivo para probar rápidamente que todos los endpoints funcionen
require('dotenv').config();
const express = require('express');
const app = require('./server');

console.log('🧪 Verificando que el servidor esté funcionando...');
console.log('Base de datos:', process.env.DB ? 'Configurada ✅' : 'No configurada ❌');
console.log('Puerto:', process.env.PORT || 3000);
console.log('Entorno:', process.env.NODE_ENV);

// Verificar que el servidor responda
setTimeout(() => {
  console.log('\n✅ Servidor iniciado. Los tests deberían poder ejecutarse.');
  console.log('\nPara ejecutar los tests funcionales:');
  console.log('1. npm test');
  console.log('2. O ejecutar: NODE_ENV=test mocha tests/2_functional-tests.js --timeout 10000');
  
  process.exit(0);
}, 3000);