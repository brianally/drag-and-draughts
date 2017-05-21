(function() {
	"use strict";

	let injections = [
		"$document",
		"gamePositionService",
		"dataTransferService",
		playingSquare
	];

	angular
		.module("draughts")
		.directive("playingSquare", injections);


	function playingSquare($document, gamePosition, dataTransfer) {

		var directive = {
			restrict    : "E",
			controllerAs: "psCtrl",
			controller  : PlayingSquareController,
			link        : playingSquareLink
		}

		return directive;


		/**
		 * @name	playingSquareLink
		 * @summary	Directive post-link function
		 * 
		 * @param  {Scope} scope
		 * @param  {Element} element
		 * @return {Void}
		 */
		function playingSquareLink(scope, element, attrs, controller) {
			var el = element[0];
			
			//el.addEventListener("dragenter", dragEnter, false);
			el.addEventListener("dragover", dragOver, false);
			el.addEventListener("drop", drop, false);

			["dragleave", "dragexit"].forEach(eventName => {
				el.addEventListener(eventName, leaveOrExit, false);
			});

			scope.$on("$destroy", function() {

				//el.removeEventListener("dragenter", dragenter, false);
				el.removeEventListener("dragover", dragOver, false);
				el.removeEventListener("drop", drop, false);

				["dragleave", "dragexit"].forEach(eventName => {
					el.removeEventListener(eventName, leaveOrExit, false);
				});
			});


			/**
			 * @name		leaveOrExit
			 * @summary		removes css classes
			 *        	
			 * @param  DragEvent	event
			 * @return void
			 */
			function leaveOrExit(event) {
				this.classList.remove("over");
				this.classList.remove("warn");
			}
			

			/**
			 * @name		dragEnter
			 * @summary		highlight entered square,
			 *        	warn if not allowed.
			 *        	
			 * @param  DragEvent	event
			 * @return void
			 */
			function dragEnter(event) {

				// ensure not empty
				if ( gamePosition.isOccupied(event.target.id) ) {
					this.classList.add("warn");
				} else {
					this.classList.add("over");
				}
			}


			/**
			 * @name		dragOver
			 * @summary	calls preventDefault() so as to allow dropping
			 * 
			 * @param  DragEvent event
			 * @return void
			 */
			function dragOver(event) {
				event.preventDefault();
			}


			/**
			 * @name		drop
			 * @summary		Determine whether game piece may be moved
			 *        	to this position. If moving one square, is
			 *        	it: a) empty? b)in the correct direction?
			 *        	If taking opponent's piece is it a valid jump?
			 * 
			 * @param  DragEvent	event
			 * @return void
			 */
			function drop(event) {
				let moveTaken = {};
				let data      = dataTransfer.getData(event);

				// data.moves holds all possible moves for the piece. 
				// Extract the one for this square.
				moveTaken = data.moves.filter(m => {
					return m.destination === event.target.id;
				})[0];

				if (moveTaken) {
				
					//evt.dataTransfer.dropEffect = "move";
					this.classList.remove("over");

					// The dataTransfer object is unavailable in dragend handler
					// inside the game-piece directive. This is a workaround to save the
					// move in the service so it can be picked up in the other directive.
					gamePosition.setLastMove(moveTaken);
				}
				
				
				this.classList.remove("warn"); // why is this necessary?
				event.preventDefault();
			}
		}
	}


	/**
	 * @name	PlayingSquareController
	 * @summary	
	 * @param Scope $scope
	 */
	function PlayingSquareController($scope, $element) {

	}
	
}());
