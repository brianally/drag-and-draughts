(function() {
	"use strict";
	let injections = [
		"$scope",
		"gameDataService",
		"gamePositionService",
		gameCtrl
	];

	angular
		.module("draughts")
		.controller("GameCtrl", injections);


	function gameCtrl($scope, gameData, gamePosition) {

		// this will be passed in by select list later
		let numSquares = 32; // dark only; for a 64-sq board
		let numPieces  = 12; // per side

		this.delay  = 2000;
		this.inPlay = "white";

		// initialises the gamePieces
		gameData.initData(numSquares, numPieces).then(function(result) {
			this.gamePieceData = result.data;
			this.isMoving      = false;
		}.bind(this));


		// updates gamePiece positions
		this.update = function(moveData) {
			gameData.update(moveData).then(function(result) {

				// updated player data
				this.gamePieceData = result.data;

				// piece with another move coming because of capture
				this.isMoving = result.isMoving;

				// if player does not have consecutive move coming toggle side
				if ( !result.isMoving ) {
					this.toggleInPlay();
				}

			}.bind(this), function(msg) {
				console.log(msg);
			});
		}.bind(this);


		this.isDisabled = function(id, shade) {

			if ( !this.isMoving && shade === this.inPlay ) {
				return false;
			}
			else if ( this.isMoving === id ) {
				return false;
			}

			return true;
		}


		this.yieldTurn = function(pieceId) {

			if ( this.isMoving === pieceId ) {

				$scope.$apply(function() {

					this.isMoving = false;
					this.toggleInPlay();

				}.bind(this));
			}
		}

		// initialises gameSquare positions
		$scope.$$postDigest(function() {
			gamePosition.init();
		});


		this.toggleInPlay = function() {

			this.inPlay = ( this.inPlay === "white" ? "black" : "white" );

		}
	}
}());