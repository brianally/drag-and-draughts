(function() {
	"use strict";

	angular
		.module("draughts")
		.factory("squarePositionService", squarePositionService);

	function squarePositionService($document) {

		var squares = [];
		var positions = [];

		var service = {
			getPosition           : getPosition,
			getNeighbours         : getNeighbours,
			getNeighboursFromId   : getNeighboursFromId,
			getNeighbourIdOpposite: getNeighbourIdOpposite,
			getNeighbourIdAt      : getNeighbourIdAt,
			isKingsRow            : isKingsRow
		};

		init();

		return service;

		/**
		 * @name	init
		 * @desc	collect positions of all squares
		 * 
		 * @todo	Handle window resize!
		 * 
		 * @return {Array}
		 */
		function init() {
			squares = $document[0].querySelectorAll("playing-square");
			squares.forEach(sq => {
				let domRect = sq.getBoundingClientRect();
				let pos = {
					left  : domRect.left,
					top   : domRect.top,
					bottom: domRect.bottom,
					right : domRect.right
				};
				positions.push({ id: sq.id, pos: pos });
			});
		}


		/**
		 * @name		getPosition
		 * @desc		text() the position object for a given square
		 * 
		 * @param  {Int} id		the square element.id
		 * @return {Object}   
		 */
		function getPosition(id) {
			return positions.filter(p => {
				return p.id == id;
			})[0];
		}


		/**
		 * @name	getNeighbours
		 * @desc	Get the neighbouring squares of one that is being moved from
		 * 
		 * @param	{DOMRect} domRect  the source square's positions
		 * @param	{Int}			dir direction of travel: l->r: 1; r->l: -1; king: 0
		 * @return {Array}  objects with neighbour IDs and positions
		 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIDOMClientRect
		 */
		function getNeighbours(domRect, dir) {
			let neighbours = positions.filter(sq => {
				return ( sq.pos.right == domRect.left && sq.pos.bottom == domRect.top )
					||	( sq.pos.left == domRect.right && sq.pos.bottom == domRect.top )
					|| 	( sq.pos.left == domRect.right && sq.pos.top == domRect.bottom )
					||	( sq.pos.right == domRect.left && sq.pos.top == domRect.bottom );
			});

			// king moves any direction
			// if (dir !== 0) {
			// 	neighbours = neighbours.filter(sq => {
			// 		return dir > 0
			// 			? sq.pos.right > domRect.right
			// 			: sq.pos.left < domRect.left;
			// 	});
			// }

			// reiterate to give directions
			let neighboursRelative = {};

			neighbours.forEach(sq => {
				if ( sq.pos.right == domRect.left && sq.pos.bottom == domRect.top ) {

					neighboursRelative.rtlu = sq;

				} else if ( sq.pos.left == domRect.right && sq.pos.bottom == domRect.top ) {

					neighboursRelative.ltru = sq;

				} else if ( sq.pos.left == domRect.right && sq.pos.top == domRect.bottom ) {

					neighboursRelative.ltrd = sq;

				} else {

					neighboursRelative.rtld = sq;

				}
			});

			return neighboursRelative;
		}


		/**
		 * @name	getNeighboursFromId
		 * @desc	Get the neighbouring squares of one that is being moved from
		 * 
		 * @param  {Int}		id  the source square id
		 * @param  {Int}		dir direction of travel: l->r: 1; r->l: -1; king: 0
		 * @return {Array}  objects with neighbour IDs and positions
		 */
		function getNeighboursFromId(id, dir) {
			let sq      = $document[0].querySelector(`#${id}`);
			let domRect = sq.getBoundingClientRect();

			return this.getNeighbours(domRect, dir);
		}


		function getNeighbourIdOpposite(idStart, idBetween) {

			let startSq          = this.getPosition(idStart);
			let betweenSq        = this.getPosition(idBetween);
			let destinationSides = {};
			let oppositeKey      = "";

			// got to be a better way
			for (let k in startSq.pos) {
				oppositeKey = getOpposite(k);

				if (startSq.pos[k] == betweenSq.pos[oppositeKey]) {
					// Corners meet. If k is "left", destination's "right"
					// will equal between's "left", and so on
					destinationSides[oppositeKey] = betweenSq.pos[k];
				}
			}

			return this.getNeighbourIdAt(destinationSides);
		}


		/**
		 * @name		getNeighbourIdAt
		 * @desc		Fecth the ID of the square at a given position
		 * @param  {Object} sides	one or more positions to check
		 * @return {Int}    the square's element.id
		 */
		function getNeighbourIdAt(sides) {
			let neighbour;

			neighbour = positions.filter(p => {
				for (let s in sides) {
					if (p.pos[s] !== sides[s]) return false;
				}
				return true;
			});

			if (neighbour[0] && neighbour[0].id) {
				return neighbour[0].id;
			}

			return null;
		}



		/**
		 * @name	isKingsRow
		 * @desc	Check whether square landed on is opponent's first row
		 * 
		 * @param  {String}  id square ID
		 * @return {Boolean}  is, or is not
		 */
		function isKingsRow(id) {
			let index = parseFloat(id.substr(2));	// id is eg. sq1, sq22, etc.
			let mod   = (index + 8) % 8;

			return mod == 1 || mod == 0;
		}


		function getOpposite(str) {
			let opposite = "";
			switch (str) {
					case "bottom":
						opposite = "top";
						break;
					case "left":
						opposite = "right";
						break;
					case "right":
						opposite = "left";
						break;
					case "top":
						opposite = "bottom";
						break;
					default:

				}
				return opposite;
		}
	}


}());