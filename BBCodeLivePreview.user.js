// ==UserScript==
// @name        [A801] BBCode Live Preview
// @namespace   @Bolodefchoco
// @version     0.1
// @description Live bbcode edition.
// @author      @Bolodefchoco
// @include     https://atelier801.com/*
// ==/UserScript==

if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[number] != 'undefined'
				? args[number]
				: match
			;
		});
	};
}

let bbcodeRelation = {
	"simple": [
		[ "b", /\[b\]/g, `<span style="font-weight:bold;">` ],
		[ "i", /\[i\]/g, `<span style="font-style:italic;">` ],
		[ "u", /\[u\]/g, `<span style="text-decoration:underline;">` ],
		[ "s", /\[s\]/g, `<span style="text-decoration:line-through;">` ],
		[ "color", /\[color=#([A-F0-9]+?)\]/g, `<span style="color:#$1;">` ],
		[ "size", /\[size=(\d+?)\]/g, `<span style="font-size:$1px;">` ],
		[ "font", /\[font=(.+?)]/g, `<span style="font-family:$1;">` ],
		[ "b/i/u/s/color/size/font", /\[\/(?:b|i|u|s|color|size|font)\]/g, `</span>` ],

		[ "p", /\[p=(\S+?)\]/g, `<p style="text-align:$1;">` ],
		[ "p", /\[\/p\]\n?/g, `</p>` ],

		[ "hr", /\[hr\]\n?/g, `<hr>` ],

		[ "list", /\[(\/)?list\]\n?/g, `<$1ul>` ],
		[ "*", /\[(\/)?\*\]\n?/g, `<$1li>` ],

		[ "quote", /\[quote(?:=(.*?))?\]\n?/g, `<blockquote class="cadre cadre-quote"><small>$1 said:</small><div>` ],
		[ "quote", /\[\/quote\]\n?/g, `</div></blockquote>` ],

		[ "row", /\[(\/)?row\]\n?/g, `<$1tr>` ],
		[ "cel", /\[\/cel\]\n?/g, `</td>` ],
		[ "table", /\[\/table\]\n?/g, `</tbody></table>` ],

		[ "img", /\[img(?: align=(.+?))?\]([\s\S]+?)\[\/img\]/g, `<img src="$2" alt="$2" class="inline-block img-ext" style="float:$1;">` ],

		[ "video", /\[video\](https:\/\/www\.youtube.com\/embed\/.+?)\[\/video\]/g, `<iframe class="vid-ext" src="$1?autohide=1&amp;controls=2" allowfullscreen=""></iframe>` ],
		[ "video", /\[video\](https:\/\/(?:www\.dailymotion\.com\/embed|player\.vimeo\.com)\/video\/.+?)\[\/video\]/g, `<object class="vid-ext" type="text/html" data="$1"></object>` ],

		[ "url", /\[url=(.+?)\]([\s\S]+?)\[\/url\]/g , `<a href="$1" target="_blank" rel="noopener" onclick="return verifierLienMemePageMessage(event);">$2</a>` ],
		[ "url", /\[url\](.+?)\[\/url\]/g , `<a href="$1" target="_blank" rel="noopener" onclick="return verifierLienMemePageMessage(event);">$1</a>` ],

		[ "spoiler", /\[\/spoiler\]\n?/g, `</div></div>` ],

		[ "\n", /\n/g, `<br>` ]
	],
	"complex": [
		[ "spoiler", /\[spoiler(?:=([\s\S]+?))?\]/g, `<div class="cadre cadre-spoil"><button id="bouton_spoil_{2}" class="btn btn-small btn-message active" onclick="afficherSpoiler('{2}');return false;">Spoiler</button>{0}<div id="div_spoil_{2}" class="">`, `<span class="titre-spoiler" id="titre_spoil_{2}">{0}</span>` ],

		[ "code", /\[code(?:=([\s\S]+?))?\]([\s\S]*?)\[\/code\]/g, `<div class="cadre cadre-code">{0}<div class="contenu-cadre-code"><div class="colonne-numeros-lignes-code empeche-selection-texte" unselectable="on">1</div><pre class="colonne-lignes-code">{1}</pre></div></div>`, `<div class="indication-langage-code">{0} Code</div><hr>` ],

		[ "table", /\[table(?: (.+?))?\]/g, `<table {0}><tbody>`, `class="aligne-a{0}"` ],
		[ "cel", /()\[cel\]/g, `<td {0}>`, `style="border:1px solid {0};"` ],
	],
	"tab": {
		"exists": /\[#.+?]/,
		"regex": /\[#(.+?)\]([\s\S]+?)\[\/#\1\]/g,
		"tab": `<li id="li_tab{0}" class="{2}"><a href="#tab{0}" id="lien_tab{0}" data-toggle="tab">{1}</a></li>`,
		"content": `<div id="tab{0}" class="tab-pane {2}"><div class="ltr">{1}</div></div>`
	}
};

let tagCheckForOptionalParameter = {
	"spoiler": true,
	"code": true,
	"table": true,
	"cel": true
};

let alignInFrench = {
	"center": "u-centre",
	"right": "-droite",
	"left": "u-gauche"
}

let tabBody = `<ul class="nav nav-tabs" id="tabs{0}">{1}</ul><div class="tab-content">{2}</div>`;
let tabs = { };

let tableColor = { };

let tabId = 0;
let spoilerId = 0;

function checkTabs(bbcode, elementId)
{
	if (!bbcodeRelation.tab.exists.test(bbcode))
		return bbcode;

	if (!tabs[elementId])
	{
		tabId += 100;
		tabs[elementId] = {
			"id": tabId,
			"tabId": tabId,
			"tabs": { },
			"activeId": null
		};
	}

	let dataTabs = [ ], dataContent = [ ];

	let tabObj = tabs[elementId];

	for (let tab in tabObj.tabs)
	{
		tab = tabObj.tabs[tab];

		let ref = document.getElementById(`li_tab${tab}`); // wow super reference, thanks JS
		if (ref && ref.classList.contains("active"))
		{
			tabObj.activeId = tab;
			break;
		}
	}

	let tab = bbcodeRelation.tab;
	bbcode.replaceAll(tab.regex, function(_, arg1, arg2)
		{
			if (!tabObj.tabs[arg1])
				tabObj.tabs[arg1] = ++tabObj.tabId;
			let subTabObj = tabObj.tabs[arg1];

			let isActive = subTabObj == tabObj.activeId ? "active" : "";

			dataTabs.push(tab.tab.format(subTabObj, arg1, isActive));
			dataContent.push(tab.content.format(subTabObj, arg2, isActive));
		});

	bbcode = tabBody.format(tabObj.id, dataTabs.join(''), dataContent.join(''));

	return bbcode;
}

function getPreview(bbcode, elementId)
{
	bbcode = bbcode.replaceAll('<', "&lt;");

	for (let r of bbcodeRelation.simple)
		bbcode = bbcode.replaceAll(r[1], r[2]);

	for (let r of bbcodeRelation.complex)
	{
		let arg3;
		bbcode = bbcode.replaceAll(r[1], function(_, arg1, arg2)
			{
				if (arg1 === undefined)
					arg1 = ''

				if (r[0] == "spoiler")
					arg3 = ++spoilerId % 10000;

				let processArg1 = true;
				if (tagCheckForOptionalParameter[r[0]])
				{
					if (r[0] == "cel")
						arg1 = tableColor[elementId];

					if (arg1 != '')
					{
						if (r[0] == "table")
						{
							let tableArgs = arg1.split(/\s+/);
							for (let a = 0; a < tableArgs.length; a++)
							{
								let tmp = tableArgs[a].split('=');
								tableArgs[tmp[0]] = tmp[1];
							}

							tableColor[elementId] = tableArgs.border;

							if (!tableArgs.align)
								processArg1 = false;
							else
								arg1 = alignInFrench[tableArgs.align] ?? '';
						}

						if (processArg1)
							arg1 = r[3].format(arg1);
					}
				}

				return r[2].format(arg1, arg2, arg3);
			});
	}

	return checkTabs(bbcode, elementId);
}

function setAction(element)
{
	element.nextElementSibling.innerHTML = `<div class="cadre cadre-message cadre-previsualisation"></div>`;
	let previsualisation = element.nextElementSibling.firstElementChild;

	function action(e)
	{
		e = e.srcElement;
		previsualisation.innerHTML = getPreview(e.value, e.id);
	}

	element.addEventListener("change", action);
	element.addEventListener("keyup", action);
}

function selectElement(elementId)
{
	let element = document.getElementById(elementId);
	if (!element) return;

	setAction(element);
}

function selectElementWithQuery(elementQuery)
{
	let elements = document.querySelectorAll(elementQuery);
	if (!elements) return;

	for (let c = 0; c < elements.length; c++)
		setAction(elements[c]);
}

(function()
{
    'use restrict';

	selectElement("message_reponse");
	selectElement("message_conversation");
	selectElement("message_sujet");

	selectElementWithQuery("textarea[id^=\"edit_message_\"");
})();
