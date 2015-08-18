var doneGeneratingNotes = false;
var configTaggedObject = null;
var configAnimating = false;

var json = null;
var noteData = new Object();
var subjectData = new Object();

$.getJSON("data.json",
function(data)
{
  json = data;
  populate();
});

function openConfigAt(obj)
{
  //Leave early if we are still animating,
  //Or not hidden and the new tagged object is the same as the old one
  if(configAnimating || $("#config").is(":visible") && (configTaggedObject != null && configTaggedObject[0] === obj))
    return;

  configAnimating = true;
  configTaggedObject = obj;

  updateConfigPos();
  $("#config").hide();
  $('#config').removeClass('configPopUp');
  setTimeout(function()
  {
    $("#config").show();
    $('#config').addClass('configPopUp');
  }, 10);

  setTimeout(function()
  {
    configAnimating = false;
  }, 200);
}

function toggleHideOpen(subjectBody)
{
  var hideOpenButton = subjectBody.parent().find('.hideOpenButton');
  var text = hideOpenButton.html();

  if(text == "+")
  {
    subjectBody.slideDown(250);

    var addNote = subjectBody.parent().find('.addNote');
    addNote.slideDown(250);
    addNote.show();

    subjectBody.css("overflow-x", "auto");

    hideOpenButton.css("top", "-2px");
    hideOpenButton.css("left", "5px");
    hideOpenButton.text("-");
  }
  else
  {
    subjectBody.slideUp(250);

    var addNote = subjectBody.parent().find('.addNote');
    addNote.slideUp(250);

    subjectBody.css("overflow-x", "hidden");

    hideOpenButton.css("top", "0");
    hideOpenButton.css("left", "0");
    hideOpenButton.text("+");
  }
}

function createNote(subjectName, headerStr, equationStr)
{
  //Create the div that is a note
  var note = document.createElement("div");
  note.className = "note";

  //Extract the page reference from the header if it's in the form: (pg *)
  var pageRegExp = new RegExp('(\\(pg .*\\))');
  var regExpResult = headerStr.match(pageRegExp);
  var pageRef = null;

  //See if we have a hit
  if(regExpResult != null)
  {
    //The header had the magic page form, add the page reference element
    var pageRefText = regExpResult[1];
    pageRef = document.createElement("b");
    pageRef.className = "pageReference";

    //Add the page reference's text
    pageRef.appendChild(document.createTextNode(pageRefText));

    //Remove the page reference text from the header string
    headerStr = headerStr.replace(pageRegExp, '');
  }

  //Create the header text holding element
  var header = document.createElement("div");
  header.className = subjectName + "Header equationHeader";
  note.appendChild(header);

  //Create the header text
  var headerText = document.createTextNode(headerStr);
  header.appendChild(headerText);

  //Create the note config
  var noteConfig = document.createElement("img");
  noteConfig.src = "circle.svg";
  noteConfig.className = "noteConfig";
  header.appendChild(noteConfig);

  //Append the page reference if we have one
  if(pageRef != null)
    header.appendChild(pageRef);

  //Extract any note links in the form: \\linkNote{CHAPTER_ID.NOTE_ID}{MATH_JAX_EXPRESSION}
  var noteLinkRegExpExt = new RegExp('\\\\linkNote\\s*\\{\\s*([\\da]+)\\s*\\}\\s*\\{(\\\\.*)\\}');

  //Extract any note links in the form: \\linkNote{CHAPTER_ID.NOTE_ID}{MESSAGE}
  var noteLinkRegExp = new RegExp('\\\\linkNote\\s*\\{\\s*([\\da]+)\\s*\\}\\s*\\{([^{}]*)\\}');

  while(true)
  {
    //Test with the extended more detailed regex first
    var regExpResult = noteLinkRegExpExt.exec(equationStr);
    if(regExpResult != null)
    {
      var noteID = regExpResult[1];
      var noteLinkMsg = regExpResult[2];
      equationStr = equationStr.replace(noteLinkRegExpExt, '\\class{noteLink ' + noteID + '}{' + noteLinkMsg + '}');
    }
    else
    {
      //Test the one that assumes the message means \\mbox{message}
      regExpResult = noteLinkRegExp.exec(equationStr);
      if(regExpResult == null)
        break;

      var noteID = regExpResult[1];
      var noteLinkMsg = regExpResult[2];
      equationStr = equationStr.replace(noteLinkRegExp, '\\class{noteLink ' + noteID + '}{\\mbox{' + noteLinkMsg + '}}');
    }
  }

  //Create the equation div
  var equation = document.createElement("div");
  equation.className = subjectName + "Equation equation";
  note.appendChild(equation);

  //Create the equation text with magic symbols used to tell mathjax that yes, we want it to mess with this
  var equationText = document.createTextNode("\\[" + equationStr + "\\]");
  equation.appendChild(equationText);

  $(noteConfig).click(function()
  {
    openConfigAt($(this)[0]);
  });

  return note;
}

function registerNote(note, id, header, equation)
{
  note.id = id;
  noteData[id] =
  {
    header: header,
    equation: equation,
  };
}

function registerSubject(subject, id, name)
{
  subject.id = id;
  subjectData[id] =
  {
    id: id,
    name: name,
  };
}

function populate()
{
  var curSubjectCount = 0;

  var masterDiv = document.createElement("div");
  masterDiv.id = "masterDiv";
  $(masterDiv).hide();
  document.body.appendChild(masterDiv);

  var subjects = json.subjects;
  for(var s = 0; s < subjects.length; ++s)
  {
    ++curSubjectCount;

    //Extract from json
    var subject = subjects[s];
    var subjectTitleStr = subject.name;
    var subjectID = subject.id;
    var subjectName = subjectTitleStr.replace(' ', '');
    var notes = subject.notes;

    //Create the subject table holding the notes
    var subjectTable = document.createElement("div");
    subjectTable.className = subjectName + "Table subjectTable";
    masterDiv.appendChild(subjectTable);

    //Register the subject
    registerSubject(subjectTable, subjectID, subjectName);

    //Create the title row for the table
    var subjectTitleRow = document.createElement("div");
    subjectTable.appendChild(subjectTitleRow);

    //Create the title for the title row
    var subjectTitle = document.createElement("b");
    subjectTitle.className = "subjectTitle " + subjectName + "Header";
    subjectTitle.appendChild
    (document.createTextNode(subjectTitleStr));
    subjectTitleRow.appendChild(subjectTitle);

    //Create the hide/open button
    var hideOpenButton = document.createElement("b");
    hideOpenButton.className = "hideOpenButton";
    hideOpenButton.appendChild
    (document.createTextNode("+"));
    subjectTitleRow.appendChild(hideOpenButton);

    //Create the quiz button
    var quizButton = document.createElement("b");
    quizButton.className = "quizButton " + subjectName + "Header";
    quizButton.appendChild
    (document.createTextNode("QUIZ"));
    subjectTitleRow.appendChild(quizButton);

    //Create the body where the notes are going
    var subjectBody = document.createElement("div");
    subjectBody.className = "subjectBody";
    subjectTable.appendChild(subjectBody);
    $(subjectBody).slideUp(1);

    //Create the notes for the subject
    for(var n = 0; n < notes.length; ++n)
    {
      var noteObj = notes[n];

      var note = createNote(subjectName, noteObj.header, noteObj.equation);
      registerNote(note, noteObj.id, noteObj.header, noteObj.equation);

      subjectBody.appendChild(note);
    }

    //Create the add note object
    var addNote = document.createElement("div");
    addNote.className = "addNote " + subjectName + "Header";
    addNote.appendChild
    (document.createTextNode("+"));
    subjectTable.appendChild(addNote);

    (function()
    {
      var si = subjectID;

      $(addNote).click(function()
      {
        openEditor(si, '');
      });
    })();
  }

  $(".quizButton").click(function()
  {
    var quizSubjectBody = $(this).parent().parent().find(".subjectBody");
    startQuiz(quizSubjectBody);
  });

  $(".hideOpenButton").click(function()
  {
    var subjectBody = $(this).parent().parent().find(".subjectBody");
    toggleHideOpen(subjectBody);
  });

  $(document).click(function(e)
  {
    if($(e.target).closest("#config, .noteConfig").length === 0)
    {
      $("#config").hide();
    }
  });

  //Create the add subject
  var addSubject = document.createElement("div");
  addSubject.id = "addSubject";
  masterDiv.appendChild(addSubject);

  doneGeneratingNotes = true;
}

function updateConfigPos()
{
  if(configTaggedObject != null)
  {
    var position = $(configTaggedObject).offset();

    $("#config").css(
    {
      'left' : position.left - 13,
      'top' : position.top - 85
    });
  }
}

//Keep the config next to the tagged object
setInterval(updateConfigPos, 100);
