import { Game, Piece } from "../boardgame";
import { jest } from "@jest/globals";

describe("Game Initialization", () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should initialize with correct board setup", () => {
    expect(game.buildBoardOutput()).toEqual([
      "🎲 Current Board State:",
      "1 ▼ 1",
      "2 ▼ 2",
      "3 ▼ 3",
      "4 · ",
      "5 ▲ 4",
      "6 ▲ 5",
      "7 ▲ 6",
    ]);
  });

  test("should have correct initial piece positions", () => {
    expect(game.getPieceAtPosition(1).id).toBe(1);
    expect(game.getPieceAtPosition(5).up).toBe(true);
    expect(game.getPieceAtPosition(4)).toBeNull();
  });

  test("should display board correctly", () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => { });

    game.displayBoard();

    const loggedLines = logSpy.mock.calls.map(call => call[0].split("\n")).flat();
    const expectedOutput = game.buildBoardOutput();

    expect(loggedLines).toEqual(expectedOutput);
  });

  test("should return null for out-of-bounds positions", () => {
    expect(game.getPieceAtPosition(0)).toBeNull();
    expect(game.getPieceAtPosition(8)).toBeNull();
  });
});

describe("Piece constructor", () => {
  test("should create a piece with the given properties", () => {
    const piece = new Piece(7, true, 4);
    expect(piece.id).toBe(7);
    expect(piece.up).toBe(true);
    expect(piece.position).toBe(4);
  });
});

describe("Movement Validation", () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  test("should find valid moves for down-facing piece", () => {
    expect(game.getNextValidMove(3)).toEqual(4);
  });

  test("should find valid jump moves", () => {
    game.movePiece(4, 4);
    expect(game.getNextValidMove(3)).toEqual(5);
  });

  test("should block invalid moves", () => {
    expect(game.getNextValidMove(1)).toBeNull();
    expect(game.getNextValidMove(6)).toBeNull();
  });

  test("should throw error for missing piece", () => {
    expect(() => game.getNextValidMove(99)).toThrow(/not found/);
  });

  test("should return null for piece with no moves", () => {
    game.movePiece(4, 4);
    expect(game.getNextValidMove(6)).toBeNull();
  });
});

describe("Piece Movement", () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  test("should move piece successfully", () => {
    game.movePiece(4, 4);
    expect(game.getPieceAtPosition(5)).toBeNull();
    expect(game.getPieceAtPosition(4).id).toBe(4);
  });

  test("should update piece.position after moving", () => {
    const piece = game.piecesMap.get(4);
    game.movePiece(4, 4);
    expect(piece.position).toBe(4);
  });

  test("should throw error for invalid piece", () => {
    expect(() => game.movePiece(99, 4)).toThrow(/not found/);
  });

  test("should throw error for invalid move", () => {
    expect(() => game.movePiece(1, 5)).toThrow(/Invalid move/);
  });

  test("should handle edge-of-board movement", () => {
    expect(() => game.movePiece(1, 0)).toThrow();
    expect(() => game.movePiece(6, 8)).toThrow();
  });

  test("should not move piece if move is invalid", () => {
    expect(() => game.movePiece(2, 5)).toThrow(/Invalid move/);
    expect(game.getPieceAtPosition(2).id).toBe(2);
  });
});

describe("Game State Validation", () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  test("should detect game is not locked at start", () => {
    expect(game.isGameLocked()).toBe(false);
  });

  test("should detect when the game is locked", () => {
    game = new Game(7, [
      { id: 1, position: 5, up: false },
      { id: 2, position: 6, up: false },
      { id: 3, position: 7, up: false },
      { id: 4, position: 1, up: true },
      { id: 5, position: 2, up: true },
      { id: 6, position: 3, up: true },
    ]);

    expect(game.isGameLocked()).toBe(true);
  });

  test("should prevent jumping over the same-direction piece", () => {
    expect(() => game.movePiece(2, 4)).toThrow(/Invalid move/);
  });
});

describe("Internal Functions", () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  test("should correctly update the board", () => {
    const piece = game.piecesMap.get(1);
    game.updateBoard(piece.position, 4, piece);

    expect(game.getPieceAtPosition(1)).toBeNull();
    expect(game.getPieceAtPosition(4)).toBe(piece);
  });

  test("should correctly check board bounds", () => {
    expect(game.isWithinBoardBounds(1)).toBe(true);
    expect(game.isWithinBoardBounds(7)).toBe(true);
    expect(game.isWithinBoardBounds(8)).toBe(false);
    expect(game.isWithinBoardBounds(0)).toBe(false);
  });

  test("should return null if getting piece from empty position", () => {
    expect(game.getPieceAtPosition(4)).toBeNull();
  });

  test("should throw error for nonexistent piece movement", () => {
    expect(() => game.movePiece(99, 3)).toThrow(/not found/);
  });
});

describe.each([
  [{ id: 7, position: 0, up: true }, /Invalid position 0/],
  [{ id: 8, position: 8, up: false }, /Invalid position 8/],
  [
    [
      { id: 1, position: 3, up: false },
      { id: 2, position: 3, up: true },
    ],
    /Position 3 is already occupied/,
  ],
])("Piece Placement Validation %#", (pieces, expectedError) => {
  test("should validate piece placements", () => {
    expect(() => new Game(7, Array.isArray(pieces) ? pieces : [pieces])).toThrow(expectedError);
  });
});

describe("Duplicate piece ID validation", () => {
  test("should throw error when piece IDs are duplicated", () => {
    expect(() => new Game(7, [
      { id: 1, position: 1, up: false },
      { id: 1, position: 2, up: true },
    ])).toThrow(/Piece ID 1 is already used/);
  });
});

test("should allow valid custom piece placements", () => {
  const game = new Game(7, [
    { id: 1, position: 1, up: true },
    { id: 2, position: 3, up: false },
    { id: 3, position: 5, up: true },
  ]);

  expect(game.getPieceAtPosition(1).id).toBe(1);
  expect(game.getPieceAtPosition(3).id).toBe(2);
  expect(game.getPieceAtPosition(5).id).toBe(3);
});

describe("Finding All Movable Pieces", () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  test("should find all pieces that have at least one valid move", () => {
    const validMoves = game.getAllValidMoves();

    expect(validMoves).toEqual([
      { pieceId: 3, validMoves: [4] },
      { pieceId: 4, validMoves: [4] }
    ]);
  });

  test("should return an empty array when no pieces can move", () => {
    game = new Game(7, [
      { id: 1, position: 5, up: false },
      { id: 2, position: 6, up: false },
      { id: 3, position: 7, up: false },
      { id: 4, position: 1, up: true },
      { id: 5, position: 2, up: true },
      { id: 6, position: 3, up: true },
    ]);

    expect(game.getAllValidMoves()).toEqual([]);
  });

  test("should correctly list pieces and their valid moves after a move", () => {
    game.movePiece(4, 4);

    expect(game.getAllValidMoves()).toEqual([
      { pieceId: 3, validMoves: [5] },
      { pieceId: 5, validMoves: [5] }
    ]);
  });
});

describe("Success State Validation", () => {
  let game;

  test("should correctly identify a success state", () => {
    game = new Game(7, [
      { id: 1, position: 1, up: true },
      { id: 2, position: 2, up: true },
      { id: 3, position: 3, up: true },
      { id: 4, position: 5, up: false },
      { id: 5, position: 6, up: false },
      { id: 6, position: 7, up: false },
    ]);
    expect(game.isSuccessState()).toBe(true);
  });

  test("should correctly identify a non-success state", () => {
    game = new Game();
    expect(game.isSuccessState()).toBe(false);
  });

  test("should reject a single-team board with all pieces up", () => {
    game = new Game(7, [
      { id: 1, position: 1, up: true },
      { id: 2, position: 2, up: true },
      { id: 3, position: 3, up: true },
      { id: 4, position: 4, up: true },
      { id: 5, position: 5, up: true },
      { id: 6, position: 6, up: true },
    ]);
    expect(game.isSuccessState()).toBe(false);
  });

  test("should reject a single-team board with all pieces down", () => {
    game = new Game(7, [
      { id: 1, position: 2, up: false },
      { id: 2, position: 3, up: false },
      { id: 3, position: 4, up: false },
      { id: 4, position: 5, up: false },
      { id: 5, position: 6, up: false },
      { id: 6, position: 7, up: false },
    ]);
    expect(game.isSuccessState()).toBe(false);
  });

  test("should consider an empty board a success state", () => {
    game = new Game(7, []);
    expect(game.isSuccessState()).toBe(true);
  });
});

describe("State serialization", () => {
  test("serializeState should produce a stable, display-independent key", () => {
    const game = new Game();
    expect(game.serializeState()).toBe("D1|D2|D3|·|U4|U5|U6");

    game.movePiece(4, 4);
    expect(game.serializeState()).toBe("D1|D2|D3|U4|·|U5|U6");
  });
});
