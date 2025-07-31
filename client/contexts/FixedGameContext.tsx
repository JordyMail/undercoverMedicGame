import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import WorkingSocketManager from '../utils/workingSocketManager';
import { GamePhase, PlayerRole, type Room, type Player, type ChatMessage, type FinalAnswer, type GameResult } from '@shared/game';

interface GameContextState {
  socket: Socket | null;
  room: Room | null;
  currentPlayer: Player | null;
  isConnected: boolean;
  error: string | null;
  myRole: PlayerRole | null;
  myDisease: string | null;
  // Actions
  initializeConnection: () => void;
  createRoom: (playerName: string) => Promise<void>;
  joinRoom: (roomCode: string, playerName: string) => Promise<void>;
  startGame: () => void;
  revealRole: () => void;
  sendChat: (message: string) => void;
  submitAnswer: (answer: string) => void;
  votePlayer: (targetPlayerId: string) => void;
  submitFinalAnswer: (answer: FinalAnswer) => void;
  voteFinal: (targetPlayerId: string) => void;
  leaveRoom: () => void;
}

const GameContext = createContext<GameContextState | null>(null);

export function FixedGameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({
    socket: null as Socket | null,
    room: null as Room | null,
    currentPlayer: null as Player | null,
    isConnected: false,
    error: null as string | null,
    myRole: null as PlayerRole | null,
    myDisease: null as string | null,
  });

  const navigate = useNavigate();
  const isInitializedRef = useRef(false);

  // Initialize socket connection
  const initializeConnection = () => {
    if (isInitializedRef.current) {
      console.log('Connection already initialized');
      return;
    }

    console.log('Initializing socket connection...');
    try {
      const socketManager = WorkingSocketManager.getInstance();
      const socket = socketManager.getSocket();

      if (socket) {
        setState(prev => ({
          ...prev,
          socket,
          isConnected: socket.connected,
          error: null
        }));

        // Set up socket event listeners
        setupSocketListeners(socket);
        isInitializedRef.current = true;
      }
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      setState(prev => ({ ...prev, error: 'Failed to connect to server' }));
    }
  };

  // Setup socket event listeners
  const setupSocketListeners = (socket: Socket) => {
    socket.on('connect', () => {
      console.log('Connected to server');
      setState(prev => ({ ...prev, isConnected: true, error: null }));

      // Try to rejoin room if we have session data
      const savedRoom = localStorage.getItem('uncoverles_room');
      const savedPlayer = localStorage.getItem('uncoverles_player');

      if (savedRoom && savedPlayer) {
        try {
          const room = JSON.parse(savedRoom);
          const player = JSON.parse(savedPlayer);

          // Try to rejoin room for all active phases
          if (room.phase !== 'results') {
            console.log('Attempting to rejoin room:', room.code, 'Phase:', room.phase);
            socket.emit('join-room', room.code, player.name);
          }
        } catch (error) {
          console.error('Failed to rejoin room:', error);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setState(prev => ({ ...prev, isConnected: false }));
    });

    socket.on('error', (error: string) => {
      console.error('Socket error:', error);
      setState(prev => ({ ...prev, error }));
    });

    socket.on('room-created', (room: Room, playerId: string) => {
      console.log('Room created:', room, 'Player ID:', playerId);
      const currentPlayer = room.players.find(p => p.id === playerId);
      setState(prev => ({ ...prev, room, currentPlayer, error: null }));
      // Save to localStorage for persistence
      localStorage.setItem('uncoverles_room', JSON.stringify(room));
      localStorage.setItem('uncoverles_player', JSON.stringify(currentPlayer));
      navigate('/lobby');
    });

    socket.on('room-joined', (room: Room, playerId: string) => {
      console.log('Room joined:', room, 'Player ID:', playerId);
      const currentPlayer = room.players.find(p => p.id === playerId);
      setState(prev => ({ ...prev, room, currentPlayer, error: null }));
      // Save to localStorage for persistence
      localStorage.setItem('uncoverles_room', JSON.stringify(room));
      localStorage.setItem('uncoverles_player', JSON.stringify(currentPlayer));
      navigate('/lobby');
    });

    socket.on('player-joined', (room: Room) => {
      console.log('New player joined room:', room);
      setState(prev => ({ ...prev, room }));
      // Save to localStorage for persistence
      localStorage.setItem('uncoverles_room', JSON.stringify(room));
    });

    socket.on('room-updated', (room: Room) => {
      console.log('Room updated:', room);
      setState(prev => ({ ...prev, room }));
      // Save to localStorage for persistence
      localStorage.setItem('uncoverles_room', JSON.stringify(room));
    });

    socket.on('game-started', (room: Room) => {
      console.log('Game started:', room);
      setState(prev => ({ ...prev, room }));
      // Save to localStorage for persistence
      localStorage.setItem('uncoverles_room', JSON.stringify(room));
      navigate('/game');
    });

    socket.on('role-assigned', (role: PlayerRole, disease?: string) => {
      console.log('Role assigned:', role, disease);
      setState(prev => ({ ...prev, myRole: role, myDisease: disease || null }));
    });

    socket.on('game-updated', (room: Room) => {
      console.log('Game updated:', room);
      setState(prev => ({ ...prev, room }));
      // Save to localStorage for persistence
      localStorage.setItem('uncoverles_room', JSON.stringify(room));
    });

    socket.on('chat-message', (message: ChatMessage) => {
      console.log('New chat message:', message);
      setState(prev => {
        const updatedRoom = prev.room ? {
          ...prev.room,
          chatMessages: [...prev.room.chatMessages, message]
        } : null;

        if (updatedRoom) {
          localStorage.setItem('uncoverles_room', JSON.stringify(updatedRoom));
        }

        return { ...prev, room: updatedRoom };
      });
    });

    socket.on('phase-changed', (phase: GamePhase) => {
      console.log('Game phase changed to:', phase);
      setState(prev => {
        const updatedRoom = prev.room ? {
          ...prev.room,
          phase: phase
        } : null;

        if (updatedRoom) {
          localStorage.setItem('uncoverles_room', JSON.stringify(updatedRoom));
        }

        return { ...prev, room: updatedRoom };
      });
    });

    socket.on('player-eliminated', (eliminatedPlayerId: string) => {
      console.log('Player eliminated:', eliminatedPlayerId);
      setState(prev => {
        const updatedRoom = prev.room ? {
          ...prev.room,
          eliminatedThisRound: eliminatedPlayerId
        } : null;

        if (updatedRoom) {
          localStorage.setItem('uncoverles_room', JSON.stringify(updatedRoom));
        }

        return { ...prev, room: updatedRoom };
      });
    });

    socket.on('game-ended', (results: GameResult) => {
      console.log('Game ended:', results);
      // Save results to localStorage for persistence
      localStorage.setItem('uncoverles_results', JSON.stringify(results));
      // Clear room data since game is over
      localStorage.removeItem('uncoverles_room');
      localStorage.removeItem('uncoverles_player');
      navigate('/results', { state: results });
    });
  };

  // Game actions that use socket
  const createRoom = async (playerName: string) => {
    if (!state.socket || !state.isConnected) {
      setState(prev => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    setState(prev => ({ ...prev, error: null }));
    state.socket.emit('create-room', playerName);
  };

  const joinRoom = async (roomCode: string, playerName: string) => {
    if (!state.socket || !state.isConnected) {
      setState(prev => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    setState(prev => ({ ...prev, error: null }));
    state.socket.emit('join-room', roomCode, playerName);
  };

  const startGame = () => {
    if (!state.socket || !state.isConnected) {
      setState(prev => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    state.socket.emit('start-game');
  };

  const revealRole = () => {
    if (!state.socket || !state.isConnected) {
      setState(prev => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    state.socket.emit('reveal-role');
  };

  const sendChat = (message: string) => {
    if (!state.socket || !state.isConnected) {
      setState(prev => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    state.socket.emit('send-chat', message);
  };

  const submitAnswer = (answer: string) => {
    if (!state.socket || !state.isConnected) {
      setState(prev => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    console.log('Emitting submit-answer:', answer);
    state.socket.emit('submit-answer', answer);
  };

  const votePlayer = (targetPlayerId: string) => {
    if (!state.socket || !state.isConnected) {
      setState(prev => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    state.socket.emit('vote-player', targetPlayerId);
  };

  const submitFinalAnswer = (answer: FinalAnswer) => {
    if (!state.socket || !state.isConnected) {
      setState(prev => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    console.log('Emitting submit-final-answer:', answer);
    state.socket.emit('submit-final-answer', answer);
  };

  const voteFinal = (targetPlayerId: string) => {
    if (!state.socket || !state.isConnected) {
      setState(prev => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    state.socket.emit('vote-final', targetPlayerId);
  };

  const leaveRoom = () => {
    if (state.socket && state.isConnected) {
      state.socket.emit('leave-room');
    }

    // Clear session data
    localStorage.removeItem('uncoverles_room');
    localStorage.removeItem('uncoverles_player');

    // Clear individual reveal state
    if (state.currentPlayer?.id) {
      localStorage.removeItem(`revealed_${state.currentPlayer.id}`);
    }

    setState(prev => ({
      ...prev,
      room: null,
      currentPlayer: null,
      myRole: null,
      myDisease: null
    }));
    navigate('/play');
  };

  const contextValue: GameContextState = {
    ...state,
    initializeConnection,
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

  // Load persisted data and initialize connection on mount
  useEffect(() => {
    // Try to restore from localStorage
    const savedRoom = localStorage.getItem('uncoverles_room');
    const savedPlayer = localStorage.getItem('uncoverles_player');

    if (savedRoom && savedPlayer) {
      try {
        const room = JSON.parse(savedRoom);
        const player = JSON.parse(savedPlayer);
        console.log('Restoring session:', { room, player });
        setState(prev => ({
          ...prev,
          room,
          currentPlayer: player
        }));

        // Auto-navigate based on game phase
        const currentPath = window.location.pathname;
        if (room.phase === 'lobby' && currentPath !== '/lobby') {
          navigate('/lobby');
        } else if ((room.phase === 'role_assignment' || room.phase === 'discussion' ||
                   room.phase === 'voting' || room.phase === 'final_round' ||
                   room.phase === 'voting_final') && currentPath !== '/game') {
          navigate('/game');
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('uncoverles_room');
        localStorage.removeItem('uncoverles_player');
      }
    }

    initializeConnection();

    // Cleanup on unmount
    return () => {
      const socketManager = WorkingSocketManager.getInstance();
      socketManager.disconnect();
      isInitializedRef.current = false;
    };
  }, []);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a FixedGameProvider');
  }
  return context;
}
