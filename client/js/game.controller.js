(function() {
	"use strict";

	angular
		.module("draughts")
		.controller("GameCtrl", ["$scope", "$timeout", "gameDataService", gameCtrl]);


	function gameCtrl($scope, $timeout, gameDataService) {

		// this will be passed in by select list later
		let numSquares = 32; // dark only; for a 64-sq board
		let numPieces  = 12; // per side

		$scope.gamePieceData = gameDataService.initData(numSquares, numPieces);

		$scope.inPlay = "white";
		$scope.timeout = 500;

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

		$scope.dropped = function(hasJumped) {
			// if the last move was a jump a certain leeway
			// is provided for making a second move
			let timeout = hasJumped ? $scope.timeout : 0;

			$timeout(function() {

				$scope.inPlay = $scope.inPlay === "white" ? "black" : "white";

			}, timeout);
		}
	}
}());