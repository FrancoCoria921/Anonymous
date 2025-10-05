// Script de depuración para probar endpoints manualmente
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./server');

chai.use(chaiHttp);

async function testEndpoints() {
  console.log('🔍 Iniciando pruebas de depuración...\n');
  
  try {
    // Test 1: POST thread
    console.log('1. Probando POST /api/threads/test...');
    const postResponse = await chai.request(server)
      .post('/api/threads/test')
      .send({text: 'Test thread debug', delete_password: 'debug123'});
    
    console.log('Status:', postResponse.status);
    console.log('Redirects:', postResponse.redirects);
    
    if (postResponse.redirects && postResponse.redirects.length > 0) {
      const redirectUrl = postResponse.redirects[0];
      console.log('Redirect URL:', redirectUrl);
      
      // Probar la extracción del ID como lo hacen las pruebas
      const extractedId = redirectUrl.replace(/.+(_id=)/i, '');
      console.log('ID extraído:', extractedId);
      console.log('¿Es un ObjectId válido?', /^[0-9a-fA-F]{24}$/.test(extractedId));
    }
    
    console.log('\n');
    
    // Test 2: GET threads
    console.log('2. Probando GET /api/threads/test...');
    const getResponse = await chai.request(server)
      .get('/api/threads/test');
    
    console.log('Status:', getResponse.status);
    console.log('¿Es array?:', Array.isArray(getResponse.body));
    if (Array.isArray(getResponse.body) && getResponse.body.length > 0) {
      console.log('Primer thread:', JSON.stringify(getResponse.body[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

testEndpoints();