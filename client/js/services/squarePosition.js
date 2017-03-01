"use strict";

angular
	.module("draughts")
	.factory("squarePosition", squarePosition);

function squarePosition($document) {

	var squares = $document[0].querySelectorAll(".playing-square");
	var positions = [];

	squares.forEach(sq => {
		let domRect = sq.getBoundingClientRect();
		let pos = {
			left  : domRect.left,
			top   : domRect.top,
			bottom: domRect.bottom,
			right : domRect.right
		};
		positions.push({id: sq.id, pos: pos});
	});

	return {

		/**
		 * Get the neighbouring squares of one that is being moved from
		 * 
		 * @param  DOMRect domRect  the source square's positions
		 * @param  int dir direction of travel: l->r: 1; r->l: -1; king: 0
		 * @return array   objects with neighbour IDs and positions
		 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIDOMClientRect
		 */
		getNeighbours: function getNeighbours(domRect, dir) {
			let neighbours = positions.filter(function(sq) {
				return ( sq.pos.right == domRect.left && sq.pos.bottom == domRect.top )
					||	( sq.pos.left == domRect.right && sq.pos.bottom == domRect.top )
					|| 	( sq.pos.left == domRect.right && sq.pos.top == domRect.bottom )
					||	( sq.pos.right == domRect.left && sq.pos.top == domRect.bottom );
			});

			// king moves any direction
			if (dir !== 0) {
				neighbours = neighbours.filter(function(sq) {
					return dir > 0
						? sq.pos.right > domRect.right
						: sq.pos.left < domRect.left;
				});
			}

			return neighbours;
		},

		/**
		 * Get the neighbouring squares of one that is being moved from
		 * 
		 * @param  Int id  the source square id
		 * @param  Int dir direction of travel: l->r: 1; r->l: -1; king: 0
		 * @return Array   objects with neighbour IDs and positions
		 */
		getNeighboursFromId: function getNeighboursFromId(id, dir) {
			console.log(id);
			let sq = $document[0].querySelector(`#${id}`);
			let domRect = sq.getBoundingClientRect();
			return this.getNeighbours(domRect);
		},

		/**
		 * Check whether square landed on is opponent's first row
		 * 
		 * @param  String  id square ID
		 * @return Boolean  is, or is not
		 */
		isKingsRow: function isKingsRow(id) {
			let index = parseFloat(id.substr(2));
			let mod = (index + 8) % 8;
			return mod == 1 || mod == 0;
		}
	}
}