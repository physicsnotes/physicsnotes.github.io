var editorState = "hidden";
var editorHeaderStr = "";
var editorEquationStr = "";

function editorNewNote()
{
  $('#editorNote').remove();

  var editorNote = createNote('Chapter20', editorHeaderStr, editorEquationStr);
  editorNote.id = 'editorNote';
  $(editorNote).find('.noteConfig').remove();

  $('#editorPreview').append(editorNote);

  MathJax.Hub.Queue(["Typeset", MathJax.Hub, editorNote]);
}

function closeEditor()
{
  if(editorState === "hidden")
    return;

  editorState = "hidden";
  editorHeaderStr = "";
  editorEquationStr = "";

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
    
  if(editorHeaderStr === '')
    editorHeaderStr = 'Note Title';
  
  if(editorEquationStr === '')
    editorEquationStr = '\\mbox{Note Body}'
    
  editorNewNote();

  $('#editorHeaderInput').val(editorHeaderStr);
  $('#editorEquationInput').html(editorEquationStr);

  editorState = "active";

  $('#config').hide();

  hideNotesAndSearch();

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
    closeEditor();
  });

  $('#configEdit').click(function()
  {
    var noteID = $(configTaggedObject).parent().parent().attr('id');
    editorHeaderStr = noteData[noteID].header;
    editorEquationStr = noteData[noteID].equation;
    showEditor();
  });
}

createEditor();
