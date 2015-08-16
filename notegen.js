var doneGeneratingNotes = false;
var configTaggedObject = null;
var configAnimating = false;
var json = null;
var noteData = new Object();

$.getJSON("data.json",
function(data)
{
  json = data;
  populate();
});

function toggleHideOpen(subjectBody)
{
  var hideOpenButton = subjectBody.parent().find('.hideOpenButton');
  var text = hideOpenButton.html();

  if(text == "+")
  {
    subjectBody.slideDown(250);

    subjectBody.css("overflow-x", "auto");

    hideOpenButton.css("top", "-2px");
    hideOpenButton.css("left", "5px");
    hideOpenButton.text("-");
  }
  else
  {
    subjectBody.slideUp(250);

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
  noteConfig.src = "circle.png"
  noteConfig.className = "noteConfig";
  header.appendChild(noteConfig);

  //Append the page reference if we have one
  if(pageRef != null)
    header.appendChild(pageRef);

  //Extract any note links in the form: \\linkNote{CHAPTER_ID.NOTE_ID}{MATH_JAX_EXPRESSION}
  var noteLinkRegExpExt = new RegExp('\\\\linkNote\\s*\\{\\s*([\\d.]+)\\s*\\}\\s*\\{(\\\\.*)\\}');

  //Extract any note links in the form: \\linkNote{CHAPTER_ID.NOTE_ID}{MESSAGE}
  var noteLinkRegExp = new RegExp('\\\\linkNote\\s*\\{\\s*([\\d.]+)\\s*\\}\\s*\\{([^{}]*)\\}');

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

  return note;
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
    var subjectName = subjectTitleStr.replace(' ', '');
    var notes = subject.notes;

    //Create the subject table holding the notes
    var subjectTable = document.createElement("div");
    subjectTable.className = subjectName + "Table subjectTable";
    masterDiv.appendChild(subjectTable);

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

      //Register note object
      note.id = 'noteRef-' + noteObj.id;
      noteData[note.id] =
      {
        header: noteObj.header,
        equation: noteObj.equation,
        subject: subjectName
      };

      subjectBody.appendChild(note);
    }
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

  $(".linkHeader").click(function()
  {
    window.prompt("Copy to clipboard:", "\\\\linkNote{" + $(this).data('link') + "}{Message}");
  });

  $(document).click(function(e)
  {
    if($(e.target).closest("#config, .noteConfig").length === 0)
    {
      $("#config").hide();
    }
  });

  $(".noteConfig").click(function()
  {
    if(configAnimating)
      return;

    configAnimating = true;
    configTaggedObject = $(this);

    updateConfigPos();

    $("#config").show();

    //Remove the animation class from the config bubble options
    $("#configBubble").children("div").each(function(index)
    {
      $(this).removeClass("slideLeft");
      $(this).css('padding-left', '205px');
    });

    prepareForAnimation($("#configBubble"));

    $('#configBubble').css
    ({
      'animation-name': 'configPopUp',
      'animation-duration': '0.2s',
      'animation-timing-function': 'ease-in',
      'animation-fill-mode': 'forwards',
      'animation-direction': 'normal',
    });

    setTimeout(function()
    {
      $("#configEdit").addClass("slideLeft");
    }, 100);

    setTimeout(function()
    {
      $("#configLink").addClass("slideLeft");
    }, 150);

    setTimeout(function()
    {
      $("#configDelete").addClass("slideLeft");
      configAnimating = false;
    }, 200);
  });
  doneGeneratingNotes = true;
}

function updateConfigPos()
{
  if(configTaggedObject != null)
  {
    var position = configTaggedObject.offset();

    $("#config").css(
    {
      'left' : position.left,
      'top' : position.top - 120
    });
  }
}

//Keep the config next to the tagged object
setInterval(updateConfigPos, 100);
