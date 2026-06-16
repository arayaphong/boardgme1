# Agent Guide for `boardgme1`

This document summarizes the project structure, technology stack, commands, conventions, and security notes for AI coding agents working on this repository.

## Project overview

`boardgme1` is a small JavaScript implementation of the **Frog Challenge** puzzle. It models a one-dimensional board where two teams of frogs face each other and can either step forward into an empty adjacent cell or jump over a single opposing frog into an empty cell. The goal is to swap the two sides.

The repository contains:

- A pure JavaScript game engine (`src/boardgame.js`).
- A browser UI (`index.html`) that lets a user click frogs to animate and play the puzzle.
- A minimal static HTTP server (`src/run.js`) used to serve the UI locally.
- A depth-first solver/traversal script (`src/solve.js`) that explores all move sequences and reports success or locked states.
- A Jest test suite (`src/test/boardgame.test.js`) covering initialization, movement, state validation, and success detection.

## Technology stack

- **Runtime:** Node.js with native ES modules. `package.json` sets `"type": "module"`, so all `.js` files are treated as ES modules.
- **Browser UI:** Plain HTML/CSS/JavaScript; Tailwind CSS is loaded from a CDN in `index.html`.
- **Test framework:** Jest 29 with Babel transpilation via `babel-jest`.
- **Babel:** `@babel/preset-env` targeted at the current Node version, plus `@babel/plugin-transform-modules-commonjs` for Jest compatibility.
- **No build step:** The project is run directly from source; there is no bundler, transpiler, or compiled output for the runtime code.

## File layout

```
.
├── index.html               # Browser UI for the Frog Challenge
├── package.json             # Project metadata, scripts, dependencies
├── babel.config.cjs         # Babel configuration for Jest
├── jest.config.cjs          # Jest configuration
├── .gitignore               # Ignores node_modules/, coverage/, package-lock.json
└── src/
    ├── boardgame.js         # Core game logic: Game and Piece classes
    ├── run.js               # Static HTTP server entry point
    ├── solve.js             # Solver/traversal script entry point
    └── test/
        └── boardgame.test.js # Jest test suite
```

### Key modules

- **`src/boardgame.js`**
  - Exports `Piece` and `Game`.
  - `Game` manages a board array, a `piecesMap`, move validation, piece movement, and win/locked detection.
  - Default setup is a board of size `7` with three down-facing frogs on positions 1-3 and three up-facing frogs on positions 5-7, leaving position 4 empty.
  - Supports custom initial configurations via `new Game(boardSize, customPieces)`.

- **`src/run.js`**
  - Creates an `http` server that serves files relative to the project root.
  - Serves `index.html` for `/`.
  - Respects the `PORT` environment variable; defaults to `3000`.

- **`src/solve.js`**
  - Imports `Game` and runs `findSolution(game)` to perform an exhaustive depth-first search with memoization.
  - Prints success/locked states and move histories to the console.
  - Also contains an unused `traverseMoves` function that performs the same search without memoization.

- **`index.html`**
  - Renders the board, handles click/hover events, animates frog jumps, and displays success/locked messages.
  - Imports `Game` from `./src/boardgame.js` as an ES module.

## Build and run commands

All commands are run from the project root.

| Command | Description |
|---------|-------------|
| `npm install` | Install development dependencies (Jest, Babel). |
| `npm start` | Start the static HTTP server on `http://localhost:3000` (or `PORT`). |
| `node src/solve.js` | Run the solver and print all terminal board states to the console. |
| `npm test` | Run the Jest test suite. Requires `NODE_OPTIONS=--experimental-vm-modules`. |
| `npm run test:coverage` | Run tests and generate a coverage report in `coverage/`. |

The `start`, `test`, and `test:coverage` scripts already include `NODE_OPTIONS=--experimental-vm-modules`, which is required because Jest runs the ES-module source directly.

## Testing instructions

- Tests live in `src/test/boardgame.test.js`.
- Jest is configured (`jest.config.cjs`) with:
  - `testEnvironment: "node"`
  - `testMatch: ["**/test/**/*.js"]`
  - `transform: { "^.+\\.js$": "babel-jest" }`
  - `collectCoverage: true` and `coverageDirectory: "coverage"`
- Run tests with `npm test`. The suite currently passes with 31 tests and 100% coverage of `boardgame.js`.
- When adding new tests, keep them under `src/test/` and import modules using ES-module syntax, for example:
  ```js
  import { Game } from "../boardgame";
  import { jest } from "@jest/globals";
  ```

## Code style guidelines

The existing code follows these patterns; maintain them when making changes:

- **ES modules:** Use `import`/`export`. Do not use CommonJS `require`/`module.exports` in source files (`.cjs` config files are exceptions).
- **Classes:** Core state lives in `Game`/`Piece` classes in `src/boardgame.js`.
- **Method style:** The project mixes standard prototype methods (`isSuccessState`) with class-field arrow functions (`_initializePieces = (pieces) => { ... }`). Preserve the style of the surrounding code rather than refactoring one style into the other.
- **Positions are 1-based:** Board cells are addressed from `1` to `boardSize`; the internal array is `0`-based, so methods convert with `position - 1`.
- **Error messages:** Game logic throws descriptive errors, often prefixed with emoji (e.g., `❌`, `⚠️`). Keep these messages consistent when modifying validation.
- **Console output:** `solve.js` and `boardgame.js` use emoji-rich console logging; tests sometimes spy on `console.log`.
- **No external runtime dependencies:** Only devDependencies are used. Avoid adding production dependencies unless necessary.

## Runtime architecture

- The **game engine** is framework-agnostic and has no DOM or I/O dependencies, making it directly testable in Node.js.
- The **browser UI** instantiates one `Game` object, renders the board from `game.board`, queries `game.getNextValidMove(pieceId)` for previews and clicks, and calls `game.movePiece(pieceId, nextMovePos)` after animations complete.
- The **server** only exists to serve static files for local development; it does not implement API routes or game sessions.
- The **solver** clones `Game` instances for each branch using the `customPieces` constructor argument, so it does not mutate the parent game state.

## Security considerations

- **Static server path handling:** `src/run.js` builds file paths with `path.join(__dirname, '..', req.url === '/' ? 'index.html' : req.url)`. A malicious URL containing traversal sequences could potentially read files outside the project root. If this server is exposed beyond localhost, validate or sanitize `req.url` before reading files.
- **No authentication or authorization:** The server is a plain static file server.
- **Browser-side game state:** All game logic runs in the client; nothing prevents a user from modifying state in the browser console.
- **Dependency vulnerabilities:** `npm install` currently reports moderate severity vulnerabilities in transitive packages. Run `npm audit` and update dependencies as needed for production use.
