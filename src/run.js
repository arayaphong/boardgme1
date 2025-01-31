import { Game } from './boardgame.js';

const game = new Game(7, [
    { id: 1, position: 5, up: false }, // Down piece at position 5
    { id: 2, position: 6, up: false }, // Down piece at position 6
    { id: 3, position: 7, up: false }, // Down piece at position 7
    { id: 4, position: 1, up: true },  // Up piece at position 1
    { id: 5, position: 2, up: true },  // Up piece at position 2
    { id: 6, position: 3, up: true }   // Up piece at position 3
]);

game.displayBoard();
console.log("Game over:", game.isGameLocked());