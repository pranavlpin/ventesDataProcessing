var mongoose = require("mongoose");

var SMSSchema = new mongoose.Schema({
  phone: Number,
  text: String,
  bearer: String,
  operator: String,
  circle: String,
  keywords: [String],
  lda: Object
});

module.exports = mongoose.model("SMS", SMSSchema);
