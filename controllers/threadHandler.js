const { Message } = require("../models/message");

exports.postThread = async (req, res) => {
  try {
    const { text, delete_password } = req.body;
    const board = req.params.board;

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
};

exports.getThread = async (req, res) => {
  try {
    const board = req.params.board;
    
    const threads = await Message.find({ board })
      .sort({ bumped_on: -1 })
      .limit(10)
      .select('-reported -delete_password -replies.reported -replies.delete_password')
      .lean();

    threads.forEach(thread => {
      thread.replycount = thread.replies.length;
      thread.replies = thread.replies.slice(-3).reverse();
    });

    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo hilos" });
  }
};

exports.deleteThread = async (req, res) => {
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
};

exports.putThread = async (req, res) => {
  try {
    const { thread_id } = req.body;
    
    await Message.findByIdAndUpdate(thread_id, { reported: true });
    res.send("reported");
  } catch (error) {
    res.status(500).json({ error: "Error reportando hilo" });
  }
};