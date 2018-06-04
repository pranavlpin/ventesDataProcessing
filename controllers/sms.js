const legit = require("legit"); //for checking email
const MailConfirm = require("mail-confirm");
const emailExistence = require("email-existence");
var SMS = require("../models/SMS");
var Email = require("../models/Email");
var fs = require("fs");
var _ = require("lodash");
var lda = require("lda");
var keyword_extractor = require("keyword-extractor");
var mongoxlsx = require("mongo-xlsx");
var ExcelReader = require("node-excel-stream").ExcelReader;
var waterfall = require("async-waterfall");
var async = require("async");

// // Example document.
// var text = 'Cats are small. Dogs are big. Cats like to chase mice. Dogs like to eat bones.';

// // Extract sentences.
// var documents = text.match( /[^\.!\?]+[\.!\?]+/g );

// // Run LDA to get terms for 2 topics (5 terms each).
// var result = lda(documents, 2, 5);

exports.getKeywords = function(req, res) {
  /* Read xlsx file without a model */
  /* The library will use the first row the key */
  var model = null;
  var xlsx = "./smsFile.xlsx";

  mongoxlsx.xlsx2MongoData(xlsx, model, function(err, data) {
    //console.log(data);
    for (var i = 0; i < data.length; i++) {
      console.log(i + "\n");
      var item = {};
      item["phone"] = data[i]["Mobile Number"];
      item["text"] = data[i]["Message Text"];
      var sentence = data[i]["Message Text"].match(/[^\.!\?]+[\.!\?]+/g);
      item["lda"] = lda(sentence, 1, 5);
      item["bearer"] = data[i]["Bearer"];
      item["operator"] = data[i]["Operator"];
      item["circle"] = data[i]["Circle"];
      item["keywords"] = keyword_extractor.extract(data[i]["Message Text"], {
        language: "english",
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: true
      });
      var regex = /xx[0-9]{4}/g; //Regular expression to remove credit card numbers
      item["keywords"] = item["keywords"].filter(val => {
        //console.log(item + " : " + item.match(regex));
        return !val.match(regex);
      });
      var sms = new SMS(item);
      sms.save(err => {
        if (err) {
          console.log("ERRROORRRORRORORORORR", err);
        } else {
          console.log("Saved:  ", item);
        }
      });
      //console.log(data[i]);
    }
    res.send(item);

    /*
    [{ Name: 'Eddie', Email: 'edward@mail' }, { Name: 'Nico', Email: 'nicolas@mail' }]  
    */
  });
};

exports.getKeywordsBig = function(req, res) {
  let dataStream = fs.createReadStream("./data/smsFile.xlsx");
  let reader = new ExcelReader(dataStream, {
    sheets: [
      {
        name: "Sheet1",
        rows: {
          headerRow: 1,
          allowedHeaders: [
            {
              name: "Mobile Number",
              key: "phone"
            },
            {
              name: "Message Text",
              key: "text"
            },
            { name: "Bearer", key: "bearer" },
            { name: "Operator", key: "operator" },
            { name: "Circle", key: "circle" }
          ]
        }
      },
      {
        name: "Sheet2",
        rows: {
          headerRow: 1,
          allowedHeaders: [
            {
              name: "Mobile Number",
              key: "phone"
            },
            {
              name: "Message Text",
              key: "text"
            },
            { name: "Bearer", key: "bearer" },
            { name: "Operator", key: "operator" },
            { name: "Circle", key: "circle" }
          ]
        }
      },
      {
        name: "Sheet3",
        rows: {
          headerRow: 1,
          allowedHeaders: [
            {
              name: "Mobile Number",
              key: "phone"
            },
            {
              name: "Message Text",
              key: "text"
            },
            { name: "Bearer", key: "bearer" },
            { name: "Operator", key: "operator" },
            { name: "Circle", key: "circle" }
          ]
        }
      },
      {
        name: "Sheet4",
        rows: {
          headerRow: 1,
          allowedHeaders: [
            {
              name: "Mobile Number",
              key: "phone"
            },
            {
              name: "Message Text",
              key: "text"
            },
            { name: "Bearer", key: "bearer" },
            { name: "Operator", key: "operator" },
            { name: "Circle", key: "circle" }
          ]
        }
      }
    ]
  });
  console.log("Starting Parse");
  var i = 0;
  reader
    .eachRow((rowData, rowNum, sheetSchema) => {
      console.log(`  >>${i++} ::  ${rowData.phone}`);

      console.log("First Function Start!");
      var item = {};
      item["phone"] = rowData.phone;
      item["text"] = rowData.text;
      var sentence = rowData.text.match(/[^\.!\?]+[\.!\?]+/g);
      //item["lda"] = lda(sentence, 1, 5);
      item["bearer"] = rowData.bearer;
      item["operator"] = rowData.operator;
      item["circle"] = rowData.circle;
      // item["keywords"] = keyword_extractor.extract(rowData.text, {
      //   language: "english",
      //   remove_digits: true,
      //   return_changed_case: true,
      //   remove_duplicates: true
      // });
      // var regex = /xx[0-9]{4}/g; //Regular expression to remove credit card numbers
      // item["keywords"] = item["keywords"].filter(val => {
      //   //console.log(item["phone"] + " " + rowData.phone);
      //   return !val.match(regex);
      // });

      var sms = new SMS(item);
      console.log("First function finish");
      console.log("Second function start");
      var saveMsg = "";
      sms.save(function(err) {
        if (err) {
          saveMsg = "Error in Saving: " + err;
          console.log("Error in Saving: ", err);
        } else {
          saveMsg = sms.phone + " saved!!";
          console.log(">>Saved");
        }
      });
      console.log("2nd function finish");
    })
    .then(() => {
      console.log("Parsing Done");
      res.json("Finished!!");
    });
};

exports.gettemplateData = function(req, res) {
  SMS.find({}, {}, function(err, sms) {
    if (err) {
      res.send(err);
    } else {
      res.render("data.hbs", {
        pageTitle: "SMS Data",
        currentYear: new Date().getFullYear(),
        data: sms
      });
      //res.json({ data: sms });
    }
  });
  //res.send("Yo");
};

exports.getallsmsData = function(req, res) {
  SMS.find({}, {}, function(err, sms) {
    if (err) {
      res.send(err);
    } else {
      res.json({ data: sms });
    }
  });
  //res.send("Yo");
};

exports.getsmsData = function(req, res) {
  SMS.findOne({ phone: req.params.phoneNumber }, {}, function(err, sms) {
    if (err) {
      res.send(err);
    } else {
      res.render("sms.hbs", {
        phone: sms.phone,
        text: sms.text,
        keywords: sms.keywords,
        id: sms._id
      });
      //res.json({ data: sms });
    }
  });
  //res.send("Yo");
};

exports.getsmsIDData = function(req, res) {
  SMS.findOne({ _id: req.params.sms_id }, {}, function(err, sms) {
    if (err) {
      res.send(err);
    } else {
      res.json(sms);
    }
  });
  //res.send("Yo");
};

exports.getKeywordUsers = function(req, res) {
  SMS.find(
    { keywords: req.params.keyword },
    { keywords: 1, phone: 1 },
    function(err, result) {
      if (err) {
        res.send(err);
      } else {
        res.render("keywordUsers.hbs", {
          keyword: req.params.keyword,
          data: result
        });
        //res.json({ data: result });
      }
    }
  );
};

//it can be used if we wanna match many keywords
exports.getManyKeywordUsers = function(req, res) {
  SMS.find(
    { keywords: { $in: ["flipkart", "wwwflipkartcom", "flipkartcom"] } },
    { keywords: 1, phone: 1 },
    function(err, result) {
      if (err) {
        res.send(err);
      } else {
        res.render("keywordUsers.hbs", {
          keyword: req.params.keyword,
          data: result
        });
        //res.json({ data: result });
      }
    }
  );
};

//get all unique keywords
exports.getAggrData = function(req, res) {
  console.log(
    "==========Getting all keywords from the uploaded data ==========="
  );
  SMS.aggregate(
    [
      {
        $group: {
          _id: null, //finds all keywords for all users not particular
          total: { $sum: 1 },
          keys: {
            $push: {
              $reduce: {
                input: "$keywords",
                initialValue: [],
                in: { $concatArrays: ["$$value", "$keywords"] }
              }
            }
          }
        }
      }
    ],
    function(err, result) {
      if (err) {
        res.send(err);
      } else {
        var dots = "...";
        var dict = [];
        console.log("==========Concatenating the keywords===========");
        for (var i = 0; i < result[0].keys.length; i++) {
          dict = dict.concat(result[0].keys[i]);
          if (i % 400 == 0) {
            //console.log(Math.round(i / result[0].keys.length * 100));
            process.stdout.write(dots);
          }
        }
        console.log("==========Removing duplicate values===========");
        var uniqueDict = _.uniq(dict);
        var regex = /xx[0-9]{4}/g; //Regular expression to remove credit card numbers
        console.log("==========Removing card details from keywords===========");
        var filterDict = uniqueDict.filter(item => {
          //console.log(item + " : " + item.match(regex));
          return !item.match(regex);
        });
        res.render("allKeywords.hbs", {
          keywords: filterDict,
          keywordCount: filterDict.length
        });
        // res.json({
        //   data: filterDict,
        //   l0: filterDict.length,
        //   l1: uniqueDict.length,
        //   l2: dict.length
        // });
      }
    }
  ); ///xx[0-9]{4}/g
  //res.send("Yo");
};

//To find all keywords of particular user
// exports.getAggrData = function(req, res) {
//   SMS.aggregate(
//     [
//       {
//         $group: {
//           _id: "$phone", //$phone is the column name in collection
//           total: { $sum: 1 },
//           keys: {
//             $push: {
//               $reduce: {
//                 input: "$keywords",
//                 initialValue: [],
//                 in: { $concatArrays: ["$$value", "$keywords"] }
//               }
//             }
//           }
//         }
//       }
//     ],
//     function(err, result) {
//       if (err) {
//         res.send(err);
//       } else {
//         res.json(result);
//       }
//     }
//   );
//   //res.send("Yo");
// };

// exports.getValidMail = function(req, res) {
//   legit(req.params.mail)
//     .then(result => {
//       //result.isValid ? res.json("Valid!") : res.json("Invalid!");
//       res.json(result);
//     })
//     .catch(err => res.json(err));
// };

// exports.getValidMail = function(req, res) {
//   const email = new MailConfirm({
//     emailAddress: req.params.mail,
//     timeout: 2000,
//     mailFrom: "my@email.com",
//     invalidMailboxKeywords: ["noreply", "noemail"]
//   });
//   email
//     .check()
//     .then(function(value) {
//       res.json(value);
//     })
//     .catch(err => res.json(err));
// };

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

exports.deleteSMS = function(req, res) {
  SMS.find({}).remove(() => {
    res.json("Deleted SMS data all");
  });
};

exports.deleteEmail = function(req, res) {
  Email.find({}).remove(() => {
    res.json("Deleted SMS data all");
  });
};
