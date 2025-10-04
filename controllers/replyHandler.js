const { Message } = require("../models/message");

exports.postReply = async (req, res) => {
  try {
    const { text, delete_password, thread_id } = req.body;
    const board = req.params.board;

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
};

exports.getReply = async (req, res) => {
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
};

exports.deleteReply = async (req, res) => {
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

    reply.text = "[deleted]";
    await thread.save();

    res.send("success");
  } catch (error) {
    res.status(500).json({ error: "Error eliminando respuesta" });
  }
};

exports.putReply = async (req, res) => {
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
};