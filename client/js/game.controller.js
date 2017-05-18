(function() {
	"use strict";
	let injections = [
		"$scope",
		"$timeout",
		"gameDataService",
		"gamePositionService",
		gameCtrl
	];

	angular
		.module("draughts")
		.controller("GameCtrl", injections);


	function gameCtrl($scope, $timeout, gameData, gamePosition) {

		// this will be passed in by select list later
		let numSquares = 32; // dark only; for a 64-sq board
		let numPieces  = 12; // per side


		$scope.inPlay = "white";
		$scope.delay  = 0;

		// initialises the gamePieces
		gameData.initData(numSquares, numPieces).then(function(data) {
			$scope.gamePieceData = data;
		});


		// updates gamePiece positions
		$scope.update = function(moves) {
			gameData.update(moves).then(function(data) {

				$scope.inPlay        = ( $scope.inPlay === "white" ? "black" : "white" );
				$scope.gamePieceData = data;

			}, function(msg) {
				console.log(msg);
			});
		}

		// initialises gameSquare positions
		$scope.$$postDigest(function() {
			gamePosition.init();
		});
	}
}());