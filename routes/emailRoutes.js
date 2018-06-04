var express = require("express");
var smsController = require("./controllers/sms");

var router = express.Router();

//Create endpoint handlers for /dashRewards
router.route("/deleteAllemail/").get(smsController.deleteEmail);
router.route("/validmail/").get(smsController.getValidMail);
router.route("/validmailAll/").get(smsController.getValidMailAll);
router.route("/allemailData").get(smsController.getallemailData); //All SMS data in raw format JSON

module.exports = router;
