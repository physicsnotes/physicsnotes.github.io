var editorHeaderStr = "Note Title";
var editorEquationStr = "\\mbox{Note Body}";

function editorNewNote()
{
  $('#editorNote').remove();

  var editorNote = createNote('Chapter20', editorHeaderStr, editorEquationStr, 0, 0);
  editorNote.id = 'editorNote';
  $(editorNote).find('.noteConfig').remove();

  $('#editorPreview').append(editorNote);

  MathJax.Hub.Queue(["Typeset", MathJax.Hub, editorNote]);
}

function closeEditor()
{
  showNotesAndSearch();

  $('#editor').show();

  /*setTimeout(function(){
    $('#editor').hide();
  }, 500);*/

  prepareForAnimation($('#editor'));
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
  $('#config').hide();

  hideNotesAndSearch();

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
}

function createEditor()
{
  editorNewNote();

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

  $('#configEdit').click(function()
  {
    showEditor();
  });
}

createEditor();
