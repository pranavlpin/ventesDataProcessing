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

const env = process.env.NODE_ENV || "development";

var connection = mongoose.connect("mongodb://localhost:27017/motomojo");

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
router.route("/getkeywords").get(smsController.getKeywords); //Uploads excel file and extracts keywords for each sms
router.route("/allsmsData").get(smsController.getallsmsData); //All SMS data in raw format JSON
router.route("/templateData").get(smsController.gettemplateData); //gets phone number data with keywords
router.route("/smsData/:phoneNumber").get(smsController.getsmsData); //Template data of SMS as per given phone number
router.route("/smsIDData/:sms_id").get(smsController.getsmsIDData); //Raw JSON data using ID of the SMS
router.route("/keywordUser/:keyword").get(smsController.getKeywordUsers); //Phone numbers associated with particular keywords
router.route("/manyKeywordUser/").get(smsController.getManyKeywordUsers); //Phone numbers associated with array of keywords
router.route("/aggrData").get(smsController.getAggrData); //gets unique keywords

router.route("/validmail/:mail").get(smsController.getValidMail);

//Register routes with API
app.use("", router);

//Start the server
app.listen(port, function() {
  console.log(`Server started on Port:${port}`);
});
