/*!
 * RWD Images v0.4.5
 *
 * A lightweight, customisable responsive image solution, which uses a familar media query syntax
 *
 * Copyright (c) 2014 Matt Stow
 *
 * http://mattstow.com
 *
 * Licensed under the MIT license
*/
;(function(window, document) {
	var $rwdImages,
		rwdImagesLength;
	
	// So much faster http://jsperf.com/byclassname-vs-queryselectorall
	if (document.getElementsByClassName)
		$rwdImages = document.getElementsByClassName('rwdimage');
	else if (document.querySelectorAll)
		$rwdImages = document.querySelectorAll('.rwdimage');
	else
		return;
	
	rwdImagesLength = $rwdImages.length;
	
	if (rwdImagesLength === 0)
		return;
	
	var $this,
		selector,
		dataCore,
		dataCoreLength,
		dataCoreCurrent,
		dataLazyLoad,
		dataRetina,
		dataRetinaSuffix,
		dataEm,
		dataEmBase,
		dataFallback,
		dataFallbackClass,
		isFallback,
		css = '',
		cssTemp,
		width,
		height,
		ratio,
		images = [],
		html,
		i = 0,
		x = 0,
		hasEnquire = !!window.enquire,
		style;
	
	var cssReplace = function(str) {
		// Remove any leading whitespace, change src: to background-image and calculate ratio percentages
		return str
				.replace(/(^\s*)/, '')
				.replace(/src:\s*/gi, 'background-image: ')
				.replace(/ratio\((\d+)\/(\d+)\)/gi, function(str, p1, p2) {
				return ((parseInt(p1, 10) / parseInt(p2, 10)) * 100) + '%';
				});
	};

	for (i; i < rwdImagesLength; i++) {
		$this = $rwdImages[i];
		
		// Give it a data-rwdimage-id to be used as a CSS selector
		$this.setAttribute('data-rwdimage-id', i);
		selector = '[data-rwdimage-id="' + i + '"] ';
		
		// Get all of the "core" CSS rules applied
		dataCore = $this.getAttribute('data-rwdimage').split(',');
		dataCoreLength = dataCore.length;
		
		images[i] = {};
		images[i]['breakpoints'] = new Array(dataCoreLength);
		
		// If the elem is an image
		if ($this.tagName.toLowerCase() === 'img') {
			// and it doesn't have a src, set it to as base64 blank gif for completeness
			if (!$this.src)
				$this.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEHAAAALAAAAAABAAEAAAICRAEAOw==';
			
			if (hasEnquire)
				$this.setAttribute('data-rwdimage-has-enquire', true);
			
			images[i]['isImage'] = true;
		}
		
		images[i]['elem'] = document.querySelector(selector);
		
		dataEm = $this.getAttribute('data-rwdimage-em') === 'true' ? true : false;
		dataEmBase = $this.getAttribute('data-rwdimage-em-base') ? parseInt($this.getAttribute('data-rwdimage-em-base'), 10) : 16;
		
		cssTemp = '';
		
		for (var j = 0; j < dataCoreLength; j++) {
			dataCoreCurrent = cssReplace(dataCore[j]);
			
			images[i]['breakpoints'][j] = {};
			
			// If it contains a min or max media query...
			if (dataCoreCurrent.match(/^\(\s*?(min|max)/)) {
				// Create a full media query selector
				
				// If specified, convert pixel media queries to ems
				if (dataEm) {
					dataCoreCurrent = dataCoreCurrent.replace(/m(?:in|ax)-(?:width|height):\s*(\d+)px/gi, function(str, p1) {
						return str.replace(p1, parseInt(p1, 10) / dataEmBase).replace('px', 'em');
					});
				}
				
				// Write the new, complete selector
				cssTemp += '@media ' +
						dataCoreCurrent
						.match(/.*?\{/)[0] +
						selector +
						dataCoreCurrent.replace(/(\((min|max).*?\)|\s+and\s+)/g, '') +
						' }\n';
				
				// Store all of the breakpoints in an array
				images[i]['breakpoints'][j]['mediaquery'] = dataCoreCurrent.match(/(.*?)(\{)/)[1];
			}
			// Otherwise output a plain selector
			else {
				cssTemp += selector + dataCoreCurrent + '\n';
				images[i]['breakpoints'][j]['mediaquery'] = '';
			}
		}
		
		dataRetina = $this.getAttribute('data-rwdimage-retina') === 'true' ? true : false;
		dataRetinaSuffix = $this.getAttribute('data-rwdimage-retina-suffix') ? $this.getAttribute('data-rwdimage-retina-suffix') : '@2x';
		
		// If we're duplicating for "retina"
		if (dataRetina) {
			cssTemp = cssTemp
					// Find any media queries, duplicate and append the relevant high DPI media query to it
					.replace(/(^@media\s*?)(\(.*?)\{(.*?\[.*?)(\..*?\))(.*)/gm, '$1$2$3$4$5\n$1$2 and (min--moz-device-pixel-ratio: 1.3), $2 and (-o-min-device-pixel-ratio: 2.6/2), $2 and (-webkit-min-device-pixel-ratio: 1.3), $2 and (min-device-pixel-ratio: 1.3), $2 and (min-resolution: 1.3dppx) \{$3' + dataRetinaSuffix + '$4$5')
					// If it doesn't have an existing media query, wrap it in a high DPI one
					.replace(/(^\[.*?)(\..*?\))(.*)/gm, '$1$2$3\n@media (min--moz-device-pixel-ratio: 1.3), (-o-min-device-pixel-ratio: 2.6/2), (-webkit-min-device-pixel-ratio: 1.3), (min-device-pixel-ratio: 1.3), (min-resolution: 1.3dppx) { $1' + dataRetinaSuffix + '$2$3 }');
		}
		
		dataFallback = $this.getAttribute('data-rwdimage-fallback');
		
		// If we're having a fallback for .ltie9 or .no-mq
		if (dataFallback) {
			dataFallbackClass = $this.getAttribute('data-rwdimage-fallback-class') ? $this.getAttribute('data-rwdimage-fallback-class') : 'ltie9';
			
			// Output the relevant selector
			cssTemp +=  '.' + dataFallbackClass +
						' ' +
						selector +
						cssReplace(dataFallback) +
						'\n';
			
			// Check once only to see if HTML has the fallback class
			if (!isFallback) {
				isFallback = document.documentElement.className.match(dataFallbackClass);
			}
		}
		
		// If we're lazy-loading the images, add .lazy-loaded to the selector
		if ($this.getAttribute('data-rwdimage-lazy-load') === 'true')
			cssTemp = cssTemp.replace(/(\[data-rwdimage-id="\d+"\])/g, '.lazy-loaded$1');
		 
		css += cssTemp;
	}
	
	// Output the default styles and all of the generated rules
	css = 	'.rwdimage { background-repeat: no-repeat; background-size: contain; height: 0; width: 100%; }\n' +
			css +
			'.rwdimage[data-rwdimage-has-enquire="true"] { height: auto; padding-bottom: 0; width: auto; }\n';
	
	style = document.createElement('style');
	style.type = 'text/css';
	
	// For LT IE 9
	if (style.styleSheet)
		style.styleSheet.cssText = css;
	else
		style.appendChild(document.createTextNode(css));
	
	document.getElementsByTagName('head')[0].appendChild(style);
	
	// Change the img src to its computed background-image src. If lazy-loading, fire this externally as DOMAttrModified is too aggressive
	window.rwdImageChangeSrc = function(image) {
		if (!image || image.tagName.toLowerCase() !== 'img')
			return;
		
		var newsrc = !!window.getComputedStyle ? window.getComputedStyle(image).getPropertyValue('background-image') : image.currentStyle.backgroundImage;
		
		newsrc = newsrc.replace(/url\((?:"|')?(.*?)(?:"|')?\)/, '$1');
		
		// Change the img src to its computed background-image src
		if (newsrc !== 'none' && image.src !== newsrc)
			image.src = newsrc;
	};
	
	// Register with enquire.js on each of the images' media queries to change their src
	var registerWithEnquire = function(x, y) {
		if (!images[x]['breakpoints'][y]['mediaquery'])
			return;
		
		enquire.register(images[x]['breakpoints'][y]['mediaquery'], function () {
			rwdImageChangeSrc(images[x]['elem']);
		});
	};
	
	// Loop through any images and set their src using the 2 functions above.
	for (x; x < images.length; x++) {
		if (images[x]['isImage']) {
			if (!isFallback && hasEnquire) {
				for (var y = 0; y < images[x]['breakpoints'].length; y++) {
					registerWithEnquire(x, y);
				}
			}
			else {
				rwdImageChangeSrc(images[x]['elem']);
			}
		}
	}
})(window, document);