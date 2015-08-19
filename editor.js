var editorState = 'closed';
var editorHeaderStr = '';
var editorEquationStr = '';
var editorSubjectName = '';
var editorSubjectID = '';
var editorNoteID = '';
var editorUpdateMathJaxTimeout = null;

//objToUpdate is optional
function updateMathJax(objToUpdate)
{
  if(objToUpdate === undefined)
    MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
  else
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, objToUpdate]);
}

function editorNewNote()
{
  $('#editorNote').remove();

  var editorNote = createNote(editorSubjectName, editorHeaderStr, editorEquationStr);
  editorNote.id = 'editorNote';
  $(editorNote).find('.noteConfig').remove();

  $('#editorPreview').append(editorNote);

  if(editorUpdateMathJaxTimeout != null)
  {
    clearTimeout(editorUpdateMathJaxTimeout);
  }

  editorUpdateMathJaxTimeout = setTimeout(function()
  {
    updateMathJax($('#editorNote')[0]);
  }, 500);
}

function closeEditor()
{
  if(editorState === 'closed')
    return;

  editorState = 'closed';

  setTimeout(function()
  {
    $('#editor').hide();
    showNotesAndSearch();
  }, 500);

  //The odd copy of the textarea string is explained by this unfortunate bug in jquery here:
  //http://bugs.jquery.com/ticket/3016
  var textareaStr = $('#editorEquationInput').val();
  prepareForAnimation($('#editor'));
  $('#editorEquationInput').val(textareaStr);

  $('#editor').css
  ({
    'animation-name': 'fadeAndScaleOut',
    'animation-duration': '0.4s',
    'animation-timing-function': 'ease-in',
    'animation-fill-mode': 'forwards',
    'animation-direction': 'normal'
  });
}

function openEditor()
{
  editorState = 'open';
  
  hideNotesAndSearch();
  $('#config').hide();

  $('#editorPreviewTitle').removeClass().addClass(editorSubjectName + 'Header');
  $('#editorPreviewParent').removeClass().addClass(editorSubjectName + 'Table');
  
  setTimeout(function()
  {
    $('#editor').show();
    prepareForAnimation($('#editor'));

    $('#editor').css
    ({
      'animation-name': 'fadeAndScaleOut',
      'animation-duration': '0.4s',
      'animation-timing-function': 'ease-in',
      'animation-fill-mode': 'forwards',
      'animation-direction': 'reverse'
    });
  }, 600);
}

//subjectID not required, just pass in an empty string.
function openSubjectEditor(subjectID)
{
  if(editorState === 'open')
    return;

  editorSubjectID = subjectID;
  
  $('#subjectEditor').show();
  $('#noteEditor').hide();
  
  //Make a dummy note
  editorHeaderStr = 'Dummy Note';
  editorEquationStr = '\\mbox{Johnny Bravo!}';
  editorNewNote();
  updateMathJax($('#editorNote')[0]);
  
  openEditor();
}

//noteID not required, just pass in an empty string.
function openNoteEditor(subjectID, noteID)
{
  if(editorState === 'open')
    return;
    
  $('#noteEditor').show();
  $('#subjectEditor').hide();

  if(noteID === '')
  {
    editorHeaderStr = 'Note Title';
    editorEquationStr = '\\mbox{Note Body}'
  }
  else
  {
    editorHeaderStr = saveData[noteID].header;
    editorEquationStr = saveData[noteID].equation;
  }
  $('#editorHeaderInput').val(editorHeaderStr);
  $('#editorEquationInput').html(editorEquationStr);

  editorNoteID = noteID;
  editorSubjectID = subjectID;
  editorSubjectName = getSubjectNameFromID(subjectID);

  editorNewNote();

  //For whatever reason Mathjax needs a kick in the pants to get the ball rolling
  updateMathJax($('#editorNote')[0]);
  
  openEditor();
}

function initEditor()
{
  $('#editorHeaderInput').on('input', function()
  {
    editorHeaderStr = $(this).val();

    editorNewNote();
  });

  $('#editorEquationInput').on('input', function()
  {
    editorEquationStr = $(this).val();

    editorNewNote();
  });

  $('.editorColorInput').on('input', function()
  {
    var name = $(this).attr('name');
    var newColor = $(this).val();
    
    function updateColor(jQueryElem)
    {
      jQueryElem.css('background-color', newColor);
    }
    
    switch(name)
    {
      case 'titleColor':
        updateColor($('#editorPreviewTitle'));  
        updateColor($('#editorNote').find('.equationHeader'));
        break;  
      case 'noteColor':
        updateColor($('#editorNote').find('.equation'));
        break;
      case 'subjectColor':
        updateColor($('#editorPreviewParent'));
        break;
    }
    updateColor($(this).parent().find('.editorColorDiv'));
  });
  
  $('#editorCancelButton').click(closeEditor);

  $('#editorSaveButton').click(saveAndExit);

  $('#configEdit').click(function()
  {
    var noteID = $(configTaggedObject).parent().parent().attr('id');
    var subjectID = getSubjectIDFromNoteID(noteID);

    openEditor(subjectID, noteID);
  });

  $("#configLink").click(function()
  {
    var noteID = $(configTaggedObject).parent().parent().attr('id');
    window.prompt("Copy to clipboard:", "\\\\linkNote{" + noteID + "}{Message}");
  });

  $("#configDelete").click(function()
  {
    $('#config').hide();

    var note = $(configTaggedObject).parent().parent();

    unregisterNote(note[0]);
    note.remove();
  });
}

function saveAndExit()
{
  if(editorState == 'closed')
    return;

  closeEditor();

  var savedNote = createNote(editorSubjectName, editorHeaderStr, editorEquationStr);

  //Did the note already exist?
  if(editorNoteID !== '')
  {
    //If so, replace the new note with it
    $('#' + editorNoteID).replaceWith(savedNote);
  }
  else
  {
    //The note didn't exist, add it to the subject
    $('#' + editorSubjectID).find('.subjectBody').append(savedNote);
    editorNoteID = getUniqueNoteID(editorSubjectID);
  }
  registerNote(savedNote, editorNoteID, editorHeaderStr, editorEquationStr);

  //Make the note jiggle, because awesome.
  savedNote.className += ' jellyPopup';

  //Remove the jiggle animation when it's done
  (function()
  {
    //Capture the note id
    var noteID = editorNoteID;
    setTimeout(function()
    {
      $('#' + noteID).removeClass('jellyPopup');
    }, 1000);
  })();

  updateMathJax(savedNote);
}

function getSubjectNameFromID(subjectID)
{
  return saveData[subjectID].name;
}

function getSubjectIDFromNoteID(noteID)
{
  return noteID.match(/(s.*)n+/)[1];
}

function getUniqueNoteID(subjectID)
{
  var maxID = 0;

  for (var note in saveData)
  {
    //Ensure that this is actually a note and not an inherited object property
    if(saveData.hasOwnProperty(note))
    {
      var noteID = note.replace(subjectID + 'n', '');
      if(noteID !== note)
      {
        maxID = Math.max(maxID, parseInt(noteID));
      }
    }
  }
  return subjectID + 'n' + (maxID + 1);
}

initEditor();
