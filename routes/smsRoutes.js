var express = require("express");
var smsController = require("../controllers/sms");

var router = express.Router();

//Create endpoint handlers for /dashRewards
router.route("/getkeywords").get(smsController.getKeywordsBig); //Uploads excel file and extracts keywords for each sms
router.route("/allsmsData").get(smsController.getallsmsData); //All SMS data in raw format JSON
router.route("/templateData").get(smsController.gettemplateData); //gets phone number data with keywords
router.route("/smsData/:phoneNumber").get(smsController.getsmsData); //Template data of SMS as per given phone number
router.route("/smsIDData/:sms_id").get(smsController.getsmsIDData); //Raw JSON data using ID of the SMS
router.route("/keywordUser/:keyword").get(smsController.getKeywordUsers); //Phone numbers associated with particular keywords
router.route("/manyKeywordUser/").get(smsController.getManyKeywordUsers); //Phone numbers associated with array of keywords
router.route("/aggrData").get(smsController.getAggrData); //gets unique keywords
router.route("/deleteAllsms/").get(smsController.deleteSMS);

module.exports = router;
