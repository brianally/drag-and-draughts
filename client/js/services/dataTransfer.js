(function() {
	"use strict";

	angular
		.module("draughts")
		.factory("dataTransferService", dataTransferService);

	function dataTransferService() {

		var positions = [];
		var txtFormat = "text/plain";

		var service   = {
			getData         : getData,
			clearData       : clearData,
			setData         : setData,
			setAllowedEffect: setAllowedEffect,
			setDropEffect   : setDropEffect,
			setDragImage    : setDragImage
		};

		return service;

		/**
		 * @name		getDataTransfer
		 * @summary		gets the Event.dataTransfer and parses it
		 * 
		 * @param  Event		evt
		 * @return Object		JSON
		 */
		function getData(evt, format) {
			
			format = format || txtFormat;

			let data = evt.dataTransfer.getData(format);

			if ( data && format === txtFormat) {
				data = JSON.parse(data);
			}

			return data;
		}



		function clearData(evt) {
			evt.dataTransfer.clearData();
		}



		function setData(evt, data, format) {
			
			format = format || txtFormat;

			if ( format === txtFormat ) {
				data = JSON.stringify(data);
			}

			evt.dataTransfer.setData(format, data);
		}



		function setAllowedEffect(evt, effect) {
			evt.dataTransfer.effectAllowed = effect;
		}



		function setDropEffect(evt, effect) {
			evt.dataTransfer.dropEffect = effect;
		}



		function setDragImage(evt, img, x, y) {

			if ( typeof img === "string" ) {
				let src = img;
				img = new Image();
				img.src = src;
			}

			if ( typeof x === "object" ) {
				let coords = x;
				x = coords.x;
				y = coords.y;
			}
			else if ( typeof x === "array" ) {
				let coords = x;
				x = coords[0];
				y = coords[1];
			}

			evt.dataTransfer.setDragImage(img, x, y);
		}
	}
}());