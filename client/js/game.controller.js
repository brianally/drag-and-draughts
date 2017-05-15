(function() {
	"use strict";

	angular
		.module("draughts")
		.controller("GameCtrl", ["$scope", "gameDataService", gameCtrl]);


	function gameCtrl($scope, gameDataService) {

		// this will be passed in by select list later
		let numSquares = 32; // dark only; for a 64-sq board
		let numPieces  = 12; // per side

		$scope.gamePieceData = gameDataService.initData(numSquares, numPieces);

		gameDataService.subscribe("gameCtrl", function() {
			$scope.$apply(function() {
				$scope.gamePieceData = gameDataService.getData();
			});
		});


		$scope.move = function(fromSqId, toSqId) {
			gameDataService.move(fromSqId, toSqId);
		}


		$scope.capture = function(fromSqId, toSqId) {
			gameDataService.remove(fromSqId, toSqId);
		}
		

		$scope.makeKing = function(sqId) {
			gameDataService.crown(sqId);
		}
	}
}());