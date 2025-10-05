/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const mongoose = require('mongoose');

/* Mongoose setup - start*/
mongoose.set('strictQuery', false);

const dbUrl = process.env.NODE_ENV === 'test' ? process.env.TEST_MONGO_URI : process.env.MONGO_URI;

if (!dbUrl) {
  console.error('❌ Error: MONGO_URI no configurado. Variables disponibles:', Object.keys(process.env).filter(key => key.includes('MONGO')));
  // En lugar de process.exit, lanzar un error que se pueda manejar
  throw new Error('MONGO_URI no configurado');
}

console.log('🔗 Conectando a MongoDB...');
mongoose.connect(dbUrl, { 
  useNewUrlParser: true,
  useUnifiedTopology: true 
}).then(() => {
  console.log('✅ Conectado exitosamente a MongoDB');
}).catch(err => {
  console.error('❌ Error conectando a MongoDB:', err.message);
  // No hacer process.exit aquí para evitar que el servidor termine
});

let Schema = mongoose.Schema

const repliesSchema = new Schema({
  text: String,
  created_on: {type: Date, default: new Date()},
  delete_password: String,
  reported: {type: Boolean, default: false}
})

const threadSchema = new Schema({
  text: String,
  created_on: {type: Date, default: new Date()},
  bumped_on: {type: Date, default: new Date()},
  reported: {type: Boolean, default: false},
  delete_password: String,
  replies: [repliesSchema]
})

function thread(boardName) {return mongoose.model(boardName, threadSchema, boardName)}
/* Mongoose setup - end */

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .get((req, res) => {
      const board = req.params.board.toLowerCase();
      const Thread = thread(board);
      
      Thread.find({}).sort({bumped_on: -1}).limit(10).exec((err, data) => {
        if (err) return res.type('text').send(err.message);
        
        const threads = data.map((thread) => {
          return {
            _id: thread._id,
            text: thread.text,
            created_on: thread.created_on,
            bumped_on: thread.bumped_on,
            replies: thread.replies.slice(-3).map(reply => ({
              _id: reply._id,
              text: reply.text,
              created_on: reply.created_on
            })),
            replycount: thread.replies.length
          };
        });
        res.json(threads);
      });
    })
  
    .post((req, res) => {
      if (!req.body.hasOwnProperty('text') || !req.body.hasOwnProperty('delete_password')) {
        return res.type('text').send('incorrect query')
      }
    
      const board = req.params.board.toLowerCase();
      const Thread = thread(board);
      let document = new Thread({
        text: req.body.text,
        reported: false,
        created_on: new Date(),
        bumped_on: new Date(),
        delete_password: req.body.delete_password,
        replies: []
      });

      document.save((err, data) => {
        if (err) throw err;
        res.redirect(`/b/${board}?_id=${data._id}`);
      });
    })
  
    .put((req, res) => {
      if (!req.body.hasOwnProperty('thread_id')) return res.type('text').send('incorrect query')
    
      const board = req.params.board.toLowerCase();
      const Thread = thread(board);
      const thread_id = req.body.thread_id.replace(/\s/g, '');
      
      Thread.findByIdAndUpdate(thread_id, {reported: true}, (err, data) => {
        if (err || !data) return res.type('text').send('incorrect board or id');
        res.type('text').send('reported');
      });
    })
  
    .delete((req, res) => {
      if (!req.body.hasOwnProperty('thread_id') || !req.body.hasOwnProperty('delete_password')) {
        return res.type('text').send('incorrect query')
      }
    
      const board = req.params.board.toLowerCase();
      const Thread = thread(board);
      const thread_id = req.body.thread_id.replace(/\s/g, '');
      const delete_password = req.body.delete_password;
      
      Thread.findById(thread_id, (err, data) => {
        if (err || !data) return res.type('text').send('incorrect board or id');
        
        if (data.delete_password === delete_password) {
          Thread.deleteOne({_id: thread_id}, (err) => {
            if (err) return res.type('text').send(err.message);
            res.type('text').send('success');
          });
        } else {
          res.type('text').send('incorrect password');
        }
      });
    });
    
  app.route('/api/replies/:board')
    .get((req, res) => {
      if (!req.query.hasOwnProperty('thread_id')) return res.type('text').send('incorrect query') 
    
      const board = req.params.board.toLowerCase();
      const Thread = thread(board);
      const thread_id = req.query.thread_id.replace(/\s/g, '');
      
      Thread.findById(thread_id, (err, data) => {
        if (err || !data) return res.type('text').send('thread not found');
        
        const result = {
          _id: data._id,
          text: data.text,
          created_on: data.created_on,
          bumped_on: data.bumped_on,
          replies: data.replies.map(reply => ({
            _id: reply._id,
            text: reply.text,
            created_on: reply.created_on
          })),
          replycount: data.replies.length
        };
        res.json(result);
      });
    })
  
    .post((req, res) => {
      if (!req.body.hasOwnProperty('thread_id') || !req.body.hasOwnProperty('text') || !req.body.hasOwnProperty('delete_password')) {
        return res.type('text').send('incorrect query')
      }
    
      const board = req.params.board.toLowerCase();
      const Thread = thread(board);
      const thread_id = req.body.thread_id;
      const newReply = {
        text: req.body.text,
        created_on: new Date(),
        delete_password: req.body.delete_password,
        reported: false
      };
      
      Thread.findByIdAndUpdate(
        thread_id, 
        {
          bumped_on: new Date(), 
          $push: {replies: newReply}
        },
        {new: true}
      ).exec((err, data) => {
        if (err || !data) return res.type('text').send('Thread not found');
        const newReplyId = data.replies[data.replies.length - 1]._id;
        res.redirect(`/b/${board}/${thread_id}?_id=${newReplyId}`);
      });
    })
  
    .put((req, res) => {
      if (!req.body.hasOwnProperty('thread_id') || !req.body.hasOwnProperty('reply_id')) {
        return res.type('text').send('incorrect query')
      }

      const board = req.params.board.toLowerCase();
      const Thread = thread(board);
      const thread_id = req.body.thread_id.replace(/\s/g, '');
      const reply_id = req.body.reply_id.replace(/\s/g, '');
      
      Thread.updateOne(
        {_id: thread_id, 'replies._id': reply_id}, 
        {'replies.$.reported': true}, 
        (err, data) => {
          if (err || data.matchedCount === 0) return res.type('text').send('incorrect board or id');
          res.type('text').send('reported');
        }
      );
    })
  
    .delete((req, res) => {
      if (!req.body.hasOwnProperty('thread_id') || !req.body.hasOwnProperty('reply_id') || !req.body.hasOwnProperty('delete_password')) {
        return res.type('text').send('incorrect query')
      }

      const board = req.params.board.toLowerCase();
      const Thread = thread(board);
      const thread_id = req.body.thread_id.replace(/\s/g, '');
      const reply_id = req.body.reply_id.replace(/\s/g, '');
      const delete_password = req.body.delete_password;
      
      Thread.findById(thread_id, (err, data) => {
        if (err || !data) return res.type('text').send('incorrect board or thread id');
        
        let reply = data.replies.id(reply_id);
        if (!reply) return res.type('text').send('incorrect post id');

        if (reply.delete_password === delete_password) {
          reply.text = '[deleted]';
          data.save((err) => {
            if (err) return res.type('text').send(err.message);
            res.type('text').send('success');
          });
        } else {
          res.type('text').send('incorrect password');
        }
      });
    });

};
