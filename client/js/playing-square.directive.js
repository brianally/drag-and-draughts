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
												piece="piece"></game-piece>
										</div>`;


		var directive = {
			restrict    : "E",
			controllerAs: "vm",
			scope: {
				sqId   : "@",
				piece  : "=",
				move   : "&",
				capture: "&",
				king   : "&"
			},
			replace   : true,
			template  : template,
			controller: PlayingSquareController,
			link      : playingSquareLink
		}



		return directive;




		/**
		 * @name	playingSquareLink
		 * @desc	Directive post-link function
		 * 
		 * @param  {Scope} scope
		 * @param  {Element} element
		 * @return {Void}
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
				//evt.dataTransfer.dropEffect = "move";

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
				let moveTaken = {};
				let data      = dataTransferService.getData(evt);
				let gamePiece = $document[0].querySelector(`#${data.pieceId}`);

				if (evt.stopPropagation) evt.stopPropagation();
				if (evt.preventDefault) evt.preventDefault();

				// data.moves holds all possible moves for the piece. 
				// Extract the one for this square.
				moveTaken = data.moves.filter(m => {
					return m.destination == evt.target.id;
				})[0];

				if (moveTaken) {
				
					evt.dataTransfer.dropEffect = "move";															// ***********************
					this.classList.remove("over");

					scope.move()(data.sourceId, moveTaken.destination);


					// If a piece was jumped, handle that
					if ( moveTaken.jumped ) {
						scope.capture()(moveTaken.jumped);
					}

					// is now king?
					if ( gamePositionService.isInCrownHead(el.id) ) {
						scope.king()(el.id);										// FIXME: feels weird being here
					}
				}
				
				
				this.classList.remove("warn"); // why is this necessary?

				return false;
			}
		}
	}


	//PlayingSquareController.$inject = ["$scope", "$document", "gamePositionService"];

	/**
	 * @name	PlayingSquareController
	 * @desc	
	 * @param {Scope} $scope
	 */
	function PlayingSquareController($scope, $element) {
		var vm = this;
		


	}
	
}());
