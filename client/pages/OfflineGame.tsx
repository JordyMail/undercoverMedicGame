import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Users,
  Eye,
  MessageSquare,
  Vote,
  Trophy,
  RotateCcw,
  Home,
  ChevronRight,
  AlertTriangle,
  Play,
  Clock,
  Skull,
  Stethoscope,
  UserCheck,
  Heart,
  X,
  LogOut,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

// Types
type PlayerRole = 'civilian' | 'undercover' | 'mrwhite' | null;
type GamePhase = 'loading' | 'passDevice' | 'distribution' | 'playing' | 'voting' | 'elimination' | 'finished';

interface Player {
  id: string;
  name: string;
  avatar_id: number;
  role: PlayerRole;
  word?: string;
  hint?: string;
  category?: string;
  is_alive: boolean;
  has_seen_word: boolean;
  vote_count: number;
  mrWhiteCorrectGuess?: boolean;
  finalAnswer?: {
    treatment: string;
    innovation: string;
  };
}

interface VoteRecord {
  round: number;
  voterId: string;
  targetId: string;
  voterRole: PlayerRole;
  targetRole: PlayerRole;
  eliminatedId?: string;
  eliminatedRole?: PlayerRole;
}

interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  round: number;
  civilianWord: string;
  undercoverWord: string;
  category: string;
  eliminatedPlayer: Player | null;
  winner: 'civilian' | 'undercover' | 'mrwhite' | null;
  winReason: string;
  votingHistory: VoteRecord[];
  chatMessages: {
    id: string;
    playerId: string;
    playerName: string;
    message: string;
    timestamp: Date;
  }[];
}

// Mock data for diseases
const DISEASE_CATEGORIES = [
  'Penyakit Jantung',
  'Penyakit Paru-paru',
  'Penyakit Kulit',
  'Penyakit Saraf',
  'Penyakit Dalam',
  'Penyakit Anak'
];

const DISEASE_WORDS: Record<string, { civilian: string; undercover: string }> = {
  'Penyakit Jantung': {
    civilian: 'Aritmia',
    undercover: 'Takikardia'
  },
  'Penyakit Paru-paru': {
    civilian: 'Asma',
    undercover: 'Bronkitis'
  },
  'Penyakit Kulit': {
    civilian: 'Eksim',
    undercover: 'Psoriasis'
  },
  'Penyakit Saraf': {
    civilian: 'Migrain',
    undercover: 'Vertigo'
  },
  'Penyakit Dalam': {
    civilian: 'Diabetes',
    undercover: 'Hipertensi'
  },
  'Penyakit Anak': {
    civilian: 'Campak',
    undercover: 'Cacar Air'
  }
};

// Mock avatars
const AVATARS = [
  { id: 1, icon: '👨‍⚕️', name: 'Dokter Pria' },
  { id: 2, icon: '👩‍⚕️', name: 'Dokter Wanita' },
  { id: 3, icon: '🩺', name: 'Perawat' },
  { id: 4, icon: '💊', name: 'Apoteker' },
  { id: 5, icon: '🔬', name: 'Peneliti' },
  { id: 6, icon: '🏥', name: 'Rumah Sakit' },
  { id: 7, icon: '🚑', name: 'Paramedis' },
  { id: 8, icon: '🧬', name: 'Ahli Genetika' },
  { id: 9, icon: '🧪', name: 'Laboran' },
  { id: 10, icon: '📊', name: 'Epidemiolog' }
];

// Utility functions
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const assignRoles = (players: any[], category: string | null): Player[] => {
  const totalPlayers = players.length;
  const undercoverCount = Math.max(1, Math.floor(totalPlayers * 0.3));
  const mrwhiteCount = Math.max(0, Math.floor(totalPlayers * 0.1));
  const civilianCount = totalPlayers - undercoverCount - mrwhiteCount;

  const selectedCategory = category || DISEASE_CATEGORIES[Math.floor(Math.random() * DISEASE_CATEGORIES.length)];
  const words = DISEASE_WORDS[selectedCategory] || {
    civilian: 'Demam',
    undercover: 'Flu'
  };

  const roles: PlayerRole[] = [
    ...Array(civilianCount).fill('civilian'),
    ...Array(undercoverCount).fill('undercover'),
    ...Array(mrwhiteCount).fill('mrwhite')
  ];

  const shuffledRoles = shuffleArray(roles);

  return players.map((player, index) => ({
    ...player,
    role: shuffledRoles[index] || 'civilian',
    word: shuffledRoles[index] === 'undercover' ? words.undercover : 
          shuffledRoles[index] === 'mrwhite' ? '' : words.civilian,
    hint: shuffledRoles[index] === 'mrwhite' ? 'Kamu tidak tahu kata rahasia!' : undefined,
    category: selectedCategory,
    is_alive: true,
    has_seen_word: false,
    vote_count: 0
  }));
};

const getEliminatedPlayer = (players: Player[]): Player | null => {
  const alivePlayers = players.filter(p => p.is_alive);
  if (alivePlayers.length === 0) return null;

  const maxVotes = Math.max(...alivePlayers.map(p => p.vote_count || 0));
  const candidates = alivePlayers.filter(p => (p.vote_count || 0) === maxVotes);

  if (candidates.length === 1) {
    return candidates[0];
  } else if (candidates.length > 1) {
    // Random tie-breaker
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  return null;
};

const checkWinCondition = (players: Player[], round: number, civilianWord: string): { winner: 'civilian' | 'undercover' | 'mrwhite' | null; reason: string } => {
  const alivePlayers = players.filter(p => p.is_alive);
  const aliveUndercover = alivePlayers.filter(p => p.role === 'undercover').length;
  const aliveMrWhite = alivePlayers.filter(p => p.role === 'mrwhite').length;
  const aliveCivilians = alivePlayers.filter(p => p.role === 'civilian').length;

  // Check Mr. White win condition (handled separately in elimination phase)
  const mrWhite = players.find(p => p.role === 'mrwhite' && p.mrWhiteCorrectGuess);
  if (mrWhite) {
    return {
      winner: 'mrwhite',
      reason: 'Mr. White berhasil menebak kata Civilian dengan benar!'
    };
  }

  // Undercover win condition
  if (aliveUndercover >= aliveCivilians && aliveUndercover > 0) {
    return {
      winner: 'undercover',
      reason: 'Jumlah Undercover sama atau lebih banyak dari Civilian!'
    };
  }

  // Mr. White alone win condition
  if (aliveMrWhite === 1 && aliveCivilians === 0 && aliveUndercover === 0) {
    return {
      winner: 'mrwhite',
      reason: 'Mr. White menjadi satu-satunya pemain yang tersisa!'
    };
  }

  // Civilian win condition
  if (aliveUndercover === 0 && aliveMrWhite === 0) {
    return {
      winner: 'civilian',
      reason: 'Semua Undercover dan Mr. White telah tereliminasi!'
    };
  }

  return { winner: null, reason: '' };
};

const calculatePlayerScore = (player: Player, gameInfo: { winner: string | null; totalRounds: number }) => {
  let score = 0;
  const breakdown: { label: string; points: number }[] = [];

  // Base survival points
  if (player.is_alive) {
    score += 100;
    breakdown.push({ label: 'Bertahan hidup', points: 100 });
  }

  // Role-specific scoring
  if (player.role === 'civilian') {
    if (gameInfo.winner === 'civilian') {
      score += 150;
      breakdown.push({ label: 'Tim Civilian menang', points: 150 });
    }
  } else if (player.role === 'undercover') {
    if (gameInfo.winner === 'undercover') {
      score += 200;
      breakdown.push({ label: 'Tim Undercover menang', points: 200 });
    }
  } else if (player.role === 'mrwhite') {
    if (gameInfo.winner === 'mrwhite') {
      score += 300;
      breakdown.push({ label: 'Mr. White menang', points: 300 });
    }
  }

  return { score, breakdown };
};

export default function OfflineGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>({
    phase: 'loading',
    players: [],
    currentPlayerIndex: 0,
    round: 1,
    civilianWord: '',
    undercoverWord: '',
    category: '',
    eliminatedPlayer: null,
    winner: null,
    winReason: '',
    votingHistory: [],
    chatMessages: []
  });

  const [chatMessage, setChatMessage] = useState('');
  const [mrWhiteGuess, setMrWhiteGuess] = useState('');
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const chatScrollRef = React.useRef<HTMLDivElement>(null);

  // Load game data
  useEffect(() => {
    const storedData = sessionStorage.getItem('offlineGameData');
    if (!storedData) {
      navigate('/offline/setup');
      navigate('/');
      return;
    }

    const gameData = JSON.parse(storedData);
    const category = gameData.category === 'random' ? null : gameData.category;
    
    // Assign roles to players
    const playersWithRoles = assignRoles(gameData.players, category);
    const shuffledPlayers = shuffleArray(playersWithRoles);
    
    // Get words from assigned players
    const civilianPlayer = shuffledPlayers.find(p => p.role === 'civilian');
    const undercoverPlayer = shuffledPlayers.find(p => p.role === 'undercover');

    setTimeout(() => {
      setGameState({
        phase: 'passDevice',
        players: shuffledPlayers,
        currentPlayerIndex: 0,
        round: 1,
        civilianWord: civilianPlayer?.word || '',
        undercoverWord: undercoverPlayer?.word || '',
        category: civilianPlayer?.category || '',
        eliminatedPlayer: null,
        winner: null,
        winReason: '',
        votingHistory: [],
        chatMessages: []
      });
    }, 1500);
  }, [navigate]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [gameState.chatMessages]);

  // Handle ready to see card
  const handleReadyToSee = () => {
    setGameState({
      ...gameState,
      phase: 'distribution'
    });
  };

  // Handle player seeing their word
  const handleWordSeen = () => {
    const updatedPlayers = [...gameState.players];
    updatedPlayers[gameState.currentPlayerIndex].has_seen_word = true;
    
    const nextIndex = gameState.currentPlayerIndex + 1;
    
    if (nextIndex >= gameState.players.length) {
      // All players have seen their words
      setGameState({
        ...gameState,
        players: updatedPlayers,
        phase: 'playing',
        currentPlayerIndex: 0
      });
    } else {
      setGameState({
        ...gameState,
        players: updatedPlayers,
        currentPlayerIndex: nextIndex,
        phase: 'passDevice'
      });
    }
  };

  // Start voting phase
  const startVoting = () => {
    // Reset vote counts
    const resetPlayers = gameState.players.map(p => ({ ...p, vote_count: 0 }));
    setGameState({
      ...gameState,
      phase: 'voting',
      players: resetPlayers,
      currentPlayerIndex: 0
    });
  };

  // Handle vote submission
  const handleVote = (targetId: string) => {
    const alivePlayers = gameState.players.filter(p => p.is_alive);
    const currentVoter = alivePlayers[gameState.currentPlayerIndex];
    const target = gameState.players.find(p => p.id === targetId);
    
    if (!currentVoter || !target) return;

    // Record vote for scoring
    const voteRecord: VoteRecord = {
      round: gameState.round,
      voterId: currentVoter.id,
      targetId: targetId,
      voterRole: currentVoter.role,
      targetRole: target.role
    };
    
    const updatedPlayers = gameState.players.map(p => 
      p.id === targetId ? { ...p, vote_count: (p.vote_count || 0) + 1 } : p
    );
    
    const nextVoter = gameState.currentPlayerIndex + 1;
    const updatedAlivePlayers = updatedPlayers.filter(p => p.is_alive);
    
    if (nextVoter >= updatedAlivePlayers.length) {
      // All votes cast - determine elimination
      const eliminated = getEliminatedPlayer(updatedPlayers);
      
      if (eliminated) {
        setGameState({
          ...gameState,
          players: updatedPlayers.map(p => 
            p.id === eliminated.id ? { ...p, is_alive: false } : p
          ),
          phase: 'elimination',
          eliminatedPlayer: eliminated,
          votingHistory: [...gameState.votingHistory, { 
            ...voteRecord, 
            eliminatedId: eliminated.id, 
            eliminatedRole: eliminated.role 
          }]
        });
      }
    } else {
      setGameState({
        ...gameState,
        players: updatedPlayers,
        currentPlayerIndex: nextVoter,
        votingHistory: [...gameState.votingHistory, voteRecord]
      });
    }
  };

  // Handle Mr. White guess
  const handleMrWhiteGuess = () => {
    if (!mrWhiteGuess.trim()) return;

    const isCorrect = mrWhiteGuess.trim().toLowerCase() === gameState.civilianWord.toLowerCase();
    
    // Mark Mr. White's guess result
    const updatedPlayers = gameState.players.map(p => {
      if (p.id === gameState.eliminatedPlayer?.id && p.role === 'mrwhite') {
        return { ...p, mrWhiteCorrectGuess: isCorrect };
      }
      return p;
    });
    
    if (isCorrect) {
      setGameState({
        ...gameState,
        players: updatedPlayers,
        phase: 'finished',
        winner: 'mrwhite',
        winReason: 'Mr. White berhasil menebak kata Civilian dengan benar!'
      });
    } else {
      // Continue checking win condition
      setGameState({
        ...gameState,
        players: updatedPlayers
      });
      checkGameEnd();
    }
    
    setMrWhiteGuess('');
  };

  // Check if game should end
  const checkGameEnd = () => {
    const result = checkWinCondition(gameState.players, gameState.round, gameState.civilianWord);
    
    if (result.winner) {
      setGameState(prev => ({
        ...prev,
        phase: 'finished',
        winner: result.winner,
        winReason: result.reason
      }));
    } else {
      // Continue to next round
      setGameState(prev => ({
        ...prev,
        phase: 'playing',
        round: prev.round + 1,
        eliminatedPlayer: null,
        currentPlayerIndex: 0
      }));
    }
  };

  // Handle send chat
  const handleSendChat = () => {
    if (!chatMessage.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      playerId: 'system',
      playerName: 'System',
      message: chatMessage.trim(),
      timestamp: new Date()
    };

    setGameState({
      ...gameState,
      chatMessages: [...gameState.chatMessages, newMessage]
    });
    setChatMessage('');
  };

  // Calculate final scores
  const calculateFinalScores = () => {
    const playersWithScores = gameState.players.map(player => {
      const { score, breakdown } = calculatePlayerScore(player, {
        winner: gameState.winner,
        totalRounds: gameState.round
      });
      
      return { ...player, score, scoreBreakdown: breakdown };
    });
    
    // Sort by score descending
    return playersWithScores.sort((a, b) => (b.score || 0) - (a.score || 0));
  };

  // Restart game
  const restartGame = () => {
    navigate('/offline/setup');
    navigate('/');
  };

  // Go home
  const goHome = () => {
    sessionStorage.removeItem('offlineGameData');
    navigate('/');
  };

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const alivePlayers = gameState.players.filter(p => p.is_alive);
  const eliminatedPlayers = gameState.players.filter(p => !p.is_alive);

  const getRoleIcon = (role: PlayerRole) => {
    switch (role) {
      case 'civilian':
        return <Stethoscope className="h-5 w-5" />;
      case 'undercover':
        return <UserCheck className="h-5 w-5" />;
      case 'mrwhite':
        return <Heart className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getRoleColor = (role: PlayerRole) => {
    switch (role) {
      case 'civilian':
        return 'text-blue-600 bg-blue-100';
      case 'undercover':
        return 'text-red-600 bg-red-100';
      case 'mrwhite':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAvatarIcon = (avatarId: number) => {
    const avatar = AVATARS.find(a => a.id === avatarId);
    return avatar?.icon || '👤';
  };

  if (gameState.phase === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin"></div>
            <div className="absolute inset-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Mempersiapkan permainan...</h2>
          <p className="text-sm text-gray-500">Membagikan peran dan kata rahasia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Med-Undercover</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Ronde {gameState.round}</span>
              <span>Kategori: {gameState.category}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Badge className="bg-emerald-500 text-white">
              <Users className="h-3 w-3 mr-1" />
              {alivePlayers.length} pemain hidup
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLeaveConfirmation(true)}
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Players List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Players Card */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Pemain ({alivePlayers.length})
                </h4>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {gameState.players.map((player) => (
                    <div
                      key={player.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg transition-colors",
                        player.is_alive ? "bg-white" : "bg-gray-50 opacity-60"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-sm">
                          {getAvatarIcon(player.avatar_id)}
                        </div>
                        <div>
                          <span className="text-sm font-medium">{player.name}</span>
                          {player.has_seen_word && player.is_alive && (
                            <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-700 border-green-200">
                              ✓
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {!player.is_alive && (
                        <Skull className="h-4 w-4 text-gray-400" />
                      )}

                      {gameState.phase === 'voting' && player.is_alive && 
                       player.id !== alivePlayers[gameState.currentPlayerIndex]?.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVote(player.id)}
                          className="text-xs"
                        >
                          Vote
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {eliminatedPlayers.length > 0 && (
                  <>
                    <h5 className="font-medium text-sm mt-4 mb-2 text-gray-400">
                      Tereliminasi ({eliminatedPlayers.length})
                    </h5>
                    <div className="space-y-1">
                      {eliminatedPlayers.map((player) => (
                        <div key={player.id} className="flex items-center space-x-2 p-1 opacity-60">
                          <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs">
                            {getAvatarIcon(player.avatar_id)}
                          </div>
                          <span className="text-xs text-gray-400 line-through">{player.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Role Distribution Preview */}
            {gameState.phase === 'playing' && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center text-emerald-700">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Distribusi Peran
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-600">🏥 Civilian:</span>
                      <span className="font-medium">{gameState.players.filter(p => p.role === 'civilian' && p.is_alive).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">🕵️ Undercover:</span>
                      <span className="font-medium">{gameState.players.filter(p => p.role === 'undercover' && p.is_alive).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-600">👻 Mr. White:</span>
                      <span className="font-medium">{gameState.players.filter(p => p.role === 'mrwhite' && p.is_alive).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Game Phase Content */}
            <AnimatePresence mode="wait">
              {/* Pass Device Phase */}
              {gameState.phase === 'passDevice' && currentPlayer && (
                <motion.div
                  key="passDevice"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <CardContent className="p-8 text-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
                      >
                        <Eye className="h-12 w-12 text-white" />
                      </motion.div>

                      <h2 className="text-3xl font-bold mb-3">
                        Giliran: {currentPlayer.name}
                      </h2>
                      
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
                        <span className="font-medium">
                          Pemain {gameState.currentPlayerIndex + 1} dari {gameState.players.length}
                        </span>
                      </div>

                      <div className="bg-amber-500/30 border border-amber-300/30 rounded-xl p-4 mb-6 max-w-md mx-auto">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-200 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-left text-white/90">
                            <strong>Penting:</strong> Pastikan hanya <strong>{currentPlayer.name}</strong> yang melihat layar ini. 
                            Pemain lain jangan mengintip!
                          </p>
                        </div>
                      </div>

                      <p className="text-white/80 mb-8">
                        Siap untuk melihat kartu rahasiamu?
                      </p>

                      <Button
                        size="lg"
                        onClick={handleReadyToSee}
                        className="bg-white text-emerald-600 hover:bg-white/90 px-8 py-6 text-lg font-semibold"
                      >
                        <Eye className="mr-2 h-5 w-5" />
                        Saya Siap, Tampilkan Kartu!
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Distribution Phase - Secret Word Card */}
              {gameState.phase === 'distribution' && currentPlayer && (
                <motion.div
                  key="distribution"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="border-0 shadow-xl overflow-hidden">
                    <div className={cn(
                      "h-2",
                      currentPlayer.role === 'civilian' ? "bg-blue-500" :
                      currentPlayer.role === 'undercover' ? "bg-red-500" : "bg-purple-500"
                    )} />
                    <CardContent className="p-8 text-center">
                      <div className="mb-6">
                        <div className={cn(
                          "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
                          currentPlayer.role === 'civilian' ? "bg-blue-100" :
                          currentPlayer.role === 'undercover' ? "bg-red-100" : "bg-purple-100"
                        )}>
                          <span className="text-4xl">
                            {currentPlayer.role === 'civilian' ? '🏥' :
                             currentPlayer.role === 'undercover' ? '🕵️' : '👻'}
                          </span>
                        </div>
                        <Badge className={cn(
                          "text-white border-0",
                          currentPlayer.role === 'civilian' ? "bg-blue-500" :
                          currentPlayer.role === 'undercover' ? "bg-red-500" : "bg-purple-500"
                        )}>
                          {currentPlayer.role === 'civilian' && 'Civilian'}
                          {currentPlayer.role === 'undercover' && 'Undercover'}
                          {currentPlayer.role === 'mrwhite' && 'Mr. White'}
                        </Badge>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        Halo, {currentPlayer.name}!
                      </h3>

                      {currentPlayer.role === 'mrwhite' ? (
                        <div className="space-y-4">
                          <p className="text-gray-600">
                            Kamu adalah <span className="font-bold text-purple-600">Mr. White</span>
                          </p>
                          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                            <p className="text-purple-700 font-medium">
                              Kamu tidak mendapatkan kata rahasia!
                            </p>
                            <p className="text-sm text-purple-600 mt-2">
                              Dengarkan deskripsi pemain lain untuk menebak kata Civilian.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-gray-600">
                            Kata rahasiamu adalah:
                          </p>
                          <div className={cn(
                            "text-4xl font-bold py-4 px-8 rounded-xl inline-block",
                            currentPlayer.role === 'civilian' ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"
                          )}>
                            {currentPlayer.word}
                          </div>
                          {currentPlayer.hint && (
                            <p className="text-sm text-gray-500 italic">
                              {currentPlayer.hint}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-sm text-gray-500 mb-4">
                          Hafalkan kata ini. Setelah klik tombol di bawah, kartu akan disembunyikan.
                        </p>
                        <Button
                          size="lg"
                          onClick={handleWordSeen}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8"
                        >
                          <Check className="mr-2 h-5 w-5" />
                          Saya Sudah Hafal
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Playing Phase */}
              {gameState.phase === 'playing' && (
                <motion.div
                  key="playing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="border-0 shadow-lg mb-4">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <MessageSquare className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">Fase Deskripsi</h2>
                          <p className="text-gray-500 text-sm">Bergiliran memberikan deskripsi kata</p>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-amber-700">
                            <p className="font-medium mb-1">Aturan:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Berikan 1 kata/kalimat untuk mendeskripsikan katamu</li>
                              <li>Jangan menyebut kata yang kamu dapat!</li>
                              <li>Perhatikan deskripsi yang mencurigakan</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Start Voting Button */}
                  <div className="text-center">
                    <Button
                      size="lg"
                      onClick={startVoting}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-6 text-lg font-semibold"
                    >
                      <Vote className="mr-2 h-5 w-5" />
                      Mulai Voting Eliminasi
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Voting Phase */}
              {gameState.phase === 'voting' && (
                <motion.div
                  key="voting"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Fase Voting</h2>
                        <p className="text-gray-500">
                          Giliran: <strong>{alivePlayers[gameState.currentPlayerIndex]?.name}</strong> untuk vote
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {alivePlayers.map((player) => {
                          const currentVoter = alivePlayers[gameState.currentPlayerIndex];
                          if (player.id === currentVoter?.id) return null;
                          
                          return (
                            <button
                              key={player.id}
                              onClick={() => handleVote(player.id)}
                              className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-400 hover:shadow-lg transition-all text-center group"
                            >
                              <div className="text-3xl mb-2">{getAvatarIcon(player.avatar_id)}</div>
                              <p className="font-medium text-gray-800 text-sm truncate">{player.name}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {(player.vote_count || 0) > 0 && `${player.vote_count} suara`}
                              </p>
                              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Badge className="bg-emerald-500 text-white">Pilih</Badge>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Elimination Phase */}
              {gameState.phase === 'elimination' && gameState.eliminatedPlayer && (
                <motion.div
                  key="elimination"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500" />
                    <CardContent className="p-8 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
                      >
                        <Skull className="h-12 w-12 text-red-500" />
                      </motion.div>

                      <h2 className="text-3xl font-bold text-gray-800 mb-2">Player Tereliminasi!</h2>
                      <p className="text-gray-500 mb-6">
                        {gameState.eliminatedPlayer.name} telah dikeluarkan dari permainan
                      </p>

                      <div className={cn(
                        "p-6 rounded-xl mb-6",
                        gameState.eliminatedPlayer.role === 'civilian' ? "bg-blue-50" :
                        gameState.eliminatedPlayer.role === 'undercover' ? "bg-red-50" : "bg-purple-50"
                      )}>
                        <div className="flex items-center justify-center space-x-3 mb-3">
                          <span className="text-2xl">
                            {gameState.eliminatedPlayer.role === 'civilian' ? '🏥' :
                             gameState.eliminatedPlayer.role === 'undercover' ? '🕵️' : '👻'}
                          </span>
                          <span className={cn(
                            "text-xl font-bold",
                            gameState.eliminatedPlayer.role === 'civilian' ? "text-blue-700" :
                            gameState.eliminatedPlayer.role === 'undercover' ? "text-red-700" : "text-purple-700"
                          )}>
                            {gameState.eliminatedPlayer.role === 'civilian' && 'Civilian'}
                            {gameState.eliminatedPlayer.role === 'undercover' && 'Undercover'}
                            {gameState.eliminatedPlayer.role === 'mrwhite' && 'Mr. White'}
                          </span>
                        </div>

                        {gameState.eliminatedPlayer.role !== 'mrwhite' && (
                          <p className="text-gray-600">
                            Kata rahasia: <strong>{gameState.eliminatedPlayer.word}</strong>
                          </p>
                        )}
                      </div>

                      {gameState.eliminatedPlayer.role === 'mrwhite' && (
                        <div className="space-y-4 mb-6">
                          <p className="text-gray-600">
                            Mr. White punya kesempatan untuk menebak kata Civilian!
                          </p>
                          <div className="flex gap-2 max-w-md mx-auto">
                            <Input
                              placeholder="Masukkan tebakanmu..."
                              value={mrWhiteGuess}
                              onChange={(e) => setMrWhiteGuess(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleMrWhiteGuess()}
                              className="flex-1"
                            />
                            <Button
                              onClick={handleMrWhiteGuess}
                              disabled={!mrWhiteGuess.trim()}
                              className="bg-purple-500 hover:bg-purple-600"
                            >
                              Tebak
                            </Button>
                          </div>
                        </div>
                      )}

                      {gameState.eliminatedPlayer.role !== 'mrwhite' && (
                        <Button
                          size="lg"
                          onClick={checkGameEnd}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8"
                        >
                          <ChevronRight className="mr-2 h-5 w-5" />
                          Lanjutkan Permainan
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Finished Phase */}
              {gameState.phase === 'finished' && (() => {
                const scoredPlayers = calculateFinalScores();
                return (
                  <motion.div
                    key="finished"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card className={cn(
                      "border-0 shadow-xl overflow-hidden mb-6",
                      gameState.winner === 'civilian' ? "bg-gradient-to-br from-blue-500 to-cyan-500" :
                      gameState.winner === 'undercover' ? "bg-gradient-to-br from-red-500 to-orange-500" :
                      "bg-gradient-to-br from-purple-500 to-pink-500"
                    )}>
                      <CardContent className="p-8 text-center text-white">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.2 }}
                          className="text-6xl mb-4"
                        >
                          🏆
                        </motion.div>
                        <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
                        <div className="inline-block px-6 py-2 bg-white/20 rounded-full font-bold text-lg mb-4">
                          {gameState.winner === 'civilian' && '🏥 Civilian Menang!'}
                          {gameState.winner === 'undercover' && '🕵️ Undercover Menang!'}
                          {gameState.winner === 'mrwhite' && '👻 Mr. White Menang!'}
                        </div>
                        <p className="text-white/90 mb-6">{gameState.winReason}</p>

                        {/* Reveal all words */}
                        <div className="bg-white/10 rounded-xl p-4 mb-4">
                          <p className="text-sm text-white/80 mb-2">Kata dalam permainan:</p>
                          <div className="flex justify-center gap-6">
                            <div className="text-center">
                              <p className="text-xs text-white/70">Civilian</p>
                              <p className="font-bold text-xl">{gameState.civilianWord}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-white/70">Undercover</p>
                              <p className="font-bold text-xl">{gameState.undercoverWord}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Leaderboard */}
                    <Card className="border-0 shadow-lg mb-6">
                      <CardContent className="p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Trophy className="h-6 w-6 text-amber-500" />
                          Leaderboard & Skor Akhir
                        </h2>
                        <div className="space-y-3">
                          {scoredPlayers.map((player, index) => {
                            const roleColors = {
                              civilian: 'border-blue-200 bg-blue-50',
                              undercover: 'border-red-200 bg-red-50',
                              mrwhite: 'border-purple-200 bg-purple-50'
                            };
                            
                            return (
                              <motion.div
                                key={player.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                  'border-2 rounded-xl p-4',
                                  roleColors[player.role as keyof typeof roleColors] || 'border-gray-200 bg-white',
                                  index === 0 && 'ring-4 ring-amber-400 shadow-lg'
                                )}
                              >
                                <div className="flex items-center gap-4">
                                  {/* Rank */}
                                  <div className={cn(
                                    'w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0',
                                    index === 0 && 'bg-amber-400 text-white',
                                    index === 1 && 'bg-gray-300 text-gray-700',
                                    index === 2 && 'bg-orange-400 text-white',
                                    index > 2 && 'bg-gray-200 text-gray-600'
                                  )}>
                                    {index === 0 ? '👑' : index + 1}
                                  </div>

                                  {/* Player Info */}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-2xl">{getAvatarIcon(player.avatar_id)}</span>
                                      <span className="font-bold text-gray-800">{player.name}</span>
                                      <Badge className={cn(
                                        player.role === 'civilian' ? "bg-blue-100 text-blue-700" :
                                        player.role === 'undercover' ? "bg-red-100 text-red-700" :
                                        "bg-purple-100 text-purple-700"
                                      )}>
                                        {player.role === 'civilian' && 'Civilian'}
                                        {player.role === 'undercover' && 'Undercover'}
                                        {player.role === 'mrwhite' && 'Mr. White'}
                                      </Badge>
                                      {!player.is_alive && (
                                        <Badge variant="outline" className="bg-gray-100 text-gray-600">
                                          Tereliminasi
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    {/* Score Breakdown */}
                                    <div className="flex flex-wrap gap-1 text-xs">
                                      {player.scoreBreakdown?.map((item: any, i: number) => (
                                        <span
                                          key={i}
                                          className={cn(
                                            'px-2 py-0.5 rounded-full',
                                            item.points > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                          )}
                                        >
                                          {item.label}: {item.points > 0 ? '+' : ''}{item.points}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Total Score */}
                                  <div className="text-center flex-shrink-0">
                                    <div className={cn(
                                      'text-3xl font-bold',
                                      index === 0 ? 'text-amber-500' : 'text-gray-700'
                                    )}>
                                      {player.score}
                                    </div>
                                    <div className="text-xs text-gray-500">Poin</div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={restartGame}
                        className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Main Lagi
                      </Button>
                      <Button
                        variant="outline"
                        onClick={goHome}
                        className="border-gray-500 text-gray-600 hover:bg-gray-50"
                      >
                        <Home className="mr-2 h-4 w-4" />
                        Ke Beranda
                      </Button>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            {/* Chat */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Catatan
                </h4>
                
                <ScrollArea className="h-40 mb-4 border rounded p-3" ref={chatScrollRef}>
                  <div className="space-y-2">
                    {gameState.chatMessages.map((msg) => (
                      <div key={msg.id} className="text-sm">
                        <span className="font-medium text-emerald-600">
                          {msg.playerName}:
                        </span>
                        <span className="ml-2 text-gray-700">{msg.message}</span>
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                    {gameState.chatMessages.length === 0 && (
                      <div className="text-center text-gray-400 text-sm py-4">
                        Belum ada pesan. Mulai diskusi!
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                <div className="flex space-x-2">
                  <Input
                    placeholder="Tulis pesan..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendChat}
                    disabled={!chatMessage.trim()}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Leave Game Confirmation Modal */}
        {showLeaveConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center animate-in fade-in duration-300">
              <div className="mb-6">
                <div className="bg-red-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <LogOut className="h-12 w-12 text-red-500" />
                </div>

                <h3 className="text-2xl font-bold mb-2 text-red-600">Keluar dari Permainan?</h3>

                <p className="text-gray-500 mb-4">
                  Apakah kamu yakin ingin keluar? Kamu akan kehilangan progres permainan.
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowLeaveConfirmation(false)}
                  className="flex-1"
                >
                  Batal
                </Button>

                <Button
                  onClick={goHome}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Missing imports
import { Check, Send } from 'lucide-react';