var editorCurNote = null;
var editorOldNote = null;
var editorHeaderStr = "";
var editorEquationStr = "";

function editorNewNote()
{
  editorOldNote = editorCurNote;
  editorCurNote = createNote("Chapter20", editorHeaderStr, editorEquationStr, 0, 0);

  if(editorOldNote == null)
  {
    $("#editorPreview").append(editorCurNote);
  }
  else
  {
    $(editorOldNote).replaceWith(editorCurNote);
  }

  MathJax.Hub.Queue(["Typeset", MathJax.Hub, editorCurNote]);
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
}

createEditor();
