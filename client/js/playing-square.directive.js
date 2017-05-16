(function() {
	"use strict";

	angular
		.module("draughts")
		.directive("playingSquare", ["$document", "gamePositionService", "dataTransferService", playingSquare]);


	function playingSquare($document, gamePositionService, dataTransferService) {

		var template = `<div	class="playing-square"
													id="sq{{ sqId }}"
													droppable="true">
											<game-piece	ng-if="!!piece"
												data-piece="piece"
												data-in-play="{{ inPlay }}"
												data-delay="{{ delay }}"
												data-dropped="dropped()"
												data-update="update()"></game-piece>
										</div>`;


		var directive = {
			restrict    : "E",
			controllerAs: "vm",
			scope: {
				sqId  : "@",
				piece : "=",
				inPlay: "@",
				delay : "@",
				update: "&"
			},
			replace   : true,
			template  : template,
			controller: PlayingSquareController,
			link      : playingSquareLink
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

			el.droppable = true;

			//el.addEventListener("dragenter", dragEnter, false);
			el.addEventListener("dragover", dragOver, false);
			el.addEventListener("drop", drop, false);

			["dragleave", "dragexit"].forEach(eventName => {
				el.addEventListener(eventName, leaveOrExit, false);
			});

			scope.$on("$destroy", function() {

				//el.removeEventListener("dragenter", dragenter, false);
				el.removeEventListener("dragover", dragover, false);
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
				//console.log(evt.type);
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
				if ( gamePositionService.isOccupied(evt.target.id) ) {
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
				let data      = dataTransferService.getData(evt);

				// data.moves holds all possible moves for the piece. 
				// Extract the one for this square.
				moveTaken = data.moves.filter(m => {
					return m.destination == evt.target.id;
				})[0];

				if (moveTaken) {
				
					//evt.dataTransfer.dropEffect = "move";
					this.classList.remove("over");

					// The dataTransfer object is unavailable in dragend handler
					// inside the game-piece directive. This is a workaround to save the
					// move in the service so it can be picked up in the other directive.
					gamePositionService.setLastMove(moveTaken);

					dataTransferService.setData(evt, moveTaken);
				}
				
				
				this.classList.remove("warn"); // why is this necessary?
			}
		}
	}


	//PlayingSquareController.$inject = ["$scope", "$document", "gamePositionService"];

	/**
	 * @name	PlayingSquareController
	 * @summary	
	 * @param Scope $scope
	 */
	function PlayingSquareController($scope, $element) {
		var vm = this;
		


	}
	
}());
