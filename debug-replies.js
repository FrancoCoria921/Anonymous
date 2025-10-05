console.log('🔍 Iniciando debug de replies...');

// Simular la creación de dos objetos reply como en el código
const reply1 = {
  text: 'Post #1 test text',
  created_on: new Date(),
  delete_password: 'correct password',
  reported: false
};

// Pequeña pausa para asegurar timestamps diferentes
setTimeout(() => {
  const reply2 = {
    text: 'Post #2 test text',
    created_on: new Date(),
    delete_password: 'correct password',
    reported: false
  };
  
  console.log('Reply 1:', reply1);
  console.log('Reply 2:', reply2);
  console.log('¿Son iguales?', JSON.stringify(reply1) === JSON.stringify(reply2));
  console.log('¿Timestamps iguales?', reply1.created_on.getTime() === reply2.created_on.getTime());
}, 1);

// Simular la extracción de ID de URL
const testUrls = [
  'http://localhost:3000/b/test/123456789012345678901234?_id=111111111111111111111111',
  'http://localhost:3000/b/test/123456789012345678901234?_id=222222222222222222222222'
];

testUrls.forEach((url, index) => {
  const extractedId = url.replace(/.+(_id=)/i, '');
  console.log(`URL ${index + 1}:`, url);
  console.log(`ID extraído ${index + 1}:`, extractedId);
});

// Verificar que la regex funcione correctamente
const regex = /.+(_id=)/i;
console.log('Regex test:', 'http://test.com/board?_id=12345'.replace(regex, '') === '12345');