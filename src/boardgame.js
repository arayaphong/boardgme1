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

    this._initializePieces(
      customPieces || [
        { id: 1, position: 1, up: false },
        { id: 2, position: 2, up: false },
        { id: 3, position: 3, up: false },
        { id: 4, position: 5, up: true },
        { id: 5, position: 6, up: true },
        { id: 6, position: 7, up: true },
      ]
    );
  }

  _initializePieces = (pieces) => {
    const occupiedPositions = new Set();

    pieces.forEach(({ id, position, up }) => {
      if (!this.isWithinBoardBounds(position)) {
        throw new Error(`❌ Invalid position ${position} for piece ${id}`);
      }
      if (occupiedPositions.has(position)) {
        throw new Error(`⚠️ Position ${position} is already occupied!`);
      }

      occupiedPositions.add(position);
      const piece = new Piece(id, up, position);
      this.board[position - 1] = piece;
      this.piecesMap.set(id, piece);
    });
  };

  updateBoard = (oldPosition, newPosition, piece) => {
    this.board[oldPosition - 1] = null;
    this.board[newPosition - 1] = piece;
  };

  buildBoardOutput = () => [
    "🎲 Current Board State:",
    ...this.board.map(
      (piece, index) => `${index + 1} ${piece ? (piece.up ? "▲" : "▼") : "·"} ${piece?.id ?? ""}`
    ),
  ];

  displayBoard = () => console.log(this.buildBoardOutput().join("\n"));

  getNextValidMove = (pieceId) => {
    const piece = this.piecesMap.get(pieceId);
    if (!piece) throw new Error(`❌ Piece with ID ${pieceId} not found`);

    const direction = piece.up ? -1 : 1;
    const adjacentPosition = piece.position + direction;

    if (!this.isWithinBoardBounds(adjacentPosition)) return null;

    const adjacentPiece = this.getPieceAtPosition(adjacentPosition);
    if (!adjacentPiece) return adjacentPosition;

    if (adjacentPiece.up !== piece.up) {
      const jumpPosition = piece.position + 2 * direction;
      if (this.isWithinBoardBounds(jumpPosition) && !this.getPieceAtPosition(jumpPosition)) {
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
    if (!piece) throw new Error(`❌ Piece with ID ${pieceId} not found`);

    const possibleMove = this.getNextValidMove(pieceId);
    if (possibleMove !== newPosition) {
      throw new Error(`⚠️ Invalid move for piece ${pieceId}. Allowed move: ${possibleMove}`);
    }

    this.updateBoard(piece.position, newPosition, piece);
    piece.position = newPosition;
  };
}

export { Game, Piece };
