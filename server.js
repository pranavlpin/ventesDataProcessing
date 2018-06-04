//Importing packages
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
var mongoose = require("mongoose");
var mongoxlsx = require("mongo-xlsx");
var SMS = require("./models/SMS");
var smsController = require("./controllers/sms");
var keyword_extractor = require("keyword-extractor");
const hbs = require("hbs");
var emailRoutes = require("./routes/emailRoutes");
var smsRoutes = require("./routes/smsRoutes");

const env = process.env.NODE_ENV || "development";

var connection = mongoose.connect("mongodb://127.0.0.1:27017/motomojo", err => {
  if (err) {
    console.log("Error: " + err);
  } else {
    console.log("connection success!!");
  }
});

process.on("uncaughtException", function(error) {
  console.log(error.stack);
  console.log("Node not exiting!!!!!");
});

var app = express();
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
hbs.registerHelper("list", function(items, options) {
  var out = "<ul>";

  for (var i = 0, l = items.length; i < l; i++) {
    out = out + "<li>" + options.fn(items[i]) + "</li>";
  }

  return out + "</ul>";
});

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(cookieParser());

app.use(express.static(__dirname + "/public"));

var port = process.env.PORT || 3000;

var router = express.Router();

//Routes

//Register routes with API
app.use("", router);
app.use("", smsRoutes);
app.use("", emailRoutes);

//Start the server
app.listen(port, function() {
  console.log(`Server started on Port:${port}`);
});
