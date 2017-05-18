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

		$scope.delay    = 2000;
		$scope.inPlay   = "white";

		// initialises the gamePieces
		gameData.initData(numSquares, numPieces).then(function(result) {
			$scope.gamePieceData = result.data;
			$scope.isMoving      = false;
		});


		// updates gamePiece positions
		$scope.update = function(moveData) {
			gameData.update(moveData).then(function(result) {

				// updated player data
				$scope.gamePieceData = result.data;

				// piece with another move coming because of capture
				$scope.isMoving = result.isMoving;

				// if player does not have consecutive move coming toggle side
				if ( !result.isMoving ) {
					$scope.inPlay = ( $scope.inPlay === "white" ? "black" : "white" );
				}

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