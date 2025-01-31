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
    expect(game.getPieceAtPosition(1).id).toBe(1);
    expect(game.getPieceAtPosition(5).up).toBe(true);
    expect(game.getPieceAtPosition(4)).toBeNull();
  });

  test('should display board correctly', () => {
    const game = new Game();
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  
    game.displayBoard(); // Call displayBoard()
    const loggedLines = logSpy.mock.calls.map(call => call[0]);
    const expectedOutput = [
      "Current Board State:",
      "1 ▼ 1",
      "2 ▼ 2",
      "3 ▼ 3",
      "4 · ",
      "5 ▲ 4",
      "6 ▲ 5",
      "7 ▲ 6"
    ];
  
    expect(loggedLines).toEqual(expectedOutput);
    logSpy.mockRestore();
  });
  

  test('should throw error for invalid board position', () => {
    expect(() => game.getPieceAtPosition(0)).not.toThrow();
    expect(() => game.getPieceAtPosition(8)).not.toThrow();
    expect(game.getPieceAtPosition(0)).toBeNull();
    expect(game.getPieceAtPosition(8)).toBeNull();
  });
});

describe('Movement Validation', () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  test('should find valid moves for down-facing piece', () => {
    expect(game.getNextValidMove(3)).toEqual(4);
  });

  test('should find valid jump moves', () => {
    game.movePiece(4, 4);
    expect(game.getNextValidMove(3)).toEqual(5); // Should jump over piece 1
  });

  test('should block invalid moves', () => {
    expect(game.getNextValidMove(1)).toBeNull();
    expect(game.getNextValidMove(6)).toBeNull();
  });

  test('should return null for missing piece', () => {
    expect(() => game.getNextValidMove(99)).toThrow('not found');
  });

  test('should return null for piece with no moves', () => {
    game.movePiece(4, 4);
    expect(game.getNextValidMove(6)).toBeNull();
  });
});

describe('Piece Movement', () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  test('should move piece successfully', () => {
    game.movePiece(4, 4);
    expect(game.getPieceAtPosition(5)).toBeNull();
    expect(game.getPieceAtPosition(4).id).toBe(4);
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

  test('should not move piece if invalid', () => {
    expect(() => game.movePiece(2, 5)).toThrow('Invalid move');
    expect(game.getPieceAtPosition(2).id).toBe(2);
  });
});

describe('Game State Validation', () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  test('should correctly determine game is not locked at start', () => {
    expect(game.isGameLocked()).toBe(false);
  });

  test('should correctly determine game is locked', () => {
    const game = new Game(7, [
      { id: 1, position: 5, up: false }, // Down piece at position 5
      { id: 2, position: 6, up: false }, // Down piece at position 6
      { id: 3, position: 7, up: false }, // Down piece at position 7
      { id: 4, position: 1, up: true },  // Up piece at position 1
      { id: 5, position: 2, up: true },  // Up piece at position 2
      { id: 6, position: 3, up: true }   // Up piece at position 3
    ]);

    // Now all pieces are blocked, so game should be locked
    expect(game.isGameLocked()).toBe(true);
  });

  test('should handle piece jump correctly', () => {
    game.movePiece(3, 4);
    expect(game.getPieceAtPosition(4).id).toBe(3);
    game.movePiece(4, 3);
    expect(game.getPieceAtPosition(3).id).toBe(4);
    expect(game.getPieceAtPosition(5)).toBeNull();
  });

  test('should prevent jumping over same-direction piece', () => {
    expect(() => game.movePiece(2, 4)).toThrow('Invalid move'); // Can't jump over piece 3
  });
});

describe('Internal Functions', () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  test('should correctly update the board', () => {
    const piece = game.piecesMap.get(1);
    game.updateBoard(piece.position, 4, piece);

    expect(game.getPieceAtPosition(1)).toBeNull();
    expect(game.getPieceAtPosition(4)).toBe(piece);
  });

  test('should correctly check board bounds', () => {
    expect(game.isWithinBoardBounds(1)).toBe(true);
    expect(game.isWithinBoardBounds(7)).toBe(true);
    expect(game.isWithinBoardBounds(8)).toBe(false);
    expect(game.isWithinBoardBounds(0)).toBe(false);
  });

  test('should return null if getting piece from empty position', () => {
    expect(game.getPieceAtPosition(4)).toBeNull();
  });

  test('should throw error for nonexistent piece movement', () => {
    expect(() => game.movePiece(99, 3)).toThrow('not found');
  });
});

describe('Piece Placement Validation', () => {
  test('should throw error if placing piece out of board bounds', () => {
    expect(() => new Game(7, [{ id: 7, position: 0, up: true }])).toThrow('Invalid position 0 for piece 7');
    expect(() => new Game(7, [{ id: 8, position: 8, up: false }])).toThrow('Invalid position 8 for piece 8');
  });

  test('should throw error if placing piece on an occupied position', () => {
    expect(() => new Game(7, [
      { id: 1, position: 3, up: false },
      { id: 2, position: 3, up: true } // Overlapping position
    ])).toThrow('Position 3 is already occupied!');
  });

  test('should allow valid custom piece placements', () => {
    const game = new Game(7, [
      { id: 1, position: 1, up: true },
      { id: 2, position: 3, up: false },
      { id: 3, position: 5, up: true }
    ]);

    expect(game.getPieceAtPosition(1).id).toBe(1);
    expect(game.getPieceAtPosition(3).id).toBe(2);
    expect(game.getPieceAtPosition(5).id).toBe(3);
  });
});