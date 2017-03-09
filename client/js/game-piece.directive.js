(function() {
	"use strict";

	angular
		.module("draughts")
		.directive("gamePiece", ["$document", "squarePositionService", gamePiece]);

	function gamePiece($document, squarePositionService) {

		var directive = {
			restrict    : "E",
			controllerAs: "vm",
			require     : ["^gamePiece", "^playingSquare"],
			controller  : GamePieceController,
			link        : gamePieceLink
		}

		return directive;

		/**
		 * @name	gamePieceLink
		 * @desc	Directive post-link function
		 * @param  {Scope} scope
		 * @param  {Element} element
		 * @param  {Object} attributes
		 * @param  {Controller} controller
		 * @return void
		 */
		function gamePieceLink($scope, element, attributes, controllers) {
			var el = element[0];

			el.draggable = true;
			el.dataset.king = false;

			el.addEventListener("dragstart", dragStart, false);
			el.addEventListener("dragend", dragEnd, false);

			//element.on("$destroy", );
			
			

			/**
			 * @name	dragStart
			 * @desc	
			 * @param  {Event} evt the event
			 * @return {Boolean}   false
			 */
			function dragStart(evt) {
				let parentId     = el.parentNode.id;
				let sourceSquare = $document[0].querySelectorAll(`#${parentId}`);
				let data         = `{"gamePieceId": "${this.id}", "sourceId": "${parentId}"}`;

				// is move allowed from here?
				let colour     = el.classList.contains("white") ? "white" : "black";
				let direction  = el.classList.contains("king") ? 0 : parseInt(el.dataset.dir);

				let hasMove = controllers[1].hasMove(parentId, colour, direction);

				if (!hasMove) {
					console.log("no move!");
					return false;
				}

				// need to find occupied neighbours
				// if occupied, by whom?
				// if occupied, is opposite sq available?
				// 


				// broadcast source position?
				// how to let destination square know about staring square?


				evt.dataTransfer.effectAllowed = "move";
				evt.dataTransfer.setData("text/plain", data);

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
	function GamePieceController($scope) {
		var vm = this;
	}
}());