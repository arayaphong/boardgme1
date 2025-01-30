import { Game } from './boardgame.js';

const game = new Game();

// Manually set positions to block all pieces
game.piecesMap.get(1).position = 2; // Down piece at position5
game.piecesMap.get(2).position = 3; // Down piece at position6
game.piecesMap.get(3).position = 4; // Down piece at position7
game.piecesMap.get(4).position = 5; // Up piece at position1
game.piecesMap.get(5).position = 6; // Up piece at position2
game.piecesMap.get(6).position = 7; // Up piece at position3

// Update the board to reflect new positions
game.board.fill(null);
game.piecesMap.forEach(piece => {
    game.board[piece.position - 1] = piece;
});

game.displayBoard();
console.log("Game over:", game.isGameLocked());