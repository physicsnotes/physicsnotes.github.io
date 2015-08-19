var mathJaxReady = false;
MathJax.Hub.Register.StartupHook("End", function()
{
  mathJaxReady = true;
  $('.noteLink').click(function()
  {
    var noteID = '#' + $(this).attr('class').split(' ')[2];
    var subjectBody = $(noteID).parent();
    var hideOpenButton = subjectBody.parent().find('.hideOpenButton');

    //Show the subject and the note if it's hidden by search
    subjectBody.parent().show();
    $(noteID).show();

    if(hideOpenButton.html() == '+')
    {
      toggleHideOpen(subjectBody);
    }

    $('html, body').animate(
    {
      scrollTop: $(noteID).offset().top
    }, 900, 'easeInOutCubic');

    $(noteID).animate(
    {
      color: '#29c8de'
    }, 250, 'swing',
    function()
    {
      setTimeout(function()
      {
        $(noteID).animate(
        {
          color: '#000000'
        }, 250);
      }, 900);
    });
  });
  $(masterDiv).show();
});

var quizTime = false;
var quizNote = null;
var quizAnswer = null;
var quizNotes = [];

//Create the holder for the quiz note
var quizNoteHolder = document.createElement("div");
quizNoteHolder.id = "quizNoteHolder";
document.body.appendChild(quizNoteHolder);

//Create the show note equation button
var quizShowButton = document.createElement("div");
quizShowButton.appendChild
(document.createTextNode("Show"));
quizShowButton.id = "quizShowButton";

function removeNote()
{
  if(quizNote !== null)
  {
    quizShowButton.remove();
    quizNote.remove();
    quizNote = null;
  }
}

function showAnswer()
{
  $(quizNote).find('.equation').append(quizAnswer);

  //Remove the show button from the equation div
  quizShowButton.remove();
}

$(quizShowButton).click(showAnswer);

//Create the next button
var quizNextButton = document.createElement("div");
quizNextButton.id = "quizNextButton";
$(quizNextButton).hide();
quizNextButton.appendChild
(document.createTextNode("Next"));
document.body.appendChild(quizNextButton);

function prepareForAnimation(jQueryElem)
{
  /*
  Don't ask don't even ask why this is needed
  if you have to, please ask the wonderful people designing
  CSS why we can't have nice things like the ability to play another animation after the first
  */
  var newElem = jQueryElem.clone(true);
  jQueryElem.before(newElem);
  jQueryElem.remove();
}

function quit()
{
  if(quizTime === false)
    return;

  $('.noteConfig').show();

  quizTime = false;

  quizNotes = [];
  removeNote();

  showNotesAndSearch();

  prepareForAnimation($('#quizNextButton'));
  $('#quizNextButton').css
  ({
    'animation-name': 'fadeOut',
    'animation-duration': '0.4s',
    'animation-timing-function': 'ease-in',
    'animation-fill-mode': 'forwards',
    'animation-direction': 'normal',
    'cursor': 'default'
  });

  prepareForAnimation($('#quizQuitButton'));
  $('#quizQuitButton').css
  ({
    'animation-name': 'fadeOut',
    'animation-duration': '0.4s',
    'animation-timing-function': 'ease-in',
    'animation-fill-mode': 'forwards',
    'animation-direction': 'normal',
    'cursor': 'default'
  });
}

$(quizNextButton).click(showRandomNote);

//Create the quit button
var quizQuitButton = document.createElement("div");
quizQuitButton.id = "quizQuitButton";
quizQuitButton.appendChild
(document.createTextNode("Quit"));
document.body.appendChild(quizQuitButton);
$(quizQuitButton).click(quit);
$(quizQuitButton).hide();

function showRandomNote()
{
  if(quizTime === false)
    return;

  if(quizNotes.length === 0)
  {
    quit();
    return;
  }
  if(quizNotes.length === 1)
    $('#quizNextButton').html("Done");

  removeNote();

  var randomNoteIndex = Math.floor(Math.random() * quizNotes.length);
  quizNote = $(quizNotes[randomNoteIndex]).clone();
  quizNote.show();

  $(quizNote).find('.noteConfig').remove();

  $('#quizNoteHolder').append(quizNote);
  quizNotes.splice(randomNoteIndex, 1);

  var equation = $(quizNote).find('.equation');
  quizAnswer = equation.find('.MathJax_Display');
  quizAnswer.remove();

  equation.append(quizShowButton);
}

function hideNotesAndSearch()
{
  setTimeout(function()
  {
    $('#masterDiv').hide();
    $('#searchDiv').hide();
  }, 600);

  prepareForAnimation($('#masterDiv'));
  $('#masterDiv').css
  ({
    'animation-name': 'fadeAndScaleOut',
    'animation-duration': '0.4s',
    'animation-timing-function': 'ease-in',
    'animation-fill-mode': 'forwards',
    'animation-direction': 'normal'
  });

  prepareForAnimation($('#searchDiv'));
  $('#searchDiv').css
  ({
    'animation-name': 'fadeOut',
    'animation-duration': '0.4s',
    'animation-timing-function': 'ease-in',
    'animation-fill-mode': 'forwards',
    'animation-direction': 'normal'
  });
}

function showNotesAndSearch()
{
  $('#masterDiv').show();
  $('#searchDiv').show();

  prepareForAnimation($('#masterDiv'));
  $('#masterDiv').css
  ({
    'animation-name': 'fadeAndScaleOut',
    'animation-duration': '0.4s',
    'animation-timing-function': 'ease-in',
    'animation-fill-mode': 'forwards',
    'animation-direction': 'reverse'
  });

  prepareForAnimation($('#searchDiv'));
  $('#searchDiv').css
  ({
    'animation-name': 'fadeOut',
    'animation-duration': '0.4s',
    'animation-timing-function': 'ease-in',
    'animation-fill-mode': 'forwards',
    'animation-direction': 'reverse'
  });

  $('#masterDiv').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e)
  {
    alert("done");
    $('#masterDiv').show();
  });
}

function startQuiz(quizSubjectBody)
{
  if(!doneGeneratingNotes || !mathJaxReady || quizTime)
    return;

  quizTime = true;

  $('#quizNextButton').html("Next");

  quizNotes = quizSubjectBody.children();

  hideNotesAndSearch();

  $('#quizNextButton').show();
  prepareForAnimation($('#quizNextButton'));
  $('#quizNextButton').css
  ({
    'animation-name': 'fadeOut',
    'animation-duration': '0.4s',
    'animation-timing-function': 'ease-in',
    'animation-fill-mode': 'forwards',
    'animation-direction': 'reverse',
    'cursor': 'pointer'
  });

  $('#quizQuitButton').show();
  prepareForAnimation($('#quizQuitButton'));
  $('#quizQuitButton').css
  ({
    'animation-name': 'fadeOut',
    'animation-duration': '0.4s',
    'animation-timing-function': 'ease-in',
    'animation-fill-mode': 'forwards',
    'animation-direction': 'reverse',
    'cursor': 'pointer'
  });

  setTimeout(showRandomNote, 520);
}
