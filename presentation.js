var $pageBody, $slideContainer, slideCount, $origBody
  isPresentation = false,
  slideNr = 1;

if (window == top) {
  chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
    togglePresentation();
    sendResponse();
  });
}

// samepage pics: http://samepage.io/cloud/img/samepage.png
// <img width="417" height="78" itemprop="logo" alt="Samepage" class="logo" src="/cloud/img/samepage.png?v=e1a812ad96e4efeb84a705425f686b254f912d37">

document.documentElement.addEventListener("keyup", function(event) {
  if (event.altKey && (event.keyCode === 112 || event.keyCode === 80)) { // P
    togglePresentation();
    return;
  }

  if (!isPresentation) return;

  if (event.keyCode === 39 || event.keyCode === 40) { // left/down arrow
    nextSlide();
  }
  else if (event.keyCode === 37 || event.keyCode === 38) { // right/up arrow
    previousSlide();
  }
  else if (event.keyCode === 27) { // esc
    if (isPresentation) togglePresentation();
  }
}, true);

function togglePresentation() {
  var script;
	var $slideFooter = $('<img id="slideFooter" src="/cloud/img/samepage.png">');

  isPresentation = !isPresentation;
  if (isPresentation) {
    // TODO return listeners when toggle back
    injectScriptInPage('Ext.EventManager.resizeEvent.clearListeners();');
	// why to clear these listeners?
	// Otherwise it shows the page again when resized

    $pageBody = $('#column-center').clone();
	// save original body to restore it back
	$origBody = $('body > *');
	// and remove it (don't hide it, since it's difficult to unhide it correctly
	$('body > *').remove();
	
    $slideContainer = $('<div>');

    $slideContainer.css({
      width: '100%',
      height: '100%',
      paddingLeft: '15%',
      paddingRight: '15%',
	  paddingTop: '1em',
      paddingBottom: '78', // size of logo
      
      display: 'table',
	  position: 'relative',
	  fontSize: '3em'
    });
	
	
  $slideFooter.css({
      width: '417',
      height: '78',
	  position: 'fixed',
	  bottom: '1em',
	  right: '15%'
    });
  	
	$('body').append($slideContainer);
	$('body').append($slideFooter);

    slideCount = $pageBody.find('.k-component-panel').length;

    moveToSlide(slideNr);
  }
  else {
    $('#slideFooter').remove();
    if ($slideContainer) $slideContainer.remove();
	// and return back original content
	$('body').append($origBody);
	
  }
}

function nextSlide() {
  if (!isPresentation) return;
  if (slideNr < slideCount) slideNr++;
  moveToSlide(slideNr);
}

function previousSlide() {
  if (!isPresentation) return;
  if (slideNr > 1) slideNr--;
  moveToSlide(slideNr);
}

function moveToSlide(nr) {
  if (!isPresentation) return;

  var $componentPanel = $pageBody.find('.k-component-panel:nth-child(' + nr + ')');
  var $componentBody = $componentPanel.find('.k-component-body');
  var componentHeader = $componentPanel.find('.k-component-header .k-text').text();
  
  var $headerColor = $componentPanel.find('.k-component-header').css("color")
  var $slideHeader = $('<h1>').text(componentHeader);
  var $slideHeaderLine = $('<div>');
  var $slide = $componentBody.clone(true);
  
 
  $slide.css({
    display: 'table-cell',
    width: '100%',
//    textAlign: 'center',
//    verticalAlign: 'middle'
  });
  
  $slide.find('.k-html-content h1').css({
    fontSize: '4em',
    lineHeight: '1.5em'
  });
  $slide.find('.k-html-content h2').css({
    fontSize: '3em',
    lineHeight: '1.5em'
  });
  $slide.find('.k-html-content h3').css({
    fontSize: '2.5em',
    lineHeight: '1.5em'
  });
  
  $slide.find('.k-html-content p').css({
    fontSize: '2.5em',
    lineHeight: '1.5em'
  });
  
  
  $slide.find('.k-html-content ul>li').css({
    fontSize: '36px',
    lineHeight: '72px',
    marginBottom: '18px'
  });

  /*  
  $slide.find('.k-html-content ul>li').each(function() {
    var $this = $(this);
    $this.html('&bull;&nbsp;' + $this.text());
  });
  */
  
  $slide.find('.k-image-container').css({
    width: '100%'
  });

  if (!/^:/.test(componentHeader)) { // headers starting with : are ignored in presentation mode
    $slideHeaderLine.css({
		height: '8px',
		marginTop: '8px'
	});
	if ($headerColor!=="") {
		$slideHeader.css({
			color: $headerColor
		}); 
		
		$slideHeaderLine.css({
			backgroundColor: $headerColor
		});
	
	} 	else {
		$slideHeaderLine.css({
			backgroundColor: '#222' // TODO: it should be better to take it from CSS
		});
	}
	
		
	$slideHeader.append($slideHeaderLine);
    $slide.prepend($slideHeader);
  }

   
  $slideContainer.empty();
  $slideContainer.append($slide);
}

function injectScriptInPage(code) {
  script = document.createElement('script');
  script.textContent = code;
  (document.head||document.documentElement).appendChild(script);
  script.parentNode.removeChild(script);
}
