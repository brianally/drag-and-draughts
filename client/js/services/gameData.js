(function() {
	"use strict";

	angular
		.module("draughts")
		.factory("gameDataService", ["$q", "GamePiece", gameDataService]);

	function gameDataService($q, GamePiece) {

		var data        = [];
		var positions   = [];
		var subscribers = {};

		var service     = {
			initData  : initData,
			getData   : getData,
			update    : update,
			isEmpty   : isEmpty,
			isOpponent: isOpponent
		};


		return service;


		/**
		 * @name		initData
		 * @summary	initialises the data with game pieces
		 * 
		 * @param  int numSquares
		 * @param  int numPieces
		 * @return array
		 */
		function initData(numSquares, numPieces) {
			var deferred = $q.defer();

			data = [];

			let fillSize = numSquares - (numPieces * 2);
			
			let blacks   = _populatePieces(numPieces, "black");
			let filler   = Array.apply(null, Array(fillSize)).map(function () {});
			let whites   = _populatePieces(numPieces, "white");

			data = data.concat(blacks, filler, whites);

			deferred.resolve(data);

			return deferred.promise;
		}


		/**
		 * @name		update
		 * @summary	updates the game data
		 * @desc		an object containing the GamePiece that moved
		 * 					and the moves made is passed in. The method
		 * 					loops over the moves, rearranging where the 
		 * 					GamePiece is stored in the data.
		 *        	
		 * @param  Object		moveData
		 * @return Promise
		 */
		function update(moveData) {
			var deferred = $q.defer();

			if ( Object.prototype.toString.call(moveData.moves) !== "[object Array]" || !moveData.moves.length ) {
				deferred.reject( "no moves to make!" );
			}

			try {				
				moveData.moves.forEach(m => {

					_update(moveData.gamePiece, m);

				});

				deferred.resolve(data);
			}
			catch(e) {
				deferred.reject( e.getMessage() );
			}

			return deferred.promise;
		}



		/**
		 * @name		getData
		 * @summary		fetches the data
		 * 
		 * @return	array
		 */
		function getData() {
			return data;
		}




		/**
		 * @name		isEmpty
		 * @summary		checks whether a position is occupied
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
		 * @summary		checks whether the piece occupying a given
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
		 * @summary	updates the game-piece data
		 * 
		 * @param		string	fromId	the ID of the originating square
		 * @param		string	toId 		the ID of the destination square.
		 *                       		If empty game-piece is removed from the board.
		 * @return	void
		 * @throws	Exception				If the array index cannot be found from the ID
		 */
		function _update(gamePiece, move) {
			let indexFrom     = _indexFromId( move.source );
			let indexTo       = _indexFromId( move.destination );
			let indexCaptured = _indexFromId( move.captured );

			if ( indexFrom > -1 && indexTo > -1 ) {

				data[indexTo]   = gamePiece;
				data[indexFrom] = undefined;

				if ( indexCaptured > -1 ) {

					data[indexCaptured] = undefined;

				}

			}
			else {
				throw new Exception(`index not found from square IDs: ${move.source} ${move.destination}`);
			}
		}


		/**
		 * @name		_populatePieces
		 * @summary		adds game-pieces to the data
		 * 
		 * @param  int			numPieces
		 * @param  string		shade
		 * @return array
		 */
		function _populatePieces(numPieces, shade) {

			let arr = Array.apply(null, Array(numPieces)).map(function (el, idx) {
				let oneBasedIndex = idx + 1;

				return new GamePiece(oneBasedIndex, shade);
			});

			return arr;
		}



		/**
		 * @name		_indexFromId
		 * @summary		extracts the data index from a square's ID
		 * @param		string	id	the square's ID
		 * @return	int					the array index
		 */
		function _indexFromId(id) {

			if ( typeof id !== "string" ) {
				return -1;
			}

			// subtracting one to make it zero-based
			return parseInt( id.substring(2) ) - 1;
		}

	}

}());