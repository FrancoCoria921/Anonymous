const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  /*
  * ----[EXAMPLE TEST]---
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('Creating a new thread: POST request to /api/threads/{board}', function(done) {
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'Test thread text',
            delete_password: 'delete123'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            // Should redirect to the board page
            assert.isAbove(res.redirects.length, 0, 'Should redirect');
            assert.include(res.redirects[0], '/b/test', 'Should redirect to board');
            done();
          });
      });
    });
    
    suite('GET', function() {
      test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', function(done) {
        chai.request(server)
          .get('/api/threads/test')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'Response should be an array');
            if (res.body.length > 0) {
              assert.property(res.body[0], '_id', 'Thread should have _id');
              assert.property(res.body[0], 'text', 'Thread should have text');
              assert.property(res.body[0], 'created_on', 'Thread should have created_on');
              assert.property(res.body[0], 'bumped_on', 'Thread should have bumped_on');
              assert.property(res.body[0], 'replies', 'Thread should have replies');
              assert.property(res.body[0], 'replycount', 'Thread should have replycount');
              assert.notProperty(res.body[0], 'reported', 'Thread should not show reported');
              assert.notProperty(res.body[0], 'delete_password', 'Thread should not show delete_password');
              assert.isArray(res.body[0].replies, 'Replies should be an array');
              assert.equal(res.body[0].replycount, res.body[0].replies.length, 'Replycount should match replies length');
            }
            done();
          });
      });
    });
    
    suite('DELETE', function() {
      test('Deleting a thread with the correct password: DELETE request to /api/threads/{board}', function(done) {
        // First create a thread to delete
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'Thread to delete',
            delete_password: 'delete123'
          })
          .end(function(err, res) {
            // Extract thread ID from redirect URL
            const redirectUrl = res.redirects[0];
            const threadId = redirectUrl.split('?_id=')[1] || redirectUrl.split('/').pop();
            
            // Now delete the thread
            chai.request(server)
              .delete('/api/threads/test')
              .send({
                thread_id: threadId,
                delete_password: 'delete123'
              })
              .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'success');
                done();
              });
          });
      });
      
      test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board}', function(done) {
        // First create a thread
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'Thread with wrong password',
            delete_password: 'correct123'
          })
          .end(function(err, res) {
            const redirectUrl = res.redirects[0];
            const threadId = redirectUrl.split('?_id=')[1] || redirectUrl.split('/').pop();
            
            // Try to delete with wrong password
            chai.request(server)
              .delete('/api/threads/test')
              .send({
                thread_id: threadId,
                delete_password: 'wrong123'
              })
              .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'incorrect password');
                done();
              });
          });
      });
    });
    
    suite('PUT', function() {
      test('Reporting a thread: PUT request to /api/threads/{board}', function(done) {
        // First create a thread to report
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'Thread to report',
            delete_password: 'delete123'
          })
          .end(function(err, res) {
            const redirectUrl = res.redirects[0];
            const threadId = redirectUrl.split('?_id=')[1] || redirectUrl.split('/').pop();
            
            // Report the thread
            chai.request(server)
              .put('/api/threads/test')
              .send({
                thread_id: threadId
              })
              .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'reported');
                done();
              });
          });
      });
    });

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('Creating a new reply: POST request to /api/replies/{board}', function(done) {
        // First create a thread to reply to
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'Thread for replies',
            delete_password: 'delete123'
          })
          .end(function(err, res) {
            const redirectUrl = res.redirects[0];
            const threadId = redirectUrl.split('?_id=')[1] || redirectUrl.split('/').pop();
            
            // Create a reply
            chai.request(server)
              .post('/api/replies/test')
              .send({
                thread_id: threadId,
                text: 'Test reply',
                delete_password: 'reply123'
              })
              .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.isAbove(res.redirects.length, 0, 'Should redirect');
                assert.include(res.redirects[0], '/b/test', 'Should redirect to board');
                done();
              });
          });
      });
    });
    
    suite('GET', function() {
      test('Viewing a single thread with all replies: GET request to /api/replies/{board}', function(done) {
        // First create a thread
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'Thread for viewing',
            delete_password: 'delete123'
          })
          .end(function(err, res) {
            const redirectUrl = res.redirects[0];
            const threadId = redirectUrl.split('?_id=')[1] || redirectUrl.split('/').pop();
            
            // Get the thread with replies
            chai.request(server)
              .get('/api/replies/test')
              .query({thread_id: threadId})
              .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.isObject(res.body, 'Response should be an object');
                assert.property(res.body, '_id', 'Thread should have _id');
                assert.property(res.body, 'text', 'Thread should have text');
                assert.property(res.body, 'created_on', 'Thread should have created_on');
                assert.property(res.body, 'bumped_on', 'Thread should have bumped_on');
                assert.property(res.body, 'replies', 'Thread should have replies');
                assert.property(res.body, 'replycount', 'Thread should have replycount');
                assert.notProperty(res.body, 'reported', 'Thread should not show reported');
                assert.notProperty(res.body, 'delete_password', 'Thread should not show delete_password');
                assert.isArray(res.body.replies, 'Replies should be an array');
                done();
              });
          });
      });
    });
    
    suite('PUT', function() {
      test('Reporting a reply: PUT request to /api/replies/{board}', function(done) {
        // First create a thread and reply
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'Thread for reply report',
            delete_password: 'delete123'
          })
          .end(function(err, res) {
            const redirectUrl = res.redirects[0];
            const threadId = redirectUrl.split('?_id=')[1] || redirectUrl.split('/').pop();
            
            chai.request(server)
              .post('/api/replies/test')
              .send({
                thread_id: threadId,
                text: 'Reply to report',
                delete_password: 'reply123'
              })
              .end(function(err, res) {
                const replyUrl = res.redirects[0];
                const replyId = replyUrl.split('?_id=')[1] || replyUrl.split('#')[1];
                
                // Report the reply
                chai.request(server)
                  .put('/api/replies/test')
                  .send({
                    thread_id: threadId,
                    reply_id: replyId
                  })
                  .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'reported');
                    done();
                  });
              });
          });
      });
    });
    
    suite('DELETE', function() {
      test('Deleting a reply with the correct password: DELETE request to /api/replies/{board}', function(done) {
        // First create a thread and reply
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'Thread for reply deletion',
            delete_password: 'delete123'
          })
          .end(function(err, res) {
            const redirectUrl = res.redirects[0];
            const threadId = redirectUrl.split('?_id=')[1] || redirectUrl.split('/').pop();
            
            chai.request(server)
              .post('/api/replies/test')
              .send({
                thread_id: threadId,
                text: 'Reply to delete',
                delete_password: 'reply123'
              })
              .end(function(err, res) {
                const replyUrl = res.redirects[0];
                const replyId = replyUrl.split('?_id=')[1] || replyUrl.split('#')[1];
                
                // Delete the reply
                chai.request(server)
                  .delete('/api/replies/test')
                  .send({
                    thread_id: threadId,
                    reply_id: replyId,
                    delete_password: 'reply123'
                  })
                  .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'success');
                    done();
                  });
              });
          });
      });
      
      test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board}', function(done) {
        // First create a thread and reply
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'Thread for wrong password test',
            delete_password: 'delete123'
          })
          .end(function(err, res) {
            const redirectUrl = res.redirects[0];
            const threadId = redirectUrl.split('?_id=')[1] || redirectUrl.split('/').pop();
            
            chai.request(server)
              .post('/api/replies/test')
              .send({
                thread_id: threadId,
                text: 'Reply with wrong password',
                delete_password: 'correct123'
              })
              .end(function(err, res) {
                const replyUrl = res.redirects[0];
                const replyId = replyUrl.split('?_id=')[1] || replyUrl.split('#')[1];
                
                // Try to delete with wrong password
                chai.request(server)
                  .delete('/api/replies/test')
                  .send({
                    thread_id: threadId,
                    reply_id: replyId,
                    delete_password: 'wrong123'
                  })
                  .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'incorrect password');
                    done();
                  });
              });
          });
      });
    });
    
  });

});
