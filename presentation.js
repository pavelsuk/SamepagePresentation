var $pageBody, $slideContainer, slideCount
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
	var $slideFooter = $('<img src="/cloud/img/samepage.png">');

  isPresentation = !isPresentation;
  if (isPresentation) {
    // TODO return listeners when toggle back
    injectScriptInPage('Ext.EventManager.resizeEvent.clearListeners();');

    $pageBody = $('#column-center').clone();
    $('body > *').hide();

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
    if ($slideContainer) $slideContainer.remove();
    $('body > *').show();
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
    $slideHeader.css({
      color: 'rgb(100,165,0)',
    });
	$slideHeaderLine.css({
		backgroundColor: 'rgb(100,165,0)',
		height: '8px',
		marginTop: '8px'
	});
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
