var $pageBody, $slides, $slideContainer, slideCount;
var $slideFooter = $('<img id="slideFooter" width="104" height="67">');
var $slideProgress = $('<div><div id="slideProgress"></div></div>');
var isPresentation = false;
var slideNr = 1;
var maxWidth = screen.width;
var maxHeight = screen.height;

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
	isPresentation = !isPresentation;
	try {
		chrome.runtime.sendMessage({ fullscreen: isPresentation });
	}
	catch (ignore) { /* nothing to do */ }

	if (isPresentation) {
		injectScriptInPage('var extResizeListeners = Ext.EventManager.resizeEvent.listeners.map(function(listener) { return listener }); Ext.EventManager.resizeEvent.clearListeners();');
		// why to clear these listeners? otherwise it shows the page again when resized

		$pageBody = $('#column-center').clone();
		// remove all elements from the body
		$('body > *').remove();

		$slideProgress.css({
			position: 'fixed',
			bottom: 0,
			left: 0,
			right: 0,
			height: '6px',
			backgroundColor: 'white'
		});
		$slideProgress.find('#slideProgress').css({
			position: 'absolute',
			top: 0,
			bottom: 0,
			left: 0,
			width: 0,
			'-webkit-transition': 'width 0.5s',
			backgroundColor: '#4471C1'
		});

		$slideContainer = $('<div>');

		$slideContainer.addClass('presentation');
		$slideContainer.css({
			width: '100%',
			height: '100%',
			paddingLeft: '15%',
			paddingRight: '15%',
			paddingTop: '1em',
			paddingBottom: '50px',

			display: 'table',
			position: 'relative',
			fontSize: '3em',
			background: 'white'
		});

		$slideFooter
			.attr('src', chrome.extension.getURL('images/logo.png'))
			.css({
				position: 'fixed',
				right: '15px',
				bottom: '20px'
			});

		$('body').append($slideContainer);
		$('body').append($slideProgress);
		$('body').append($slideFooter);

		$slides = [];

		// remove component previews (they contains their own k-component-panels)
		$pageBody.find('.component-preview').remove();

		// remove unsupported components (only Text and Images are supported)
		$pageBody.find('.k-component-panel').filter(function() {
			var isText = ($('.k-html-content:not(.k-mashup-content)', this).length === 1);
			var isImages = ($('.k-image-gallery', this).length === 1);
			var $slide;

			if (isText) {
				$slide = prepareTextSlide($(this));
				$slides.push($slide);
			}
			else if (isImages) {
				$('.k-image-gallery img', this).each(function() {
					$slide = prepareImageSlide($(this));
					$slides.push($slide);
				});
			}
		});

		// remove the rest of panels - we transferred them
		$pageBody.find('.k-component-panel').remove();

		slideCount = $slides.length;
		firstSlide();
	}
	else {
		$slideProgress.remove();
		$slideFooter.remove();
		if ($slideContainer) $slideContainer.remove();
		// reload page to get rid of presentation mode
		window.location.reload();
	}
}

function prepareTextSlide($componentPanel) {
	var $componentBody = $componentPanel.find('.k-component-body');
	var hasComponentHeader = ($componentPanel.find('.k-component-header').css('display') !== 'none');
	var componentHeader = $componentPanel.find('.k-component-header .k-text').text();

	var $headerColor = $componentPanel.find('.k-component-header').css("color");
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

	$slide.find('.k-html-content ul li').css({
		listStyleType: 'disc'
	});
	$slide.find('.k-html-content li li').css({
		marginLeft: '30px'
	});
	$slide.find('.k-html-content ul li ul li, .k-html-content ol li ul li').css({
		listStyleType: 'circle'
	});

	$slide.find('.k-html-content ol li').css({
		listStylePosition: 'inside'
	});
	$slide.find('.k-html-content ol li ol li, .k-html-content ul li ol li').css({
		listStyleType: 'lower-alpha',
		marginLeft: '45px'
	});

	$slide.find('.k-html-content ol').css({
		marginLeft: '0'
	});

	$slide.find('.k-html-content ol li, .k-html-content ul li').css({
		fontSize: '36px',
		lineHeight: '48px',
		marginTop: '9px',
		marginBottom: '9px'
	});

	if (hasComponentHeader) {
		$slideHeaderLine.css({
			height: '8px',
			marginTop: '8px'
		});
		$slideHeader.css({
			marginBottom: '30px'
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

	return $slide;
}

function prepareImageSlide($image) {
	var $slide = $('<div>');
	var image = new Image();
	var src = $image.attr('src');

	src = src.replace(/(width)=\d+(&?)/, '$1=' + maxWidth + '$2');
	src = src.replace(/(height)=\d+(&?)/, '$1=' + maxHeight + '$2');
	// preload image
	image.setAttribute('src', src);
	image.addEventListener('load', function() {
		if (image.width < maxWidth && image.height < maxHeight) {
			$slide.css({ backgroundSize: 'auto' });
		}
	});

	$slide.css({
		position: 'absolute',
		top: 0, left: 0,
		right: 0, bottom: 0,
		backgroundImage: 'url(' + src + ')',
		backgroundPosition: 'center center',
		backgroundSize: 'contain',
		backgroundRepeat: 'no-repeat'
	});

	return $slide;
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
	var $slide = $slides[nr - 1];
	var $textInside, scaleCoef, rect;

	$slideContainer.empty();
	$slideContainer.append($slide);

	$slideProgress.find('#slideProgress').css({
		width: Math.ceil(((nr - 1) / (slideCount - 1)) * 100) + '%'
	});

	$textInside = $slide.find('.k-html-content');
	if ($textInside.length > 0) {
		rect = $textInside[0].getBoundingClientRect();

		if ((rect.height + rect.top) > (maxHeight - 50)) {
			scaleCoef = ((maxHeight - rect.top - 50) / rect.height);
		}

		$textInside.css({
			'-webkit-transform': 'scale(' + scaleCoef + ', ' + scaleCoef + ')',
			'-webkit-transform-origin': '0 0'
		});
	}
}

function injectScriptInPage(code) {
	var script = document.createElement('script');
	script.textContent = code;
	(document.head || document.documentElement).appendChild(script);
	script.parentNode.removeChild(script);
}

var addCssRule = (function(style){
	var sheet = document.head.appendChild(style).sheet;

	return function(selector, css){
		var propText = Object.keys(css).map(function(property){
			return property + ':' + css[property]
		}).join(';');
		sheet.insertRule(selector + '{' + propText + '}', sheet.cssRules.length);
	}
})(document.createElement('style'));
// clean-up of list items
addCssRule('.presentation .k-html-content ul>li:before', { background: 'none' });
