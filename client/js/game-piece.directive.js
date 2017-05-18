(function() {
	"use strict";

	let injections = [
		"$rootScope",
		"$document",
		"$timeout",
		"gamePositionService",
		"dataTransferService",
		"gameObituaryService",
		gamePiece
	];

	angular
		.module("draughts")
		.directive("gamePiece", injections);

	function gamePiece($rootScope, $document, $timeout, gamePosition, dataTransfer, obit) {

		var template = `<div 	class="game-piece {{ piece.shade }}"
													ng-class="{'king': piece.isKing(), 'disabled': piece.shade !== inPlay, 'captured': piece.captured}"
													data-dir="{{ piece.direction }}"
													data-piece-id="{{ piece.id }}"
													draggable="true"></div>`;

		var directive = {
			restrict    : "E",
			controllerAs: "vm",
			scope: {
				piece   : "=",
				inPlay  : "@",
				delay   : "@",
				update  : "&"
			},
			replace   : true,
			template  : template,
			controller: GamePieceController,
			link      : gamePieceLink
		}

		return directive;


		/**
		 * @name		gamePieceLink
		 * @summary	Directive post-link function
		 * 
		 * @param		Scope scope
		 * @param		Element element
		 * @return	void
		 */
		function gamePieceLink(scope, element) {
			var el            = element[0];

			var possibleMoves = [];
			var movesQueue    = [];
			var timeout;

			el.draggable = true;

			el.addEventListener("dragstart", dragStart, false);
			el.addEventListener("dragend", dragEnd, false);

			scope.$on("$destroy", function() {

				_stopTheClock();
				el.removeEventListener("dragstart", dragStart, false);
				el.removeEventListener("dragend", dragEnd, false);

			});


			// ************************************* FIXME: get multiple consecutive moves working

			// highlight captured pieces as multiple consecutive
			// moves are made

			$rootScope.$on("the-raven", function(evt, data) {
				if ( data.id == scope.piece.id ) {
					scope.piece.captured = true;
					console.log("captured: ", data.id);
				}
			});

			

			/**
			 * @name		dragStart
			 * @summary	stops the timeout clock if it's running (if a previous
			 *          move captured an opposing piece) and checks for possible moves
			 * 
			 * @param  DragEvent	evt
			 * @return void
			 */
			function dragStart(evt) {

				if ( !el.classList.contains( scope.inPlay ) ) {
					evt.preventDefault();
					return;
				}

				// kill timeout
				_stopTheClock();

				let sqId      = el.parentNode.id;
				let shade     = scope.piece.shade;
				let direction = scope.piece.direction;
				let mustJump  = false;
				let data      = {
					gamePieceId: el.id,
					sourceId   : sqId
				};


				// if there was a previous move it was a jump
				// so this move must also be a jump
				if ( movesQueue.length ) {
					mustJump = true;
				}

				// get all moves from this position, including jumps
				possibleMoves = gamePosition.getMoves(sqId, shade, direction, mustJump);


				// is any move allowed from here?
				if ( !possibleMoves.length ) {
					evt.preventDefault();
					_endOfTurn();
					return;
				}

				// store possible moves
				data.moves = possibleMoves;

				dataTransfer.setAllowedEffect(evt, "move");
				dataTransfer.setData(evt, data);
				
				this.classList.add("dragging");
			}



			/**
			 * @name		dragEnd
			 * @summary	pushes move taken onto the moves queue and
			 * 					starts the timeout clock
			 * 
			 * @param  DragEvent	evt
			 * @return void
			 */
			function dragEnd(evt) {
				let moveTaken = {};
				let lastMove  = gamePosition.getLastMove();
				let data      = dataTransfer.getData(evt);

				moveTaken = possibleMoves.filter(move => {
					return move.destination == lastMove.destination;
				})[0];

				if (moveTaken) {

					if ( moveTaken.captured ) {

						obit.announce({ id: moveTaken.captured });
					}

					movesQueue.push(moveTaken);

					// if now king update data directly so this move
					// can move all directions
					if ( gamePosition.isInCrownHead(el.id) ) {
						scope.piece.crown();
					}
					
					_startTheClock( moveTaken.captured ? parseInt(scope.delay) : 0 );
				}

				this.classList.remove("dragging");
				possibleMoves = [];
			}



			function _startTheClock(delay) {
				timeout = $timeout(_endOfTurn, delay || 0);
			}

			function _stopTheClock() {
				$timeout.cancel(timeout);
			}


			function _endOfTurn() {
				let data = { gamePiece: scope.piece, moves: movesQueue };
				movesQueue = [];

				scope.update()( data );
			}
		}
	}


	GamePieceController.$inject = ["$scope"];

	/**
	 * @name	GamePieceController
	 * @summary	
	 * @param {Scope} $scope
	 */
	function GamePieceController($scope, $element) {
		var vm = this;
	}
}());
