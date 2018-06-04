const legit = require("legit"); //for checking email
const MailConfirm = require("mail-confirm");
const emailExistence = require("email-existence");
var Email = require("../models/Email");
var fs = require("fs");
var _ = require("lodash");
var mongoxlsx = require("mongo-xlsx");
var ExcelReader = require("node-excel-stream").ExcelReader;
var waterfall = require("async-waterfall");
var async = require("async");

exports.getValidMailAll = function(req, res) {
  let dataStream = fs.createReadStream("./data/emails/3.xlsx");
  let reader = new ExcelReader(dataStream, {
    sheets: [
      {
        name: "Sheet1",
        rows: {
          headerRow: 1,
          allowedHeaders: [
            {
              name: "Email Id",
              key: "email"
            }
          ]
        }
      }
    ]
  });
  var i = 0,
    j = 0;
  reader.eachRow((rowData, rowNum, sheetSchema) => {
    console.log("\n" + j++ + "/100000" + JSON.stringify(rowData) + "\n");

    /////Just save logic
    var email = new Email({
      email: rowData.email
    });
    email.save(err => {
      if (err) {
        console.log("error in saving to DB\n");
      } else {
        console.log(rowData.email + " " + i++ + " saved successfully\n");
      }
    });

    //   emailExistence.check(rowData.email, function(err, response) {
    //     if (err) {
    //       console.log("EmailExistence Error: " + rowData.email + err);
    //       var email = new Email({
    //         email: rowData.email
    //       });
    //       email.save(err => {
    //         if (err) {
    //           console.log("error in saving to DB\n");
    //         } else {
    //           i++;
    //           console.log(rowData.email+" "+i+ " error but saved successfully\n");
    //         }
    //       });
    //     } else {
    //       if (response == true || response == false) {
    //         var email = new Email({
    //           email: rowData.email,
    //           valid: response
    //         });
    //         email.save(err => {
    //           if (err) {
    //             console.log("error in saving to DB\n");
    //           } else {
    //             i++;
    //             console.log(rowData.email +" "+i+ " saved successfully\n");
    //           }
    //         });
    //       }
    //       //console.log(">>>>>>>>>>>>>>>>>>>>>>" + i + "/100000 ");
    //     }
    //   });
  });
  res.json(`saved ${i} emails out of ${j} read records from 100000`);
};
exports.getValidMail = function(req, res) {
  Email.find({ valid: undefined })
    .limit(5000)
    .exec(function(err, result) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        for (let i = 0; i < result.length; i++) {
          //console.log(result[i].email + "" + result[i]._id);
          var savedId = result[i]._id;

          async.waterfall(
            [
              function(callback) {
                //console.log("in 1st" + result[i]);
                emailExistence.check(result[i].email, function(err, response) {
                  if (err) {
                    console.log("Exist Error: " + result[i].email + " " + err);
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
              console.log("Complete for one record: " + i + " " + finalResult);
            }
          );

          //console.log(">>>" + result[i].email);
        }
      }
      res.send("Lets see!!");
    });
};

exports.getallemailData = function(req, res) {
  Email.find({}, {}, function(err, sms) {
    if (err) {
      res.send(err);
    } else {
      res.json({ data: sms });
    }
  });
  //res.send("Yo");
};
exports.deleteEmail = function(req, res) {
  Email.find({}).remove(() => {
    res.json("Deleted SMS data all");
  });
};
