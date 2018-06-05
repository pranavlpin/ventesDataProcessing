var fs = require("fs");
var cron = require("cron");
var CronJob = require("cron").CronJob;
var Email = require("../models/Email");
var async = require("async");
const emailExistence = require("email-existence");

var validateEmails = new CronJob({
  cronTime: "*/3 * * * *",
  onTick: function() {
    console.log(
      "*******************CRON RAN***********************\n*******************CRON RAN***********************\n*******************CRON RAN***********************"
    );

    Email.find({ valid: "Error" })
      .limit(50000)
      .exec(function(err, result) {
        if (err) {
          console.log(err);
          //res.send(err);
        } else {
          for (let i = 0; i < result.length; i++) {
            //console.log(result[i].email + "" + result[i]._id);
            var savedId = result[i]._id;

            async.waterfall(
              [
                function(callback) {
                  //console.log("in 1st" + result[i]);
                  emailExistence.check(result[i].email, function(
                    err,
                    response
                  ) {
                    if (err) {
                      console.log(
                        "Exist Error: " + result[i].email + " " + err
                      );

                      callback(err);
                    } else {
                      //console.log("Exist Success: " + result[i]);
                      callback(null, response, result[i]);
                    }
                  });
                },
                function(resp, mail, callback) {
                  //console.log("in 2nd:" + mail);
                  Email.findByIdAndUpdate(
                    mail._id,
                    { isValid: resp, valid: resp },
                    { new: true },
                    function(err, updateResult) {
                      if (err) {
                        console.log("Error in update: ", err);
                        callback(err);
                      } else {
                        //console.log("Success in update: ", updateResult);
                        callback(null, updateResult, mail);
                      }
                    }
                  );
                }
              ],
              function(err, finalResult, mailData) {
                console.log(
                  "Complete for one record: " + i + " " + finalResult
                );
              }
            );

            //console.log(">>>" + result[i].email);
          }
        }
        //res.send("Lets see!!");
      });
    console.log(
      "*******************CRON FINISH***********************\n*******************CRON FINISH***********************\n*******************CRON FINISH***********************"
    );
  },
  start: true,
  timeZone: "Asia/Calcutta"
});

module.exports = {
  validateEmails
};
