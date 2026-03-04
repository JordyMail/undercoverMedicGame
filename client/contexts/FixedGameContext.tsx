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
  const [state, setState] = useState<GameContextState>({
    socket: null,
    room: null,
    currentPlayer: null,
    isConnected: false,
    error: null,
    myRole: null,
    myDisease: null,
    initializeConnection: () => {},
    createRoom: async () => {},
    joinRoom: async () => {},
    startGame: () => {},
    revealRole: () => {},
    sendChat: () => {},
    submitAnswer: () => {},
    votePlayer: () => {},
    submitFinalAnswer: () => {},
    voteFinal: () => {},
    leaveRoom: () => {},
  });

  const navigate = useNavigate();
  const isInitializedRef = useRef(false);

  // Helper function to update current player from room data
  const updateCurrentPlayerFromRoom = (room: Room | null) => {
    if (!room || !state.currentPlayer?.id) return;
    
    const updatedPlayer = room.players.find(p => p.id === state.currentPlayer?.id);
    if (updatedPlayer) {
      // Cek apakah ada perubahan status eliminated
      const wasEliminated = state.currentPlayer.isEliminated;
      const isNowEliminated = updatedPlayer.isEliminated;
      
      if (wasEliminated !== isNowEliminated) {
        console.log('🔄 Player eliminated status changed:', {
          name: updatedPlayer.name,
          was: wasEliminated,
          now: isNowEliminated
        });
      }
      
      setState((prev: GameContextState) => ({
        ...prev,
        currentPlayer: updatedPlayer as Player
      }));
    }
  };

  // Initialize socket connection
  const initializeConnection = () => {

    if (isInitializedRef.current && state.error) {
      console.log('Resetting connection due to error');
      isInitializedRef.current = false;
    }

    if (isInitializedRef.current) {
      console.log('Connection already initialized');
      return;
    }

    console.log('Initializing socket connection...');
    try {
      const socketManager = WorkingSocketManager.getInstance();
      const socket = socketManager.getSocket();

      if (socket) {
        setState((prev: GameContextState) => ({
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
      setState((prev: GameContextState) => ({ ...prev, error: 'Failed to connect to server' }));
      isInitializedRef.current = false;
    }
  };

  // Setup socket event listeners
  const setupSocketListeners = (socket: Socket) => {
    socket.on('connect', () => {
      console.log('Connected to server');
      setState((prev: GameContextState) => ({ ...prev, isConnected: true, error: null }));

      // Try to rejoin room if we have session data
      // const savedRoom = localStorage.getItem('uncoverles_room');
      // const savedPlayer = localStorage.getItem('uncoverles_player');

      // if (savedRoom && savedPlayer) {
      //   try {
      //     const room: Room = JSON.parse(savedRoom);
      //     const player: Player = JSON.parse(savedPlayer);

      //     // Try to rejoin room for all active phases
      //     if (room.phase !== 'results') {
      //       console.log('Attempting to rejoin room:', room.code, 'Phase:', room.phase);
      //       socket.emit('join-room', room.code, player.name);
      //     }
      //   } catch (error) {
      //     console.error('Failed to rejoin room:', error);
      //   }
      // }
    });

socket.on('disconnect', (reason) => {
    console.log('Disconnected from server:', reason);
    setState((prev: GameContextState) => ({ ...prev, isConnected: false }));
    
    // 🔴 PERBAIKAN: Jika disconnect karena server, coba reconnect manual
    if (reason === 'io server disconnect') {
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        socket.connect();
      }, 3000);
    }
  });

  socket.on('error', (error: string) => {
    console.error('Socket error:', error);
    setState((prev: GameContextState) => ({ ...prev, error }));
    
    // 🔴 PERBAIKAN: Jika error karena too many attempts, tunggu lebih lama
    if (error.includes('Too many connection attempts')) {
      setTimeout(() => {
        console.log('Retrying connection after rate limit...');
        socket.connect();
      }, 5000);
    }
  });

    socket.on('room-created', (room: Room, playerId: string) => {
      console.log('Room created:', room, 'Player ID:', playerId);
      const currentPlayer = room.players.find(p => p.id === playerId);
      setState((prev: GameContextState) => ({ 
        ...prev, 
        room: room as Room,  // <-- type assertion
        currentPlayer: currentPlayer as Player, // <-- type assertion
        error: null 
      }));
      // Save to localStorage for persistence
      localStorage.setItem('uncoverles_room', JSON.stringify(room));
      localStorage.setItem('uncoverles_player', JSON.stringify(currentPlayer));
      navigate('/lobby');
    });

    socket.on('room-joined', (room: Room, playerId: string) => {
      console.log('Room joined:', room, 'Player ID:', playerId);
      const currentPlayer = room.players.find(p => p.id === playerId);
            setState((prev: GameContextState) => ({ 
        ...prev, 
        room: room as Room,  // <-- type assertion
        currentPlayer: currentPlayer as Player, // <-- type assertion
        error: null 
      }));
      // Save to localStorage for persistence
      localStorage.setItem('uncoverles_room', JSON.stringify(room));
      localStorage.setItem('uncoverles_player', JSON.stringify(currentPlayer));
      navigate('/lobby');
    });

    socket.on('player-joined', (room: Room) => {
      console.log('New player joined room:', room);
      setState((prev: GameContextState) => ({ 
        ...prev, 
        room: room as Room  // <-- type assertion
      }));
      // Save to localStorage for persistence
      localStorage.setItem('uncoverles_room', JSON.stringify(room));
    });

    socket.on('room-updated', (room: Room) => {
      console.log('📥 ROOM UPDATED FROM SERVER:', {
        phase: room.phase,
        finalVotes: room.finalVotes,
        players: room.players.map(p => ({ 
          name: p.name, 
          eliminated: p.isEliminated,
          finalAnswer: !!p.finalAnswer,
          votedFor: p.votedFor
        }))
      });
      
      setState((prev: GameContextState) => {
        // Update current player dari room
        let updatedCurrentPlayer = prev.currentPlayer;
        if (prev.currentPlayer?.id) {
          const freshPlayer = room.players.find(p => p.id === prev.currentPlayer?.id);
          if (freshPlayer) {
            updatedCurrentPlayer = freshPlayer as Player;
          }
        }
        
        return {
          ...prev,
          room: room as Room,
          currentPlayer: updatedCurrentPlayer
        };
      });
      
      localStorage.setItem('uncoverles_room', JSON.stringify(room));
    });

    socket.on('game-started', (room: Room) => {
      console.log('Game started:', room);
      setState((prev: GameContextState) => ({ ...prev, room: room as Room }));
      // Save to localStorage for persistence
      localStorage.setItem('uncoverles_room', JSON.stringify(room));
      navigate('/game');
    });

  socket.on('role-assigned', (role: PlayerRole, disease?: string) => {
    console.log('Role assigned:', role, disease);
    setState((prev: GameContextState) => {
      if (prev.currentPlayer?.id) {
        localStorage.setItem(`role_${prev.currentPlayer.id}`, role);
        if (disease) {
          localStorage.setItem(`disease_${prev.currentPlayer.id}`, disease);
        }
      }
      return { ...prev, myRole: role, myDisease: disease || null };
    });
  });

    socket.on('game-updated', (room: Room) => {
      console.log('Game updated:', room);
      setState((prev: GameContextState) => ({ ...prev, room: room as Room }));
      
      // 🔴 PERBAIKAN: Update currentPlayer dari room data
      if (state.currentPlayer?.id) {
        const updatedPlayer = room.players.find(p => p.id === state.currentPlayer?.id);
        if (updatedPlayer) {
          setState((prev: GameContextState) => ({
            ...prev,
            currentPlayer: updatedPlayer as Player
          }));
        }
      }
      
      // Save to localStorage for persistence
      localStorage.setItem('uncoverles_room', JSON.stringify(room));
    });

    socket.on('chat-message', (message: ChatMessage) => {
      console.log('New chat message:', message);
      setState((prev: GameContextState) => {
        const updatedRoom = prev.room ? {
          ...prev.room,
          chatMessages: [...prev.room.chatMessages, message as ChatMessage]
        } : null;

        if (updatedRoom) {
          localStorage.setItem('uncoverles_room', JSON.stringify(updatedRoom));
        }

        return { ...prev, room: updatedRoom as Room | null };
      });
    });

    socket.on('phase-changed', (phase: GamePhase) => {
      console.log('🔄 Game phase changed to:', phase);
      setState((prev: GameContextState) => {
        const updatedRoom = prev.room ? {
          ...prev.room,
          phase: phase as GamePhase
        } : null;

        if (updatedRoom) {
          localStorage.setItem('uncoverles_room', JSON.stringify(updatedRoom));
        }

        return { ...prev, room: updatedRoom as Room | null };
      }); 
    });

    socket.on('player-eliminated', (eliminatedPlayerId: string) => {
      console.log('⚰️ Player eliminated:', eliminatedPlayerId);
      
      setState((prev: GameContextState) => {
        if (!prev.room) return prev;
        
        const updatedRoom: Room = {
          ...prev.room,
          eliminatedThisRound: eliminatedPlayerId,
          players: prev.room.players.map(p => 
            p.id === eliminatedPlayerId 
              ? { ...p, isEliminated: true }
              : p
          )
        };

        localStorage.setItem('uncoverles_room', JSON.stringify(updatedRoom));

        return {
          ...prev,
          room: updatedRoom,
          currentPlayer: prev.currentPlayer?.id === eliminatedPlayerId 
            ? { ...prev.currentPlayer, isEliminated: true } as Player
            : prev.currentPlayer
        };
      });
    });

    socket.on('vote-recorded', (data) => {
      console.log('✅ VOTE RECORDED BY SERVER:', data);
    });

    socket.on('final-answer-submitted', (data) => {
      console.log('✅ Final answer confirmed by server', data);
    });

    socket.on('game-ended', (results: GameResult) => {
      console.log('🏆 GAME ENDED - RECEIVED RESULTS:', results);
      
      setState((prev: GameContextState) => ({
        ...prev,
        room: prev.room ? { 
          ...prev.room, 
          winner: results.winner.id,
          phase: GamePhase.RESULTS 
        } as Room : null
      }));
  
      // 1. Hapus room dan player data
      localStorage.removeItem('uncoverles_room');
      localStorage.removeItem('uncoverles_player');
      localStorage.removeItem('uncoverles_results');
      
      // Dapatkan semua kunci localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('revealed_') || key.startsWith('role_') || key.startsWith('disease_'))) {
          keysToRemove.push(key);
        }
      }

        // Hapus semua kunci yang ditemukan
      keysToRemove.forEach(key => {
        console.log('🧹 Cleaning up localStorage key:', key);
        localStorage.removeItem(key);
      });
      
      // Reset state
      setState((prev: GameContextState) => ({
        socket: prev.socket,
        room: null,
        currentPlayer: null,
        isConnected: prev.isConnected,
        error: null,
        myRole: null,
        myDisease: null,
        initializeConnection: prev.initializeConnection,
        createRoom: prev.createRoom,
        joinRoom: prev.joinRoom,
        startGame: prev.startGame,
        revealRole: prev.revealRole,
        sendChat: prev.sendChat,
        submitAnswer: prev.submitAnswer,
        votePlayer: prev.votePlayer,
        submitFinalAnswer: prev.submitFinalAnswer,
        voteFinal: prev.voteFinal,
        leaveRoom: prev.leaveRoom,
      }));
      
      // Navigate
      navigate('/results', { state: results });
    });
  };

  // Game actions that use socket
  const createRoom = async (playerName: string) => {
    if (!state.socket || !state.isConnected) {
      setState((prev: GameContextState) => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    setState((prev: GameContextState) => ({ ...prev, error: null }));
    state.socket.emit('create-room', playerName);
  };

  const joinRoom = async (roomCode: string, playerName: string) => {
    if (!state.socket || !state.isConnected) {
      setState((prev: GameContextState) => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    setState((prev: GameContextState) => ({ ...prev, error: null }));
    state.socket.emit('join-room', roomCode, playerName);
  };

  const startGame = () => {
    if (!state.socket || !state.isConnected) {
      setState((prev: GameContextState) => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    state.socket.emit('start-game');
  };

  const revealRole = () => {
    if (!state.socket || !state.isConnected) {
      setState((prev: GameContextState) => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    state.socket.emit('reveal-role');
  };

  const sendChat = (message: string) => {
    if (!state.socket || !state.isConnected) {
      setState((prev: GameContextState) => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    state.socket.emit('send-chat', message);
  };

  const submitAnswer = (answer: string) => {
    if (!state.socket || !state.isConnected) {
      setState((prev: GameContextState) => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    console.log('Emitting submit-answer:', answer);
    state.socket.emit('submit-answer', answer);
  };

  const votePlayer = (targetPlayerId: string) => {
    if (!state.socket || !state.isConnected) {
      setState((prev: GameContextState) => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    state.socket.emit('vote-player', targetPlayerId);
  };

  const submitFinalAnswer = (answer: FinalAnswer) => {
    if (!state.socket || !state.isConnected) {
      setState((prev: GameContextState) => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    console.log('Emitting submit-final-answer:', answer);
    state.socket.emit('submit-final-answer', answer);
  };

  const voteFinal = (targetPlayerId: string) => {
    if (!state.socket || !state.isConnected) {
      console.error('❌ Cannot vote: Socket not connected');
      setState((prev: GameContextState) => ({ ...prev, error: 'Not connected to server' }));
      return;
    }

    console.log('🗳️ Sending vote to server:', {
      targetId: targetPlayerId,
      socketId: state.socket.id,
      connected: state.isConnected
    });

    // 🔴 KIRIM VOTE
    state.socket.emit('vote-final', targetPlayerId);
    
    // 🔴 LANGSUNG UPDATE LOCAL STATE
    setState((prev: GameContextState) => ({
      ...prev,
      currentPlayer: prev.currentPlayer ? {
        ...prev.currentPlayer,
        votedFor: targetPlayerId
      } : null
    }));
    
    // 🔴 TAMBAHKAN TIMEOUT UNTUK CEK RESPON
    setTimeout(() => {
      if (state.socket && !state.room?.finalVotes?.[state.socket.id || '']) {
        console.warn('⚠️ Vote may not have reached server, retrying...');
        state.socket?.emit('vote-final', targetPlayerId);
      }
    }, 2000);
  };

  const leaveRoom = () => {
    if (state.socket && state.isConnected) {
      state.socket.emit('leave-room');
    }

    // Clear session data
    localStorage.removeItem('uncoverles_room');
    localStorage.removeItem('uncoverles_player');
    localStorage.removeItem('uncoverles_results');

    // Hapus semua data reveal
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('revealed_') || key.startsWith('role_') || key.startsWith('disease_'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      console.log('🧹 Cleaning up localStorage key:', key);
      localStorage.removeItem(key);
    });

    setState((prev: GameContextState) => ({
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
        const room: Room = JSON.parse(savedRoom);
        const player: Player = JSON.parse(savedPlayer);
        console.log('Restoring session:', { room, player });
        setState((prev: GameContextState) => ({
          ...prev,
          room: room as Room,
          currentPlayer: player as Player
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

  // 🔴 PERBAIKAN: Periodic check untuk memastikan currentPlayer sinkron
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.room && state.currentPlayer) {
        const freshPlayerData = state.room.players.find(p => p.id === state.currentPlayer?.id);
        if (freshPlayerData) {
          // Cek apakah ada perbedaan
          if (freshPlayerData.isEliminated !== state.currentPlayer.isEliminated ||
              JSON.stringify(freshPlayerData.finalAnswer) !== JSON.stringify(state.currentPlayer.finalAnswer) ||
              freshPlayerData.votedFor !== state.currentPlayer.votedFor) {
            
            console.log('🔄 Syncing current player data:', {
              name: freshPlayerData.name,
              eliminated: freshPlayerData.isEliminated,
              hadFinalAnswer: !!freshPlayerData.finalAnswer,
              votedFor: freshPlayerData.votedFor
            });
            
            setState((prev: GameContextState) => ({
              ...prev,
              currentPlayer: freshPlayerData as Player
            }));
          }
        }
      }
    }, 2000); // Cek setiap 2 detik
    
    return () => clearInterval(interval);
  }, [state.room, state.currentPlayer]);

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