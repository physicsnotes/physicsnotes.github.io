$('#search').on('input', function(event)
{
  if(!doneGeneratingNotes)
    return;

  var searchKeywords = $(this).val().toUpperCase().split(' ');
  var subjectTables = $('.subjectTable').each(function(index)
  {
    //A boolean for if all the notes are gone in a subject
    //Assume true until proven otherwise
    var allNotesGone = true;

    $(this).find('.subjectBody').children('.note').each(function(index)
    {
      var headerText = $(this).find('.equationHeader').html().toUpperCase();
      var noteHidden = false;

      for(var i = 0; i < searchKeywords.length; ++i)
      {
        var keyword = searchKeywords[i];

        if(headerText.indexOf(keyword) === -1)
        {
          noteHidden = true;
          break;
        }
      }

      if(!noteHidden)
      {
        allNotesGone = false;
        $(this).show();
      }
      else
      {
        $(this).hide();
      }
    });

    if(allNotesGone)
    {
      $(this).hide();
    }
    else
    {
      $(this).show();
    }
  });
});

var regularSearchR = 250;
var regularSearchG = 250;
var regularSearchB = 250;

var focusSearchR = 245;
var focusSearchG = 245;
var focusSearchB = 255;

var isFocused = false;
var lerpVal = 1;

$('#search').focus(function(event)
{
  isFocused = true;
});

$('#search').focusout(function(event)
{
  isFocused = false;
});

setInterval(function()
{
  function lerp(a, b, t)
  {
    return a + (b - a) * t;
  }

  if(isFocused)
  {
    lerpVal = Math.max(lerpVal - 0.3, 0);
  }
  else
  {
    lerpVal = Math.min(lerpVal + 0.3, 1);
  }

  var r = Math.round(lerp(focusSearchR, regularSearchR, lerpVal));
  var g = Math.round(lerp(focusSearchG, regularSearchG, lerpVal));
  var b = Math.round(lerp(focusSearchB, regularSearchB, lerpVal));

  $('#search').css('background-color', 'rgb(' + r + ',' + g + ',' + b);
  $('#search').css('font-color', 'rgb(' + r + ',' + g + ',' + b);

}, 50);
