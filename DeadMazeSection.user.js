// ==UserScript==
// @name        [A801] Display Dead Maze Section
// @namespace   @Bolodefchoco
// @version     0.1
// @description See the Dead Maze section in /forums
// @author      @Bolodefchoco
// @include     https://atelier801.com/forums

// @grant       none
// ==/UserScript==

(function(){
    setTimeout(function() {
        document.getElementById("corps").innerHTML += `<div class="row">
	<div class="span12">
		<div id="f652058" class="cadre cadre-relief cadre-forum ltr">
			<div id="f1_17">
				<div class="accordion accordeon-forum" id="accordion652058">
					<div class="accordion-group">
						<div class="accordion-heading cadre-forum-titre">
							<a class="accordion-toggle lien-blanc" data-toggle="collapse" data-parent="#accordion652058" href="#collapse652058">
								<img src="/img/sections/deadmaze.png" class="img32 espace-2-2">Dead Maze <img src="/img/icones/plus24-2.png" alt="" class="espace-2-2 pull-right image-accordeon">
							</a>
						</div>
						<div id="collapse652058" class="accordion-body collapse-forum-actu in collapse" style="height: auto;">
							<div class="accordion-inner">
								<div class="cadre-sections-actu" id="deadmaze">
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>`;

        jQuery.ajax({
            url: "forum-ajax",
            type: "GET",
            dataType: "html",
            data: {
                "f":"652058",
                "c":'0',
                "s":"deadmaze"
            },
            timeout:TIMEOUT_AJAX,
            success: function(data, textStatus, jqXHR) {
                document.getElementById("deadmaze").innerHTML = data;
                majCadresMessage();
                parserDates();
            }
        });
    }, 5000);
})();
