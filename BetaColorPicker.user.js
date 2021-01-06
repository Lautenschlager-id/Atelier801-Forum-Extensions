// ==UserScript==
// @name        [A801] Beta Color Picker
// @namespace   @Bolodefchoco
// @version     0.2
// @description Enables a color picker for bbcode. [click in the button after picking the color]
// @author      @Bolodefchoco
// @include     https://atelier801.com/*
// @require     https://greasyfork.org/scripts/23181-colorpicker/code/colorPicker.js?version=147862
// ==/UserScript==

(function()
{
	"use restrict";

    let colorTables = document.getElementsByClassName("dropdown-menu pull-right label-message");
    for (let tableIndex = 0; tableIndex < colorTables.length; tableIndex++) {
        let table = colorTables[tableIndex];

        let refElement = table.parentElement.firstElementChild.attributes.onclick.value.match('\'(.+?)\'')[1];

        table.parentElement.innerHTML += `<button type="button" id="colorpicker_${tableIndex}" class="btn btn-reduit" >
    <img src="/img/sections/pinceau.png" class="img16 espace-2-2">
</button>
`;
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
})();
