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
				sqId   : "@",
				piece  : "=",
				move   : "&",
				capture: "&",
				king   : "&"
			},
			replace   : true,
			template  : template,
			controller: PlayingSquareController,
			link      : playingSquareLink
		}



		return directive;




		/**
		 * @name	playingSquareLink
		 * @desc	Directive post-link function
		 * 
		 * @param  {Scope} scope
		 * @param  {Element} element
		 * @return {Void}
		 */
		function playingSquareLink(scope, element, attrs, controller) {
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
				let moveTaken = {};
				let data      = getDataTransfer(evt);
				let gamePiece = $document[0].querySelectorAll(`#${data.pieceId}`).item(0);

				if (evt.stopPropagation) evt.stopPropagation();
				if (evt.preventDefault) evt.preventDefault();

				// data.moves holds all possible moves for the piece. 
				// Extract the one for this square.
				moveTaken = data.moves.filter(m => {
					return m.destination == evt.target.id;
				})[0];

				if (moveTaken) {
				
					evt.dataTransfer.dropEffect = "move";
					this.classList.remove("over");

					scope.move()(data.sourceId, moveTaken.destination);


					// If a piece was jumped, handle that
					if ( moveTaken.jumped ) {
						scope.capture()(moveTaken.jumped);
					}

					// is now king?
					if ( gamePositionService.isInCrownHead(el.id) ) {
						scope.king()(el.id);										// FIXME: feels weird being here
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
		 * @desc		tests whether a piece has a legal move from
		 *        	starting square
		 * 
		 * @param		string  id        starting square element.id
		 * @param		string		colour		white or black
		 * @param		int  		direction	1: black's initial direction;
		 *                          	-1: white's initial direction;
		 *                          	0: any direction
		 * @return	array							objects holding IDs of possible squares, with possible jumps
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

			// neighbour position keys are relative: ne, nw, se, sw; white faces "north"
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
		 * @desc		checks whether a square is empty
		 * 
		 * @param		string  id			the square's element.id
		 * @return	boolean					is, or is not
		 */
		function isEmptySquare(id) {
			let gamePiece = getPieceOnSquare(id);

			return gamePiece === false;
		}



		/**
		 * @name		isOpponent
		 * @desc		checks whether the piece occupying a given
		 *        	square belongs to the opponnent.
		 *        	
		 * @param		string  id			the square's element.id
		 * @param		string  colour	the colour of the MOVING piece
		 * @return	boolean					is, or is not
		 */
		function isOpponent(id, colour) {
			let gamePiece = getPieceOnSquare(id);

			if (gamePiece) {
				return !gamePiece.classList.contains(colour);
			}

			return false;
		}



		/**
		 * @name		getPieceOnSquare
		 * @desc		gets the game-piece element occupying a given square
		 * 
		 * @param		string sqId square id
		 * @return	mixed				DOM element or false if square empty
		 */
		function getPieceOnSquare(sqId) {
			let el        = $document[0].querySelector(`#${sqId}`);
			let gamePiece = el.querySelector(".game-piece");

			if (gamePiece) {
				return gamePiece;
			}
			return false;
		}

	}
	
}());
