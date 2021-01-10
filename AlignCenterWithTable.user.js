// ==UserScript==
// @name        [A801] Align Center (table)
// @namespace   @Bolodefchoco
// @version     0.1
// @description Centers any element using table
// @author      @Bolodefchoco
// @include     https://atelier801.com/*
// ==/UserScript==

(function()
{
	"use restrict";

	let alignItem = document.getElementById("outils_message_reponse").children[4].children[2];

	alignItem.innerHTML += `<li>
	<a class="element-menu-outils" onclick="ajouterBBCode('message_reponse', '[table align=center][cel]', '[/cel][/table]', 39);"><img src="/img/icones/16/edit-alignment-center.png"> Table Center</a>
</li>`;
})();
