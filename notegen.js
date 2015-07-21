var doneGeneratingNotes = false;

$.getJSON("data.json",
function(data)
{
  populate(data);
});

function createNote(subjectName, headerStr, equationStr)
{
  //Create the div holding the note
  var equationDiv = document.createElement("div");
  equationDiv.className = "equationDiv";

  //Create the note table
  var table = document.createElement("table");
  equationDiv.appendChild(table);

  //Create the header row
  var headerRow = document.createElement("tr");
  table.appendChild(headerRow);

  //Create the header text holding element
  var header = document.createElement("th");
  header.className = subjectName + "Header equationHeader";
  headerRow.appendChild(header);

  //Create the header text
  var headerText = document.createTextNode(headerStr);
  header.appendChild(headerText);

  //Create the equation row
  var equationRow = document.createElement("tr");
  table.appendChild(equationRow);

  //Create the equation holder
  var equation = document.createElement("td");
  equation.className = subjectName + "Equation equation";
  equationRow.appendChild(equation);

  //Create the equation text with magic symbols used to tell mathjax that yes, we want them to mess with this
  var equationText = document.createTextNode("\\[" + equationStr + "\\]");
  equation.appendChild(equationText);

  return equationDiv;
}

function populate(json)
{
  var masterDiv = document.createElement("div");
  masterDiv.id = "masterDiv";
  $(masterDiv).hide();
  document.body.appendChild(masterDiv);

  var subjects = json.subjects;
  for(var s = 0; s < subjects.length; ++s)
  {
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

    for(var e = 0; e < equations.length; ++e)
    {
      var equationObj = equations[e];

      subjectBody.appendChild(createNote(subjectName, equationObj.header, equationObj.equation));
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
    var text = $(this).html();

    if(text == "+")
    {
      subjectBody.css("maxHeight", "100%");
      subjectBody.css("overflow-x", "auto");

      $(this).css("left", "5px");
      $(this).text("-");
    }
    else
    {
      subjectBody.css("maxHeight", "5px");
      subjectBody.css("overflow-x", "hidden");

      $(this).css("left", "0");
      $(this).text("+");
    }
  });
  doneGeneratingNotes = true;
}
