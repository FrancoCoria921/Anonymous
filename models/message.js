let mongoose = require("mongoose");

// Conexión simplificada - sin opciones obsoletas
mongoose.connect(process.env.DB);

let messageSchema = new mongoose.Schema({
  board: String,
  text: String,
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
  delete_password: String,
  replies: [
    {
      text: String,
      created_on: { type: Date, default: Date.now },
      delete_password: String,
      reported: { type: Boolean, default: false }
    }
  ]
});

let Message = mongoose.model("Message", messageSchema);

exports.Message = Message;