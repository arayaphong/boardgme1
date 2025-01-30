import { Game, Piece } from "./boardgame.js";

class Solver {
    constructor(game) {
        this.game = game;
        this.queue = [];
        this.visited = new Set();
        this.parentMap = new Map();
    }

    serializeState(upPieces, downPieces) {
        return `${upPieces.sort().join(',')}|${downPieces.sort().join(',')}`;
    }

    getInitialState() {
        const upPieces = [];
        const downPieces = [];
        this.game.board.forEach((piece, index) => {
            if (piece) {
                if (piece.up) upPieces.push(index + 1);
                else downPieces.push(index + 1);
            }
        });
        return { upPieces, downPieces };
    }

    isGoalState(state) {
        const upInTarget = state.upPieces.every(pos => pos <= 3);
        const downInTarget = state.downPieces.every(pos => pos >= 5);
        return upInTarget && downInTarget;
    }

    getNextStates(currentState) {
        const nextStates = [];
        const { upPieces, downPieces } = currentState;

        // Simulate all possible moves for Up pieces
        upPieces.forEach((pos, idx) => {
            const pieceId = 4 + idx; // Up pieces have IDs 4,5,6
            const originalGameState = this.game.board.map(p => p ? { ...p } : null);
            const piece = this.game.piecesMap.get(pieceId);
            const possibleMoves = this.game.checkPossibleMoves(pieceId);

            possibleMoves.forEach(newPos => {
                // Clone the game to simulate the move
                const tempGame = new Game();
                tempGame.board = originalGameState.map(p => p ? new Piece(p.id, p.up, p.position) : null);
                tempGame.piecesMap = new Map(Array.from(this.game.piecesMap).map(([id, p]) => [id, new Piece(p.id, p.up, p.position)]));
                const tempPiece = tempGame.piecesMap.get(pieceId);
                tempGame.movePiece(pieceId, newPos);

                // Extract new state
                const newUp = tempGame.board.reduce((acc, p, idx) => {
                    if (p && p.up) acc.push(idx + 1);
                    return acc;
                }, []);
                const newDown = tempGame.board.reduce((acc, p, idx) => {
                    if (p && !p.up) acc.push(idx + 1);
                    return acc;
                }, []);
                nextStates.push({ upPieces: newUp, downPieces: newDown, move: `▲${pieceId} → ${newPos}` });
            });
        });

        // Simulate all possible moves for Down pieces (similar logic)
        // ... omitted for brevity ...

        return nextStates;
    }

    solve() {
        const initialState = this.getInitialState();
        const serializedInitial = this.serializeState(initialState.upPieces, initialState.downPieces);
        this.queue.push({ state: initialState, path: [] });
        this.visited.add(serializedInitial);

        while (this.queue.length > 0) {
            const { state, path } = this.queue.shift();

            if (this.isGoalState(state)) {
                return { solved: true, path };
            }

            const nextStates = this.getNextStates(state);
            for (const nextState of nextStates) {
                const serialized = this.serializeState(nextState.upPieces, nextState.downPieces);
                if (!this.visited.has(serialized)) {
                    this.visited.add(serialized);
                    this.queue.push({ state: nextState, path: [...path, nextState.move] });
                }
            }
        }

        return { solved: false, path: [] };
    }
}

// Usage
const game = new Game();
const solver = new Solver(game);
const result = solver.solve();
console.log(result.solved ? `Solution Path:\n${result.path.join('\n')}` : 'No solution exists.');