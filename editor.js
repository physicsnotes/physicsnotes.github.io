var editorState = "hidden";
var editorHeaderStr = "";
var editorEquationStr = "";
var editorSubjectStr = "";
var editorNoteID = "";
var editorUpdateMathJaxTimeout = null;

function editorNewNote()
{
  $('#editorNote').remove();

  var editorNote = createNote(editorSubjectStr, editorHeaderStr, editorEquationStr);
  editorNote.id = 'editorNote';
  $(editorNote).find('.noteConfig').hide();

  $('#editorPreview').append(editorNote);

  if(editorUpdateMathJaxTimeout != null)
  {
    clearTimeout(editorUpdateMathJaxTimeout);
  }

  editorUpdateMathJaxTimeout = setTimeout(function()
  {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, $('#editorNote')[0]]);
  }, 500);
}

function closeEditor()
{
  if(editorState === "hidden")
    return;

  editorState = "hidden";
  editorHeaderStr = "";
  editorEquationStr = "";
  editorNoteID = "";

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

function showEditor()
{
  if(editorState === 'active')
    return;

  editorState = "active";

  hideNotesAndSearch();
  $('#config').hide();

  if(editorHeaderStr === '')
    editorHeaderStr = 'Note Title';

  if(editorEquationStr === '')
    editorEquationStr = '\\mbox{Note Body}'

  $('#editorPreviewTitle').removeClass().addClass(editorSubjectStr + 'Header');
  $('#editorPreviewParent').removeClass().addClass(editorSubjectStr + 'Table');

  $('#editorHeaderInput').val(editorHeaderStr);
  $('#editorEquationInput').html(editorEquationStr);

  editorNewNote();

  //For whatever reason Mathjax needs a kick in the pants to get the ball rolling
  MathJax.Hub.Queue(["Typeset", MathJax.Hub, $('#editorNote')[0]]);

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

function createEditor()
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

  $('#editorCancelButton').click(function()
  {
    closeEditor();
  });

  $('#editorSaveButton').click(function()
  {
    var savedNote = createNote(editorSubjectStr, editorHeaderStr, editorEquationStr);

    if(editorNoteID !== "")
    {
      //Register the note
      registerNote(savedNote, editorNoteID, editorHeaderStr, editorEquationStr);

      $('#' + editorNoteID).replaceWith(savedNote);
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, savedNote]);
    }

    closeEditor();
  });

  $('#configEdit').click(function()
  {
    var noteID = $(configTaggedObject).parent().parent().attr('id');

    editorHeaderStr = noteData[noteID].header;
    editorEquationStr = noteData[noteID].equation;

    var subjectID = getSubjectIDFromNoteID(noteID);
    alert(subjectID);
    editorSubjectStr = subjectData[subjectID].name;

    editorNoteID = noteID;
    showEditor();
  });
}

function getSubjectNameFromID(subjectID)
{
  return subjectData[subjectID].name;
}

function getSubjectIDFromNoteID(noteID)
{
  return noteID.match(/(s.*)n+/)[1];
}

function getUniqueNoteID(subjectID)
{
  var maxID = 0;

  for (var note in noteData)
  {
    //Ensure that this is actually a note and not an inherited object property
    if(noteData.hasOwnProperty(note))
    {
      var noteID = note.replace(subjectID + 'a', '');
      if(noteID !== note)
      {
        maxID = Math.max(maxID, parseInt(noteID));
      }
    }
  }
  return maxID + 1;
}

createEditor();
