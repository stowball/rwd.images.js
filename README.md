# rwd.images.js

## Yet another lightweight, customisable responsive image solution

I know what you're thinking. Aren't there enough responsive image solutions by now? Until `<picture>` is standard and we can use it everywhere, I'm going to say "no".

### Why is this one any different?

I like to think that it's a best-of-all-worlds solution, which addresses the requirements that Mat Marquis lists in his article [So, You're Writing A Responsive Images Script](http://filamentgroup.com/lab/respimg_scripts/):

* Only makes 1 request for the image's current situation.
* Easily allows a `<noscript>` fallback for users without JavaScript. If JavaScript breaks then so does the script, but that goes for all non-native solutions.
* It supports "art direction", ie. the ability to load "sources that make use of different cropping, zooming, and focal points".
* It actually works in the real-world. I've been using early prototypes of the plugin internally at [XO Digital](http://xodigital.com.au), and have just included this in our latest soon-to-be-released project for a well-recognised brand.

In addition to the above, rwd.images.js:

* Uses a familar CSS/media query syntax for determining the appropriate image src.
* Can automatically convert pixel-based media queries to ems.
* Supports high-DPI/retina versions when a consistent naming convention is used.
* Supports fallback images for browsers that don't support media queries.
* Supports lazy-loading of images.
* Is not restricted to just `<img>` tags. It can be applied to any element (`<div>`s etc) for use as backgrounds.
* Works using either a mobile-first or a desktop-down philosophy.
* Has no dependencies, but can piggy-back off [enquire.js](http://wicky.nillia.ms/enquire.js/) to allow users to "right-click" and share.
* Is only ~1.7 KB minified and gzipped.

### OK. Show me how it works

rwd.images.js uses the `.rwdimage` class, a series of `[data-rwdimage]` attributes and "CSS" to set up a responsive image, like so:

```html
<img class="rwdimage" data-rwdimage="
	{ src: url(/images/4-by-3.jpg); padding-bottom: ratio(3/4); },
	(min-width: 501px) { src: url(/images/16-by-9.jpg); padding-bottom: ratio(9/16); }
" />

<script src="/js/rwd.images.min.js"></script>
</body>
```

#### So what's this doing?

1. `.rwdimage` instructs the script that this image needs to be "made responsive".
2. `[data-rwdimage]` is passed a comma-separated list of CSS-like rules without a selector:
	1. `src` is the path to the image that should be set for that breakpoint (or by default if no media query is used)
	2. `padding-bottom: ratio(y,x)` gets evaluated and converted in to an [intrinsic percentage ratio](http://alistapart.com/article/creating-intrinsic-ratios-for-video/). You can pass in the actual dimensions of the image, or break it down to its smallest fraction like I have here.

So, the `<img>`:

* Will display `4-by-3.jpg` by default; and
* At 501px, will be switched to display `16-by-9.jpg`.

### Taking it further

Now let's use some more of the options available in rwd.images.js:

```html
<img class="rwdimage" data-rwdimage="
	{ src: url(/images/4-by-3.jpg); padding-bottom: ratio(3/4); },
	(min-width: 501px) { src: url(/images/16-by-9.jpg); padding-bottom: ratio(9/16); }
" data-rwdimage-fallback="
	{ src: url(/images/16-by-9.jpg); padding-bottom: ratio(9/16); }
" data-rwdimage-em="true" data-rwdimage-retina="true" />
```

The `<img>`:

* Will display `4-by-3.jpg` by default
	* But `4-by-3@2x.jpg` for high-DPI/retina devices
* At 31.3125em (501 ÷ 16) will display `16-by-9.jpg`
	* But `16-by-9@2x.jpg` for high-DPI devices
* Will also display `16-by-9.jpg` for the oldIE fallback (`.ltie9`)

So here we can see how em-based media queries, retina images and old IE can easily be supported using rwd.images.js with minimal effort.

### Further still

Using the remaining `[data-rwdimage-*]` attributes, we can achieve even more:

* `[data-rwdimage-em-base]`: To change the base font size for the calculation of media queries from 16px. Some developers like to set `html { font-size: 62.5%; }` so set `-em-base` to 10.
* `[data-rwdimage-fallback-class]`: The class (generally on `html`) used to target the fallback browser. The default is `ltie9`, but you may like to set it to `lt-ie9` or `no-mq` if using Modernizr to detect media query support.
* `[data-rwdimage-retina-suffix]`: The suffix used for high-DPI/retina image filenames. The default is `@2x`. Filenames must follow the convention: [filename][suffix][extension].
* `[data-rwdimage-lazy-load]`: Set to `true`to only load the `<img>`'s relevant src when it has a class of `lazy-loaded` applied.

Since rwd.images.js solves the responsive image problem with a `background-image` "workaround", by loading [@WickyNilliams'](https://twitter.com/WickyNilliams) [enquire.js](http://wicky.nillia.ms/enquire.js/) before rwd.images.js, the `<img src>` will also be set to the correct filename so users can share or download it.

Note: If using enquire.js and `[data-rwdimage-lazy-load="true"]`to lazy-load images, you must also call `window.rwdImageChangeSrc(img)` when applying the `.lazy-loaded` class.

Something like:

```html
<script src="/js/enquire.min.js"></script>
<script src="/js/rwd.images.min.js"></script>
<script>
(function() {
	// Get all images
	var $images = document.getElementsByClassName('rwdimage');
	
	var lazyLoad = function($image) {
		$image.className += ' lazy-loaded';
		window.rwdImageChangeSrc($image);
	};
	
	// Lazy-load them all (don't use this in production!)
	for (var i = 0; i < $images.length; i++) {
		lazyLoad($images[i]);
	}
})();
</script>
```

#### Things to note

There may be times where your image is outside of a container that constrains its size. This will lead to the image continuing to scale past its original size.

To prevent this, set a relevant breakpoint to reset the image's dimensions, and also apply it to the fallback if appropriate:

```html
<img class="rwdimage" data-rwdimage="
	{ src: url(/images/4-by-3.jpg); padding-bottom: ratio(3/4); },
	(min-width: 501px) { src: url(/images/16-by-9.jpg); padding-bottom: ratio(9/16); }
	(min-width: 1000px) { height: 562px; padding-bottom: 0; width: auto; }
" data-rwdimage-fallback="
	{ src: url(/images/16-by-9.jpg); height: 562px; padding-bottom: 0; width: auto; }
" />
```

---

Copyright (c) 2014 Matt Stow  
Licensed under the MIT license (see LICENSE for details)  
Minified version created with Online YUI Compressor: http://www.refresh-sf.com/yui/