import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export function useGame() {
  const socketRef = useRef(null);

  const [screen, setScreen] = useState('register'); // register | home | waiting | game
  const [playerName, setPlayerName] = useState('');
  const [inputName, setInputName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [board, setBoard] = useState(null);
  const [myColor, setMyColor] = useState(null);
  const [myName, setMyName] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [currentTurn, setCurrentTurn] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null); // actual [r, c]
  const [validCaptures, setValidCaptures] = useState([]);   // [{ to:[r,c], captured:[r,c] }]
  const [validMoves, setValidMoves] = useState([]);          // [[r,c], ...]
  const [mandatoryPiece, setMandatoryPiece] = useState(null); // actual [r, c]
  const [lastMove, setLastMove] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winnerName, setWinnerName] = useState('');
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill room code from URL query param (?room=XXXXXX)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('room');
    if (codeParam) setJoinCode(codeParam.toUpperCase());
  }, []);

  useEffect(() => {
    // Connect to same origin so Vite proxy forwards /socket.io/* to the server.
    // In production, replace with explicit URL via VITE_SOCKET_URL env var.
    const serverUrl = import.meta.env.VITE_SOCKET_URL ?? window.location.origin;
    const socket = io(serverUrl, { autoConnect: false });
    socketRef.current = socket;

    socket.on('room_created', ({ code }) => {
      setRoomCode(code);
      setScreen('waiting');
    });

    socket.on('game_start', ({ board, myColor, myName, opponentName, currentTurn }) => {
      setBoard(board);
      setMyColor(myColor);
      setMyName(myName);
      setOpponentName(opponentName);
      setCurrentTurn(currentTurn);
      setGameOver(false);
      setWinner(null);
      setWinnerName('');
      setSelectedPiece(null);
      setValidCaptures([]);
      setValidMoves([]);
      setMandatoryPiece(null);
      setLastMove(null);
      setOpponentDisconnected(false);
      setScreen('game');
    });

    socket.on('valid_moves', ({ captures, moves }) => {
      setValidCaptures(captures);
      setValidMoves(moves);
    });

    socket.on('board_update', ({ board, currentTurn, lastMove, capturedPos, multiJump, mandatoryPiece }) => {
      setBoard(board);
      setCurrentTurn(currentTurn);
      setLastMove(lastMove);
      setSelectedPiece(null);
      setValidCaptures([]);
      setValidMoves([]);

      if (multiJump && mandatoryPiece) {
        setMandatoryPiece(mandatoryPiece);
        // Auto-select the mandatory piece and request its valid moves
        setSelectedPiece(mandatoryPiece);
        socket.emit('request_valid_moves', { row: mandatoryPiece[0], col: mandatoryPiece[1] });
      } else {
        setMandatoryPiece(null);
      }
    });

    socket.on('game_over', ({ board, winner, winnerName }) => {
      setBoard(board);
      setGameOver(true);
      setWinner(winner);
      setWinnerName(winnerName);
      setSelectedPiece(null);
      setValidCaptures([]);
      setValidMoves([]);
      setMandatoryPiece(null);
    });

    socket.on('opponent_disconnected', () => {
      setOpponentDisconnected(true);
    });

    socket.on('error', ({ message }) => {
      setErrorMsg(message);
      setTimeout(() => setErrorMsg(''), 3000);
    });

    socket.connect();
    return () => socket.disconnect();
  }, []);

  const submitName = useCallback(() => {
    const trimmed = inputName.trim();
    if (!trimmed) return setErrorMsg('Ingresa tu nombre para continuar');
    setPlayerName(trimmed);
    setScreen('home');
    setErrorMsg('');
  }, [inputName]);

  const createRoom = useCallback(() => {
    if (!playerName) return;
    socketRef.current.emit('create_room', { name: playerName });
  }, [playerName]);

  const joinRoom = useCallback(() => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return setErrorMsg('Ingresa el código de sala');
    socketRef.current.emit('join_room', { code, name: playerName });
  }, [joinCode, playerName]);

  const handleCellClick = useCallback((displayRow, displayCol) => {
    if (!board || currentTurn !== myColor || gameOver || opponentDisconnected) return;

    // Convert display coordinates to actual board coordinates
    const [ar, ac] = myColor === 'black'
      ? [7 - displayRow, 7 - displayCol]
      : [displayRow, displayCol];

    const piece = board[ar]?.[ac];

    // During multi-jump: only the mandatory piece can be moved
    if (mandatoryPiece) {
      const [mr, mc] = mandatoryPiece;
      if (ar === mr && ac === mc) {
        // Already auto-selected; clicking it again does nothing
        return;
      }
      // Clicking a valid capture destination
      if (selectedPiece) {
        const ok = validCaptures.some(cap => cap.to[0] === ar && cap.to[1] === ac);
        if (ok) {
          socketRef.current.emit('make_move', { from: selectedPiece, to: [ar, ac] });
          setSelectedPiece(null);
          setValidCaptures([]);
          setValidMoves([]);
        }
      }
      return;
    }

    // Clicking an own piece: select it
    if (piece && piece.player === myColor) {
      if (selectedPiece && selectedPiece[0] === ar && selectedPiece[1] === ac) {
        setSelectedPiece(null);
        setValidCaptures([]);
        setValidMoves([]);
      } else {
        setSelectedPiece([ar, ac]);
        setValidCaptures([]);
        setValidMoves([]);
        socketRef.current.emit('request_valid_moves', { row: ar, col: ac });
      }
      return;
    }

    // Clicking a destination when a piece is selected
    if (selectedPiece) {
      const isCapture = validCaptures.some(cap => cap.to[0] === ar && cap.to[1] === ac);
      const isMove = validMoves.some(([r, c]) => r === ar && c === ac);
      if (isCapture || isMove) {
        socketRef.current.emit('make_move', { from: selectedPiece, to: [ar, ac] });
        setSelectedPiece(null);
        setValidCaptures([]);
        setValidMoves([]);
      }
    }
  }, [board, currentTurn, myColor, gameOver, opponentDisconnected, mandatoryPiece, selectedPiece, validCaptures, validMoves]);

  const resetToHome = useCallback(() => {
    setScreen('home');
    setBoard(null);
    setMyColor(null);
    setCurrentTurn(null);
    setGameOver(false);
    setWinner(null);
    setWinnerName('');
    setOpponentDisconnected(false);
    setRoomCode('');
    setJoinCode('');
  }, []);

  const shareLink = roomCode
    ? `${window.location.origin}${window.location.pathname}?room=${roomCode}`
    : '';

  return {
    screen,
    playerName,
    inputName, setInputName,
    roomCode,
    joinCode, setJoinCode,
    board,
    myColor,
    myName,
    opponentName,
    currentTurn,
    selectedPiece,
    validCaptures,
    validMoves,
    mandatoryPiece,
    lastMove,
    gameOver,
    winner,
    winnerName,
    opponentDisconnected,
    errorMsg,
    shareLink,
    submitName,
    createRoom,
    joinRoom,
    handleCellClick,
    resetToHome,
  };
}
