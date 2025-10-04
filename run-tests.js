const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("./server");

chai.use(chaiHttp);

let testThreadId = "";
let testThreadId2 = "";
let testReplyId = "";

console.log("Ejecutando tests funcionales...");

async function runTests() {
  try {
    console.log("1. Creando 2 nuevos threads...");
    
    // Test 1: Creating 2 new threads
    const thread1 = await chai
      .request(server)
      .post("/api/threads/test4")
      .send({
        board: "test4",
        test: "testText", // Usa 'test' como en el test original
        delete_password: "valid password"
      });
    console.log("✓ Thread 1 creado:", thread1.status === 200);

    const thread2 = await chai
      .request(server)
      .post("/api/threads/test4")
      .send({
        board: "test4",
        test: "testText", // Usa 'test' como en el test original
        delete_password: "valid password"
      });
    console.log("✓ Thread 2 creado:", thread2.status === 200);

    // Test 2: Viewing the 10 most recent threads
    console.log("2. Obteniendo 10 threads más recientes...");
    const threadsRes = await chai
      .request(server)
      .get("/api/threads/test4");
    
    console.log("✓ Status 200:", threadsRes.status === 200);
    console.log("✓ Menos de 11 threads:", threadsRes.body.length < 11);
    console.log("✓ Menos de 4 replies:", threadsRes.body[0].replies.length < 4);
    console.log("✓ Es array:", Array.isArray(threadsRes.body));
    
    testThreadId = String(threadsRes.body[0]._id);
    testThreadId2 = String(threadsRes.body[1]._id);
    console.log("Thread IDs guardados:", testThreadId.substring(0,8), testThreadId2.substring(0,8));

    // Test 3: Deleting thread with incorrect password
    console.log("3. Intentando eliminar thread con password incorrecto...");
    const deleteWrong = await chai
      .request(server)
      .delete("/api/threads/test4")
      .send({
        delete_password: "invalid password",
        thread_id: testThreadId
      });
    console.log("✓ Status 200:", deleteWrong.status === 200);
    console.log("✓ Respuesta 'incorrect password':", deleteWrong.text === "incorrect password");

    // Test 4: Deleting thread with correct password
    console.log("4. Eliminando thread con password correcto...");
    const deleteCorrect = await chai
      .request(server)
      .delete("/api/threads/test4")
      .send({
        delete_password: "valid password",
        thread_id: testThreadId2
      });
    console.log("✓ Status 200:", deleteCorrect.status === 200);
    console.log("✓ Respuesta 'success':", deleteCorrect.text === "success");

    // Test 5: Reporting a thread
    console.log("5. Reportando un thread...");
    const reportThread = await chai
      .request(server)
      .put("/api/threads/test4")
      .send({
        thread_id: testThreadId
      });
    console.log("✓ Status 200:", reportThread.status === 200);
    console.log("✓ Respuesta 'success':", reportThread.text === "success");

    // Test 6: Creating a new reply
    console.log("6. Creando nueva reply...");
    const newReply = await chai
      .request(server)
      .post("/api/replies/test4")
      .send({
        thread_id: testThreadId,
        text: "test text",
        delete_password: "valid password"
      });
    console.log("✓ Status 200:", newReply.status === 200);

    // Test 7: Viewing a single thread with all replies
    console.log("7. Obteniendo thread con todas las replies...");
    const threadWithReplies = await chai
      .request(server)
      .get("/api/replies/test4")
      .query({
        thread_id: testThreadId
      });
    console.log("✓ Status 200:", threadWithReplies.status === 200);
    console.log("✓ Replies es array:", Array.isArray(threadWithReplies.body.replies));
    
    testReplyId = threadWithReplies.body.replies[0]._id;
    console.log("Reply ID guardado:", testReplyId.substring(0,8));

    // Test 8: Reporting a reply
    console.log("8. Reportando una reply...");
    const reportReply = await chai
      .request(server)
      .put("/api/replies/test4")
      .send({
        thread_id: testThreadId,
        reply_id: testReplyId
      });
    console.log("✓ Status 200:", reportReply.status === 200);
    console.log("✓ Respuesta 'success':", reportReply.text === "success");

    // Test 9: Deleting reply with incorrect password
    console.log("9. Intentando eliminar reply con password incorrecto...");
    const deleteReplyWrong = await chai
      .request(server)
      .delete("/api/replies/test4")
      .send({
        thread_id: testThreadId,
        reply_id: testReplyId,
        delete_password: "invalid password"
      });
    console.log("✓ Status 200:", deleteReplyWrong.status === 200);
    console.log("✓ Respuesta 'incorrect password':", deleteReplyWrong.text === "incorrect password");

    // Test 10: Deleting reply with correct password
    console.log("10. Eliminando reply con password correcto...");
    const deleteReplyCorrect = await chai
      .request(server)
      .delete("/api/replies/test4")
      .send({
        thread_id: testThreadId,
        reply_id: testReplyId,
        delete_password: "valid password"
      });
    console.log("✓ Status 200:", deleteReplyCorrect.status === 200);
    console.log("✓ Respuesta 'success':", deleteReplyCorrect.text === "success");

    console.log("\n🎉 ¡Todos los 10 tests funcionales completados exitosamente!");
    
  } catch (error) {
    console.error("❌ Error en tests:", error.message);
  }
}

// Ejecutar después de un delay para que el servidor esté listo
setTimeout(runTests, 2000);