var doneGeneratingNotes = false;
var configTaggedObject = null;
var configAnimating = false;

var json = null;
var saveData = new Object();

$.getJSON("data.json",
function(data)
{
  json = data;
  populate();
});

function saveToFile()
{
  return JSON.stringify(saveData);
}

function getSubjectColors(subjectID)
{
  var subjectData = saveData[subjectID];
  
  var palette = new Object();
  palette['tableColor'] = subjectData['tableColor'];
  palette['headerColor'] = subjectData['headerColor'];
  palette['equationColor'] = subjectData['equationColor'];

  return palette;
}

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

function subjectIsOpen(subjectBody)
{
  var hideOpenButton = subjectBody.parent().find('.hideOpenButton');
  var text = hideOpenButton.html();
  return text === "-";
}

function toggleHideOpen(subjectBody)
{
  var hideOpenButton = subjectBody.parent().find('.hideOpenButton');

  if(!subjectIsOpen(subjectBody))
  {
    var addNote = subjectBody.parent().find('.addNote');
    if(!addNote.is(":only-child"))
    {
      addNote.slideDown(250);
      subjectBody.slideDown(250);
    }
    else if(!addNote.is(":visible"))
    {
      addNote.show();
    }
    subjectBody.slideDown(250);

    subjectBody.css("overflow-x", "auto");

    hideOpenButton.css("top", "-2px");
    hideOpenButton.css("left", "5px");
    hideOpenButton.text("-");
  }
  else
  {
    subjectBody.slideUp(250);

    var addNote = subjectBody.parent().find('.addNote');
    if(!addNote.is(":only-child"))
    {
      addNote.slideUp(250);
    }

    subjectBody.css("overflow-x", "hidden");

    hideOpenButton.css("top", "0");
    hideOpenButton.css("left", "0");
    hideOpenButton.text("+");
  }
}

function createNote(subjectID, headerStr, equationStr)
{
  var pallete = getSubjectColors(subjectID);

  return createNoteWithColors(headerStr, equationStr, pallete.headerColor, pallete.equationColor);
}

function createNoteWithColors(headerStr, equationStr, headerColor, equationColor)
{
  //Create the div that is a note
  var note = document.createElement("div");
  note.className = "note";

  //Extract the page reference from the header if it's in the form: (pg *)
  var pageRegExp = new RegExp(/(\(pg .*\))/);
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
  header.className = "equationHeader";
  $(header).css('background-color', headerColor);
  note.appendChild(header);

  //Create the header text
  var headerText = document.createTextNode(headerStr);
  header.appendChild(headerText);

  //Create the note config
  var noteConfig = document.createElement("img");
  noteConfig.src = "gear.svg";
  noteConfig.className = "noteConfig";
  header.appendChild(noteConfig);

  //Append the page reference if we have one
  if(pageRef != null)
    header.appendChild(pageRef);

  //Extract any note links in the form: \\linkNote{NOTE_ID}{MATH_JAX_EXPRESSION}
  var noteLinkRegExpExt = new RegExp(/\\linkNote\s*\{\s*(\S+)\s*\}\s*\{(\\.*)\}/);

  //Extract any note links in the form: \\linkNote{NOTE_ID}{MESSAGE}
  var noteLinkRegExp = new RegExp(/\\linkNote\s*\{\s*(\S+)\s*\}\s*\{([^{}]*)\}/);

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
  equation.className = 'equation';
  $(equation).css('background-color', equationColor);
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

function createSubject(subjectName, tableColor, headerColor, equationColor)
{
  //Create the subject table holding the notes
  var subjectTable = document.createElement("div");
  subjectTable.className = "subjectTable";
  $(subjectTable).css('background-color', tableColor);

  //Create the title row for the table
  var subjectTitleRow = document.createElement("div");
  subjectTable.appendChild(subjectTitleRow);

  //Create the title for the title row
  var subjectTitle = document.createElement("b");
  subjectTitle.className = "subjectTitle";
  $(subjectTitle).css('background-color', headerColor);
  subjectTitle.appendChild
  (document.createTextNode(subjectName));
  subjectTitleRow.appendChild(subjectTitle);

  //Create the hide/open button
  var hideOpenButton = document.createElement("b");
  hideOpenButton.className = "hideOpenButton";
  hideOpenButton.appendChild
  (document.createTextNode("+"));
  subjectTitleRow.appendChild(hideOpenButton);
  
  //Create the quiz button
  var quizButton = document.createElement("b");
  quizButton.className = "quizButton";
  $(quizButton).css('background-color', headerColor);
  quizButton.appendChild
  (document.createTextNode("Quiz"));
  subjectTitleRow.appendChild(quizButton);
  
  //Create the subject edit config button
  var subjectConfigEdit = document.createElement("b");
  subjectConfigEdit.className = "subjectConfigEdit";
  $(subjectConfigEdit).css('background-color', headerColor);
  subjectConfigEdit.appendChild
  (document.createTextNode("Edit"));
  subjectTitleRow.appendChild(subjectConfigEdit);
  
  //Create the subject delete config button
  var subjectConfigDelete = document.createElement("b");
  subjectConfigDelete.className = "subjectConfigDelete";
  $(subjectConfigDelete).css('background-color', headerColor);
  subjectConfigDelete.appendChild
  (document.createTextNode("Delete"));
  subjectTitleRow.appendChild(subjectConfigDelete);
  
  //Create the body where the notes are going
  var subjectBody = document.createElement("div");
  subjectBody.className = "subjectBody";
  subjectTable.appendChild(subjectBody);
  
  //Create the add note object
  var addNote = document.createElement("div");
  addNote.className = "addNote";
  $(addNote).css('background-color', headerColor);
  addNote.appendChild
  (document.createTextNode("+"));
  subjectBody.appendChild(addNote);
  
  $(quizButton).click(function()
  {
    var quizSubjectBody = $(this).parent().parent().find(".subjectBody");
    startQuiz(quizSubjectBody);
  });

  $(hideOpenButton).click(function()
  {
    var subjectBody = $(this).parent().parent().find(".subjectBody");
    toggleHideOpen(subjectBody);
  });
  
  $(subjectBody).slideUp(1);

  return subjectTable;
}

function registerNote(note, id, header, equation)
{
  note.id = id;
  saveData[id] =
  {
    header: header,
    equation: equation
  };
}

function unregisterNote(note)
{
  delete saveData[note.id];
}

function registerSubject(subject, id, name, tableColor, headerColor, equationColor)
{
  subject.id = id;
  saveData[id] =
  {
    id: id,
    name: name,
    tableColor: tableColor,
    headerColor: headerColor,
    equationColor: equationColor
  };
  
  //Handle the add note click function
  (function()
  {
    //Capture the subjectID
    var si = id;

    $(subject).find('.addNote').click(function()
    {
      openNoteEditor(si, '');
    });
  })();
}

function populate()
{
  var masterDiv = document.createElement("div");
  masterDiv.id = "masterDiv";
  $(masterDiv).hide();
  document.body.appendChild(masterDiv);

  for(var subjectID in json)
  {
    //Ensure that this is not an inherited object property and is a subject
    if(json.hasOwnProperty(subjectID) && subjectID.indexOf('n') === -1)
    {  
      //Extract the data from json
      var subject = json[subjectID];
      var subjectName = subject.name;
      var tableColor = subject.tableColor;
      var headerColor = subject.headerColor;
      var equationColor = subject.equationColor;
      
      //Create the subject
      var subjectTable = createSubject(subjectName, tableColor, headerColor, equationColor);
      masterDiv.appendChild(subjectTable);
      
      //Register the subject
      registerSubject(subjectTable, subjectID, subjectName, tableColor, headerColor, equationColor);

      //Create the notes for the subject
      for(var noteID in json)
      {
        //Ensure that this is not an inherited object property and is a note for the subject
        if(json.hasOwnProperty(noteID) && noteID.indexOf(subjectID + 'n') !== -1)
        {
          var noteData = json[noteID];
          
          //Create the note
          var note = createNote(subjectID, noteData.header, noteData.equation);
          $(subjectTable).find('.subjectBody').append(note);
          
          //Register the note
          registerNote(note, noteID, noteData.header, noteData.equation);
        }
      }
      $(subjectTable).find('.subjectBody').slideUp(1);
    }
  }

  $(document).click(function(e)
  {
    if($(e.target).closest("#config, .noteConfig").length === 0)
    {
      $("#config").hide();
    }
  });

  //Create the add subject table
  var addSubjectTable = document.createElement("div");
  addSubjectTable.id = "addSubjectTable";
  masterDiv.appendChild(addSubjectTable);

  //Create the add subject button
  var addSubject = document.createElement("div");
  addSubject.id = "addSubject";
  addSubject.appendChild
  (document.createTextNode("+"));
  addSubjectTable.appendChild(addSubject);

  $(addSubject).click(function()
  {
    openSubjectEditor("");
  });
  
  $(document).on('click', '.noteLink', function(e) 
  {
    if(editorState !== 'closed' && !quizTime)
      return;
    
    var noteID = '#' + $(this).attr('class').split(' ')[2];
    var subjectBody = $(noteID).parent();
    
    //Show the subject and the note if it's hidden by search
    subjectBody.parent().show();
    $(noteID).show();
    
    //Open up the subject if it's closed
    if(!subjectIsOpen(subjectBody))
    {
      toggleHideOpen(subjectBody);
    }

    $('html, body').animate(
    {
      scrollTop: $(noteID).offset().top
    }, 900, 'easeInOutCubic');

    $(noteID).animate(
    {
      borderWidth: '5px'
    }, 700, 'swing',
    function()
    {
      setTimeout(function()
      {
        $(noteID).animate(
        {
          borderWidth: '0'
        }, 250);
      }, 900);
    });
  });
  
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
