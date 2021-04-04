// ==UserScript==
// @name        [A801] BBCode Live Preview
// @namespace   @Bolodefchoco
// @version     0.2
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

		[ "code", /\[code(?:=([\s\S]+?))?\]([\s\S]*?)\[\/code\]/g, `<div class="cadre cadre-code">{0}<div class="contenu-cadre-code"><div class="colonne-numeros-lignes-code empeche-selection-texte" unselectable="on">{2}</div><pre class="colonne-lignes-code">{1}</pre></div></div>`, `<div class="indication-langage-code">{0} Code</div><hr>` ],

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

let communityFlags = {
	"ad":true,"ae":true,"af":true,"ag":true,"ai":true,"al":true,"am":true,"an":true,"ao":true,
	"ar":true,"as":true,"at":true,"au":true,"aw":true,"ax":true,"az":true,"ba":true,"bb":true,
	"bd":true,"be":true,"bf":true,"bg":true,"bh":true,"bi":true,"bj":true,"bm":true,"bn":true,
	"bo":true,"br":true,"bs":true,"bt":true,"bv":true,"bw":true,"by":true,"bz":true,"ca":true,
	"cc":true,"cd":true,"cf":true,"cg":true,"ch":true,"ci":true,"ck":true,"cl":true,"cm":true,
	"cn":true,"co":true,"cr":true,"cs":true,"cu":true,"cv":true,"cx":true,"cy":true,"cz":true,
	"de":true,"dj":true,"dk":true,"dm":true,"do":true,"dz":true,"ec":true,"ee":true,"eg":true,
	"eh":true,"er":true,"es":true,"et":true,"fi":true,"fj":true,"fk":true,"fm":true,"fo":true,
	"fr":true,"ga":true,"gb":true,"gd":true,"ge":true,"gf":true,"gh":true,"gi":true,"gl":true,
	"gm":true,"gn":true,"gp":true,"gq":true,"gr":true,"gs":true,"gt":true,"gu":true,"gw":true,
	"gy":true,"hk":true,"hm":true,"hn":true,"hr":true,"ht":true,"hu":true,"id":true,"ie":true,
	"il":true,"in":true,"io":true,"iq":true,"ir":true,"is":true,"it":true,"jm":true,"jo":true,
	"jp":true,"ke":true,"kg":true,"kh":true,"ki":true,"km":true,"kn":true,"kp":true,"kr":true,
	"kw":true,"ky":true,"kz":true,"la":true,"lb":true,"lc":true,"li":true,"lk":true,"lr":true,
	"ls":true,"lt":true,"lu":true,"lv":true,"ly":true,"ma":true,"mc":true,"md":true,"me":true,
	"mg":true,"mh":true,"mk":true,"ml":true,"mm":true,"mn":true,"mo":true,"mp":true,"mq":true,
	"mr":true,"ms":true,"mt":true,"mu":true,"mv":true,"mw":true,"mx":true,"my":true,"mz":true,
	"na":true,"nc":true,"ne":true,"nf":true,"ng":true,"ni":true,"nl":true,"no":true,"np":true,
	"nr":true,"nu":true,"nz":true,"om":true,"pa":true,"pe":true,"pf":true,"pg":true,"ph":true,
	"pk":true,"pl":true,"pm":true,"pn":true,"pr":true,"ps":true,"pt":true,"pw":true,"py":true,
	"qa":true,"re":true,"ro":true,"rs":true,"ru":true,"rw":true,"sa":true,"sb":true,"sc":true,
	"sd":true,"se":true,"sg":true,"sh":true,"si":true,"sj":true,"sk":true,"sl":true,"sm":true,
	"sn":true,"so":true,"sr":true,"st":true,"sv":true,"sy":true,"sz":true,"tc":true,"td":true,
	"tf":true,"tg":true,"th":true,"tj":true,"tk":true,"tl":true,"tm":true,"tn":true,"to":true,
	"tr":true,"tt":true,"tv":true,"tw":true,"tz":true,"ua":true,"ug":true,"um":true,"us":true,
	"uy":true,"uz":true,"va":true,"vc":true,"ve":true,"vg":true,"vi":true,"vk":true,"vn":true,
	"vu":true,"wf":true,"ws":true,"xx":true,"ye":true,"yt":true,"za":true,"zm":true,"zw":true
}
let communityFlag = `<img src="img/pays/{0}.png" class="img16">`;

let luaKeywords = [
	/\b(and)\b/g,   /\b(break)\b/g, /\b(do)\b/g,       /\b(else)\b/g,   /\b(elseif)\b/g, /\b(end)\b/g,
	/\b(false)\b/g, /\b(for)\b/g,   /\b(function)\b/g, /\b(if)\b/g,     /\b(in)\b/g,     /\b(local)\b/g,
	/\b(nil)\b/g,   /\b(not)\b/g,   /\b(or)\b/g,       /\b(repeat)\b/g, /\b(return)\b/g,
	/\b(then)\b/g,  /\b(true)\b/g,  /\b(until)\b/g,    /\b(while)\b/g
]
let luaStrings = /(([\"'])[\s\S]*?\2|(?:^|[^-])\[(=*)\[[\s\S]*?\]\3\])/g;
let luaComments = /(--\[(=*)\[[\s\S]*?\]\2\]|--.*?(?:<br>|$))/g;

let luaKeyword = `<span class="mot-cle-lua-code">$1</span>`;
let luaString = `<span class="chaine-caracteres-lua-code">{0}</span>`;
let luaComment = `<span class="commentaire-lua-code">{0}</span>`;

function formatLuaCode(code)
{
	// Hide
	let strings = [ ], string = 0;
	code = code.replaceAll(luaStrings, function(_, arg1)
		{
			strings[++string] = luaString.format(arg1);
			return `\0STRING_${string}\0`
		});

	let comments = [ ], comment = 0;
	code = code.replaceAll(luaComments, function(_, arg1)
		{
			comments[++comment] = luaComment.format(arg1);
			return `\0COMMENT_${comment}\0`
		});

	// Format
	for (let keyword = 0; keyword < luaKeywords.length; keyword++)
		code = code.replaceAll(luaKeywords[keyword], luaKeyword);

	for (;string > 0; --string)
		code = code.replaceAll(`\0STRING_${string}\0`, strings[string]);

	for (;comment > 0; --comment)
		code = code.replaceAll(`\0COMMENT_${comment}\0`, comments[comment]);

	return code;
}

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

			if (communityFlags[arg1])
				arg1 = communityFlag.format(arg1);

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
				else if (r[0] == "code")
				{
					arg3 = Array((arg2.match(/<br>/g)||[]).length + 1)
						.fill()
						.map((_, idx) => idx + 1)
						.join("<br>");
				}

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
						else if (r[0] == "code" && arg1.toLowerCase() == "lua")
							arg2 = formatLuaCode(arg2);

						if (processArg1)
							arg1 = r[3].format(arg1);
					}
				}

				return r[2].format(arg1, arg2, arg3);
			});
	}

	return checkTabs(bbcode, elementId);
}

function setAction(element, id)
{
    let siblingElement;
    if (id)
        siblingElement = document.getElementById("previsualisation_" + id);
    else
        siblingElement = element.nextElementSibling;
    siblingElement.innerHTML = `<div class="cadre cadre-message cadre-previsualisation"></div>`;
	let previsualisation = siblingElement.firstElementChild;

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

	setAction(element, elementId);
}

function selectElementWithQuery(elementQuery)
{
	let elements = document.querySelectorAll(elementQuery);
	if (!elements) return;

	for (let c = 0; c < elements.length; c++)
		setAction(elements[c], elements[c].id);
}

(function()
{
    'use restrict';

	selectElement("message_reponse");
	selectElement("message_conversation");
	selectElement("message_sujet");
    selectElement("message_avertissement");
    selectElement("raison");

	selectElementWithQuery("textarea[id^=\"edit_message_\"");
    selectElementWithQuery("textarea[id^=\"reponse_signalement_\"");
})();
