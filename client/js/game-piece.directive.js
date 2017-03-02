(function() {
	"use strict";

	angular
		.module("draughts")
		.directive("gamePiece", ["squarePositionService", gamePiece]);

	function gamePiece(squarePositionService) {

		var directive = {
			restrict    : "E",
			controllerAs: "vm",
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
		function gamePieceLink(scope, element, attributes, controller) {
			var el   = element[0];

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
				let sourceSquare = document.getElementById(parentId);
				let data         = `{"gamePieceId": "${this.id}", "sourceId": "${parentId}"}`;



				// is move allowed from here?
				let direction = el.classList.contains("king") ? 0 : el.dataset.dir;
				let neighbours = squarePositionService.getNeighboursFromId(parentId, direction);
				//console.log(neighbours);

				let hasMove = false;



				// need to find occupied neighbours
				// if occupied, by whom?
				// if occupied, is opposite sq available?
				// 





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