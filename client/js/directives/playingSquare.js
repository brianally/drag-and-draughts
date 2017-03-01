"use strict";

angular
	.module("draughts")
	.directive("playingSquare", ["squarePosition", playingSquare]);

function playingSquare(squarePosition) {

	function playingSquareCtrl() {

	}

	function playingSquareLink(scope, element) {

	}

	return {
		restrict  : "C",
		controller: playingSquareCtrl,
		link      : playingSquareLink
	}
}