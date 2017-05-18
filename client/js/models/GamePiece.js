(function() {
	"use strict";

	angular
		.module("draughts")
		.factory("GamePiece", GamePieceModel);

	function GamePieceModel() {

		function GamePiece(id, shade) {

			this.id        = `${shade}${id}`;
			this.shade     = shade;
			this.direction = ( shade == "white" ? -1 : 1 );		// hacky
			this.crowned = false;
		}


		GamePiece.prototype.crown = function() {
			this.crowned = true;
		}

		return GamePiece;
	}
}());