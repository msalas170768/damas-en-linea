# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Damas en Línea** — Online checkers game. This repository contains **the client only** (React + Vite).

The **server** (Node.js + Express + Socket.IO) is in a separate repository: [`damas-en-linea-server`](https://github.com/msalas170768/damas-en-linea-server)

Full spec in `spec-damas-en-linea.md`.

## Commands

```bash
# Client (React + Vite) — runs on port 5173
npm install
npm run dev       # Vite dev server with HMR
npm run build     # production build → dist/
npm run preview   # preview production build
```

During development, the server must be running separately (port 3001). Vite proxy automatically forwards `/socket.io` requests to the server.

## Architecture

### Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Real-time | Socket.IO client |
| State | Single `useGame` hook |

### File layout

```
client/src/
  hooks/useGame.js         # Socket.IO + all game state
  components/
    Register.jsx           # Name entry screen
    Home.jsx               # Create / join room screen
    WaitingRoom.jsx        # Waiting for opponent, shows shareable link
    Game.jsx               # Game screen: board, status, winner overlay
    Board.jsx              # 8×8 grid, handles coordinate flip for black player
    Cell.jsx               # Single cell + piece rendering
  App.jsx                  # Screen router
  index.css                # All styles
```

### Board coordinate system

- `board[row][col]`, row 0 = top, row 7 = bottom
- Dark squares (game squares): `(row + col) % 2 === 1`
- **Red** player: pieces start rows 5–7 (bottom), move toward row 0
- **Black** player: pieces start rows 0–2 (top), move toward row 7
- **Board flip**: the `Board` component flips rows and columns for the black player so both players always see their pieces at the bottom. All coordinates are in actual (unflipped) space.

### Socket.IO event flow

**Client → Server**
| Event | Payload |
|---|---|
| `create_room` | `{ name }` |
| `join_room` | `{ code, name }` |
| `request_valid_moves` | `{ row, col }` |
| `make_move` | `{ from: [r,c], to: [r,c] }` |

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

### Responsive layout

Cell size is controlled by `--cell` CSS custom property (70 px desktop, 44 px on ≤640 px screens). Piece and font sizes scale proportionally.
