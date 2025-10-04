// Script para ejecutar las pruebas
const { spawn } = require('child_process');

console.log('🧪 Iniciando pruebas...');

// Configurar el entorno para las pruebas
process.env.NODE_ENV = 'test';
process.env.TEST_MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/test';

// Ejecutar las pruebas
const testProcess = spawn('npm', ['test'], { 
  stdio: 'inherit',
  shell: true 
});

testProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Todas las pruebas pasaron correctamente!');
  } else {
    console.log('❌ Algunas pruebas fallaron. Código de salida:', code);
  }
  process.exit(code);
});

testProcess.on('error', (err) => {
  console.error('❌ Error ejecutando las pruebas:', err);
  process.exit(1);
});