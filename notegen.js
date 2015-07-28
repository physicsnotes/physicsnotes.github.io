var doneGeneratingNotes = false;

$.getJSON("data.json",
function(data)
{
  populate(data);
});

function toggleHideOpen(subjectBody)
{
  var hideOpenButton = subjectBody.parent().find('.hideOpenButton');
  var text = hideOpenButton.html();

  if(text == "+")
  {
    subjectBody.slideDown(250);

    subjectBody.css("overflow-x", "auto");

    hideOpenButton.css("left", "5px");
    hideOpenButton.text("-");
  }
  else
  {
    subjectBody.slideUp(250);

    subjectBody.css("overflow-x", "hidden");

    hideOpenButton.css("left", "0");
    hideOpenButton.text("+");
  }
}

function createNote(subjectName, headerStr, equationStr, subjectCount, noteCount)
{
  //Create the div holding the note
  var equationDiv = document.createElement("div");
  equationDiv.className = "equationDiv";
  equationDiv.id = 'noteRef-' + subjectCount + '.' + noteCount;

  //Create the note table
  var table = document.createElement("table");
  equationDiv.appendChild(table);

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
  var header = document.createElement("th");
  header.className = subjectName + "Header equationHeader";
  table.appendChild(header);

  //Create the link header
  var linkHeader = document.createElement("th");
  linkHeader.className = "linkHeader";
  linkHeader.appendChild(document.createTextNode("link"));
  $(linkHeader).data("link", "" + subjectCount + "." + noteCount + "");

  table.appendChild(linkHeader);

  //Create the header text
  var headerText = document.createTextNode(headerStr);
  header.appendChild(headerText);

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

  //Create the equation row
  var equationRow = document.createElement("tr");
  table.appendChild(equationRow);

  //Create the equation holder
  var equation = document.createElement("td");
  equation.className = subjectName + "Equation equation";
  equationRow.appendChild(equation);

  //Create the equation text with magic symbols used to tell mathjax that yes, we want it to mess with this
  var equationText = document.createTextNode("\\[" + equationStr + "\\]");
  equation.appendChild(equationText);

  return equationDiv;
}

function populate(json)
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
    var equations = subject.equations;

    //Create the subject table holding the notes
    var subjectTable = document.createElement("table");
    subjectTable.className = subjectName + "Table subjectTable";
    masterDiv.appendChild(subjectTable);

    //Create the title row for the table
    var subjectTitleRow = document.createElement("tr");
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
    var subjectBody = document.createElement("tbody");
    subjectBody.className = "subjectBody";
    subjectTable.appendChild(subjectBody);
    $(subjectBody).slideUp(1);

    for(var e = 0; e < equations.length; ++e)
    {
      var equationObj = equations[e];

      subjectBody.appendChild(createNote(subjectName, equationObj.header, equationObj.equation, curSubjectCount, e + 1));
    }
  }

  $(".quizButton").click(function()
  {
    var quizSubjectBody = $(this).parent().parent().find("tbody");
    startQuiz(quizSubjectBody);
  });

  $(".hideOpenButton").click(function()
  {
    var subjectBody = $(this).parent().parent().find("tbody");
    toggleHideOpen(subjectBody);
  });

  $(".linkHeader").click(function() 
  {
    window.prompt("Copy to clipboard:", "\\\\linkNote{" + $(this).data('link') + "}{Message}");
  });

  doneGeneratingNotes = true;
}
