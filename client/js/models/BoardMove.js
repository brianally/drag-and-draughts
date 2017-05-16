(function() {
	"use strict";

	angular
		.module("draughts")
		.factory("BoardMove", BoardMoveModel);

	function BoardMoveModel() {

		function BoardMove(source, destination, captured) {

			this.source      = source;
			this.destination = destination;
			this.captured    = captured;
		}

		return BoardMove;
	}
}());