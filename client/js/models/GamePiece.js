(function() {
	"use strict";

	angular
		.module("draughts")
		.factory("GamePiece", GamePieceModel);

	function GamePieceModel() {

		function GamePiece(id, shade) {

			this.id        = `${shade}${id}`;
			this.shade     = shade;
			this.direction = ( shade === "white" ? -1 : 1 );
			this.crowned   = false;
		}


		GamePiece.prototype.crown = function() {
			this.crowned   = true;
			this.direction = 0;
		}

		return GamePiece;
	}
}());