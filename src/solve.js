import { Game } from "./boardgame.js";

let terminalCount = 0;
let successCount = 0;
let lockedCount = 0;
const memo = new Map();

const cloneGameState = (game) =>
  [...game.piecesMap.values()].map((p) => ({
    id: p.id,
    position: p.position,
    up: p.up,
  }));

const traverseMoves = (game, history = []) => {
  if (game.isGameLocked()) {
    terminalCount++;

    const isSuccess = game.isSuccessState();
    const resultMessage = isSuccess
      ? `✅ Success #${terminalCount}`
      : `💀 Game Over #${terminalCount}`;

    console.log(resultMessage);
    console.log("📜 Move Steps:\n" + history.map((move, i) => `${i + 1}. ${move}`).join("\n"));
    game.displayBoard();
    console.log("\n");
    return;
  }

  const allValidMoves = game.getAllValidMoves();

  allValidMoves.forEach(({ pieceId, validMoves }) => {
    validMoves.forEach((move) => {
      const clonedGame = new Game(game.boardSize, cloneGameState(game));
      clonedGame.movePiece(pieceId, move);

      const moveLog = `Piece ${pieceId} → ${move}`;
      const newHistory = [...history, moveLog];

      traverseMoves(clonedGame, newHistory);
    });
  });
};

const findSolution = (game, history = []) => {
  const boardStateKey = game.serializeState();

  if (memo.has(boardStateKey)) {
    return memo.get(boardStateKey);
  }

  if (game.isGameLocked()) {
    terminalCount++;
    const isSuccess = game.isSuccessState();
    if (isSuccess) successCount++;
    else lockedCount++;

    const resultMessage = isSuccess
      ? `✅ Success #${terminalCount}`
      : `💀 Game Over #${terminalCount}`;

    console.log(resultMessage);
    console.log("📜 Move Steps:\n" + history.map((move, i) => `${i + 1}. ${move}`).join("\n"));
    game.displayBoard();
    console.log("\n");

    memo.set(boardStateKey, isSuccess);
    return isSuccess;
  }

  const allValidMoves = game.getAllValidMoves();
  let foundSuccess = false;

  allValidMoves.forEach(({ pieceId, validMoves }) => {
    validMoves.forEach((move) => {
      const clonedGame = new Game(game.boardSize, cloneGameState(game));
      clonedGame.movePiece(pieceId, move);
      const newHistory = [...history, `Piece ${pieceId} → ${move}`];

      if (findSolution(clonedGame, newHistory)) {
        foundSuccess = true;
      }
    });
  });

  memo.set(boardStateKey, foundSuccess);
  return foundSuccess;
};

const runSolver = () => {
  const game = new Game();
  console.log("🎲 Initial Board:");
  game.displayBoard();
  console.log("\n🚀 Starting Traversal...\n");

  findSolution(game);

  console.log(`🏁 Total Moving Scenario: ${terminalCount}`);
  console.log(`✅ Successes: ${successCount}, 💀 Locked: ${lockedCount}`);
  console.log(`🧠 Unique states memoized: ${memo.size}`);
};

export { findSolution, traverseMoves, runSolver };

if (import.meta.url === `file://${process.argv[1]}`) {
  runSolver();
}
