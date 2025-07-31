import React, { createContext, useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { GamePhase, PlayerRole, type Room, type Player, type ChatMessage, type FinalAnswer, type GameResult } from '@shared/game';
import SocketManager from '../utils/socketManager';

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

export function GameProvider({ children }: { children: React.ReactNode }) {
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
  const socketManagerRef = useRef(SocketManager.getInstance());
  const isInitializedRef = useRef(false);

  // Simple function without useCallback to avoid dependency issues
  const initializeConnection = () => {
    if (isInitializedRef.current) {
      console.log('Connection already initialized');
      return;
    }

    if (state.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    console.log('Initializing socket connection...');
    isInitializedRef.current = true;
    
    try {
      const socket = socketManagerRef.current.getSocket();
      
      if (!socket) {
        setState(prev => ({ ...prev, error: 'Unable to create socket connection' }));
        isInitializedRef.current = false;
        return;
      }

      setState(prev => ({ ...prev, socket, isConnected: socket.connected }));

      // Set up event listeners
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        setState(prev => ({ ...prev, isConnected: true, error: null }));
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setState(prev => ({ ...prev, isConnected: false }));
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setState(prev => ({ ...prev, error: 'Connection failed. Please try again.' }));
        isInitializedRef.current = false; // Allow retry
      });

      // Game event handlers
      socket.on('room-created', (room: Room, playerId: string) => {
        const player = room.players.find(p => p.id === playerId);
        setState(prev => ({ ...prev, room, currentPlayer: player || null, error: null }));
        setTimeout(() => navigate('/lobby'), 100);
      });

      socket.on('room-joined', (room: Room, playerId: string) => {
        const player = room.players.find(p => p.id === playerId);
        setState(prev => ({ ...prev, room, currentPlayer: player || null, error: null }));
        setTimeout(() => navigate('/lobby'), 100);
      });

      socket.on('room-updated', (room: Room) => {
        setState(prev => ({ ...prev, room }));
      });

      socket.on('game-started', () => {
        setTimeout(() => navigate('/game'), 100);
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
        setTimeout(() => navigate('/results', { state: results }), 100);
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

    } catch (error) {
      console.error('Error initializing connection:', error);
      setState(prev => ({ ...prev, error: 'Failed to initialize connection' }));
      isInitializedRef.current = false;
    }
  };

  // Actions using arrow functions to avoid this binding issues
  const createRoom = async (playerName: string) => {
    if (!state.socket) {
      setState(prev => ({ ...prev, error: 'Please initialize connection first' }));
      return;
    }
    
    setState(prev => ({ ...prev, error: null }));
    state.socket.emit('create-room', playerName);
  };

  const joinRoom = async (roomCode: string, playerName: string) => {
    if (!state.socket) {
      setState(prev => ({ ...prev, error: 'Please initialize connection first' }));
      return;
    }
    
    setState(prev => ({ ...prev, error: null }));
    state.socket.emit('join-room', roomCode, playerName);
  };

  const startGame = () => {
    if (!state.socket) return;
    state.socket.emit('start-game');
  };

  const revealRole = () => {
    if (!state.socket) return;
    state.socket.emit('reveal-role');
  };

  const sendChat = (message: string) => {
    if (!state.socket) return;
    state.socket.emit('send-chat', message);
  };

  const submitAnswer = (answer: string) => {
    if (!state.socket) return;
    state.socket.emit('submit-answer', answer);
  };

  const votePlayer = (targetPlayerId: string) => {
    if (!state.socket) return;
    state.socket.emit('vote-player', targetPlayerId);
  };

  const submitFinalAnswer = (answer: FinalAnswer) => {
    if (!state.socket) return;
    state.socket.emit('submit-final-answer', answer);
  };

  const voteFinal = (targetPlayerId: string) => {
    if (!state.socket) return;
    state.socket.emit('vote-final', targetPlayerId);
  };

  const leaveRoom = () => {
    if (!state.socket) return;
    state.socket.emit('leave-room');
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

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
