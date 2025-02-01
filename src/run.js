import { Game } from "./boardgame.js";

let lockedGameCount = 0; // Track how many times the game locks

/**
 * Checks if the final board matches the "Success" win condition.
 * @param {Game} game - The current game state.
 * @returns {boolean} - Returns true if the board is in the success state.
 */
const isSuccessState = (game) => {
    // Check if pieces 1-3 are face up and pieces 5-7 are face down
    return [1, 2, 3].every(id => {
        const piece = game.getPieceAtPosition(id);
        return piece?.up === true;
    }) && [5, 6, 7].every(id => {
        const piece = game.getPieceAtPosition(id);
        return piece?.up === false;
    });
};


/**
 * Traverses all possible moves recursively until the game is locked.
 * @param {Game} game - The current game state.
 * @param {Array} history - Log of moves.
 */
const traverseMoves = (game, history = []) => {
    if (game.isGameLocked()) {
        lockedGameCount++; // Increase locked game count

        const resultMessage = isSuccessState(game)
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


// Initialize game and start traversal
const game = new Game();
console.log("🎲 Initial Board:");
game.displayBoard();
console.log("\n🚀 Starting Traversal...\n");

traverseMoves(game);

console.log(`🏁 Total Moving Senario: ${lockedGameCount}`);
