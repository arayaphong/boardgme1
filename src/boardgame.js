class Piece {
  constructor(id, up, position) {
    this.id = id;
    this.up = up; // true for up, false for down
    this.position = position;
  }
}

class Game {
  constructor(boardSize = 7) {
    this.boardSize = boardSize;
    this.board = Array(this.boardSize).fill(null);
    this.piecesMap = new Map();

    this._initializePieces(1, 1, 3, false);  // Down pieces
    this._initializePieces(4, 5, 3, true);   // Up pieces
  }

  _initializePieces(startId, startPos, count, isUp) {
    Array.from({ length: count }).forEach((_, idx) => {
      const pieceId = startId + idx;
      const position = startPos + idx;
      const piece = new Piece(pieceId, isUp, position);

      this.board[position - 1] = piece;
      this.piecesMap.set(pieceId, piece);
    });
  }

  updateBoard(oldPosition, newPosition, piece) {
    if (oldPosition !== null && oldPosition >= 1 && oldPosition <= this.boardSize) {
      this.board[oldPosition - 1] = null;
    }
    if (newPosition >= 1 && newPosition <= this.boardSize) {
      this.board[newPosition - 1] = piece;
    }
  }

  buildBoardOutput() {
    const lines = ["Current Board State:"];
    this.board.forEach((piece, index) => {
      const pieceStr = piece ? (piece.up ? '▲' : '▼') : '·';
      lines.push(`${index + 1} ${pieceStr} ${piece ? piece.id : ''}`);
    });
    return lines;
  }

  displayBoard() {
    const lines = this.buildBoardOutput();
    lines.forEach(line => console.log(line));
  }

  getNextValidMove(pieceId) {
    const piece = this.piecesMap.get(pieceId);
    if (!piece) throw new Error(`Piece with ID ${pieceId} not found`);
    const direction = piece.up ? -1 : 1;
    const adjacentPosition = piece.position + direction;
    let possibleMove = null;
    if (this.isWithinBoardBounds(adjacentPosition)) {
      const adjacentPiece = this.getPieceAtPosition(adjacentPosition);
      if (!adjacentPiece) {
        possibleMove = piece.position + direction;
      } else if (adjacentPiece.up !== piece.up) {
        const jumpPosition = piece.position + 2 * direction;
        if (this.isWithinBoardBounds(jumpPosition) && !this.getPieceAtPosition(jumpPosition)) {
          possibleMove = jumpPosition;
        }
      }
    }
    return possibleMove;
  }

  isGameLocked() {
    return ![...this.piecesMap.keys()].some(pieceId => this.getNextValidMove(pieceId) !== null);
  }

  isWithinBoardBounds(position) {
    return position > 0 && position <= this.boardSize;
  }

  getPieceAtPosition(position) {
    return this.board[position - 1] || null;
  }

  movePiece(pieceId, newPosition) {
    const piece = this.piecesMap.get(pieceId);
    if (!piece) throw new Error(`Piece with ID ${pieceId} not found`);
    const possibleMove = this.getNextValidMove(pieceId);
    if (possibleMove !== newPosition) {
      throw new Error(`Invalid move for piece ${pieceId}`);
    }
    const oldPosition = piece.position;
    piece.position = newPosition;
    this.updateBoard(oldPosition, newPosition, piece);
  }
}

export { Game, Piece };