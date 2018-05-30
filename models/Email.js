var mongoose = require("mongoose");

var EmailSchema = new mongoose.Schema({
  email: String,
  isValid: Boolean,
  valid: String
});

module.exports = mongoose.model("Email", EmailSchema);
