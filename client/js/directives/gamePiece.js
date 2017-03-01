"use strict";

angular
	.module("draughts")
	.directive("gamePiece", ["squarePosition", gamePiece]);

function gamePiece(squarePosition) {

	function gamePieceCtrl() {

	}

	function gamePieceLink(scope, element, attributes, controller) {

	}

	return {
		restrict  : "C",
		controller: gamePieceCtrl,
		link      : gamePieceLink
	}
}