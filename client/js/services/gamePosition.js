(function() {
	"use strict";

	angular
		.module("draughts")
		.factory("gamePositionService", ["$document", "$window", gamePositionService]);

	function gamePositionService($document, $window) {

		var positions = [];

		var service   = {
			getPosition             : getPosition,
			getMoves                : getMoves,
			getNeighbours           : getNeighbours,
			getNeighboursFromId     : getNeighboursFromId,
			getNeighbourIdOpposite  : getNeighbourIdOpposite,
			getNeighbourIdAtPosition: getNeighbourIdAtPosition,
			getPieceOnSquare        : getPieceOnSquare,
			isOpponent              : isOpponent,
			isEmptySquare           : isEmptySquare,
			isInCrownHead           : isInCrownHead
		};

		// directives don't exist yet!
		// _init();

		return service;


		/**
		 * @name	_init
		 * @desc	collect positions of all squares
		 * 
		 * @return {Array}
		 */
		function _init() {

			let squares = $document[0].querySelectorAll(".playing-square");

			squares.forEach(sq => {
				let domRect = sq.getBoundingClientRect();
				let pos     = {};

				// The updated CSS for the square sizes uses percent to several
				// decimal places to allow for a proportional game board.
				// But this causes the DOMRect to similarly use high precision,
				// which means that the corner positions of adjoining squares
				// no longer match without rounding.
				// 
				// DOMRect (from getBoundingClientRect) is getter-only so we
				// cannot update in place.
				for (let side in domRect) {
					pos[side] = Math.round(domRect[side]);
				}

				positions.push({ id: sq.id, pos: pos });
			});

			angular.element($window).bind('resize', _init);
		}



		/**
		 * @name		getPosition
		 * @desc		text() the position object for a given square
		 * 
		 * @param  {String} id		the square element.id
		 * @return {Object}   
		 */
		function getPosition(id) {
			if ( !positions.length ) _init();	// hacky!

			return positions.filter(p => {
				return p.id == id;
			})[0];
		}



		/**
		 * @name		getMoves
		 * @desc		tests whether a piece has a legal move from
		 *        	starting square
		 * 
		 * @param		string  id        starting square element.id
		 * @param		string		colour		white or black
		 * @param		int  		direction	1: black's initial direction;
		 *                          	-1: white's initial direction;
		 *                          	0: any direction
		 * @return	array							objects holding IDs of possible squares, with possible jumps
		 */
		function getMoves(id, colour, direction) {
			var moves             = [];
			var directionsToCheck = [];
			let neighbours        = this.getNeighboursFromId(id, direction);

			// fugly!
			switch (direction) {
				case 1:
					directionsToCheck = ["s"];
					break;
				case -1:
					directionsToCheck = ["n"];
					break;
				case 0:
				default:
					directionsToCheck = ["n", "s"];
			}

			// neighbour position keys are relative: ne, nw, se, sw; white faces "north"
			["e", "w"].forEach(h => {

				directionsToCheck.forEach(v => {
					let key = `${v}${h}`;
					let sq  = neighbours[key];

					// if starting square is along edge neighbour[key] may not exist
					if (sq) {
						if ( this.isEmptySquare(sq.id) ) {
							moves.push({ destination: sq.id });
						}
						else if ( this.isOpponent(sq.id, colour) ) {
							// can opponent be jumped?
							let jumpSqId = this.getNeighbourIdOpposite(id, sq.id);

							if (jumpSqId != null) {	// possible if edge of game board

								if ( this.isEmptySquare(jumpSqId) ) {
									moves.push({ destination: jumpSqId, jumped: sq.id });
								}
							}
						}
					}					
				});

			});
			return moves;
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
			if ( !positions.length ) _init();	// sacky!

			let neighbours         = [];
			let neighboursRelative = {};

			neighbours = positions.filter(sq => {
				return ( sq.pos.right == domRect.left && sq.pos.bottom == domRect.top )
					||	( sq.pos.left == domRect.right && sq.pos.bottom == domRect.top )
					|| 	( sq.pos.left == domRect.right && sq.pos.top == domRect.bottom )
					||	( sq.pos.right == domRect.left && sq.pos.top == domRect.bottom );
			});

// return all for now
			// king moves any direction
			// if (dir !== 0) {
			// 	neighbours = neighbours.filter(sq => {
			// 		return dir > 0
			// 			? sq.pos.right > domRect.right
			// 			: sq.pos.left < domRect.left;
			// 	});
			// }


			// reiterate to give relative directions
			neighbours.forEach(sq => {
				if ( sq.pos.right == domRect.left && sq.pos.bottom == domRect.top ) {

					neighboursRelative.nw = sq;

				} else if ( sq.pos.left == domRect.right && sq.pos.bottom == domRect.top ) {

					neighboursRelative.ne = sq;

				} else if ( sq.pos.left == domRect.right && sq.pos.top == domRect.bottom ) {

					neighboursRelative.se = sq;

				} else {

					neighboursRelative.sw = sq;

				}
			});

			return neighboursRelative;
		}



		/**
		 * @name	getNeighboursFromId
		 * @desc	Get the neighbouring squares of one that is being moved from
		 * 
		 * @param  {String}		id  the source element.id
		 * @param  {Int}		dir direction of travel: l->r: 1; r->l: -1; king: 0
		 * @return {Array}  objects with neighbour IDs and positions
		 */
		function getNeighboursFromId(id, dir) {
			let sq      = $document[0].querySelector(`#${id}`);
			let domRect = sq.getBoundingClientRect();
			let pos     = {};

			// see comment in init()
			for (let side in domRect) {
				pos[side] = Math.round(domRect[side]);
			}

			return this.getNeighbours(pos, dir);
		}




		/**
		 * @name		getNeighbourIdOpposite
		 * @desc		Fetch the ID for the square in line
		 * 					with starting square and between square
		 * 					
		 * @param  {String} idStart   element.id
		 * @param  {String} idBetween element.id
		 * @return {String}           element.id or null
		 */
		function getNeighbourIdOpposite(idStart, idBetween) {

			let startSq          = this.getPosition(idStart);
			let betweenSq        = this.getPosition(idBetween);
			let destinationSides = {};
			let opposing         = "";
			let opposites        = {
				"bottom": "top",
				"left"  : "right",
				"right" : "left",
				"top"   : "bottom"
			};

			// got to be a better way
			for (let k in startSq.pos) {
				opposing = opposites[k];

				if (startSq.pos[k] == betweenSq.pos[opposing]) {
					// Corners meet. If k is "left", destination's "right"
					// will equal between's "left", and so on
					destinationSides[opposing] = betweenSq.pos[k];
				}
			}

			return this.getNeighbourIdAtPosition(destinationSides);
		}



		/**
		 * @name		getNeighbourIdAtPosition
		 * @desc		Fetch the ID of the square at a given position
		 * 
		 * @param		Object sides	one or more positions to check
		 * @return	String				the square's element.id
		 */
		function getNeighbourIdAtPosition(sides) {
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
		 * @name		getPieceOnSquare
		 * @desc		gets the game-piece element occupying a given square
		 * 
		 * @param		string sqId square id
		 * @return	mixed				DOM element or false if square empty
		 */
		function getPieceOnSquare(sqId) {
			let el        = $document[0].querySelector(`#${sqId}`);
			let gamePiece = el.querySelector(".game-piece");

			if (gamePiece) {
				return gamePiece;
			}
			return false;
		}


		/**
		 * @name		isEmptySquare
		 * @desc		checks whether a square is empty
		 * 
		 * @param		string  id			the square's element.id
		 * @return	boolean					is, or is not
		 */
		function isEmptySquare(id) {
			let gamePiece = this.getPieceOnSquare(id);

			return gamePiece === false;
		}


		/**
		 * @name		isOpponent
		 * @desc		checks whether the piece occupying a given
		 *        	square belongs to the opponnent.
		 *        	
		 * @param		string  id			the square's element.id
		 * @param		string  colour	the colour of the MOVING piece
		 * @return	boolean					is, or is not
		 */
		function isOpponent(id, colour) {
			let gamePiece = this.getPieceOnSquare(id);

			if (gamePiece) {
				return !gamePiece.classList.contains(colour);
			}

			return false;
		}



		/**
		 * @name		isInCrownHead
		 * @desc		checks whether a square is in first row
		 * 
		 * @param		String  id square element.id
		 * @return	Boolean  is, or is not
		 */
		function isInCrownHead(id) {
			let index = parseFloat(id.substr(2));	// id is eg. sq1, sq22, etc.

			return ( index >= 1 && index <= 4 ) || ( index >= 29 && index <= 32 );
		}
	}


}());

