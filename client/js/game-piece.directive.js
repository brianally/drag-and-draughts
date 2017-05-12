(function() {
	"use strict";

	angular
		.module("draughts")
		.directive("gamePiece", ["$document", "gamePositionService", gamePiece]);

	function gamePiece($document, gamePositionService) {

		var template = `<div 	class="game-piece {{ piece.color }}"
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
			require   : ["^gamePiece", "^playingSquare"],
			controller: GamePieceController,
			link      : gamePieceLink
		}

		return directive;


		/**
		 * @name		gamePieceLink
		 * @desc		Directive post-link function
		 * 
		 * @param		{Scope} scope
		 * @param		{Element} element
		 * @param		{Object} attributes
		 * @param		{Controller} controller
		 * @return	{Void}
		 */
		function gamePieceLink(scope, element, attributes, controllers) {
			var el = element[0];

			el.draggable = true;
			el.dataset.king = false;

			el.addEventListener("dragstart", dragStart, false);
			el.addEventListener("dragend", dragEnd, false);

			// This destroys ALL gamePiece scopes!
			// scope.$on("$destroy", function(event, data) {
			// 	el.removeEventListener("dragstart", dragStart, false);
			// 	el.removeEventListener("dragend", dragEnd, false);
			// 	console.log(`destroyed: ${el.id}`);
			// });


			scope.$on("gamePiece.jumped", function(event, data) {

				if (data.piece == el.id) {
					scope.$destroy();
					scope = null;
					
					el.removeEventListener("dragstart", dragStart, false);
					el.removeEventListener("dragend", dragEnd, false);
					
					el.parentNode.removeChild(el);
				}
			});
			

			/**
			 * @name	dragStart
			 * @desc	
			 * @param  {Event} evt the event
			 * @return {Boolean}   false
			 */
			function dragStart(evt) {
				let sourceSquare, data, colour, direction;
				let sqCtrl   = controllers[1];
				let parentId = el.parentNode.id;
				let moves    = [];

				sourceSquare = $document[0].querySelectorAll(`#${parentId}`);
				colour       = el.classList.contains("white") ? "white" : "black";
				direction    = el.classList.contains("king") ? 0 : parseInt(el.dataset.dir);
				data         = {
					gamePieceId: el.id,
					sourceId   : parentId
				};
console.log(parentId, colour, direction);
				moves = sqCtrl.getMoves(parentId, colour, direction);
console.log(moves);
				// is any move allowed from here?
				if ( !moves.length ) {

					console.log("no moves!");

					
					evt.preventDefault();
					return false;
				}

				// store possible moves, including jumps
				data.moves = moves;

				evt.dataTransfer.effectAllowed = "move";
				evt.dataTransfer.setData("text/plain", JSON.stringify(data));

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
