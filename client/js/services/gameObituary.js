(function() {
	"use strict";

	angular
		.module("draughts")
		.factory("gameObituaryService", ["$rootScope", gameObituaryService]);

	function gameObituaryService($rootScope) {

		var service = {
			announce: announce
		};

		return service;

		function announce(data) {
			$rootScope.$broadcast("the-raven", { id: data.id });
		}
	}
}());