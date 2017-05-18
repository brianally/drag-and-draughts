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
			 * @param  DragEvent	evt
			 * @return void
			 */
			function leaveOrExit(evt) {
				this.classList.remove("over");
				this.classList.remove("warn");
			}
			

			/**
			 * @name		dragEnter
			 * @summary		highlight entered square,
			 *        	warn if not allowed.
			 *        	
			 * @param  DragEvent	evt
			 * @return void
			 */
			function dragEnter(evt) {

				// ensure not empty
				if ( gamePosition.isOccupied(evt.target.id) ) {
					this.classList.add("warn");
				} else {
					this.classList.add("over");
				}
			}


			/**
			 * @name		dragOver
			 * @summary	calls preventDefault() so as to allow dropping
			 * 
			 * @param  DragEvent evt
			 * @return void
			 */
			function dragOver(evt) {
				evt.preventDefault();
			}


			/**
			 * @name		drop
			 * @summary		Determine whether game piece may be moved
			 *        	to this position. If moving one square, is
			 *        	it: a) empty? b)in the correct direction?
			 *        	If taking opponent's piece is it a valid jump?
			 * 
			 * @param  DragEvent	evt
			 * @return void
			 */
			function drop(evt) {
				let moveTaken = {};
				let data      = dataTransfer.getData(evt);

				// data.moves holds all possible moves for the piece. 
				// Extract the one for this square.
				moveTaken = data.moves.filter(m => {
					return m.destination === evt.target.id;
				})[0];

				if (moveTaken) {
				
					//evt.dataTransfer.dropEffect = "move";
					this.classList.remove("over");

					// The dataTransfer object is unavailable in dragend handler
					// inside the game-piece directive. This is a workaround to save the
					// move in the service so it can be picked up in the other directive.
					gamePosition.setLastMove(moveTaken);

					dataTransfer.setData(evt, moveTaken);
				}
				
				
				this.classList.remove("warn"); // why is this necessary?
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
