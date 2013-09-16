var $pageBody, $slideContainer, slideCount, $origBody, previousUrl;
var isPresentation = false;
var slideNr = 1;

if (window == top) {
	chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
		togglePresentation();
		sendResponse();
	});
}

document.documentElement.addEventListener("keydown", function(event) {
	if (event.altKey && (event.keyCode === 112 || event.keyCode === 80)) { // P
		togglePresentation();
		event.preventDefault();
		return;
	}

	if (!isPresentation) return;

	if (event.metaKey) {
		if (event.keyCode === 39 || event.keyCode === 40) { // end
			lastSlide();
			event.preventDefault();
		}
		else if (event.keyCode === 37 || event.keyCode === 38) { // home
			firstSlide();
			event.preventDefault();
		}
	}
	else {
		if (event.keyCode === 39 || event.keyCode === 40 || event.keyCode === 32) { // right/down arrow or space
			nextSlide();
			event.preventDefault();
		}
		else if (event.keyCode === 37 || event.keyCode === 38) { // left/up arrow
			previousSlide();
			event.preventDefault();
		}
		else if (event.keyCode === 35) { // end
			lastSlide();
			event.preventDefault();
		}
		else if (event.keyCode === 36) { // home
			firstSlide();
			event.preventDefault();
		}
		else if (event.keyCode === 27) { // esc
			togglePresentation();
			event.preventDefault();
		}
	}
}, true);

function togglePresentation() {
	var $slideFooter = $('<img id="slideFooter">');
	var currentUrl = window.location.href;

	isPresentation = !isPresentation;
	if (isPresentation) {
		injectScriptInPage('var extResizeListeners = Ext.EventManager.resizeEvent.listeners.map(function(listener) { return listener }); Ext.EventManager.resizeEvent.clearListeners();');
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
			paddingBottom: '82px', // height of logo

			display: 'table',
			position: 'relative',
			fontSize: '3em',
			background: 'white'
		});

		$slideFooter.attr('src', chrome.extension.getURL('images/logo.png'));
		$slideFooter.css({
			width: '417px',
			height: '82px',
			position: 'fixed',
			bottom: '1em',
			right: '15%'
		});

		$('body').append($slideContainer);
		$('body').append($slideFooter);

		$pageBody.find('.component-preview').remove(); // remove component previews (they contains their own k-component-panels)
		slideCount = $pageBody.find('.k-component-panel').length;

		debugger;
		if (previousUrl !== currentUrl) {
			slideNr = 1;
		}

		moveToSlide(slideNr);
		previousUrl = currentUrl;
	}
	else {
		$('#slideFooter').remove();
		if ($slideContainer) $slideContainer.remove();
		// and return back original content
		$('body').append($origBody);
		injectScriptInPage('if (extResizeListeners) { extResizeListeners.forEach(function(listener) { Ext.EventManager.resizeEvent.addListener(listener.fn, listener.scope) }); extResizeListeners = null }');
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

function firstSlide() {
	if (!isPresentation) return;
	slideNr = 1;
	moveToSlide(slideNr);
}

function lastSlide() {
	if (!isPresentation) return;
	slideNr = slideCount;
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
		width: '100%'
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

	$slide.find('.k-image-container').css({
		width: '100%'
	});

	if (!/^:/.test(componentHeader)) { // headers starting with : are ignored in presentation mode
		$slideHeaderLine.css({
			height: '8px',
			marginTop: '8px'
		});

		if ($headerColor !== "") {
			$slideHeader.css({
				color: $headerColor
			});

			$slideHeaderLine.css({
				backgroundColor: $headerColor
			});
		}
		else {
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
	var script = document.createElement('script');
	script.textContent = code;
	(document.head || document.documentElement).appendChild(script);
	script.parentNode.removeChild(script);
}
