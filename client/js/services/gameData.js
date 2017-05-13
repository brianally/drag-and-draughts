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
			initData : initData,
			getData  : getData,
			subscribe: subscribe,
			move     : move,
			remove   : remove,
			king     : king
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


		function king(sqId) {
			let index = _indexFromId(sqId);
			let piece = data[index];

			if (piece) {
				piece.king = true;
				data[index] = piece;

				_notifySubscribers();
			}
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
		 * @desc		adds the game-pieces to the data
		 * 
		 * @param  int			numPieces
		 * @param  string		color
		 * @return array
		 */
		function _populatePieces(numPieces, color) {

			let arr = Array.apply(null, Array(numPieces)).map(function (el, idx) {
				let oneBasedIndex = idx + 1;
				return {
					id   : `${color}${oneBasedIndex}`,
					color: color,
					direction: color == "white" ? -1 : 1		// hacky
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