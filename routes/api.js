"use strict";
const express = require('express');
const router = express.Router();
const { Message } = require("../models/message");

// POST para crear nuevo hilo en un board
router.post("/threads/:board", async (req, res) => {
  try {
    const { text, delete_password } = req.body;
    const { board } = req.params;

    const newThread = new Message({
      board,
      text,
      delete_password,
      created_on: new Date(),
      bumped_on: new Date(),
      reported: false,
      replies: []
    });

    const savedThread = await newThread.save();
    res.json(savedThread);
  } catch (error) {
    res.status(500).json({ error: "Error creando hilo" });
  }
});

// GET para obtener los 10 hilos más recientes de un board
router.get("/threads/:board", async (req, res) => {
  try {
    const { board } = req.params;
    
    const threads = await Message.find({ board })
      .sort({ bumped_on: -1 })
      .limit(10)
      .select('-reported -delete_password -replies.reported -replies.delete_password')
      .lean();

    // Limitar a 3 respuestas más recientes por hilo y añadir replycount
    threads.forEach(thread => {
      thread.replycount = thread.replies.length;
      thread.replies = thread.replies.slice(-3).reverse();
    });

    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo hilos" });
  }
});

// DELETE para eliminar hilo (con verificación de contraseña)
router.delete("/threads/:board", async (req, res) => {
  try {
    const { thread_id, delete_password } = req.body;

    const thread = await Message.findById(thread_id);
    if (!thread) {
      return res.send("thread not found");
    }

    if (thread.delete_password !== delete_password) {
      return res.send("incorrect password");
    }

    await Message.findByIdAndDelete(thread_id);
    res.send("success");
  } catch (error) {
    res.status(500).json({ error: "Error eliminando hilo" });
  }
});

// PUT para reportar un hilo
router.put("/threads/:board", async (req, res) => {
  try {
    const { thread_id } = req.body;
    
    await Message.findByIdAndUpdate(thread_id, { reported: true });
    res.send("reported");
  } catch (error) {
    res.status(500).json({ error: "Error reportando hilo" });
  }
});

// POST para crear nueva respuesta
router.post("/replies/:board", async (req, res) => {
  try {
    const { text, delete_password, thread_id } = req.body;
    const { board } = req.params;

    const newReply = {
      text,
      delete_password,
      created_on: new Date(),
      reported: false
    };

    const updatedThread = await Message.findByIdAndUpdate(
      thread_id,
      {
        $push: { replies: newReply },
        $set: { bumped_on: new Date() }
      },
      { new: true }
    );

    res.json(updatedThread);
  } catch (error) {
    res.status(500).json({ error: "Error creando respuesta" });
  }
});

// GET para obtener un hilo específico con todas sus respuestas
router.get("/replies/:board", async (req, res) => {
  try {
    const { thread_id } = req.query;

    const thread = await Message.findById(thread_id)
      .select('-reported -delete_password -replies.reported -replies.delete_password');

    if (!thread) {
      return res.status(404).json({ error: "Hilo no encontrado" });
    }

    res.json(thread);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo respuestas" });
  }
});

// DELETE para eliminar respuesta (con verificación de contraseña)
router.delete("/replies/:board", async (req, res) => {
  try {
    const { thread_id, reply_id, delete_password } = req.body;

    const thread = await Message.findById(thread_id);
    if (!thread) {
      return res.send("thread not found");
    }

    const reply = thread.replies.id(reply_id);
    if (!reply) {
      return res.send("reply not found");
    }

    if (reply.delete_password !== delete_password) {
      return res.send("incorrect password");
    }

    // En lugar de eliminar, cambia el texto a "[deleted]"
    reply.text = "[deleted]";
    await thread.save();

    res.send("success");
  } catch (error) {
    res.status(500).json({ error: "Error eliminando respuesta" });
  }
});

// PUT para reportar una respuesta
router.put("/replies/:board", async (req, res) => {
  try {
    const { thread_id, reply_id } = req.body;

    const thread = await Message.findById(thread_id);
    if (thread) {
      const reply = thread.replies.id(reply_id);
      if (reply) {
        reply.reported = true;
        await thread.save();
      }
    }

    res.send("success");
  } catch (error) {
    res.status(500).json({ error: "Error reportando respuesta" });
  }
});

module.exports = router;