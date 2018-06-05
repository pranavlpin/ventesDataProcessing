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
var stream = require("stream");
var util = require("util");
var Excel = require("exceljs");
var LineByLineReader = require("line-by-line");
//var lazy = require("lazy");

exports.newFun = function(req, res) {
  let i = 0;
  // new lazy(fs.createReadStream("./data/emails/emails.txt")).lines.forEach(
  //   function(line) {
  //     //console.log(line.toString());
  //     text = line.toString();
  //     emailExistence.check(text, function(err, response) {
  //       console.log(i++ + " " + text + " " + response + "\n");
  //       //fs.appendFile("output.txt", `${response} \n/n`, function() {});
  //     });
  //   }
  // );
};

// exports.streamTransformData = function(req, res) {
//   lr = new LineByLineReader("./data/emails/emails.txt");
//   var i = 0;
//   lr.on("error", function(err) {
//     console.log("Error: " + err);
//   });

//   lr.on("line", function(line) {
//     let text = line.replace(/ /g, "");
//     // Do some evaluation to determine if the text matches
//     console.log(text.toString());
//     emailExistence.check(text, function(err, response) {
//       console.log("> " + response + "\n");
//       fs.appendFile("output.txt", `${response} \n/n`, function() {});
//     });
//   });
//   lr.on("end", function() {
//     res.json("All lines read!");
//   });
// };

exports.streamTransformData = function(req, res) {
  let dataStream = fs.createReadStream("./data/emails/6.xlsx");
  //var wstream = fs.createWriteStream("./data/emails/emailsDone.xlsx");
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
  let promise = [];
  var i = 0;
  var j = 0;
  reader.eachRow((rowData, rowNum, sheetSchema) => {
    console.log("Read: " + i++ + " " + rowData.email);
    dataStream.pause();
    promise[rowNum] = new Promise((resolve, reject) => {
      emailExistence.check(rowData.email, function(err, response) {
        if (err) {
          console.log("Error in checking: " + err);
          return new Promise((resolve, reject) => {
            var email = new Email({
              email: rowData.email
            });
            email.save(err => {
              if (err) {
                //dataStream.resume();
                reject("Error in saving: " + err);
              } else {
                console.log(rowData.email + " " + j++ + " saved success!!");
                //dataStream.resume();
                resolve(rowData + " saved successfully!");
              }
            });
          });
        } else {
          console.log(rowData.email + " " + response + " response!!");
          return new Promise((resolve, reject) => {
            var email = new Email({
              email: rowData.email,
              isValid: response,
              valid: response
            });
            email.save(err => {
              if (err) {
                //dataStream.resume();
                reject("Error in saving: " + err);
              } else {
                console.log(rowData.email + " " + j++ + " saved success!!");
                //dataStream.resume();
                resolve(rowData + " saved successfully!");
              }
            });
          });
        }
      });
    })
      .then(resp => {
        console.log(resp);
      })
      .then(re => {
        console.log(re);
        Promise.all(promise)
          .then(val => {
            res.json("Resolved" + val);
          })
          .catch(e => {
            console.log("ERROR in resolving All promise" + e);
          });
      });
  });
};

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
  Email.find({ valid: "Error" })
    .limit(45000)
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
    res.json("Deleted Email data all");
  });
};
