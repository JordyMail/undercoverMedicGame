import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  Room,
  Player,
  GamePhase,
  PlayerRole,
  Disease,
  ChatMessage,
  FinalAnswer,
  GameResult,
  Reward
} from '../shared/game.js';

class GameManager {
  private rooms: Map<string, Room> = new Map();
  private playerRooms: Map<string, string> = new Map();
  private io: SocketIOServer;

  // Sample diseases for the game
  private diseases: Disease[] = [
    {
      id: '1',
      name: 'Tuberculosis',
      type: 'main',
      description: 'Bacterial infection affecting lungs',
      symptoms: ['persistent cough', 'chest pain', 'fatigue', 'weight loss']
    },
    {
      id: '2', 
      name: 'Pneumonia',
      type: 'differential',
      description: 'Lung infection causing inflammation',
      symptoms: ['cough with phlegm', 'fever', 'difficulty breathing', 'chest pain']
    },
    {
      id: '3',
      name: 'Diabetes Type 2',
      type: 'main',
      description: 'Metabolic disorder with high blood sugar',
      symptoms: ['increased thirst', 'frequent urination', 'fatigue', 'blurred vision']
    },
    {
      id: '4',
      name: 'Hypothyroidism',
      type: 'differential', 
      description: 'Underactive thyroid gland',
      symptoms: ['fatigue', 'weight gain', 'cold sensitivity', 'dry skin']
    },
    {
      id: '5',
      name: 'Hypertension',
      type: 'main',
      description: 'High blood pressure condition',
      symptoms: ['headaches', 'dizziness', 'chest pain', 'shortness of breath']
    }
  ];

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Ensure unique code
    if (this.rooms.has(result)) {
      return this.generateRoomCode();
    }
    
    return result;
  }

  createRoom(socket: Socket, playerName: string): void {
    try {
      if (!playerName || playerName.trim().length === 0) {
        socket.emit('error', 'Player name is required');
        return;
      }

      const roomCode = this.generateRoomCode();
      const playerId = socket.id;

      const player: Player = {
        id: playerId,
        name: playerName.trim(),
        isHost: true,
        isEliminated: false,
        points: 0
      };

      const room: Room = {
        id: roomCode,
        code: roomCode,
        players: [player],
        phase: GamePhase.LOBBY,
        round: 0,
        hostId: playerId,
        diseases: [],
        maxPlayers: 12,
        minPlayers: 4,
        currentVotes: {},
        finalVotes: {},
        chatMessages: []
      };

      this.rooms.set(roomCode, room);
      this.playerRooms.set(playerId, roomCode);

      socket.join(roomCode);
      socket.emit('room-created', room, playerId);
      console.log(`Room ${roomCode} created by player ${playerName} (${playerId})`);
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', 'Failed to create room. Please try again.');
    }
  }

  joinRoom(socket: Socket, roomCode: string, playerName: string): void {
    try {
      if (!roomCode || !playerName || playerName.trim().length === 0) {
        socket.emit('error', 'Room code and player name are required');
        return;
      }

      const room = this.rooms.get(roomCode.toUpperCase());
      const playerId = socket.id;

      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      if (room.players.length >= room.maxPlayers) {
        socket.emit('error', 'Room is full');
        return;
      }

      if (room.phase !== GamePhase.LOBBY) {
        socket.emit('error', 'Game already in progress');
        return;
      }

      // Check if player name already exists in the room
      if (room.players.some(p => p.name.toLowerCase() === playerName.trim().toLowerCase())) {
        socket.emit('error', 'Player name already taken in this room');
        return;
      }

      const player: Player = {
        id: playerId,
        name: playerName.trim(),
        isHost: false,
        isEliminated: false,
        points: 0
      };

      room.players.push(player);
      this.playerRooms.set(playerId, roomCode);

      socket.join(roomCode);
      socket.emit('room-joined', room, playerId);
      this.io.to(roomCode).emit('room-updated', room);
      console.log(`Player ${playerName} (${playerId}) joined room ${roomCode}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', 'Failed to join room. Please try again.');
    }
  }

  startGame(socket: Socket): void {
    const roomCode = this.playerRooms.get(socket.id);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player?.isHost) {
      socket.emit('error', 'Only host can start the game');
      return;
    }

    if (room.players.length < room.minPlayers) {
      socket.emit('error', `Minimum ${room.minPlayers} players required`);
      return;
    }

    // Assign roles and diseases
    this.assignRoles(room);
    
    room.phase = GamePhase.ROLE_ASSIGNMENT;
    room.round = 1;

    this.io.to(roomCode).emit('game-started', room);
    this.io.to(roomCode).emit('room-updated', room);
  }

  private assignRoles(room: Room): void {
    const playerCount = room.players.length;
    
    // Calculate role distribution
    const mainCount = Math.floor(playerCount * 0.6) || 1;
    const diffCount = Math.floor(playerCount * 0.3) || 1;
    const greyCount = playerCount - mainCount - diffCount;

    // Shuffle players
    const shuffledPlayers = [...room.players].sort(() => Math.random() - 0.5);
    
    // Select diseases
    const mainDiseases = this.diseases.filter(d => d.type === 'main');
    const diffDiseases = this.diseases.filter(d => d.type === 'differential');
    
    const selectedMainDisease = mainDiseases[Math.floor(Math.random() * mainDiseases.length)];
    const selectedDiffDisease = diffDiseases[Math.floor(Math.random() * diffDiseases.length)];

    // Assign roles
    let index = 0;
    
    // Main diagnose players
    for (let i = 0; i < mainCount; i++) {
      shuffledPlayers[index].role = PlayerRole.MAIN_DIAGNOSE;
      shuffledPlayers[index].disease = selectedMainDisease.name;
      index++;
    }
    
    // Differential diagnose players
    for (let i = 0; i < diffCount; i++) {
      shuffledPlayers[index].role = PlayerRole.DIFFERENTIAL_DIAGNOSE;
      shuffledPlayers[index].disease = selectedDiffDisease.name;
      index++;
    }
    
    // Doctor Grey players
    for (let i = 0; i < greyCount; i++) {
      shuffledPlayers[index].role = PlayerRole.DOCTOR_GREY;
      // No disease assigned
      index++;
    }

    room.diseases = [selectedMainDisease, selectedDiffDisease];
  }

  revealRole(socket: Socket): void {
    const roomCode = this.playerRooms.get(socket.id);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    socket.emit('role-assigned', player.role, player.disease);
    
    // Check if all players have revealed their roles
    const allRevealed = room.players.every(p => p.role);
    if (allRevealed) {
      room.phase = GamePhase.DISCUSSION;
      this.io.to(roomCode).emit('phase-changed', GamePhase.DISCUSSION);
      this.io.to(roomCode).emit('room-updated', room);
    }
  }

  sendChat(socket: Socket, message: string): void {
    const roomCode = this.playerRooms.get(socket.id);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      playerId: player.id,
      playerName: player.name,
      message,
      timestamp: Date.now(),
      type: 'chat'
    };

    room.chatMessages.push(chatMessage);
    this.io.to(roomCode).emit('chat-message', chatMessage);
  }

  submitAnswer(socket: Socket, answer: string): void {
    const roomCode = this.playerRooms.get(socket.id);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      playerId: player.id,
      playerName: player.name,
      message: `Diagnosis: ${answer}`,
      timestamp: Date.now(),
      type: 'answer'
    };

    room.chatMessages.push(chatMessage);
    this.io.to(roomCode).emit('chat-message', chatMessage);

    // Check if all active players have submitted answers
    const activePlayers = room.players.filter(p => !p.isEliminated);
    const submittedAnswers = room.chatMessages.filter(m => 
      m.type === 'answer' && 
      activePlayers.find(p => p.id === m.playerId)
    );

    if (submittedAnswers.length >= activePlayers.length) {
      room.phase = GamePhase.VOTING;
      this.io.to(roomCode).emit('phase-changed', GamePhase.VOTING);
      this.io.to(roomCode).emit('room-updated', room);
    }
  }

  votePlayer(socket: Socket, targetPlayerId: string): void {
    const roomCode = this.playerRooms.get(socket.id);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== GamePhase.VOTING) return;

    room.currentVotes[socket.id] = targetPlayerId;

    const activePlayers = room.players.filter(p => !p.isEliminated);
    const voteCount = Object.keys(room.currentVotes).length;

    if (voteCount >= activePlayers.length) {
      this.processElimination(room);
    }

    this.io.to(roomCode).emit('room-updated', room);
  }

  private processElimination(room: Room): void {
    // Count votes
    const voteMap: { [playerId: string]: number } = {};
    
    Object.values(room.currentVotes).forEach(targetId => {
      voteMap[targetId] = (voteMap[targetId] || 0) + 1;
    });

    // Find player with most votes
    let maxVotes = 0;
    let eliminatedId = '';
    
    Object.entries(voteMap).forEach(([playerId, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        eliminatedId = playerId;
      }
    });

    if (eliminatedId) {
      const eliminatedPlayer = room.players.find(p => p.id === eliminatedId);
      if (eliminatedPlayer) {
        eliminatedPlayer.isEliminated = true;
        room.eliminatedThisRound = eliminatedId;
        
        this.io.to(room.code).emit('player-eliminated', eliminatedId);
        
        // Award points for survival
        room.players.forEach(player => {
          if (!player.isEliminated) {
            player.points += 10; // Survival points
          }
        });
      }
    }

    // Reset votes
    room.currentVotes = {};
    room.round++;

    // Check if game should end
    const activePlayers = room.players.filter(p => !p.isEliminated);
    
    if (activePlayers.length <= 3) {
      room.phase = GamePhase.FINAL_ROUND;
      this.io.to(room.code).emit('phase-changed', GamePhase.FINAL_ROUND);
    } else {
      room.phase = GamePhase.DISCUSSION;
      this.io.to(room.code).emit('phase-changed', GamePhase.DISCUSSION);
    }

    this.io.to(room.code).emit('room-updated', room);
  }

  submitFinalAnswer(socket: Socket, answer: FinalAnswer): void {
    const roomCode = this.playerRooms.get(socket.id);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== GamePhase.FINAL_ROUND) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.isEliminated) return;

    player.finalAnswer = answer;
    player.points += 50; // Final round completion bonus

    // Check if all finalists have submitted
    const finalists = room.players.filter(p => !p.isEliminated);
    const submitted = finalists.filter(p => p.finalAnswer);

    if (submitted.length >= finalists.length) {
      room.phase = GamePhase.VOTING_FINAL;
      this.io.to(roomCode).emit('phase-changed', GamePhase.VOTING_FINAL);
      this.io.to(roomCode).emit('room-updated', room);
    }
  }

  voteFinal(socket: Socket, targetPlayerId: string): void {
    const roomCode = this.playerRooms.get(socket.id);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== GamePhase.VOTING_FINAL) return;

    const voter = room.players.find(p => p.id === socket.id);
    if (!voter || !voter.isEliminated) return; // Only eliminated players vote

    room.finalVotes[socket.id] = targetPlayerId;

    const eliminatedPlayers = room.players.filter(p => p.isEliminated);
    const finalVoteCount = Object.keys(room.finalVotes).length;

    if (finalVoteCount >= eliminatedPlayers.length) {
      this.endGame(room);
    }
  }

  private endGame(room: Room): void {
    // Count final votes
    const finalVoteMap: { [playerId: string]: number } = {};
    
    Object.values(room.finalVotes).forEach(targetId => {
      finalVoteMap[targetId] = (finalVoteMap[targetId] || 0) + 1;
    });

    // Award final voting points
    Object.entries(finalVoteMap).forEach(([playerId, votes]) => {
      const player = room.players.find(p => p.id === playerId);
      if (player) {
        player.points += votes * 20; // 20 points per vote received
      }
    });

    // Determine winner and create results
    const sortedPlayers = [...room.players].sort((a, b) => b.points - a.points);
    const winner = sortedPlayers[0];

    // Award special rewards
    const rewards: { [playerId: string]: Reward } = {};
    
    // Winner reward
    rewards[winner.id] = {
      title: winner.role === PlayerRole.DOCTOR_GREY ? 'Mastermind' : 'Champion',
      icon: winner.role === PlayerRole.DOCTOR_GREY ? '🧠' : '👑',
      points: winner.role === PlayerRole.DOCTOR_GREY ? 100 : 75,
      description: winner.role === PlayerRole.DOCTOR_GREY 
        ? 'Won without knowing the disease!' 
        : 'Medical diagnosis champion'
    };

    // Additional rewards for top performers
    if (sortedPlayers.length > 1) {
      rewards[sortedPlayers[1].id] = {
        title: 'Survivor',
        icon: '🥈',
        points: 50,
        description: 'Excellent medical performance'
      };
    }

    if (sortedPlayers.length > 2) {
      rewards[sortedPlayers[2].id] = {
        title: 'Diagnostician',
        icon: '🥉',
        points: 25,
        description: 'Strong medical knowledge'
      };
    }

    const results: GameResult = {
      winner,
      finalRanking: sortedPlayers,
      rewards
    };

    room.phase = GamePhase.RESULTS;
    this.io.to(room.code).emit('game-ended', results);
  }

  leaveRoom(socket: Socket): void {
    const roomCode = this.playerRooms.get(socket.id);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room) return;

    // Remove player from room
    room.players = room.players.filter(p => p.id !== socket.id);
    this.playerRooms.delete(socket.id);
    socket.leave(roomCode);

    if (room.players.length === 0) {
      // Delete empty room
      this.rooms.delete(roomCode);
    } else {
      // If host left, assign new host
      const leavingPlayer = room.players.find(p => p.id === socket.id);
      if (leavingPlayer?.isHost && room.players.length > 0) {
        room.players[0].isHost = true;
        room.hostId = room.players[0].id;
      }
      
      this.io.to(roomCode).emit('room-updated', room);
    }
  }

  handleDisconnect(socket: Socket): void {
    try {
      console.log(`Player disconnecting: ${socket.id}`);
      this.leaveRoom(socket);
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }
}

export default GameManager;
