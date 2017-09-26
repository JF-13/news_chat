// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append("<a style='color:black; text-decoration:none' href='" + data[i].link + "'><h4 data-id='" + data[i]._id + " href=" + data[i].link + "'>" + data[i].title + "</h4></a><button class='btn btn-secondary comment' data-id='" + data[i]._id + "'>comment</button>");
  }
});


// Whenever someone clicks a class="comment" tag
$(document).on("click", ".comment", function() {
  // delete note box
  $("#notes").empty();
  // get id matching article with button
  var thisId = $(this).attr("data-id");

  // get article title with ajax
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // adding note box
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea><button class='btn btn-secondary' data-id='" + data._id + "' id='savenote'>save</button>");
      // note submit button
      //$("#notes").append("<button class='btn btn-secondary' data-id='" + data._id + "' id='savenote'>save</button>");

      // If there's a note in the article
      if (data.note) {
        $("#notes").append("<h4 id='bodyinput' data-id='" + data.note._id + "' name='body'>" + data.note.title + "</h4>")
        $("#notes").append("<h4 id='bodyinput' data-id='" + data.note._id + "' name='body'>" + data.note.body + "</h4>")
        $("#notes").append("<button class='btn btn-secondary' data-id='" + data.note._id + "' id='deletenote'>delete</button>");
      }
    });
});

//DELETE comment
$(document).on("click", "#deletenote", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "POST",
      url: "/notes/" + thisId
    })
    $("[data-id=" + thisId + "]").hide();
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {

  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
