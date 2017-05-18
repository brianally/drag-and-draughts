(function() {
	"use strict";

	let injections = [
		"$rootScope",
		"$document",
		"gamePositionService",
		"dataTransferService",
		gamePiece
	];

	angular
		.module("draughts")
		.directive("gamePiece", injections);


	function gamePiece($rootScope, $document, gamePosition, dataTransfer) {

		var directive = {
			restrict    : "E",
			controllerAs: "gpCtrl",
			scope: {
				piece    : "=",
				inPlay   : "@",
				isMoving : "=",
				update   : "&",
				yieldTurn: "&"
			},
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


			el.addEventListener("dragstart", dragStart, false);
			el.addEventListener("dragend", dragEnd, false);

			scope.$on("$destroy", function() {

				el.removeEventListener("dragstart", dragStart, false);
				el.removeEventListener("dragend", dragEnd, false);

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

				let sqId      = el.parentNode.id;
				let shade     = scope.piece.shade;
				let direction = scope.piece.direction;
				let mustJump  = false;
				let data      = {
					gamePieceId: scope.piece.id,
					sourceId   : sqId
				};

				// if there was a previous move it was a jump
				// so this move must also be a jump
				if ( scope.isMoving === scope.piece.id ) {
					mustJump = true;
				}

				// get all moves from this position, including jumps
				possibleMoves = gamePosition.getMoves(sqId, shade, direction, mustJump);


				// is any move allowed from here?
				if ( !possibleMoves.length ) {

					scope.yieldTurn({ pieceId: scope.piece.id });

					evt.preventDefault();
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

				this.classList.remove("dragging");

				moveTaken = possibleMoves.filter(move => {
					return move.destination === lastMove.destination;
				})[0];

				if (moveTaken) {

					// if now king update data directly so this move
					// can move all directions
					if ( gamePosition.isInCrownHead( moveTaken.destination ) ) {

						scope.piece.crown();
					}
					
					scope.update( { moveData: { gamePiece: scope.piece, move: moveTaken } } );
				}
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

		$scope.isDisabled = function() {

			if ( !$scope.isMoving && $scope.piece.shade == $scope.inPlay ) {
				return false;
			}
			else if ( $scope.isMoving == $scope.piece.id ) {
				return false;
			}

			return true;
		}

		$scope.isKing = function() {
			return $scope.piece.crowned;
		}
	}
}());
