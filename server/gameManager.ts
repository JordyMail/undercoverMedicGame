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
      socket.emit('room-created', this.sanitizeRoomForClient(room), playerId);
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
      socket.emit('room-joined', this.sanitizeRoomForClient(room), playerId);
      this.broadcastRoomUpdate(room);
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

    this.assignRoles(room);
    
    room.phase = GamePhase.ROLE_ASSIGNMENT;
    room.round = 1;

    this.io.to(roomCode).emit('game-started');
    this.broadcastRoomUpdate(room);
  }

  private assignRoles(room: Room): void {
    const playerCount = room.players.length;
    
    const mainCount = Math.floor(playerCount * 0.6) || 1;
    const diffCount = Math.floor(playerCount * 0.3) || 1;
    const greyCount = playerCount - mainCount - diffCount;

    const shuffledPlayers = [...room.players].sort(() => Math.random() - 0.5);
    
    const mainDiseases = this.diseases.filter(d => d.type === 'main');
    const diffDiseases = this.diseases.filter(d => d.type === 'differential');
    
    const selectedMainDisease = mainDiseases[Math.floor(Math.random() * mainDiseases.length)];
    const selectedDiffDisease = diffDiseases[Math.floor(Math.random() * diffDiseases.length)];

    let index = 0;
    
    for (let i = 0; i < mainCount; i++) {
      shuffledPlayers[index].role = PlayerRole.MAIN_DIAGNOSE;
      shuffledPlayers[index].disease = selectedMainDisease.name;
      index++;
    }
    
    for (let i = 0; i < diffCount; i++) {
      shuffledPlayers[index].role = PlayerRole.DIFFERENTIAL_DIAGNOSE;
      shuffledPlayers[index].disease = selectedDiffDisease.name;
      index++;
    }
    
    for (let i = 0; i < greyCount; i++) {
      shuffledPlayers[index].role = PlayerRole.DOCTOR_GREY;
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
    
    const allRevealed = room.players.every(p => p.role);
    if (allRevealed) {
      room.phase = GamePhase.DISCUSSION;
      this.io.to(roomCode).emit('phase-changed', GamePhase.DISCUSSION);
      this.broadcastRoomUpdate(room);
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

    const activePlayers = room.players.filter(p => !p.isEliminated);
    const submittedAnswers = room.chatMessages.filter(m => 
      m.type === 'answer' && 
      activePlayers.some(p => p.id === m.playerId)
    );

    if (submittedAnswers.length >= activePlayers.length) {
      room.phase = GamePhase.VOTING;
      this.io.to(roomCode).emit('phase-changed', GamePhase.VOTING);
      this.broadcastRoomUpdate(room);
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

    this.broadcastRoomUpdate(room);
  }

  private processElimination(room: Room): void {
    const voteMap: { [playerId: string]: number } = {};
    
    Object.values(room.currentVotes).forEach(targetId => {
      voteMap[targetId] = (voteMap[targetId] || 0) + 1;
    });

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
        
        room.players.forEach(player => {
          if (!player.isEliminated) {
            player.points += 10;
          }
        });
      }
    }

    room.currentVotes = {};
    room.round++;

    const activePlayers = room.players.filter(p => !p.isEliminated);
    
    if (activePlayers.length <= 3) {
      room.phase = GamePhase.FINAL_ROUND;
      this.io.to(room.code).emit('phase-changed', GamePhase.FINAL_ROUND);
    } else {
      room.phase = GamePhase.DISCUSSION;
      this.io.to(room.code).emit('phase-changed', GamePhase.DISCUSSION);
    }

    this.broadcastRoomUpdate(room);
  }

  private sanitizeRoomForClient(room: Room): any {
    return {
      id: room.id,
      code: room.code,
      phase: room.phase,
      round: room.round,
      hostId: room.hostId,
      maxPlayers: room.maxPlayers,
      minPlayers: room.minPlayers,
      eliminatedThisRound: room.eliminatedThisRound,
      currentVotes: room.currentVotes,
      finalVotes: room.finalVotes,
      chatMessages: room.chatMessages,
      diseases: room.diseases,
      players: room.players.map(player => ({
        id: player.id,
        name: player.name,
        role: player.role,
        disease: player.disease,
        isHost: player.isHost,
        isEliminated: player.isEliminated,
        votedFor: player.votedFor,
        finalAnswer: player.finalAnswer,
        points: player.points
      }))
    };
  }

  private broadcastRoomUpdate(room: Room): void {
    const sanitizedRoom = this.sanitizeRoomForClient(room);
    this.io.to(room.code).emit('room-updated', sanitizedRoom);
    console.log(`📢 Broadcast room update for ${room.code}:`, {
      phase: room.phase,
      players: room.players.map(p => ({
        name: p.name,
        eliminated: p.isEliminated,
        hasFinalAnswer: !!p.finalAnswer
      }))
    });
  }

  submitFinalAnswer(socket: Socket, answer: FinalAnswer): void {
    console.log('📝 Final answer submitted:', { socketId: socket.id });
    
    const roomCode = this.playerRooms.get(socket.id);
    if (!roomCode) {
      console.log('❌ No room found for socket');
      socket.emit('error', 'No room found');
      return;
    }

    const room = this.rooms.get(roomCode);
    if (!room) {
      console.log('❌ Room not found');
      return;
    }

    if (room.phase !== GamePhase.FINAL_ROUND) {
      console.log('❌ Invalid phase:', room.phase);
      socket.emit('error', 'Not in final round');
      return;
    }

    const player = room.players.find(p => p.id === socket.id);
    if (!player) {
      console.log('❌ Player not found');
      return;
    }

    if (player.isEliminated) {
      console.log('❌ Player is eliminated');
      socket.emit('error', 'Eliminated players cannot submit');
      return;
    }

    // Save final answer
    player.finalAnswer = answer;
    console.log(`✅ Final answer saved for ${player.name}`);

    // Send confirmation to player
    socket.emit('final-answer-submitted', { success: true });

    // Broadcast updated room
    this.broadcastRoomUpdate(room);

    // Check if all finalists have submitted
    const finalists = room.players.filter(p => !p.isEliminated);
    const submitted = finalists.filter(p => p.finalAnswer);
    
    console.log(`Finalists: ${finalists.length}, Submitted: ${submitted.length}`);

    // If all submitted, move to voting phase
    if (submitted.length === finalists.length && finalists.length > 0) {
      console.log('🎯 ALL FINALISTS SUBMITTED! Moving to VOTING_FINAL');
      
      room.phase = GamePhase.VOTING_FINAL;
      
      // Broadcast phase change and room update
      this.io.to(roomCode).emit('phase-changed', GamePhase.VOTING_FINAL);
      this.broadcastRoomUpdate(room);
      
      console.log('✅ Phase changed to VOTING_FINAL');
    }
  }

 voteFinal(socket: Socket, targetPlayerId: string): void {
  console.log('========== VOTE FINAL RECEIVED ==========');
  console.log('📥 Raw vote data:', { 
    voterId: socket.id, 
    targetId: targetPlayerId,
    socketExists: !!socket,
    roomCode: this.playerRooms.get(socket.id)
  });
  
  const roomCode = this.playerRooms.get(socket.id);
  if (!roomCode) {
    console.log('❌ CRITICAL: No room found for voter', socket.id);
    socket.emit('error', 'No room found');
    return;
  }

  const room = this.rooms.get(roomCode);
  if (!room) {
    console.log('❌ CRITICAL: Room not found for code', roomCode);
    return;
  }

  console.log('Room state before vote:', {
    code: room.code,
    phase: room.phase,
    finalVotes: room.finalVotes,
    players: room.players.map(p => ({ 
      id: p.id, 
      name: p.name, 
      eliminated: p.isEliminated 
    }))
  });

  // VALIDASI PHASE
  if (room.phase !== GamePhase.VOTING_FINAL) {
    console.log('❌ Invalid phase for voting. Expected:', GamePhase.VOTING_FINAL, 'Got:', room.phase);
    socket.emit('error', 'Not in final voting phase');
    return;
  }

  const voter = room.players.find(p => p.id === socket.id);
  if (!voter) {
    console.log('❌ Voter not found in players array');
    return;
  }

  console.log('Voter info:', { 
    name: voter.name, 
    eliminated: voter.isEliminated,
    hasVoted: !!room.finalVotes[socket.id]
  });

  // VALIDASI: Hanya eliminated players yang boleh vote
  if (!voter.isEliminated) {
    console.log('❌ Non-eliminated player cannot vote');
    socket.emit('error', 'Only eliminated players can vote');
    return;
  }

  // VALIDASI: Cek apakah sudah pernah vote
  if (room.finalVotes[socket.id]) {
    console.log('❌ Player already voted for:', room.finalVotes[socket.id]);
    socket.emit('error', 'You have already voted');
    return;
  }

  // VALIDASI: Cek target vote valid
  const targetPlayer = room.players.find(p => p.id === targetPlayerId);
  if (!targetPlayer) {
    console.log('❌ Target player not found:', targetPlayerId);
    socket.emit('error', 'Target player not found');
    return;
  }

  console.log('Target info:', { 
    name: targetPlayer.name, 
    eliminated: targetPlayer.isEliminated,
    isFinalist: !targetPlayer.isEliminated
  });

  if (targetPlayer.isEliminated) {
    console.log('❌ Cannot vote for eliminated player');
    socket.emit('error', 'Cannot vote for eliminated player');
    return;
  }

  // 🔴 SIMPAN VOTE
  room.finalVotes[socket.id] = targetPlayerId;
  console.log(`✅ VOTE SAVED: ${voter.name} (${socket.id}) voted for ${targetPlayer.name} (${targetPlayerId})`);
  console.log('Updated finalVotes:', room.finalVotes);

  // 🔴 KIRIM KONFIRMASI KE CLIENT
  socket.emit('vote-recorded', { 
    success: true, 
    targetId: targetPlayerId,
    voteCount: Object.keys(room.finalVotes).length
  });

  // Broadcast updated room ke semua client
  this.broadcastRoomUpdate(room);

  // 🔴 CEK APAKAH SEMUA SUDAH VOTE
  const eliminatedPlayers = room.players.filter(p => p.isEliminated);
  const finalVoteCount = Object.keys(room.finalVotes).length;

  console.log(`Vote progress: ${finalVoteCount}/${eliminatedPlayers.length}`);

  // Jika semua eliminated players sudah vote, END GAME
  if (finalVoteCount >= eliminatedPlayers.length && eliminatedPlayers.length > 0) {
    console.log('🎯 ALL VOTES RECEIVED! Ending game immediately...');
    this.endGame(room);
  } else {
    console.log(`⏳ Still waiting for ${eliminatedPlayers.length - finalVoteCount} more votes`);
  }
  
  console.log('========== VOTE PROCESSING COMPLETE ==========');
}

 private endGame(room: Room): void {
  console.log('🏁 Ending game for room:', room.code);
  console.log('Final votes:', room.finalVotes);
  
  // Hitung votes
  const voteMap: { [playerId: string]: number } = {};
  
  Object.values(room.finalVotes).forEach(targetId => {
    voteMap[targetId] = (voteMap[targetId] || 0) + 1;
  });

  console.log('Vote counts:', voteMap);

  // Berikan poin berdasarkan votes
  Object.entries(voteMap).forEach(([playerId, votes]) => {
    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.points += votes * 20;
      console.log(`🏆 ${player.name} received ${votes} votes (+${votes * 20} points)`);
    }
  });

  // Urutkan pemain berdasarkan poin
  const sortedPlayers = [...room.players].sort((a, b) => b.points - a.points);
  const winner = sortedPlayers[0];

  console.log(`👑 Winner: ${winner.name} with ${winner.points} points`);

  // Buat rewards
  const rewards: { [playerId: string]: Reward } = {};
  
  rewards[winner.id] = {
    title: winner.role === PlayerRole.DOCTOR_GREY ? 'Mastermind' : 'Champion',
    icon: winner.role === PlayerRole.DOCTOR_GREY ? '🧠' : '👑',
    points: winner.role === PlayerRole.DOCTOR_GREY ? 100 : 75,
    description: winner.role === PlayerRole.DOCTOR_GREY 
      ? 'Won without knowing the disease!' 
      : 'Medical diagnosis champion'
  };

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

  // Ubah phase ke RESULTS
  room.phase = GamePhase.RESULTS;
  
  // 🔴 KIRIM RESULTS KE SEMUA CLIENT
  console.log('📊 Sending game results to clients:', results);
  this.io.to(room.code).emit('game-ended', results);
  
  // Broadcast room update terakhir
  this.broadcastRoomUpdate(room);
  
  console.log('✅ Game ended successfully');
}

  leaveRoom(socket: Socket): void {
    const roomCode = this.playerRooms.get(socket.id);
    if (!roomCode) return;

    const room = this.rooms.get(roomCode);
    if (!room) return;

    room.players = room.players.filter(p => p.id !== socket.id);
    this.playerRooms.delete(socket.id);
    socket.leave(roomCode);

    if (room.players.length === 0) {
      this.rooms.delete(roomCode);
      console.log(`Room ${roomCode} deleted (empty)`);
    } else {
      const leavingPlayer = room.players.find(p => p.id === socket.id);
      if (leavingPlayer?.isHost && room.players.length > 0) {
        room.players[0].isHost = true;
        room.hostId = room.players[0].id;
      }
      
      this.broadcastRoomUpdate(room);
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