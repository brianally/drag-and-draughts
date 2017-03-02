(function() {
	"use strict";

	angular
		.module("draughts")
		.directive("playingSquare", ["squarePositionService", playingSquare]);

	function playingSquare(squarePositionService) {

		var directive = {
			restrict    : "E",
			controllerAs: "vm",
			controller  : PlayingSquareController,
			link        : playingSquareLink
		}

		return directive;


		function playingSquareLink(scope, element) {
			var el = element[0];

			el.droppable = true;

			el.addEventListener("dragenter", function(evt) {
				// ensure not empty
				if ( el.hasChildNodes() ) {
					this.classList.add("warn");
				} else {
					this.classList.add("over");
				}
				
				return false;
			}, false);

			el.addEventListener("dragover", function(evt) {
				evt.dataTransfer.dropEffect = "move";
				if ( el.hasChildNodes() ) {
					this.classList.add("warn");
				} else {
					this.classList.add("over");
				}

				if (evt.preventDefault) evt.preventDefault();
				return false;
			}, false);


			el.addEventListener("drop", function(evt) {
				let data         = JSON.parse(evt.dataTransfer.getData("text/plain"));
				let gamePiece    = document.getElementById(data.gamePieceId);
				let sourceSquare = document.getElementById(data.sourceId);
				
				if (evt.stopPropagation) evt.stopPropagation();
				if (evt.preventDefault) evt.preventDefault();

				evt.dataTransfer.dropEffect = "move";

				this.classList.remove("over");

				// ensure not empty
				if ( !el.hasChildNodes() ) {


					this.appendChild(gamePiece);

					// must tell sibling square to empty itself of text nodes

					// is now king?
					if (squarePositionService.isKingsRow(el.id)) {
						gamePiece.classList.add("king");				// FIXME: move to gamePiece
					}
				}
				
				
				this.classList.remove("warn"); // why is this necessary?

				return false;
			}, false);


			["dragleave", "dragend", "dragexit"].forEach(function(event) {
				el.addEventListener(event, function(evt) {
					this.classList.remove("over");
					this.classList.remove("warn");
					return false;
				}, false);
			});

			//element.on("$destroy", );
		}
	}

	PlayingSquareController.$inject = ["$scope"];

	function PlayingSquareController($scope) {
		var vm = this;
	}
	
}());