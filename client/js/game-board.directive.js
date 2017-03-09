(function() {
	"use strict";

	angular
		.module("draughts")
		.directive("gameBoard", ["$document", "gamePositionService", gameBoard]);

	function gameBoard($document, gamePositionService) {

		var directive = {
			restrict    : "E",
			controllerAs: "vm",
			controller  : GameBoardController,
			link        : gameBoardLink
		}

		return directive;


		/**
		 * @name		gameBoardLink
		 * @desc		Directive post-link function
		 * 
		 * @param		{Scope} scope
		 * @param		{Element} element
		 * @param		{Object} attributes
		 * @param		{Controller} controller
		 * @return	{Void}
		 */
		function gameBoardLink(scope, element, attributes, controller) {

		}

	}

	GameBoardController.$inject = ["$scope"];

	/**
	 * @name	GameBoardController
	 * @desc	
	 * @param {Scope} $scope
	 */
	function GameBoardController($scope) {
		var vm = this;

		$scope.$on("playingSquare.jumped", function(event, data) {
			$scope.$broadcast("gamePiece.jumped", data);
		});
	}
}());