var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

var request = require("request");
var cheerio = require("cheerio");

mongoose.Promise = Promise;

var app = express();

var PORT = process.env.PORT || 3000;

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static("public"));

mongoose.connect("---secret---");
//THIS IS FOR LOCAL DB
//mongoose.connect("mongodb://localhost/test");
var db = mongoose.connection;

//connection log
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


//routes
app.get("/scrape", function(req, res) {
  // get HTML
  request("https://news.google.com/news/?ned=us&hl=enç", function(error, response, html) {
    // load cheerio
    var $ = cheerio.load(html);
    //grab element
    $("c-wiz").each(function(i, element) {

      // save empty var
      var result = {};

      // grab titles and href from element
      result.title = $(this).children("a.nuEeue.hzdq5d.ME7ew").text();
      result.link = $(this).children("a.nuEeue.hzdq5d.ME7ew").attr("href");

      // inputting an our results into db article
      var entry = new Article(result);
      //Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
  });
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {

  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});
//delete note by id
app.post("/notes/:id", function(req, res) {
  Note.findByIdAndRemove(req.params.id, function(err){
    if (err) {
      res.send(err)
    } else {
      res.json({message: "note deleted"})
    }
  })
});
// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});


// Listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port ", PORT);
});
