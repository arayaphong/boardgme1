import { Game } from "./boardgame.js";

let lockedGameCount = 0; // Track how many times the game locks

/**
 * Checks if the final board matches the "Success" win condition.
 * @param {Game} game - The current game state.
 * @returns {boolean} - Returns true if the board is in the success state.
 */
const isSuccessState = (game) => {
    const successPositions = {
        1: { position: 5, up: false },
        2: { position: 6, up: false },
        3: { position: 7, up: false },
        4: { position: 1, up: true },
        5: { position: 2, up: true },
        6: { position: 3, up: true },
    };

    return Object.entries(successPositions).every(([id, { position, up }]) => {
        const piece = game.piecesMap.get(Number(id));
        return piece
            ? piece.position === position && piece.up === up
            : up === null;
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
