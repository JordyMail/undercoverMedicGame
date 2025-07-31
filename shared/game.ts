export interface Player {
  id: string;
  name: string;
  role?: PlayerRole;
  disease?: string;
  isHost: boolean;
  isEliminated: boolean;
  votedFor?: string;
  finalAnswer?: FinalAnswer;
  points: number;
}

export interface FinalAnswer {
  treatment: string;
  innovation: string;
}

export enum PlayerRole {
  MAIN_DIAGNOSE = 'main_diagnose',
  DIFFERENTIAL_DIAGNOSE = 'differential_diagnose', 
  DOCTOR_GREY = 'doctor_grey'
}

export enum GamePhase {
  LOBBY = 'lobby',
  ROLE_ASSIGNMENT = 'role_assignment',
  DISCUSSION = 'discussion',
  VOTING = 'voting',
  FINAL_ROUND = 'final_round',
  VOTING_FINAL = 'voting_final',
  RESULTS = 'results'
}

export interface Room {
  id: string;
  code: string;
  players: Player[];
  phase: GamePhase;
  round: number;
  hostId: string;
  diseases: Disease[];
  maxPlayers: number;
  minPlayers: number;
  currentVotes: { [playerId: string]: string };
  finalVotes: { [voterId: string]: string };
  eliminatedThisRound?: string;
  chatMessages: ChatMessage[];
}

export interface Disease {
  id: string;
  name: string;
  type: 'main' | 'differential';
  description: string;
  symptoms: string[];
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: 'chat' | 'system' | 'answer';
}

export interface GameConfig {
  diseases: Disease[];
  roleDistribution: {
    mainDiagnose: number; // percentage
    differential: number; // percentage
    doctorGrey: number; // percentage
  };
}

export interface GameResult {
  winner: Player;
  finalRanking: Player[];
  rewards: { [playerId: string]: Reward };
}

export interface Reward {
  title: string;
  icon: string;
  points: number;
  description: string;
}

// Socket event types
export interface SocketEvents {
  // Client to Server
  'create-room': (playerName: string) => void;
  'join-room': (roomCode: string, playerName: string) => void;
  'start-game': () => void;
  'reveal-role': () => void;
  'send-chat': (message: string) => void;
  'submit-answer': (answer: string) => void;
  'vote-player': (targetPlayerId: string) => void;
  'submit-final-answer': (answer: FinalAnswer) => void;
  'vote-final': (targetPlayerId: string) => void;
  'leave-room': () => void;

  // Server to Client
  'room-created': (room: Room, playerId: string) => void;
  'room-joined': (room: Room, playerId: string) => void;
  'room-updated': (room: Room) => void;
  'game-started': () => void;
  'role-assigned': (role: PlayerRole, disease?: string) => void;
  'phase-changed': (phase: GamePhase) => void;
  'player-eliminated': (eliminatedPlayerId: string) => void;
  'game-ended': (results: GameResult) => void;
  'chat-message': (message: ChatMessage) => void;
  'error': (message: string) => void;
}
