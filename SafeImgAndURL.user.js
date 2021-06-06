// ==UserScript==
// @name        [A801] Image and URL data
// @namespace   @Bolodefchoco
// @version     0.1
// @description Displays image hrefs and URL hrefs.
// @author      @Bolodefchoco
// @include     https://atelier801.com/*
// ==/UserScript==

let cache = [ ];

(function()
{
	"use restrict";

	for (let image of document.getElementsByTagName("img"))
		image.title = image.src;

	let displayURLs = false;
	$("html").keydown(function(e) {
		if (!e.altKey) return;

		displayURLs = !displayURLs;

		let id = 0;
		for (let a of document.getElementsByTagName("a"))
			if (a.rel === "noopener")
				if (displayURLs)
				{
					if (!a.internalID)
					{
						a.internalID = ++id;
						cache[a.internalID] = a.innerHTML;
					}

					a.innerHTML = a.href;
				}
				else
					a.innerHTML = cache[a.internalID];

		return false;
	});
})();
