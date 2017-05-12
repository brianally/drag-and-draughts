(function() {
	"use strict";

	angular
		.module("draughts")
		.directive("playingSquare", ["$document", "gamePositionService", playingSquare]);


	function playingSquare($document, gamePositionService) {

		var template = `<div	class="playing-square"
													id="sq{{ sqId }}"
													droppable="true">
											<game-piece	ng-if="!!piece"
												piece="piece"></game-piece>
										</div>`;


		var directive = {
			restrict    : "E",
			controllerAs: "vm",
			scope: {
				sqId  : "@",
				piece : "=",
				update: "&"
			},
			replace   : true,
			template  : template,
			controller: PlayingSquareController,
			link      : postLink
		}



		return directive;


		/**
		 * @name		compile
		 * @desc		Removes empty text nodes from template to make it easier
		 *        	to test whether a given square can be moved to.
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
				let thisMove  = {};
				let data      = getDataTransfer(evt);
				let gamePiece = $document[0].querySelectorAll(`#${data.pieceId}`).item(0);

				if (evt.stopPropagation) evt.stopPropagation();
				if (evt.preventDefault) evt.preventDefault();

				// data.moves holds all possible moves for the piece. 
				// Extract the one for this square.
				thisMove = data.moves.filter(m => {
					return m.destination == evt.target.id;
				})[0];

				if (thisMove) {
				
					evt.dataTransfer.dropEffect = "move";
					this.classList.remove("over");

					// // move the DOM element
					// gamePiece.parentNode.removeChild(gamePiece);
					// this.appendChild(gamePiece);

					scope.update()(data.sourceId, thisMove.destination);


					// if a piece was jumped, handle that.
					if ( thisMove.jumped ) {
						let JumpedPiece = controller.getPieceOnSquare(thisMove.jumped);

						scope.update()(thisMove.jumped);

						// report upwards
						//scope.$emit('gamePiece.jumped', {square: jumpedSquare.id, piece: JumpedPiece.id});
					}









					// is now king?
					if ( gamePositionService.isKingsRow(el.id) ) {
						gamePiece.classList.add("king");										// FIXME: move to gamePiece directive?
					}
				}
				
				
				this.classList.remove("warn"); // why is this necessary?

				return false;
			}


			/**
			 * @name		getDataTransfer
			 * @desc		get the Event.dataTransfer
			 * 
			 * @param  {Event}		evt
			 * @return {Object}		JSON
			 */
			function getDataTransfer(evt) {
				let data    = {};
				let strData = evt.dataTransfer.getData("text/plain");

				if ( strData.length ) {
					data = JSON.parse(strData);
				}

				return data;
			}
		}
	}


	PlayingSquareController.$inject = ["$scope", "$document", "gamePositionService"];

	/**
	 * @name	PlayingSquareController
	 * @desc	
	 * @param {Scope} $scope
	 */
	function PlayingSquareController($scope, $document, positionService) {
		var vm = this;
		
		this.getMoves         = getMoves;
		this.isEmptySquare    = isEmptySquare;
		this.isOpponent       = isOpponent;
		this.getPieceOnSquare = getPieceOnSquare;


		/**
		 * @name		getMoves
		 * @desc		Test whether a piece has a legal move from
		 *        	starting square
		 * 
		 * @param  {String}		id        starting square element.id
		 * @param  {String}		colour		white or black
		 * @param  {Int}  		direction 1: left to right; -1: right to left; 0: any direction
		 * @return {Array}							Objects holding IDs of possible squares, with possible jumps
		 */
		function getMoves(id, colour, direction) {
			var moves             = [];
			var directionsToCheck = [];
			let neighbours        = positionService.getNeighboursFromId(id, direction);

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

			// neighbour position keys are relative: ltru, ltrd, rtlu, rtld
			["e", "w"].forEach(h => {

				directionsToCheck.forEach(v => {
					let key = `${v}${h}`;
					let sq  = neighbours[key];

					// if starting square is along edge neighbour[key] may not exist
					if (sq) {
						if ( vm.isEmptySquare(sq.id) ) {
							moves.push({ destination: sq.id });
						}
						else if ( vm.isOpponent(sq.id, colour) ) {
							// can opponent be jumped?
							let jumpSqId = positionService.getNeighbourIdOpposite(id, sq.id);

							if (jumpSqId != null) {	// possible if edge of game board

								if ( vm.isEmptySquare(jumpSqId) ) {
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
		 * @name		isEmptySquare
		 * @desc		Check whether a square is empty
		 * 
		 * @param  {String}  id	The square's element.id
		 * @return {Boolean}
		 */
		function isEmptySquare(id) {
			let gamePiece = getPieceOnSquare(id);

			return gamePiece === false;
		}


		/**
		 * @name		isOpponent
		 * @desc		Check whether the piece occupying a given
		 *        	square belongs to the opponnent.
		 *        	
		 * @param  {String}  id	The square's element.id
		 * @param  {String}  colour The colour of the MOVING piece
		 * @return {Boolean}
		 */
		function isOpponent(id, colour) {
			try {
				let gamePiece = getPieceOnSquare(id);

				if (gamePiece) {
					return !gamePiece.classList.contains(colour);
				}

				return false;
				
			} catch (e) {
				console.log(e.message);
			}
		}


		function getPieceOnSquare(id) {
			let el        = $document[0].querySelectorAll(`#${id}`).item(0);
			let gamePiece = el.querySelectorAll(".game-piece").item(0);

			if (gamePiece) {
				return gamePiece;
			}
			return false;
		}

	}
	
}());
