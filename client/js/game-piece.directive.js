(function() {
	"use strict";

	angular
		.module("draughts")
		.directive("gamePiece", ["$document", "gamePositionService", "dataTransferService", gamePiece]);

	function gamePiece($document, gamePositionService, dataTransferService) {

		var template = `<div 	class="game-piece {{ piece.shade }}"
													ng-class="{'king': piece.king}"
													data-dir="{{ piece.direction }}"
													data-piece-id="{{ piece.id }}"
													draggable="true"></div>`;

		var directive = {
			restrict    : "E",
			controllerAs: "vm",
			scope: {
				piece: "="
			},
			replace   : true,
			template  : template,
			//require   : ["^gamePiece", "^playingSquare"],
			controller: GamePieceController,
			link      : gamePieceLink
		}

		return directive;


		/**
		 * @name		gamePieceLink
		 * @desc		Directive post-link function
		 * 
		 * @param		Scope scope
		 * @param		Element element
		 * @return	Void}
		 */
		function gamePieceLink(scope, element) {
			var el = element[0];

			el.draggable = true;
			el.dataset.king = false;

			el.addEventListener("dragstart", dragStart, false);
			el.addEventListener("dragend", dragEnd, false);

			scope.$on("$destroy", function() {

				el.removeEventListener("dragstart", dragStart, false);
				el.removeEventListener("dragend", dragEnd, false);

			});
			

			/**
			 * @name	dragStart
			 * @desc	
			 * @param  {Event} evt the event
			 * @return {Boolean}   false
			 */
			function dragStart(evt) {

				let sqId      = el.parentNode.id;
				let moves     = [];
				let shade     = el.classList.contains("white") ? "white" : "black";
				let direction = el.classList.contains("king") ? 0 : parseInt(el.dataset.dir);
				let data      = {
					gamePieceId: el.id,
					sourceId   : sqId
				};

				// get all moves from this position
				moves = gamePositionService.getMoves(sqId, shade, direction);


				// is any move allowed from here?
				if ( !moves.length ) {

					//console.log("no moves!");
					
					evt.preventDefault();
					return false;
				}

				// store possible moves, including jumps
				data.moves = moves;

				dataTransferService.setAllowedEffect(evt, "move");
				dataTransferService.setData(evt, data);
				
				this.classList.add("dragging");
				return false;
			}



			/**
			 * @name		dragEnd
			 * @desc		Remove "dragging" class from element
			 * @param  {Event} evt the event
			 * @return {Boolean}   false
			 */
			function dragEnd(evt) {
				this.classList.remove("dragging");
				return false;			
			}
		}
	}


	GamePieceController.$inject = ["$scope"];

	/**
	 * @name	GamePieceController
	 * @desc	
	 * @param {Scope} $scope
	 */
	function GamePieceController($scope, $element) {
		var vm = this;
	}
}());
