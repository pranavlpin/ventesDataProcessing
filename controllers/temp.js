//email = "";
var checkEmail = function(email, cb) {
  emailExistence.check(email, function(err, response) {
    console.log(
      "|||||||||" +
        typeof email +
        "|||||||||" +
        email +
        "|||||||||" +
        response +
        "||||||||"
    );
    cb(null, response);
  });
};

const fs = require("fs");
const readline = require("readline");

exports.streamTransformData = function(req, res) {
  const outputFile = fs.createWriteStream("./output-file.txt");
  const rl = readline.createInterface({
    input: fs.createReadStream("./data/emails/emails.txt")
  });

  // Read the file and replace any text that matches
  rl.on("line", line => {
    let text = line.replace(/ /g, "");
    // Do some evaluation to determine if the text matches

    emailExistence.check(text, function(err, response) {
      console.log(">" + text + " " + response + "\n");
      fs.appendFile("output.txt", `${text} : ${response}\n`, function() {});
    });
    // write text to the output file stream with new line character
    //outputFile.write(`${text}\n`);
  });

  // Done reading the input, call end() on the write stream
  rl.on("close", () => {
    outputFile.end();
  });
};

exports.streamTransformData = function(req, res) {
  lr = new LineByLineReader("./data/emails/emails.txt");
  var i = 0;
  lr.on("error", function(err) {
    console.log("Error: " + err);
  });

  lr.on("line", function(line) {
    let text = line.replace(/ /g, "");
    // Do some evaluation to determine if the text matches

    emailExistence.check(text, function(err, response) {
      console.log(">" + text + " " + response + "\n");
      fs.appendFile("output.txt", `${text} : ${response}\n`, function() {});
    });
  });
  lr.on("end", function() {
    res.json("All lines read!");
  });
};
