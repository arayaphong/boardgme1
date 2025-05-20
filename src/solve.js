import { Game } from "./boardgame.js";

let lockedGameCount = 0;
const memo = new Map();

const traverseMoves = (game, history = []) => {
    if (game.isGameLocked()) {
        lockedGameCount++; // Increase locked game count

        const resultMessage = game.isSuccessState()
            ? `✅ Success #${lockedGameCount}`
            : `💀 Game Over #${lockedGameCount}`;

        console.log(resultMessage);
        console.log("📜 Move Steps:\n" + history.map((move, i) => `${i + 1}. ${move}`).join("\n"));
        game.displayBoard();
        console.log("\n");
        return;
    }

    const validMoves = game.getAllValidMoves();

    validMoves.forEach(({ pieceId, validMoves }) => {
        validMoves.forEach((move) => {
            const clonedGame = new Game(
                game.boardSize,
                [...game.piecesMap.values()].map((p) => ({
                    id: p.id,
                    position: p.position,
                    up: p.up,
                }))
            );

            clonedGame.movePiece(pieceId, move);

            const moveLog = `Piece ${pieceId} → ${move}`;
            const newHistory = [...history, moveLog];

            traverseMoves(clonedGame, newHistory);
        });
    });
};

const findSolution = (game, history = []) => {
    const boardStateKey = game.buildBoardOutput().join("|");

    if (memo.has(boardStateKey)) {
        lockedGameCount += memo.get(boardStateKey).isSuccess ? 1 : 0;
        return;
    }

    if (game.isGameLocked()) {
        lockedGameCount++;
        const isSuccess = game.isSuccessState();
        const resultMessage = isSuccess
            ? `✅ Success #${lockedGameCount}`
            : `💀 Game Over #${lockedGameCount}`;

        console.log(resultMessage);
        console.log("📜 Move Steps:\n" + history.map((move, i) => `${i + 1}. ${move}`).join("\n"));
        game.displayBoard();
        console.log("\n");

        memo.set(boardStateKey, { isSuccess });
        return;
    }

    const validMoves = game.getAllValidMoves();
    let hasSuccess = false;

    validMoves.forEach(({ pieceId, validMoves }) => {
        validMoves.forEach((move) => {
            const clonedGame = new Game(
                game.boardSize,
                [...game.piecesMap.values()].map(p => ({
                    id: p.id,
                    position: p.position,
                    up: p.up
                }))
            );
            clonedGame.movePiece(pieceId, move);
            const newHistory = [...history, `Piece ${pieceId} → ${move}`];
            findSolution(clonedGame, newHistory);

            if (memo.has(clonedGame.buildBoardOutput().join("|")) &&
                memo.get(clonedGame.buildBoardOutput().join("|")).isSuccess) {
                hasSuccess = true;
            }
        });
    });

    memo.set(boardStateKey, { isSuccess: hasSuccess });
};


// Initialize game and start traversal
const game = new Game();
console.log("🎲 Initial Board:");
game.displayBoard();
console.log("\n🚀 Starting Traversal...\n");

findSolution(game);
// traverseMoves(game);

console.log(`🏁 Total Moving Senario: ${lockedGameCount}`);
