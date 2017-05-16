(function() {
	"use strict";

	angular
		.module("draughts")
		.factory("GamePiece", GamePieceModel);

	function GamePieceModel() {

		var isKing = false;

		function GamePiece(id, shade, direction, king) {

			this.id     = `${shade}${id}`;
			this.shade  = shade;

			// It seems like overkill to even implement last 2 params
			// but useful if a game is suspended.
			// OK, it's overkill.
			if ( typeof direction == "undefined" ) {
				this.direction = ( shade == "white" ? -1 : 1 );		// hacky
			}
			else {
				this.direction = direction;
			}

			if ( king ) {
				isKing = king;
			}
			
		}

		GamePiece.prototype.crown = function() {
			isKing = true;
		}


		GamePiece.prototype.isKing = function() {
			return angular.copy(isKing);
		}

		return GamePiece;
	}
}());