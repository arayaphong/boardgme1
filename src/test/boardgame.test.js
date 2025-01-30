import { Game } from '../boardgame';
import { jest } from '@jest/globals';

describe('Game Initialization', () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  test('should initialize with correct board setup', () => {
    const output = game.buildBoardOutput();
    expect(output).toEqual([
      "Current Board State:",
      "1 ▼ 1",
      "2 ▼ 2",
      "3 ▼ 3",
      "4 · ",
      "5 ▲ 4",
      "6 ▲ 5",
      "7 ▲ 6"
    ]);
  });

  test('should have correct initial piece positions', () => {
    expect(game.getPieceByLocation(1).id).toBe(1);
    expect(game.getPieceByLocation(5).up).toBe(true);
    expect(game.getPieceByLocation(4)).toBeNull();
  });

  test('should have display board correctly', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    game.displayBoard();
    expect(spy).toHaveBeenCalledTimes(8);
    spy.mockRestore();
  });
});

describe('Movement Validation', () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  test('should find valid moves for down-facing piece', () => {
    const moves = game.checkMovePosition(3);
    expect(moves).toEqual(4);
  });

  test('should find valid jump moves', () => {
    game.movePiece(4, 4);
    const moves = game.checkMovePosition(3);
    expect(moves).toEqual(5); // Should jump over piece 1
  });

  test('should block invalid moves', () => {
    expect(game.checkMovePosition(1)).toBeNull();
    expect(game.checkMovePosition(6)).toBeNull();
  });
});

describe('Piece Movement', () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  test('should move piece successfully', () => {
    game.movePiece(4, 4);
    expect(game.getPieceByLocation(5)).toBeNull();
    expect(game.getPieceByLocation(4).id).toBe(4);
    expect(game.piecesMap.get(2).position).toBe(2);
  });

  test('should throw error for invalid piece', () => {
    expect(() => game.movePiece(99, 4)).toThrow('not found');
  });

  test('should throw error for invalid move', () => {
    expect(() => game.movePiece(1, 5)).toThrow('Invalid move');
  });

  test('should handle edge-of-board movement', () => {
    expect(() => game.movePiece(1, 0)).toThrow();
    expect(() => game.movePiece(6, 8)).toThrow();
  });
});

describe('Special Cases', () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  test('should handle non-existent pieces', () => {
    expect(() => game.checkMovePosition(99)).toThrow('not found');
  });

  test('should correctly jump over opposing piece', () => {
    game.movePiece(3, 4);
    expect(game.getPieceByLocation(4).id).toBe(3);
    game.movePiece(4, 3);
    expect(game.getPieceByLocation(3).id).toBe(4);
    expect(game.getPieceByLocation(5)).toBeNull();
  });

  test('should prevent jumping same-direction pieces', () => {
    expect(() => game.movePiece(2, 4)).toThrow('Invalid move'); // Can't jump over piece 3
  });
});

describe('Game Over Conditions', () => {
  let game;

  test('should return false when the game starts (moves available)', () => {
    game = new Game();
    expect(game.isGameOver()).toBe(false);
  });

  test('should return true when all pieces are blocked', () => {
    game = new Game();

    // Manually set positions to block all pieces
    game.piecesMap.get(1).position = 5; // Down piece at position5
    game.piecesMap.get(2).position = 6; // Down piece at position6
    game.piecesMap.get(3).position = 7; // Down piece at position7
    game.piecesMap.get(4).position = 1; // Up piece at position1
    game.piecesMap.get(5).position = 2; // Up piece at position2
    game.piecesMap.get(6).position = 3; // Up piece at position3

    // Update the board to reflect new positions
    game.board.fill(null);
    game.piecesMap.forEach(piece => {
      game.board[piece.position - 1] = piece;
    });

    expect(game.isGameOver()).toBe(true);
  });
});