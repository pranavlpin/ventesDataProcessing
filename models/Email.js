var mongoose = require("mongoose");

var EmailSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  isValid: Boolean,
  valid: String
});

module.exports = mongoose.model("Email", EmailSchema);
