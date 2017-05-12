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
			update   : update
		};


		return service;

		function initData(numSquares, numPieces) {

			data = [];

			let fillSize = numSquares - (numPieces * 2);
			
			let blacks   = _populatePieces(numPieces, "black");
			let filler   = Array.apply(null, Array(fillSize)).map(function () {});
			let whites   = _populatePieces(numPieces, "white");

			data = data.concat(blacks, filler, whites);

			return data;
		}

		function getData() {
			return data;
		}


		function subscribe(key, callback) {
			subscribers[key] = callback;
		}

		function update(fromId, toId) {
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

		function _notifySubscribers() {

			angular.forEach(subscribers, function(callback, key) {
				callback();
			});
		}


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

		function _indexFromId(id) {
			return parseInt( id.substring(2) ) - 1;
		}

	}

}());