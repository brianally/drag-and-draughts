(function() {
	"use strict";

	angular
		.module("draughts")
		.directive("playingSquare", ["squarePositionService", playingSquare]);


	function playingSquare(squarePositionService) {

		var directive = {
			restrict    : "E",
			controllerAs: "vm",
			controller  : PlayingSquareController,
			compile     : compile
		}

		return directive;

		/**
		 * @name		compile
		 * @desc		Removes empty text nodes from template to make it easier
		 *        	to test whether a given square is can be moved to.
		 *
		 * @param		{Element}	tElem
		 * @returns	{Object}
		 */
		function compile(tElem) {
			var el = tElem[0];
			
			for (let i = 0; i < el.childNodes.length; i++) {
				let child = el.childNodes[i];

				// we don't care about non-empty text nodes; they shouldn't be here
				if ( child.nodetype === 8 || child.nodeType === 3 ) {
					el.removeChild(child);
					i--;
				}
			}

			return {
				pre: preLink,
				post: postLink
			}
		}


		/**
		 * @name		preLink
		 * @desc		directive pre-link function.Unused
		 * 
		 * @param  {Scope} scope
		 * @param  {Element} iElem
		 * @return {Void}
		 */
		function preLink(scope, iElem) { }


		/**
		 * @name	postLink
		 * @desc	Directive post-link function
		 * @param  {Scope} scope
		 * @param  {Element} element
		 * @return {Void}
		 */
		function postLink(scope, element, attrs, controller) {
			var el = element[0];

			el.droppable = true;

			el.addEventListener("dragenter", dragEnter, false);
			el.addEventListener("dragover", dragOver, false);
			el.addEventListener("drop", drop, false);

			["dragleave", "dragend", "dragexit"].forEach(eventName => {
				el.addEventListener(eventName, function(evt) {
					this.classList.remove("over");
					this.classList.remove("warn");
					return false;
				}, false);
			});

			//element.on("$destroy", );
			

			/**
			 * @name		dragEnter
			 * @desc		highlight entered square,
			 *        	warn if not allowed.
			 *        	
			 * @param  {Event} evt "dragenter"
			 * @return {Boolean}   false
			 */
			function dragEnter(evt) {
				// ensure not empty
				if ( el.hasChildNodes() ) {
					this.classList.add("warn");
				} else {
					this.classList.add("over");
				}
				
				if (evt.preventDefault) evt.preventDefault();
				return false;
			}


			/**
			 * @name		dragOver
			 * @desc		Set the dropEffect
			 * 
			 * @param  {Event} evt "dragover"
			 * @return {Boolean}   false
			 */
			function dragOver(evt) {
				evt.dataTransfer.dropEffect = "move";

				if (evt.preventDefault) evt.preventDefault();
				return false;
			}


			/**
			 * @name		drop
			 * @desc		Determine whether game piece may be moved
			 *        	to this position. If moving one square, is
			 *        	it: a) empty? b)in the correct direction?
			 *        	If taking opponent's piece is it a valid jump?
			 * 
			 * @param  {Event} evt "drop"
			 * @return {Boolean}   false
			 */
			function drop(evt) {
				let data         = JSON.parse(evt.dataTransfer.getData("text/plain"));
				let gamePiece    = document.getElementById(data.gamePieceId);
				let sourceSquare = document.getElementById(data.sourceId);
				
				if (evt.stopPropagation) evt.stopPropagation();
				if (evt.preventDefault) evt.preventDefault();

				evt.dataTransfer.dropEffect = "move";

				this.classList.remove("over");


				// ensure not empty
				if ( !el.hasChildNodes() ) {


					this.appendChild(gamePiece);

					// must tell sibling square to empty itself of text nodes
					

					// is now king?
					if (squarePositionService.isKingsRow(el.id)) {
						gamePiece.classList.add("king");										// FIXME: move to gamePiece
					}
				}
				
				
				this.classList.remove("warn"); // why is this necessary?

				return false;
			}
		}
	}

	PlayingSquareController.$inject = ["$scope"];

	/**
	 * @name	PlayingSquareController
	 * @desc	
	 * @param {Scope} $scope
	 */
	function PlayingSquareController($scope) {
		var vm = this;
	}
	
}());