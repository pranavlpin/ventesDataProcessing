const legit = require("legit"); //for checking email
const MailConfirm = require("mail-confirm");
const emailExistence = require("email-existence");
var SMS = require("../models/SMS");

var _ = require("lodash");
var lda = require("lda");
var keyword_extractor = require("keyword-extractor");
var mongoxlsx = require("mongo-xlsx");

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

exports.getValidMail = function(req, res) {
  emailExistence.check(req.params.mail, function(err, response) {
    if (err) {
      res.send(err);
    } else {
      res.json("res: " + response);
    }
  });
};
