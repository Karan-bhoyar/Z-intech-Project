const mongoose = require("mongoose");

const registerSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  startupName: String,
}, { timestamps: true });

module.exports = mongoose.model("Register", registerSchema);

