class Piece {
  constructor(id, up, position) {
    Object.assign(this, { id, up, position });
  }
}

class Game {
  constructor(boardSize = 7, customPieces = null) {
    this.boardSize = boardSize;
    this.board = Array.from({ length: boardSize }, () => null);
    this.piecesMap = new Map();

    // Default setup (if no custom pieces provided)
    if (!customPieces) {
      customPieces = [
        { id: 1, position: 1, up: false },
        { id: 2, position: 2, up: false },
        { id: 3, position: 3, up: false },
        { id: 4, position: 5, up: true },
        { id: 5, position: 6, up: true },
        { id: 6, position: 7, up: true }
      ];
    }

    this._initializePieces(customPieces);
  }

  _initializePieces = (pieces) => {
    const occupiedPositions = new Set(); // Track occupied positions

    pieces.forEach(({ id, position, up }) => {
      if (!this.isWithinBoardBounds(position)) {
        throw new Error(`Invalid position ${position} for piece ${id}`);
      }
      if (occupiedPositions.has(position)) {
        throw new Error(`Position ${position} is already occupied!`);
      }

      occupiedPositions.add(position); // Mark position as occupied
      const piece = new Piece(id, up, position);
      this.board[position - 1] = piece;
      this.piecesMap.set(id, piece);
    });
  };

  updateBoard = (oldPosition, newPosition, piece) => {
    if (this.isWithinBoardBounds(oldPosition)) this.board[oldPosition - 1] = null;
    if (this.isWithinBoardBounds(newPosition)) this.board[newPosition - 1] = piece;
  };

  buildBoardOutput = () =>
    [`Current Board State:`].concat(
      this.board.map((piece, index) =>
        `${index + 1} ${piece ? (piece.up ? '▲' : '▼') : '·'} ${piece?.id ?? ''}`
      )
    );

  displayBoard = () => this.buildBoardOutput().forEach(line => console.log(line));

  getNextValidMove = (pieceId) => {
    const piece = this.piecesMap.get(pieceId);
    if (!piece) throw new Error(`Piece with ID ${pieceId} not found`);

    const direction = piece.up ? -1 : 1;
    const adjacentPosition = piece.position + direction;

    if (this.isWithinBoardBounds(adjacentPosition)) {
      const adjacentPiece = this.getPieceAtPosition(adjacentPosition);
      if (!adjacentPiece) return adjacentPosition;
      if (adjacentPiece.up !== piece.up) {
        const jumpPosition = piece.position + 2 * direction;
        if (this.isWithinBoardBounds(jumpPosition) && !this.getPieceAtPosition(jumpPosition))
          return jumpPosition;
      }
    }
    return null;
  };

  isGameLocked = () => ![...this.piecesMap.keys()].some((id) => this.getNextValidMove(id) !== null);

  isWithinBoardBounds = (position) => position > 0 && position <= this.boardSize;

  getPieceAtPosition = (position) => this.board[position - 1] ?? null;

  movePiece = (pieceId, newPosition) => {
    const piece = this.piecesMap.get(pieceId);
    if (!piece) throw new Error(`Piece with ID ${pieceId} not found`);

    const possibleMove = this.getNextValidMove(pieceId);
    if (possibleMove !== newPosition) throw new Error(`Invalid move for piece ${pieceId}`);

    this.updateBoard(piece.position, newPosition, piece);
    piece.position = newPosition;
  };
}

export { Game, Piece };
