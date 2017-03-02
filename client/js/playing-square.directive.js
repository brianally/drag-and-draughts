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

		/**
		 * @name	
		 * @desc	Directive post-link function
		 * @param  {Scope} scope
		 * @param  {Element} element
		 * @return void
		 */
		function playingSquareLink(scope, element, attrs, controller) {
			var el = element[0];

			el.droppable = true;

			el.addEventListener("dragenter", dragEnter, false);
			el.addEventListener("dragover", dragOver, false);
			el.addEventListener("drop", drop, false);

			["dragleave", "dragend", "dragexit"].forEach(eventName => {
				el.addEventListener(eventName, function(evt) {
					this.classList.remove("over");
					this.classList.remove("warn");
					return false;
				}, false);
			});

			//element.on("$destroy", );
			

			/**
			 * @name		dragEnter
			 * @desc		highlight entered square,
			 *        	warn if not allowed.
			 *        	
			 * @param  {Event} evt "dragenter"
			 * @return {Boolean}   false
			 */
			function dragEnter(evt) {
				// ensure not empty
				if ( el.hasChildNodes() ) {
					this.classList.add("warn");
				} else {
					this.classList.add("over");
				}
				
				if (evt.preventDefault) evt.preventDefault();
				return false;
			}


			/**
			 * @name		dragOver
			 * @desc		Set the dropEffect
			 * 
			 * @param  {Event} evt "dragover"
			 * @return {Boolean}   false
			 */
			function dragOver(evt) {
				evt.dataTransfer.dropEffect = "move";

				if (evt.preventDefault) evt.preventDefault();
				return false;
			}


			/**
			 * @name		drop
			 * @desc		Determine whether game piece may be moved
			 *        	to this position. If moving one square, is
			 *        	it: a) empty? b)in the correct direction?
			 *        	If taking opponent's piece is it a valid jump?
			 * 
			 * @param  {Event} evt "drop"
			 * @return {Boolean}   false
			 */
			function drop(evt) {
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
						gamePiece.classList.add("king");										// FIXME: move to gamePiece
					}
				}
				
				
				this.classList.remove("warn"); // why is this necessary?

				return false;
			}
		}
	}

	PlayingSquareController.$inject = ["$scope"];

	/**
	 * @name	PlayingSquareController
	 * @desc	
	 * @param {Scope} $scope
	 */
	function PlayingSquareController($scope) {
		var vm = this;
	}
	
}());