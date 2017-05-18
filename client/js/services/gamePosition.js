(function() {
	"use strict";

	let injections = [
		"$document",
		"$window",
		"BoardMove",
		"gameDataService",
		gamePositionService
	];

	angular
		.module("draughts")
		.factory("gamePositionService", injections);

	function gamePositionService($document, $window, BoardMove, gameData) {

		var boardPos  = {};
		var positions = [];
		var lastMove  = {};
		
		var service   = {
			init                    : init,
			getPosition             : getPosition,
			getMoves                : getMoves,
			getNeighbours           : getNeighbours,
			getNeighboursFromId     : getNeighboursFromId,
			getNextNeighbourId      : getNextNeighbourId,
			getNeighbourIdAtPosition: getNeighbourIdAtPosition,
			getLastMove             : getLastMove,
			setLastMove             : setLastMove,
			isOccupied              : isOccupied,
			isInCrownHead           : isInCrownHead
		};

		return service;


		/**
		 * @name	init
		 * @summary	collects positions of all squares
		 * 
		 * @return {Array}
		 */
		function init() {

			let board     = $document[0].querySelector("#game-board");
			let boardRect = board.getBoundingClientRect();
			let squares   = $document[0].querySelectorAll(".playing-square");
			
			boardPos = _roundRect(boardRect, boardPos);

			squares.forEach(sq => {
				let domRect = sq.getBoundingClientRect();
				let pos     = _roundRect(domRect);

				positions.push({ id: sq.id, pos: pos });
			});

			angular.element($window).bind('resize', init);
		}



		/**
		 * @name		getPosition
		 * @summary	gets the position object for a given square
		 * 
		 * @param  {String} id		the square element.id
		 * @return {Object}   
		 */
		function getPosition(id) {

			return positions.filter(p => {
				return p.id == id;
			})[0];
		}



		/**
		 * @name		getMoves
		 * @summary	tests whether a piece has a legal move from
		 *        	starting square
		 * 
		 * @param		String  sourceId	starting square element.id
		 * @param		String	shade			white or black
		 * @param		Int  		direction	1: black's initial direction;
		 *                          	-1: white's initial direction;
		 *                          	0: any direction
		 * @param		Boolean	mustJump	If previously captured a piece the next move must be a jump
		 *  
		 * @return	array							objects holding IDs of possible squares, with possible jumps
		 */
		function getMoves(sourceId, shade, direction, mustJump) {
			let moves             = [];
			let directionsToCheck = [];
			let neighbours        = this.getNeighboursFromId(sourceId, direction);

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
					let move;
					let key  = `${v}${h}`;
					let sq   = neighbours[key];

					// if starting square is along edge neighbour[key] may not exist
					if (sq) {

						if ( gameData.isEmpty(sq.id) && !mustJump ) {
							
							move = new BoardMove( sourceId, sq.id );
							moves.push( move );
						}
						else if ( gameData.isOpponent(sq.id, shade) ) {

							// can opponent be jumped?
							let jumpSqId = this.getNextNeighbourId(sourceId, sq.id);

							if ( jumpSqId != null ) {	// if not at edge of game board

								if ( gameData.isEmpty(jumpSqId) ) {

									move = new BoardMove( sourceId, jumpSqId, sq.id );
									moves.push( move );
								}
							}
						}
					}					
				});

			});
			return moves;
		}


		/**
		 * @name		getNeighbours
		 * @summary	Get the neighbouring squares of one that is being moved from
		 * 
		 * @param		DOMRect source  the source square's positions
		 * @param		Int			dir			direction of travel: l->r: 1; r->l: -1; king: 0
		 * @return	Array  				objects with neighbour IDs and positions
		 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/nsIDOMClientRect
		 */
		function getNeighbours(source, dir) {

			let neighbours         = [];
			let neighboursRelative = {};

			// filter for immediate neighbours
			neighbours = positions.filter(dest => {
				return ( dest.pos.right == source.left && dest.pos.bottom == source.top )
					||	( dest.pos.left == source.right && dest.pos.bottom == source.top )
					|| 	( dest.pos.left == source.right && dest.pos.top == source.bottom )
					||	( dest.pos.right == source.left && dest.pos.top == source.bottom );
			});


			// filter for direction unless king
			if (dir !== 0) {
				neighbours = neighbours.filter(dest => {
					return dir > 0
						? dest.pos.top > source.top
						: dest.pos.top < source.top;
				});
			}


			// reiterate to give relative directions
			neighbours.forEach(dest => {
				if ( dest.pos.right == source.left && dest.pos.bottom == source.top ) {

					neighboursRelative.nw = dest;

				} else if ( dest.pos.left == source.right && dest.pos.bottom == source.top ) {

					neighboursRelative.ne = dest;

				} else if ( dest.pos.left == source.right && dest.pos.top == source.bottom ) {

					neighboursRelative.se = dest;

				} else {

					neighboursRelative.sw = dest;

				}
			});

			return neighboursRelative;
		}



		/**
		 * @name		getNeighboursFromId
		 * @summary	gets the neighbouring squares of one that is being moved from
		 * 
		 * @param  String		id  the source element.id
		 * @param  Int			dir direction of travel: l->r: 1; r->l: -1; king: 0
		 * @return Array  			objects with neighbour IDs and positions
		 */
		function getNeighboursFromId(id, dir) {
			let sq      = $document[0].querySelector(`#${id}`);
			let domRect = sq.getBoundingClientRect();
			let pos     = _roundRect(domRect);

			return this.getNeighbours(pos, dir);
		}




		/**
		 * @name		getNextNeighbourId
		 * @summary	fetches the ID for the next square in line
		 * 					with starting square and between square
		 * 					
		 * @param  String idStart   element.id
		 * @param  String idBetween element.id
		 * @return String           element.id or null
		 */
		function getNextNeighbourId(idStart, idBetween) {

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
		 * @summary	fetches the ID of the square at a given position
		 * 
		 * @param		Object sides	one or more positions to check
		 * @return	String				the square's element.id
		 */
		function getNeighbourIdAtPosition(sides) {

			let neighbour = positions.filter(p => {
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

		function getLastMove() {
			return lastMove;
		}

		function setLastMove(move) {
			lastMove = move;
		}


		/**
		 * @name		isOccupied
		 * @summary	checks whether a square is occupied
		 * 
		 * @param		String		sqId	square element.id
		 * @return	Boolean					is, or is not
		 */
		function isOccupied(sqId) {
			return !gameData.isEmpty(sqId);
		}



		/**
		 * @name		isInCrownHead
		 * @summary	checks whether a square is in first row
		 * 
		 * @param		String		sqId	square element.id
		 * @return	Boolean					is, or is not
		 */
		function isInCrownHead(sqId) {

			let sq = positions.filter(function(s) {
				return s.id == sqId;
			})[0];

			if (sq) {
				return ( sq.pos.top == boardPos.top || sq.pos.bottom == boardPos.bottom );
			}

			return false;
		}



		/**
		 * @name		_roundRect
		 * @summary	rounds the values of a DomRect
		 * @desc		The CSS for the square sizes uses percent to several
		 *        	decimal places to allow for a proportional game board.
		 *        	But this causes the DOMRect to similarly use high precision,
		 *        	which means that the corner positions of adjoining squares
		 *        	no longer match without rounding.
		 *        	
		 *        	DOMRect (from getBoundingClientRect) is getter-only so we
		 *        	cannot update in place.
		 * 
		 * @param  ClientRect	domRect
		 * @param  Object			proxy			an empty vailla object
		 * @return Object
		 */
		function _roundRect(domRect, proxy) {

			if ( proxy == undefined ) {
				proxy = {};
			}

			for (let side in domRect) {
				proxy[side] = Math.round( domRect[side] );
			}

			return proxy;
		}
	}

}());

