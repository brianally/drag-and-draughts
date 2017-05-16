(function() {
	"use strict";

	angular
		.module("draughts")
		.controller("GameCtrl", ["$scope", "$timeout", "gameDataService", "gameObituaryService", gameCtrl]);


	function gameCtrl($scope, $timeout, gameDataService, obit) {

		// this will be passed in by select list later
		let numSquares = 32; // dark only; for a 64-sq board
		let numPieces  = 12; // per side


		$scope.inPlay = "white";
		$scope.delay  = 0;

		gameDataService.initData(numSquares, numPieces).then(function(data) {
			$scope.gamePieceData = data;
		});



		$scope.update = function(moves) {
			gameDataService.update(moves).then(function(data) {

				$scope.inPlay        = ( $scope.inPlay === "white" ? "black" : "white" );
				$scope.gamePieceData = data;

			}, function(msg) {
				console.log(msg);
			});
		}
	}
}());