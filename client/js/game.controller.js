(function() {
	"use strict";

	angular
		.module("draughts")
		.controller("GameCtrl", ["$scope", "gameDataService", gameCtrl]);


	function gameCtrl($scope, gameDataService) {

		// this will be passed in by select list later
		let numSquares = 32; // black only; for a 64-sq board
		let numPieces  = 12; // per side

		$scope.gamePieceData = gameDataService.initData(numSquares, numPieces);

		gameDataService.subscribe("gameCtrl", function() {
			$scope.$apply(function() {
				$scope.gamePieceData = gameDataService.getData();
			});
		});


		$scope.update = function(fromSqId, toSqId) {
			console.log("calling update");
			gameDataService.update(fromSqId, toSqId);
		}
	}
}());