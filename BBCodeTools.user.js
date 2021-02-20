// ==UserScript==
// @name        [A801] BBCode Tools
// @namespace   @Bolodefchoco
// @version     0.1
// @description Adds a Color Picker, object centralizer and Lua code support to the bbcode panel.
// @author      @Bolodefchoco
// @include     https://atelier801.com/*
// @updateURL   https://github.com/Lautenschlager-id/Atelier801-Forum-Extensions/raw/main/BBCodeTools.user.js
// @downloadURL https://github.com/Lautenschlager-id/Atelier801-Forum-Extensions/raw/main/BBCodeTools.user.js
// @require     https://greasyfork.org/scripts/23181-colorpicker/code/colorPicker.js?version=147862
// ==/UserScript==

function addColorPicker(table, refElement, tableIndex)
{
	table.parentElement.innerHTML += `<button type="button" id="colorpicker_${tableIndex}" class="btn btn-reduit">
	<img src="/img/sections/pinceau.png" class="img16 espace-2-2">
</button>`;
	let colorPicker = document.getElementById("colorpicker_" + tableIndex);

	jsColorPicker("button[id^=\"colorpicker_" + tableIndex + "\"]", {
		noAlpha: true,
		customBG: "#FFFFFF",
		appendTo: document.body.parentElement,
		size: 2
	})

	let isPicking = false;

	colorPicker.addEventListener("click", function(){
		if (isPicking)
		{
			isPicking = false;
			ajouterBBCode(refElement, "[color=" + colorPicker.value + "]", "[/color]", 15);
		}
		else
			isPicking = true;
	});
}

function addObjectCentralizer(textElement, refElement)
{
	textElement.children[2].innerHTML += `<li>
	<a class="element-menu-outils" onclick="ajouterBBCode('${refElement}', '[table align=center][cel]', '[/cel][/table]', 25);">
		<img src="/img/icones/16/edit-alignment-center.png"> Table Center
	</a>
</li>`
}

function addLuaCode(table, refElement)
{
	table.outerHTML += `<div class="btn-group groupe-boutons-barre-outils">
	<button type="button" class="btn btn-reduit" onclick="ajouterBBCode('${refElement}', '[code=Lua]', '[/code]', 10);" title="Lua Code">
		<img src="http://images.atelier801.com/177c092b190.png" class="img16 espace-2-2">
	</button>
</div>`;
}

(function()
{
	"use restrict";

	let colorTables = document.getElementsByClassName("dropdown-menu pull-right label-message");
	for (let tableIndex = 0; tableIndex < colorTables.length; tableIndex++) {
		let table = colorTables[tableIndex];
		let refElement = table.parentElement.firstElementChild.attributes.onclick.value.match('\'(.+?)\'')[1];
		let tools = table.parentElement.parentElement;

		addObjectCentralizer(tools.children[4], refElement);

		addLuaCode(tools.children[8], refElement);

		addColorPicker(table, refElement, tableIndex);
	}
})();
