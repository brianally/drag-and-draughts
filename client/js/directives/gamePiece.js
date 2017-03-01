"use strict";

angular
	.module("draughts")
	.directive("gamePiece", ["squarePosition", gamePiece]);

function gamePiece(squarePosition) {

	function gamePieceCtrl($scope, $element, $attrs) {

	}

	function gamePieceLink(scope, element, attributes, controller) {
		var el   = element[0];

		el.draggable = true;
		el.dataset.king = false;

		function dragStart(evt) {
			let parentId     = el.parentNode.id;
			let sourceSquare = document.getElementById(parentId);
			let data         = `{"gamePieceId": "${this.id}", "sourceId": "${parentId}"}`;



			// is move allowed from here?
			let direction = el.classList.contains("king") ? 0 : el.dataset.dir;
			let neighbours = squarePosition.getNeighboursFromId(parentId, direction);
			//console.log(neighbours);

			let hasMove = false;

			neighbours.forEach(function(sq) {

			});

			// need to find occupied neighbours
			// if occupied, by whom?
			// if occupied, is opposite sq available?
			// 





			evt.dataTransfer.effectAllowed = "move";
			evt.dataTransfer.setData("text/plain", data);

			this.classList.add("dragging");
			return false;
		}

		function dragEnd(evt) {
			this.classList.remove("dragging");
			return false;			
		}

		el.addEventListener("dragstart", dragStart, false);
		el.addEventListener("dragend", dragEnd, false);
	}

	return {
		restrict  : "C",
		controller: gamePieceCtrl,
		link      : gamePieceLink
	}
}