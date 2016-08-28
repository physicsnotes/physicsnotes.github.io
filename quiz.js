var mathJaxReady = false;
MathJax.Hub.Register.StartupHook("End", function()
{
	mathJaxReady = true;
	$(masterDiv).show();
	$('#quizNoteHolder').hide();
	$('#headerDiv').show();
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
	$('#quizNoteHolder').hide();
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

	enableSorting();
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
		$('#headerDiv').hide();
	}, 600);

	//Don't use straight css animation with the masterDiv because
	//jquery has very bad problems with it while making the masterDiv user sortable
	$('#masterDiv').animate
	({
		opacity: 0.0,
	}, 200);
	prepareForAnimation($('#headerDiv'));
	$('#headerDiv').css
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
	$('#headerDiv').show();

	//Don't use straight css animation with the masterDiv because
	//jquery has very bad problems with it while making the masterDiv user sortable
	$('#masterDiv').animate
	({
		opacity: 1.0,
	}, 200);

	prepareForAnimation($('#headerDiv'));
	$('#headerDiv').css
	({
		'animation-name': 'fadeOut',
		'animation-duration': '0.4s',
		'animation-timing-function': 'ease-in',
		'animation-fill-mode': 'forwards',
		'animation-direction': 'reverse'
	});
}

function startQuiz(quizSubjectBody)
{
	if(!doneGeneratingNotes || !mathJaxReady || quizTime || isMovingSomething())
		return;

	$('#quizNoteHolder').show();

	disableSorting();
	quizTime = true;

	$('#quizNextButton').html("Next");
	quizNotes = quizSubjectBody.children('.note');
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
