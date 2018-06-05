var express = require("express");
var emailController = require("../controllers/email");

var router = express.Router();

router.route("/streamTransform").get(emailController.streamTransformData);
router.route("/newFun/").get(emailController.newFun);

router.route("/deleteAllemail/").get(emailController.deleteEmail);
router.route("/validmail/").get(emailController.getValidMail);
router.route("/validmailAll/").get(emailController.getValidMailAll);
router.route("/allemailData").get(emailController.getallemailData); //All SMS data in raw format JSON

module.exports = router;
