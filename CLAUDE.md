# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Online checkers (damas) platform — two players connect in real time via browser. Full spec in `spec-damas-en-linea.md`.

## Commands

```bash
# Server (Node.js + Express + Socket.IO) — runs on port 3001
cd server
npm install
npm run dev       # nodemon watch mode
npm start         # production

# Client (React + Vite) — runs on port 5173
cd client
npm install
npm run dev       # Vite dev server with HMR
npm run build     # production build → client/dist/
npm run preview   # preview production build
```

Both must be running simultaneously during development. The Vite config proxies `/socket.io` to `http://localhost:3001`, so no CORS issues in dev.

## Architecture

### Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express + Socket.IO 4 |
| State | In-memory on server (Map of rooms) |

### File layout

```
server/src/
  checkers.js      # Pure game logic (no I/O) — board state, move validation, win detection
  roomManager.js   # Room CRUD over an in-memory Map
  server.js        # Express + Socket.IO event handlers

client/src/
  hooks/useGame.js         # Single hook: socket lifecycle + all game state
  components/
    Register.jsx           # Name entry screen
    Home.jsx               # Create / join room screen
    WaitingRoom.jsx        # Waiting for opponent, shows shareable link
    Game.jsx               # Game screen: header, status bar, overlay
    Board.jsx              # 8×8 grid, handles coordinate flip for black player
    Cell.jsx               # Single cell + piece rendering
  App.jsx                  # Screen router (register → home → waiting → game)
  index.css                # All styles (CSS custom properties for cell sizing)
```

### Server-side validation (anti-cheat)

All game logic runs exclusively in `checkers.js` on the server. The client never calculates valid moves itself — it requests them via `request_valid_moves` and the server responds with `valid_moves`. The client only renders what the server authorizes.

### Socket.IO event flow

**Client → Server**
| Event | Payload |
|---|---|
| `create_room` | `{ name }` |
| `join_room` | `{ code, name }` |
| `request_valid_moves` | `{ row, col }` — actual board coords |
| `make_move` | `{ from: [r,c], to: [r,c] }` — actual board coords |

**Server → Client**
| Event | Payload |
|---|---|
| `room_created` | `{ code }` |
| `game_start` | `{ board, myColor, myName, opponentName, currentTurn }` |
| `valid_moves` | `{ captures: [{to,captured}], moves: [[r,c]] }` |
| `board_update` | `{ board, currentTurn, lastMove, capturedPos, multiJump, mandatoryPiece }` |
| `game_over` | `{ board, winner, winnerName }` |
| `opponent_disconnected` | — |
| `error` | `{ message }` |

### Board coordinate system

- `board[row][col]`, row 0 = top, row 7 = bottom
- Dark squares (game squares): `(row + col) % 2 === 1`
- `red` player starts rows 5–7 (bottom), moves toward row 0
- `black` player starts rows 0–2 (top), moves toward row 7
- **Board flip**: the `Board` component flips rows and columns for the black player so both players always see their pieces at the bottom. All coordinates sent to/from the server are always in actual (unflipped) space; only the rendering layer applies the flip.

### Checkers rules enforced

- Normal pieces: move forward 1 diagonal; capture in any diagonal direction (including backward)
- Kings: move and capture in all 4 diagonal directions
- Mandatory capture: if any piece can capture, the player must capture
- Multi-jump: after a capture, if the same piece can capture again, it must continue (turn stays with same player; server sets `mandatoryPiece`)
- A piece crowned mid-jump ends the multi-jump chain
- Coronation: red piece reaching row 0, black piece reaching row 7 becomes king

### Room lifecycle

Rooms are stored in `roomManager.js` as a `Map<code, room>`. A room is deleted when its last player disconnects. There is no reconnection — if a player disconnects, the opponent sees `opponent_disconnected` and must return to the home screen.

### Responsive layout

Cell size is controlled by `--cell` CSS custom property (70 px desktop, 44 px on ≤640 px screens). Piece and font sizes scale proportionally.
