(function() {
	"use strict";

	angular
		.module("draughts")
		.factory("gameDataService", gameDataService);

	function gameDataService($document, $window) {

		var data        = [];
		var positions   = [];
		var subscribers = {};

		var service     = {
			initData  : initData,
			getData   : getData,
			subscribe : subscribe,
			move      : move,
			remove    : remove,
			crown     : crown,
			isEmpty   : isEmpty,
			isOpponent: isOpponent
		};


		return service;


		/**
		 * @name		initData
		 * @desc		initialises the data with game pieces
		 * 
		 * @param  int numSquares
		 * @param  int numPieces
		 * @return array
		 */
		function initData(numSquares, numPieces) {

			data = [];

			let fillSize = numSquares - (numPieces * 2);
			
			let blacks   = _populatePieces(numPieces, "black");
			let filler   = Array.apply(null, Array(fillSize)).map(function () {});
			let whites   = _populatePieces(numPieces, "white");

			data = data.concat(blacks, filler, whites);

			return data;
		}


		/**
		 * @name		getData
		 * @desc		fetches the data
		 * 
		 * @return	array
		 */
		function getData() {
			return data;
		}



		/**
		 * @name		subscribe
		 * @desc		adds callback to be run when data changes
		 * 
		 * @param  string   key
		 * @param  Function callback
		 * @return void
		 */
		function subscribe(key, callback) {
			subscribers[key] = callback;
		}



		/**
		 * @name		move
		 * @desc		moves a game-piece
		 * 
		 * @param		string	fromId	the ID of the originating square
		 * @param		string	toId 		the ID of the destination square.
		 * @return	void
		 */
		function move(fromId, toId) {
			_update(fromId, toId);
		}



		/**
		 * @name		remove
		 * @desc		removes a game-piece
		 * 
		 * @param		string	fromId	the ID of the square to remove from
		 * @return	void
		 */
		function remove(fromId) {
			_update(fromId);
		}


		/**
		 * @name		crown
		 * @desc		makes a given game piece a king
		 * 
		 * @param  String		sqId	the ID of the square the piece is occupying
		 * @return void
		 */
		function crown(sqId) {
			let index = _indexFromId(sqId);
			let piece = data[index];

			if (piece) {
				piece.king = true;
				data[index] = piece;

				_notifySubscribers();
			}
		}


		/**
		 * @name		isEmpty
		 * @desc		checks whether a position is occupied
		 * 
		 * @param  String		sqId	square element.id
		 * @return Boolean				is, or is not
		 */
		function isEmpty(sqId) {
			let index = _indexFromId(sqId);

			return data[index] === undefined;
		}


		/**
		 * @name		isOpponent
		 * @desc		checks whether the piece occupying a given
		 *        	position belongs to the opponnent
		 *        	
		 * @param		string  id			the square's element.id
		 * @param		string  shade		the shade of the moving piece: black or white
		 * @return	boolean					is, or is not - or undefined
		 */
		function isOpponent(sqId, shade) {
			let index = _indexFromId(sqId);
			let piece = data[index];

			if (piece) {
				return piece.shade !== shade;
			}

			return undefined;
		}



		/**
		 * @name		_update
		 * @desc		updates the game-piece data
		 * 
		 * @param		string	fromId	the ID of the originating square
		 * @param		string	toId 		the ID of the destination square.
		 *                       		If empty game-piece is removed from the board.
		 * @return	void
		 */
		function _update(fromId, toId) {
			let fromIndex = _indexFromId(fromId);			

			if ( fromIndex > -1 ) {
				let piece = data[fromIndex];

				data[fromIndex] = undefined;

				// the piece may have been removed as opposed to moved
				if (toId) {
					let toIndex = _indexFromId(toId);

					if ( toIndex > -1 ) {
						data[toIndex] = piece;
					}
				}

				_notifySubscribers();
			}
		}



		/**
		 * @name		_notifySubscribers
		 * @desc		
		 * @return void
		 */
		function _notifySubscribers() {

			angular.forEach(subscribers, function(callback, key) {
				callback();
			});
		}



		/**
		 * @name		_populatePieces
		 * @desc		adds game-pieces to the data
		 * 
		 * @param  int			numPieces
		 * @param  string		shade
		 * @return array
		 */
		function _populatePieces(numPieces, shade) {

			let arr = Array.apply(null, Array(numPieces)).map(function (el, idx) {
				let oneBasedIndex = idx + 1;
				return {
					id       : `${shade}${oneBasedIndex}`,
					shade    : shade,
					direction: shade == "white" ? -1 : 1		// hacky
				};
			});

			return arr;
		}



		/**
		 * @name		_indexFromId
		 * @desc		extracts the data index from a square's ID
		 * @param		string	id	the square's ID
		 * @return	int					the array index
		 */
		function _indexFromId(id) {
			// subtracting one to make it zero-based
			return parseInt( id.substring(2) ) - 1;
		}

	}

}());