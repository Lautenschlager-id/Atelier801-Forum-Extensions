// ==UserScript==
// @name        [A801] Forum Blacklist
// @namespace   @Bolodefchoco
// @version     0.4
// @description Allows you to ignore people on forums.
// @author      @Bolodefchoco
// @include     https://atelier801.com/*
// @require     http://userscripts-mirror.org/scripts/source/107941.user.js

// @grant       GM_setValue
// @grant       GM_getValue
// ==/UserScript==

let ignoredList;

function ignoreUser(playerName)
{
	ignoredList[playerName] = true;
	GM_SuperValue.set("blacklist", ignoredList);
	removeIgnoredAuthors(true);

	alert(playerName.replace("%23", '#').toUpperCase() + " has been ignored!");
}

function whitelistUser(playerName)
{
	ignoredList[playerName] = undefined;
	GM_SuperValue.set("blacklist", ignoredList);
	alert(playerName.replace("%23", '#').toUpperCase() + " is not longer ignored!");

}

let alreadyIgnored = { };
function removeIgnoredAuthors(rerun = false)
{
	let nicknameList = { };

	let messageContainer = document.getElementsByClassName("cadre-message");
	for (let messageId = messageContainer.length - 1; messageId >= 0; messageId--) {
		let message = messageContainer[messageId];
		let postId = message.querySelectorAll('div[id^="message_"]')[0].id;
		let popupList = messageContainer[messageId].getElementsByClassName("nav-header")[0].parentElement;
		let nickname = popupList.children[1].firstElementChild.href.match("=(.+)")[1];
		nickname = nickname.toLowerCase();
		let hashtag = nickname.slice(-4);

		if (ignoredList[nickname] && !alreadyIgnored[postId])
		{
			alreadyIgnored[postId] = true;

			let messageContent = message.getElementsByClassName("cadre-message-message")[0].firstElementChild;
			messageContent.innerHTML = `<div class="cadre cadre-spoil">
	<button id="bouton_spoil_${messageId}" class="btn btn-small btn-message" onclick="afficherSpoiler('${messageId}');return false;">Message from ignored user</button>
	<div id="div_spoil_${messageId}" class="hidden">${messageContent.innerHTML}</div>
</div>`;

			let avatar = message.getElementsByClassName("element-composant-auteur bouton-profil-avatar")[0];

			let title;
			if (!avatar)
				title = message.getElementsByClassName("rang-prestige")[0].remove();
			else
			{
				title = avatar.nextElementSibling.remove();
				avatar.remove();
			}

			message.style.backgroundColor = "#2A2A29";
			continue;
		}
		else if (rerun || (hashtag > "0000" && hashtag <= "0020"))
			continue;
		nicknameList[nickname] = true;

		popupList.innerHTML += `<li>
	<a id="ignore_${nickname}_${messageId}" class="element-menu-contextuel" href="#">
		<img src="/img/icones/16/1liste-noire.png" class="espace-2-2" alt=""> Ignore
	</a>
</li>
`;

	}

	for (let nickname in nicknameList)
	{
		let buttons = document.querySelectorAll("a[id^=\"ignore_" + nickname + "\"]");
		for (let b = 0; b < buttons.length; b++)
			buttons[b].addEventListener("click", function(){ ignoreUser(nickname); });
	}
}

function displayBlacklist()
{
	let corps = document.getElementById("corps");

	let list = [ ], index = -1;
	for (let nickname in ignoredList)
	{
		let username = nickname.split("%23");

		list[++index] = `<tr role="row" class="${index%2==0?"even":"odd"}" id="${nickname}">
	<td class="table-cadre-cellule-principale">
		<span class="cadre-type-auteur-joueur nom-utilisateur-scindable">${username[0]}<span class="font-s couleur-hashtag-pseudo">#${username[1]}</span></span>
	</td>
	<td>
		<button class="btn" id="whitelist_${nickname}">Remove</button>
	</td>
</tr>`;
	}

	corps.innerHTML = `<div class="row">
	<div class="span12">
		<div class="cadre cadre-defaut ltr">
			<table class="table-cadre table-cadre-centree table-striped dataTable no-footer">
				<thead>
					<tr>
						<th>Name</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					${list.join('\n')}
				</tbody>
			</table>
		</div>
	</div>
</div>`;

	for (let nickname in ignoredList)
	{
		let row = document.getElementById(nickname);
		document.getElementById("whitelist_" + nickname).addEventListener("click", function(){
			whitelistUser(nickname);
			row.remove();
		})
	}
}

function addPathToBlacklist()
{
	let currentDropdownMenu = -1;
	let dropdownMenu = document.getElementsByClassName("dropdown-menu menu-contextuel pull-left");
	let menu, child;

	do
	{
		currentDropdownMenu++;
		menu = dropdownMenu[currentDropdownMenu];
		child = menu.firstElementChild.firstElementChild;
	} while(!(child.href && child.href.slice(-8) == "/account"));
	dropdownMenu = menu;

	let secondDivier = dropdownMenu.getElementsByClassName("divider")[1];
	secondDivier.outerHTML = `<li>
	<a href="forum-blacklist" class="element-menu-principal">
		<img src="/img/icones/16/1liste-noire.png" class="espace-2-2 img16"><span class="hidden-phone hidden-tablet">Forum Blacklist</span>
	</a>
</li>` + secondDivier.outerHTML;
}

(function() {
	'use-strict';
	ignoredList = GM_SuperValue.get("blacklist") || { };

	addPathToBlacklist();
	if (document.location.pathname == "/forum-blacklist")
		displayBlacklist();
	else
		removeIgnoredAuthors();
})();
