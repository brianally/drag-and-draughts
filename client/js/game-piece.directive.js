(function() {
	"use strict";


	angular
		.module("draughts")
		.directive("gamePiece", gamePiece);


	function gamePiece() {

		var directive = {
			restrict    : "E",
			controllerAs: "gpCtrl",
			bindToController: true,
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
		function gamePieceLink(scope, element, attrs, ctrl) {
			var el = element[0];
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
			 * @param  DragEvent	event
			 * @return void
			 */
			function dragStart(event) {

				if ( ctrl.handleDragStart(event, el) ) {
					this.classList.add("dragging");
				}

			}



			/**
			 * @name		dragEnd
			 * @summary	pushes move taken onto the moves queue and
			 * 					starts the timeout clock
			 * 
			 * @param  DragEvent	event
			 * @return void
			 */
			function dragEnd(event) {

				this.classList.remove("dragging");

				ctrl.handleDragEnd(event);
				// event.preventDefault();
				// return false;
			}
		}
	}


	GamePieceController.$inject = ["$scope", "gamePositionService", "dataTransferService"];

	/**
	 * @name	GamePieceController
	 * @summary	
	 * @param {Scope} $scope
	 */
	function GamePieceController($scope, gamePosition, dataTransfer) {

		var possibleMoves;

		this.handleDragStart = function(event, element) {

			if ( !element.classList.contains( this.inPlay ) ) {
				event.preventDefault();
				return false;
			}

			let sqId      = element.parentNode.id;
			let shade     = this.piece.shade;
			let direction = this.piece.direction;
			let mustJump  = false;
			let data      = {
				gamePieceId: this.piece.id,
				sourceId   : sqId
			};

			// if there was a previous move it was a jump
			// so this move must also be a jump
			if ( this.isMoving === this.piece.id ) {
				mustJump = true;
			}

			// get all moves from this position, including jumps
			possibleMoves = this.getMoves(sqId, shade, direction, mustJump);


			// is any move allowed from here?
			if ( !possibleMoves.length ) {

				this.yieldTurn({ pieceId: this.piece.id });

				event.preventDefault();
				return false;
			}

			// store possible moves
			data.moves = possibleMoves;

			dataTransfer.setAllowedEffect(event, "move");
			dataTransfer.setData(event, data);

			return true;
		}





		this.handleDragEnd = function(event) {
				
			let moveTaken = {};
			let lastMove  = gamePosition.getLastMove();
			
			// cannot read in dragend???
			//let data      = dataTransfer.getData(event);

			moveTaken = possibleMoves.filter(move => {
				return move.destination === lastMove.destination;
			})[0];

			if (moveTaken) {

				// if now king update data directly so this move
				// can move all directions
				if ( gamePosition.isInCrownHead( moveTaken.destination ) ) {

					this.piece.crown();
				}

				let sqId  = lastMove.destination;
				let shade = this.piece.shade;
				let dir   = this.piece.direction;

				possibleMoves = this.getMoves(sqId, shade, dir, true);

				let updateData = {
					gamePiece: this.piece,
					move     : moveTaken,
					yieldPlay: possibleMoves.length === 0
				};
				
				this.update( { moveData: updateData } );
			}

		}




		this.getMoves = function(sqId, shade, direction, mustJump) {

			return gamePosition.getMoves(sqId, shade, direction, mustJump);

		}




	}
}());
