import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { GamePhase, PlayerRole, type Room, type Player, type ChatMessage, type FinalAnswer, type GameResult } from '@shared/game';

interface GameSocketState {
  socket: Socket | null;
  room: Room | null;
  currentPlayer: Player | null;
  isConnected: boolean;
  error: string | null;
  myRole: PlayerRole | null;
  myDisease: string | null;
}

export function useGameSocket() {
  const [state, setState] = useState<GameSocketState>({
    socket: null,
    room: null,
    currentPlayer: null,
    isConnected: false,
    error: null,
    myRole: null,
    myDisease: null,
  });

  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple socket connections
    if (isInitialized.current || socketRef.current?.connected) {
      return;
    }

    isInitialized.current = true;

    // Initialize socket connection with better error handling
    const socket = io('/', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 3,
      timeout: 20000,
      forceNew: false,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setState(prev => ({ ...prev, socket, isConnected: true, error: null }));
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setState(prev => ({ ...prev, isConnected: false }));
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setState(prev => ({ ...prev, error: 'Connection failed. Please refresh the page.' }));
    });

    socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      setState(prev => ({ ...prev, error: 'Unable to connect to server. Please check your connection.' }));
    });

    socket.on('room-created', (room: Room, playerId: string) => {
      const player = room.players.find(p => p.id === playerId);
      setState(prev => ({ ...prev, room, currentPlayer: player || null, error: null }));
      navigate('/lobby');
    });

    socket.on('room-joined', (room: Room, playerId: string) => {
      const player = room.players.find(p => p.id === playerId);
      setState(prev => ({ ...prev, room, currentPlayer: player || null, error: null }));
      navigate('/lobby');
    });

    socket.on('room-updated', (room: Room) => {
      setState(prev => ({ ...prev, room }));
    });

    socket.on('game-started', () => {
      navigate('/game');
    });

    socket.on('role-assigned', (role: PlayerRole, disease?: string) => {
      setState(prev => ({ ...prev, myRole: role, myDisease: disease || null }));
    });

    socket.on('phase-changed', (phase: GamePhase) => {
      setState(prev => ({
        ...prev,
        room: prev.room ? { ...prev.room, phase } : null
      }));
    });

    socket.on('player-eliminated', (eliminatedPlayerId: string) => {
      setState(prev => {
        if (!prev.room) return prev;
        
        const updatedPlayers = prev.room.players.map(player =>
          player.id === eliminatedPlayerId
            ? { ...player, isEliminated: true }
            : player
        );
        
        return {
          ...prev,
          room: { ...prev.room, players: updatedPlayers }
        };
      });
    });

    socket.on('game-ended', (results: GameResult) => {
      // Handle game end results
      navigate('/results', { state: results });
    });

    socket.on('chat-message', (message: ChatMessage) => {
      setState(prev => {
        if (!prev.room) return prev;
        
        return {
          ...prev,
          room: {
            ...prev.room,
            chatMessages: [...prev.room.chatMessages, message]
          }
        };
      });
    });

    socket.on('error', (message: string) => {
      setState(prev => ({ ...prev, error: message }));
    });

    return () => {
      if (socket && socket.connected) {
        console.log('Cleaning up socket connection');
        socket.removeAllListeners();
        socket.disconnect();
      }
      socketRef.current = null;
      isInitialized.current = false;
    };
  }, [navigate]);

  const createRoom = async (playerName: string) => {
    if (!socketRef.current) return;
    
    setState(prev => ({ ...prev, error: null }));
    socketRef.current.emit('create-room', playerName);
  };

  const joinRoom = async (roomCode: string, playerName: string) => {
    if (!socketRef.current) return;
    
    setState(prev => ({ ...prev, error: null }));
    socketRef.current.emit('join-room', roomCode, playerName);
  };

  const startGame = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('start-game');
  };

  const revealRole = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('reveal-role');
  };

  const sendChat = (message: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('send-chat', message);
  };

  const submitAnswer = (answer: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('submit-answer', answer);
  };

  const votePlayer = (targetPlayerId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('vote-player', targetPlayerId);
  };

  const submitFinalAnswer = (answer: FinalAnswer) => {
    if (!socketRef.current) return;
    socketRef.current.emit('submit-final-answer', answer);
  };

  const voteFinal = (targetPlayerId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('vote-final', targetPlayerId);
  };

  const leaveRoom = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('leave-room');
    navigate('/play');
  };

  return {
    ...state,
    createRoom,
    joinRoom,
    startGame,
    revealRole,
    sendChat,
    submitAnswer,
    votePlayer,
    submitFinalAnswer,
    voteFinal,
    leaveRoom,
  };
}
