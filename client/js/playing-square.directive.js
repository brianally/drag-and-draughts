(function() {
	"use strict";

	angular
		.module("draughts")
		.directive("playingSquare", ["$document", "squarePositionService", playingSquare]);


	function playingSquare($document, squarePositionService) {

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
				pre : preLink,
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
				let gamePiece    = $document[0].querySelectorAll(`#${data.gamePieceId}`)[0];
				let sourceSquare = $document[0].querySelectorAll(`#${data.sourceId}`)[0];
				
		
		

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

	PlayingSquareController.$inject = ["$scope", "$document", "squarePositionService"];

	/**
	 * @name	PlayingSquareController
	 * @desc	
	 * @param {Scope} $scope
	 */
	function PlayingSquareController($scope, $document, squarePositionService) {
		var vm = this;
		
		this.hasMove       = hasMove;
		this.isEmptySquare = isEmptySquare;
		this.isOpponent    = isOpponent;


		/**
		 * @name		hasMove
		 * @desc		Test whether a piece has a move to make from this square
		 * 
		 * @param  {[type]}  id        [description]
		 * @param  {[type]}  colour    [description]
		 * @param  {[type]}  direction [description]
		 * @return {Boolean}           [description]
		 */
		function hasMove(id, colour, direction) {
			var canProceed        = false;
			var directionsToCheck = [];
			let neighbours        = squarePositionService.getNeighboursFromId(id, direction);
			
			// fugly!
			switch (direction) {
				case 1:
					directionsToCheck = ["ltr"];
					break;
				case -1:
					directionsToCheck = ["rtl"];
					break;
				case 0:
				default:
					directionsToCheck = ["ltr", "rtl"];
			}



			canProceed = ["d", "u"].some(v => {
				return directionsToCheck.some(h => {
					let key = `${h}${v}`;
					let sq  = neighbours[key];
console.log(`hasMove: ${key}`);
					if (vm.isEmptySquare(sq.id)) {
						return true;
					}

					// can opponent be jumped?
					if (vm.isOpponent(id, colour)) {
						console.log("is opponent");
					}
				});
			});



			return canProceed;
		}


		/**
		 * @name		isEmptySquare
		 * @desc		Check whether a square is empty
		 * 
		 * @param  {Int}  id	The square's element.id
		 * @return {Boolean}
		 */
		function isEmptySquare(id) {
			let el = $document[0].querySelectorAll(`#${id}`);

			return el && el[0].childNodes.length == 0;
		}


		/**
		 * @name	isOpponent
		 * @desc		Check whether the piece occupying a given
		 *        	square belongs to the opponnent.
		 *        	
		 * @param  {Int}  id	The square's element.id
		 * @param  {String}  colour The colour of the MOVING piece
		 * @return {Boolean}
		 */
		function isOpponent(id, colour) {
			let el = $document[0].querySelectorAll(`#${id}`)[0];

			try {
				let node = el.childNodes[0];

				return !el.classList.contains(colour);

			} catch (e) {
				console.log(e.message);
			}
		}
	}
	
}());