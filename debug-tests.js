const chaiHttp = require('chai-http');
const chai = require('chai');
const server = require('./server');
const mongoose = require('mongoose');

chai.use(chaiHttp);

let id_1, id_2, post_id_1, post_id_2;

console.log('🔍 Iniciando debug de pruebas funcionales...\n');

async function debugTests() {
  try {
    // Esperar conexión a DB
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => {
        mongoose.connection.on('connected', resolve);
      });
    }
    console.log('✅ Conectado a la base de datos\n');

    // 1. Crear primer thread
    console.log('📝 Creando primer thread...');
    const thread1 = await chai.request(server)
      .post('/api/threads/test')
      .send({text: 'Test thread 1', delete_password: 'correct password'});
    
    console.log('Status:', thread1.status);
    console.log('Redirects:', thread1.redirects);
    
    if (thread1.redirects && thread1.redirects[0]) {
      id_1 = thread1.redirects[0].replace(/.+(_id=)/i, '');
      console.log('📋 id_1 extraído:', id_1);
      console.log('📋 Longitud de id_1:', id_1.length);
      console.log('📋 Tipo de id_1:', typeof id_1);
    } else {
      console.log('❌ No hay redirects en thread1');
    }

    // 2. Crear segundo thread
    console.log('\n📝 Creando segundo thread...');
    const thread2 = await chai.request(server)
      .post('/api/threads/test')
      .send({text: 'Test thread 2', delete_password: 'correct password'});
    
    console.log('Status:', thread2.status);
    console.log('Redirects:', thread2.redirects);
    
    if (thread2.redirects && thread2.redirects[0]) {
      id_2 = thread2.redirects[0].replace(/.+(_id=)/i, '');
      console.log('📋 id_2 extraído:', id_2);
      console.log('📋 Longitud de id_2:', id_2.length);
      console.log('📋 Tipo de id_2:', typeof id_2);
    } else {
      console.log('❌ No hay redirects en thread2');
    }

    console.log('\n🔍 Comparación de IDs de threads:');
    console.log('id_1 === id_2:', id_1 === id_2);
    console.log('id_1 !== id_2:', id_1 !== id_2);

    // 3. Crear primer reply
    console.log('\n💬 Creando primer reply...');
    const reply1 = await chai.request(server)
      .post('/api/replies/test')
      .send({thread_id: id_2, text: 'Post #1 test text', delete_password: 'correct password'});
    
    console.log('Status:', reply1.status);
    console.log('Redirects:', reply1.redirects);
    
    if (reply1.redirects && reply1.redirects[0]) {
      post_id_1 = reply1.redirects[0].replace(/.+(_id=)/i, '');
      console.log('📋 post_id_1 extraído:', post_id_1);
      console.log('📋 Longitud de post_id_1:', post_id_1.length);
      console.log('📋 Tipo de post_id_1:', typeof post_id_1);
    } else {
      console.log('❌ No hay redirects en reply1');
    }

    // 4. Crear segundo reply
    console.log('\n💬 Creando segundo reply...');
    const reply2 = await chai.request(server)
      .post('/api/replies/test')
      .send({thread_id: id_2, text: 'Post #2 test text', delete_password: 'correct password'});
    
    console.log('Status:', reply2.status);
    console.log('Redirects:', reply2.redirects);
    
    if (reply2.redirects && reply2.redirects[0]) {
      post_id_2 = reply2.redirects[0].replace(/.+(_id=)/i, '');
      console.log('📋 post_id_2 extraído:', post_id_2);
      console.log('📋 Longitud de post_id_2:', post_id_2.length);
      console.log('📋 Tipo de post_id_2:', typeof post_id_2);
    } else {
      console.log('❌ No hay redirects en reply2');
    }

    console.log('\n🔍 Comparación de IDs de replies:');
    console.log('post_id_1 === post_id_2:', post_id_1 === post_id_2);
    console.log('post_id_1 !== post_id_2:', post_id_1 !== post_id_2);
    console.log('¿Son diferentes?:', post_id_1 !== post_id_2);

    // 5. Verificar que los threads existen
    console.log('\n🔍 Verificando que los threads existen...');
    const getThreads = await chai.request(server)
      .get('/api/threads/test');
    
    console.log('Status GET threads:', getThreads.status);
    console.log('Número de threads:', getThreads.body.length);
    if (getThreads.body.length > 0) {
      console.log('Primer thread ID:', getThreads.body[0]._id);
      console.log('Primer thread replies:', getThreads.body[0].replies.length);
    }

    // 6. Verificar contenido específico del thread
    console.log('\n🔍 Verificando contenido del thread con replies...');
    const getThread = await chai.request(server)
      .get('/api/replies/test')
      .query({thread_id: id_2});
    
    console.log('Status GET thread:', getThread.status);
    if (getThread.body && getThread.body.replies) {
      console.log('Número de replies:', getThread.body.replies.length);
      getThread.body.replies.forEach((reply, index) => {
        console.log(`Reply ${index + 1} ID:`, reply._id);
      });
    }

  } catch (error) {
    console.error('❌ Error en debug:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response text:', error.response.text);
    }
  }
}

debugTests().then(() => {
  console.log('\n✅ Debug completado');
  process.exit(0);
});