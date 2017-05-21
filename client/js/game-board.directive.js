(function() {
	"use strict";

	angular
		.module("draughts")
		.directive("gameBoard", ["$document", "gamePositionService", gameBoard]);

	function gameBoard($document, gamePositionService) {


		let directive = {
			restrict    : "E",
			controllerAs: "gbCtrl",
			controller  : GameBoardController,
			link        : gameBoardLink
		}

		return directive;


		/**
		 * @name		gameBoardLink
		 * @summary	Directive post-link function
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
	 * @summary	
	 * @param {Scope} $scope
	 */
	function GameBoardController($scope) {
		

	}
}());