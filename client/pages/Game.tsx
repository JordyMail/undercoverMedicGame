import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Users,
  MessageCircle,
  Send,
  Eye,
  EyeOff,
  Heart,
  Stethoscope,
  UserCheck,
  Clock,
  Vote,
  Trophy,
  X,
  Skull,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useGame } from '../contexts/FixedGameContext';
import { GamePhase, PlayerRole, type FinalAnswer } from '@shared/game';

export default function GamePage() {
  const {
    room,
    currentPlayer,
    myRole,
    myDisease,
    revealRole,
    sendChat,
    submitAnswer,
    votePlayer,
    submitFinalAnswer,
    voteFinal,
    leaveRoom,
    initializeConnection,
    isConnected
  } = useGame();

  // Ensure connection is initialized
  useEffect(() => {
    initializeConnection();
  }, []);

  const [chatMessage, setChatMessage] = useState('');
  const [answer, setAnswer] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [finalAnswer, setFinalAnswer] = useState<FinalAnswer>({ treatment: '', innovation: '' });
  const [cardFlipped, setCardFlipped] = useState(false);
  const [individuallyRevealed, setIndividuallyRevealed] = useState(false);
  const hasRevealedRole = myRole !== null;
  const [showEliminationModal, setShowEliminationModal] = useState(false);
  const [eliminatedPlayer, setEliminatedPlayer] = useState<any>(null);
  const [myVote, setMyVote] = useState<string>('');
  const [finalAnswerSubmitted, setFinalAnswerSubmitted] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [allFinalAnswersSubmitted, setAllFinalAnswersSubmitted] = useState(false);
  const [showFinalAnswers, setShowFinalAnswers] = useState<boolean>(false);
  const [points, setPoints] = useState<Record<string, number>>({});
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  
  // 🔴 PERBAIKAN: State untuk debug
  const [debugInfo, setDebugInfo] = useState({
    phase: room?.phase,
    isEliminated: currentPlayer?.isEliminated,
    allFinalAnswersSubmitted: false,
    showFinalAnswers: false,
    finalistsCount: 0,
    submittedCount: 0,
    finalVotesCount: 0
  });

  // 🔴 PERBAIKAN: Cek role reveal dari localStorage saat mount
useEffect(() => {
  if (currentPlayer?.id) {
    // Cek apakah ini game baru (tidak ada saved reveal state)
    const savedRevealState = localStorage.getItem(`revealed_${currentPlayer.id}`);
    
    if (!savedRevealState) {
      // Ini game baru, reset semua state lokal
      console.log('🆕 New game detected, resetting card state');
      setIndividuallyRevealed(false);
      setCardFlipped(false);
      setMyVote('');
      setSelectedPlayer('');
      setFinalAnswerSubmitted(false);
      setAllFinalAnswersSubmitted(false);
      setShowFinalAnswers(false);
    } else {
      // Ini restore session, set sesuai saved state
      console.log('🔄 Restoring session, card was revealed:', savedRevealState);
      setIndividuallyRevealed(true);
      setCardFlipped(true);
    }
  }
}, [currentPlayer?.id]); 

  // 🔴 PERBAIKAN: Save reveal state ke localStorage
  useEffect(() => {
    if (currentPlayer?.id && individuallyRevealed) {
      localStorage.setItem(`revealed_${currentPlayer.id}`, 'true');
    }
  }, [individuallyRevealed, currentPlayer?.id]);

  useEffect(() => {
  if (currentPlayer?.id && !myRole) {
    const savedRole = localStorage.getItem(`role_${currentPlayer.id}`);
    const savedDisease = localStorage.getItem(`disease_${currentPlayer.id}`);
    
    if (savedRole) {
      console.log('Loading role from localStorage:', savedRole, savedDisease);
      // Set state manually - tapi lebih baik tunggu dari server
    }
  }
}, [currentPlayer?.id, myRole]);

useEffect(() => {
  console.log('Current myRole:', myRole);
  console.log('Current myDisease:', myDisease);
  console.log('Current individuallyRevealed:', individuallyRevealed);
  console.log('Current cardFlipped:', cardFlipped);
}, [myRole, myDisease, individuallyRevealed, cardFlipped]);

  // Update debug info
  useEffect(() => {
    if (room) {
      const finalists = room.players.filter(p => !p.isEliminated);
      const submitted = finalists.filter(p => p.finalAnswer);
      
      setDebugInfo({
        phase: room.phase,
        isEliminated: currentPlayer?.isEliminated || false,
        allFinalAnswersSubmitted: submitted.length === finalists.length && finalists.length > 0,
        showFinalAnswers: room.phase === GamePhase.VOTING_FINAL || 
                         (room.phase === GamePhase.FINAL_ROUND && (currentPlayer?.isEliminated ?? false)),
        finalistsCount: finalists.length,
        submittedCount: submitted.length,
        finalVotesCount: Object.keys(room.finalVotes || {}).length
      });
    }
  }, [room, currentPlayer]);

  // 🔴 PERBAIKAN: Monitor final votes
  useEffect(() => {
    if (room?.phase === GamePhase.VOTING_FINAL && room.finalVotes) {
      const eliminatedCount = room.players.filter(p => p.isEliminated).length;
      const voteCount = Object.keys(room.finalVotes).length;
      
      console.log('📊 Final vote status:', {
        votes: voteCount,
        total: eliminatedCount,
        percentage: Math.round((voteCount / eliminatedCount) * 100) + '%'
      });
    }
  }, [room?.finalVotes, room?.phase, room?.players]);

  // Redirect if no room
  useEffect(() => {
    if (!room || !currentPlayer) {
      const savedRoom = localStorage.getItem('uncoverles_room');
      const savedPlayer = localStorage.getItem('uncoverles_player');

      if (!savedRoom || !savedPlayer) {
        window.location.href = '/play';
      } else {
        try {
          const room = JSON.parse(savedRoom);
          if (room.phase === 'lobby') {
            window.location.href = '/lobby';
          }
        } catch (error) {
          console.error('Failed to parse saved room:', error);
          window.location.href = '/play';
        }
      }
    }
  }, [room, currentPlayer]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [room?.chatMessages]);

  // Detect player elimination
  useEffect(() => {
    if (room?.eliminatedThisRound) {
      const eliminated = room.players.find(p => p.id === room.eliminatedThisRound);
      if (eliminated) {
        setEliminatedPlayer(eliminated);
        setShowEliminationModal(true);
        setMyVote('');
        setSelectedPlayer('');
      }
    }
  }, [room?.eliminatedThisRound]);

  // Reset voting state
  useEffect(() => {
    if (room?.phase !== GamePhase.VOTING) {
      setMyVote('');
      setSelectedPlayer('');
    }
  }, [room?.phase]);

  // Track final answers
  useEffect(() => {
    if (room?.phase === GamePhase.FINAL_ROUND || room?.phase === GamePhase.VOTING_FINAL) {
      const finalists = room.players.filter(p => !p.isEliminated);
      const submittedCount = finalists.filter(p => p.finalAnswer).length;
      
      setAllFinalAnswersSubmitted(submittedCount === finalists.length && finalists.length > 0);
      
      if (room.phase === GamePhase.VOTING_FINAL && currentPlayer?.isEliminated) {
        setShowFinalAnswers(true);
      }
      
      if (room.phase === GamePhase.VOTING_FINAL && !currentPlayer?.isEliminated) {
        setShowFinalAnswers(allFinalAnswersSubmitted);
      }
    }
  }, [room?.phase, room?.players, currentPlayer?.isEliminated, allFinalAnswersSubmitted]);

  // 🔴 PERBAIKAN: Calculate points hanya jika ada winner
  useEffect(() => {
    if (room?.winner) {
      const calculatedPoints = calculatePoints();
      setPoints(calculatedPoints);
    }
  }, [room?.winner, room?.players]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showLeaveConfirmation) {
          setShowLeaveConfirmation(false);
        } else if (!showEliminationModal) {
          setShowLeaveConfirmation(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showLeaveConfirmation, showEliminationModal]);

  if (!room || !currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-blue/10 via-background to-medical-green/10 flex items-center justify-center">
        <Card className="bg-game-card border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-blue mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading game data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 🔴 PERBAIKAN: Fungsi handleRevealRole yang benar
  const handleRevealRole = () => {
    if (!individuallyRevealed) {
      setCardFlipped(true);
      
      // Kirim reveal ke server setelah animasi selesai
      setTimeout(() => {
        setIndividuallyRevealed(true);
        revealRole();
      }, 600);
    }
  };

  const handleSendChat = () => {
    if (chatMessage.trim()) {
      sendChat(chatMessage.trim());
      setChatMessage('');
    }
  };

  const handleSubmitAnswer = () => {
    if (answer.trim()) {
      submitAnswer(answer.trim());
      setAnswer('');
    }
  };

  const handleVotePlayer = (playerId: string) => {
    setSelectedPlayer(playerId);
    setMyVote(playerId);
    votePlayer(playerId);
  };

  const handleSubmitFinalAnswer = () => {
    if (finalAnswer.treatment.trim() && finalAnswer.innovation.trim()) {
      submitFinalAnswer(finalAnswer);
      setFinalAnswerSubmitted(true);
    }
  };

  // 🔴 PERBAIKAN: Fungsi calculatePoints yang aman
  const calculatePoints = () => {
    if (!room) return {};
    const pointsMap: Record<string, number> = {};
    
    // Initialize semua player dengan 0
    room.players.forEach(player => {
      pointsMap[player.id] = player.points || 0;
    });
    
    // Bonus untuk winner
    if (room.winner) {
      pointsMap[room.winner] = (pointsMap[room.winner] || 0) + 50;
    }
    
    return pointsMap;
  };

  const getRoleIcon = (role: PlayerRole) => {
    switch (role) {
      case PlayerRole.MAIN_DIAGNOSE: return <Stethoscope className="h-6 w-6" />;
      case PlayerRole.DIFFERENTIAL_DIAGNOSE: return <Heart className="h-6 w-6" />;
      case PlayerRole.DOCTOR_GREY: return <UserCheck className="h-6 w-6" />;
      default: return <Users className="h-6 w-6" />;
    }
  };

  const getRoleColor = (role: PlayerRole) => {
    switch (role) {
      case PlayerRole.MAIN_DIAGNOSE: return 'text-medical-blue';
      case PlayerRole.DIFFERENTIAL_DIAGNOSE: return 'text-medical-green';
      case PlayerRole.DOCTOR_GREY: return 'text-medical-purple';
      default: return 'text-muted-foreground';
    }
  };

  const getPlayerColor = (playerId: string) => {
    const colors = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-pink-600', 'text-indigo-600', 'text-red-600', 'text-yellow-600', 'text-teal-600', 'text-orange-600', 'text-cyan-600'];
    let hash = 0;
    for (let i = 0; i < playerId.length; i++) hash = playerId.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const activePlayers = room.players.filter(p => !p.isEliminated);
  const eliminatedPlayers = room.players.filter(p => p.isEliminated);

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/10 via-background to-medical-green/10 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-medical-blue/20 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-medical-green/20 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-medical-purple/10 rounded-full opacity-10 blur-3xl"></div>
        
        {/* Medical Icons Pattern */}
        <motion.div 
          initial={{ opacity: 0, rotate: -45 }}
          animate={{ opacity: 0.05, rotate: 0 }}
          transition={{ duration: 1 }}
          className="absolute top-20 left-20"
        >
          <Stethoscope className="w-24 h-24 text-medical-blue" />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, rotate: 45 }}
          animate={{ opacity: 0.05, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute bottom-20 right-20"
        >
          <Heart className="w-24 h-24 text-medical-green" />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute top-40 right-40"
        >
          <Users className="w-20 h-20 text-medical-purple" />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute bottom-40 left-40"
        >
          <Trophy className="w-20 h-20 text-medical-blue" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-6 relative">
        {/* Game Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold">Uncoverles Game</h1>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Room: {room.code}</span>
              <span>Round: {room.round}</span>
              <span>Phase: {room.phase.replace('_', ' ')}</span>
              {!isConnected && (
                <Badge variant="destructive" className="animate-pulse">
                  Reconnecting...
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge className={`${
                room.phase === GamePhase.FINAL_ROUND ? 'bg-medical-orange' : 
                room.phase === GamePhase.VOTING_FINAL ? 'bg-medical-purple' : 
                'bg-medical-blue'
              } text-white`}>
                {room.phase === GamePhase.FINAL_ROUND && 'Final Round'}
                {room.phase === GamePhase.VOTING_FINAL && 'Final Voting'}
                {room.phase !== GamePhase.FINAL_ROUND && room.phase !== GamePhase.VOTING_FINAL && `Round ${room.round}`}
              </Badge>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLeaveConfirmation(true)}
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                title="Leave Game (Press Escape)"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave Game
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Debug Panel */}
        {/* {process.env.NODE_ENV === 'development' && (
          <Card className="bg-yellow-50 border-yellow-300 mb-4">
            <CardContent className="p-3">
              <div className="text-xs font-mono">
                <div><strong>🔍 DEBUG INFO:</strong></div>
                <div>Phase: {debugInfo.phase} | Eliminated: {debugInfo.isEliminated ? 'Yes' : 'No'}</div>
                <div>Finalists: {debugInfo.finalistsCount} | Submitted: {debugInfo.submittedCount}</div>
                <div>All Submitted: {debugInfo.allFinalAnswersSubmitted ? 'Yes' : 'No'}</div>
                <div>Show Answers: {debugInfo.showFinalAnswers ? 'Yes' : 'No'}</div>
                <div>Final Votes: {debugInfo.finalVotesCount}</div>
                <div>Room Code: {room.code}</div>
                <div>My Vote: {myVote || 'None'}</div>
                <div>Winner: {room.winner || 'None'}</div>
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* MODIFIED LAYOUT: 3 columns - Left, Center, Right */}
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT COLUMN - Your Role Card & Active Players */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="col-span-3 space-y-4"
          >
           {/* 🔴 PERBAIKAN: Role Assignment Card - Dengan animasi flip yang benar */}
{!individuallyRevealed && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
  >
    <Card className="bg-game-card border-0 shadow-lg overflow-hidden">
      <CardContent className="p-6 text-center">
        <h3 className="font-bold mb-4">Your Role Card</h3>
        
        {/* Container dengan perspective untuk efek 3D */}
        <div 
          className="relative w-48 h-64 mx-auto cursor-pointer"
          style={{ perspective: '1000px' }}
          onClick={handleRevealRole}
        >
          {/* Card wrapper dengan transform-style preserve-3d */}
          <div 
            className="relative w-full h-full transition-all duration-700"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: cardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Front of card - sisi depan */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ 
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-medical-blue to-medical-green rounded-2xl shadow-xl flex flex-col items-center justify-center p-4 border-4 border-white/20">
                <div className="animate-pulse">
                  <Eye className="h-12 w-12 text-white mb-3" />
                </div>
                <div className="text-white text-center">
                  <div className="text-sm font-semibold mb-2">Click to Reveal</div>
                  <div className="text-xs opacity-80">Your secret role awaits</div>
                </div>
                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <Sparkles className="h-4 w-4 text-white/50 mx-auto animate-pulse" />
                </div>
              </div>
            </div>
            
            {/* Back of card - sisi belakang (diputar 180 derajat) */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ 
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="w-full h-full bg-white rounded-2xl shadow-xl border-2 border-medical-blue/30 flex flex-col items-center justify-center p-4">
                {myRole ? (
                  <>
                    <div className={`${getRoleColor(myRole)} mb-3 scale-150`}>
                      {getRoleIcon(myRole)}
                    </div>
                    
                    <div className="text-sm font-semibold text-center mt-2">
                      {myRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    
                    {myDisease && (
                      <div className="text-xs font-medium text-medical-blue mt-3 text-center border-t pt-3 w-full">
                        <span className="font-bold">Disease:</span>
                        <br />
                        {myDisease}
                      </div>
                    )}
                    
                    {!myDisease && myRole === PlayerRole.DOCTOR_GREY && (
                      <div className="text-xs font-medium text-medical-purple mt-3 text-center border-t pt-3 w-full">
                        <span className="font-bold">Special Role:</span>
                        <br />
                        Doctor Grey
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue mx-auto mb-2"></div>
                    <p className="text-xs text-muted-foreground">Loading role...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mt-4">
          Click the card to reveal your secret role
        </p>
      </CardContent>
    </Card>
  </motion.div>
)}

            {/* 🔴 PERBAIKAN: Tampilkan role yang sudah di-reveal */}
            {individuallyRevealed && hasRevealedRole && myRole && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring" }}
              >
                <Card className="bg-game-card border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="text-center space-y-3">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.1 }}
                        className="bg-gradient-to-r from-medical-blue to-medical-green p-3 rounded-full w-fit mx-auto"
                      >
                        {getRoleIcon(myRole)}
                      </motion.div>
                      <div>
                        <h4 className="font-semibold">Your Role</h4>
                        <p className="text-lg font-bold text-medical-blue">
                          {myRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      </div>
                      {myDisease ? (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="bg-medical-blue/10 p-3 rounded-lg"
                        >
                          <h5 className="font-medium text-sm mb-1">Your Disease</h5>
                          <p className="text-base font-bold text-medical-blue">{myDisease}</p>
                        </motion.div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="bg-medical-purple/10 p-3 rounded-lg"
                        >
                          <h5 className="font-medium text-sm mb-1">Special Role</h5>
                          <p className="text-sm text-medical-purple">Doctor Grey - No disease assigned</p>
                        </motion.div>
                      )}
                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        {myDisease ? "Focus on this disease during discussions" : "Observe and deduce from others"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Voting Status */}
            {room.phase === GamePhase.VOTING && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-game-card border-0 shadow-lg">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Vote className="h-4 w-4 mr-2" />
                      Voting Status
                    </h4>
                    <div className="space-y-3">
                      {myVote && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-medical-green/10 p-3 rounded-lg"
                        >
                          <div className="text-sm font-medium text-medical-green">
                            ✓ You voted for: {room.players.find(p => p.id === myVote)?.name}
                          </div>
                        </motion.div>
                      )}
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Votes cast:</span>
                          <span className="font-medium">{Object.keys(room.currentVotes || {}).length}/{activePlayers.length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <motion.div 
                            className="bg-medical-blue h-1.5 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(Object.keys(room.currentVotes || {}).length / Math.max(1, activePlayers.length)) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Active Players */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-game-card border-0 shadow-lg">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Active Players ({activePlayers.length})
                  </h4>
                  <div className="space-y-2  pr-1">
                    <AnimatePresence>
                      {activePlayers.map((player, index) => (
                        <motion.div 
                          key={player.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center justify-between p-2 bg-background rounded-lg border"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-medical-blue to-medical-green rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {player.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-sm font-medium">{player.name}</span>
                              {player.isHost && (
                                <Badge variant="secondary" className="ml-2 text-xs">Host</Badge>
                              )}
                            </div>
                          </div>
                          {room.phase === GamePhase.VOTING && player.id !== currentPlayer.id && !myVote && !currentPlayer.isEliminated && (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button 
                                size="sm" 
                                variant={selectedPlayer === player.id ? "default" : "outline"} 
                                onClick={() => handleVotePlayer(player.id)} 
                                className="text-xs"
                              >
                                Vote
                              </Button>
                            </motion.div>
                          )}
                          {room.phase === GamePhase.VOTING && myVote === player.id && (
                            <Badge className="bg-medical-green text-white text-xs">✓ Voted</Badge>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {eliminatedPlayers.length > 0 && (
                    <>
                      <h5 className="font-medium text-sm mt-4 mb-2 text-muted-foreground flex items-center">
                        <Skull className="h-3 w-3 mr-1" />
                        Eliminated ({eliminatedPlayers.length})
                      </h5>
                      <div className="space-y-1">
                        <AnimatePresence>
                          {eliminatedPlayers.map((player) => (
                            <motion.div 
                              key={player.id} 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 0.6, x: 0 }}
                              className="flex items-center space-x-2 p-1"
                            >
                              <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-xs">
                                {player.name.charAt(0)}
                              </div>
                              <span className="text-xs text-muted-foreground line-through">{player.name}</span>
                              {player.role && (
                                <Badge variant="outline" className="text-[10px] px-1">
                                  {player.role === PlayerRole.MAIN_DIAGNOSE ? 'Main' : 
                                   player.role === PlayerRole.DIFFERENTIAL_DIAGNOSE ? 'Diff' : 'Grey'}
                                </Badge>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* CENTER COLUMN - Game Chat, Phase Instructions, Game Phases, and Final Voting */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-6 space-y-4"
          >
            {/* Phase Instructions - Now in Center */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-game-card border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-medical-blue" />
                    <div>
                      <h3 className="font-semibold">
                        {room.phase === GamePhase.ROLE_ASSIGNMENT && "Role Assignment Phase"}
                        {room.phase === GamePhase.DISCUSSION && "Discussion Phase"}
                        {room.phase === GamePhase.VOTING && "Voting Phase"}
                        {room.phase === GamePhase.FINAL_ROUND && "Final Round"}
                        {room.phase === GamePhase.VOTING_FINAL && "Final Voting"}
                        {room.phase === GamePhase.RESULTS && "Game Results"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {room.phase === GamePhase.ROLE_ASSIGNMENT && "Click your card to reveal your role and disease"}
                        {room.phase === GamePhase.DISCUSSION && "Share your diagnosis and discuss with other players"}
                        {room.phase === GamePhase.VOTING && "Vote to eliminate one player this round"}
                        {room.phase === GamePhase.FINAL_ROUND && "Submit your treatment plan and medical innovation"}
                        {room.phase === GamePhase.VOTING_FINAL && "Vote for the best final answer"}
                        {room.phase === GamePhase.RESULTS && "Game has ended. Check the results!"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Final Round Form - Now in Center */}
            {room.phase === GamePhase.FINAL_ROUND && !currentPlayer.isEliminated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring" }}
              >
                <Card className="bg-game-card border-0 shadow-lg">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Trophy className="h-5 w-5 text-medical-orange" />
                      <h4 className="font-semibold">Final Challenge - You're a Finalist!</h4>
                    </div>
                    
                    <div className="bg-medical-blue/10 p-3 rounded-lg mb-4">
                      <div className="text-sm">
                        <span className="font-medium">⚠️ Important:</span> You cannot see other finalists' answers until all have submitted.
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Treatment Plan</label>
                        <Textarea 
                          placeholder="Describe the treatment for your assigned disease..." 
                          value={finalAnswer.treatment} 
                          onChange={(e) => setFinalAnswer(prev => ({ ...prev, treatment: e.target.value }))} 
                          rows={3} 
                          disabled={finalAnswerSubmitted} 
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Medical Innovation</label>
                        <Textarea 
                          placeholder="Propose an innovation for handling this disease..." 
                          value={finalAnswer.innovation} 
                          onChange={(e) => setFinalAnswer(prev => ({ ...prev, innovation: e.target.value }))} 
                          rows={3} 
                          disabled={finalAnswerSubmitted} 
                        />
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          onClick={handleSubmitFinalAnswer} 
                          disabled={!finalAnswer.treatment.trim() || !finalAnswer.innovation.trim() || finalAnswerSubmitted} 
                          className="w-full bg-gradient-to-r from-medical-orange to-medical-red hover:from-medical-orange/90 hover:to-medical-red/90"
                        >
                          {finalAnswerSubmitted ? '✓ Final Answer Submitted' : 'Submit Final Answer'}
                        </Button>
                      </motion.div>
                      
                      {finalAnswerSubmitted && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-medical-green/10 p-3 rounded-lg"
                        >
                          <div className="text-sm font-medium text-medical-green text-center">
                            ✓ Your final answer has been submitted successfully!
                          </div>
                          <div className="text-xs text-muted-foreground text-center mt-2">
                            Waiting for other finalists to submit their answers...
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Eliminated Players during Final Round - Now in Center */}
            {room.phase === GamePhase.FINAL_ROUND && currentPlayer.isEliminated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring" }}
              >
                <Card className="bg-game-card border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="text-center space-y-4">
                      <div className="bg-gradient-to-r from-medical-blue to-medical-green p-3 rounded-full w-fit mx-auto">
                        <Eye className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">🗳️ You're a Voter!</h4>
                        <p className="text-sm text-muted-foreground">
                          As an eliminated player, you can see all finalists' answers in real-time.
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-medical-orange/10 to-medical-red/10 p-3 rounded-lg">
                        <div className="text-sm font-medium mb-2">Final Round Status</div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span>Submissions:</span>
                            <span className="font-bold text-medical-blue">
                              {room.players.filter(p => !p.isEliminated && p.finalAnswer).length} / {room.players.filter(p => !p.isEliminated).length}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <motion.div 
                              className="bg-medical-blue h-2.5 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(room.players.filter(p => !p.isEliminated && p.finalAnswer).length / Math.max(1, room.players.filter(p => !p.isEliminated).length)) * 100}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {allFinalAnswersSubmitted && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-medical-green/10 p-3 rounded-lg animate-pulse"
                        >
                          <div className="text-medical-green font-semibold">
                            ✓ All finalists have submitted! Voting will begin shortly...
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Finalists during Voting - Now in Center */}
            {room.phase === GamePhase.VOTING_FINAL && !currentPlayer.isEliminated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring" }}
              >
                <Card className="bg-game-card border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="text-center space-y-4">
                      <div className="bg-gradient-to-r from-medical-orange to-medical-red p-3 rounded-full w-fit mx-auto">
                        <Trophy className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">🏆 You're a Finalist!</h4>
                        <p className="text-sm text-muted-foreground">
                          {showFinalAnswers ? "All answers are now visible. Eliminated players are voting." : "Waiting for all finalists to submit before answers are revealed."}
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-medical-blue/10 to-medical-green/10 p-3 rounded-lg">
                        <div className="text-lg font-bold text-medical-blue">
                          {Object.keys(room.finalVotes || {}).length} / {room.players.filter(p => p.isEliminated).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Eliminated players have voted</div>
                      </div>
                      
                      {Object.keys(room.finalVotes || {}).length >= room.players.filter(p => p.isEliminated).length && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-medical-green/10 p-3 rounded-lg"
                        >
                          <div className="text-medical-green font-semibold text-sm">
                            ✓ All votes received! The winner will be announced soon...
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}


            {/* Eliminated Status - Now in Center */}
            {(room.phase === GamePhase.DISCUSSION || room.phase === GamePhase.VOTING) && currentPlayer.isEliminated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring" }}
              >
                <Card className="bg-game-card border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="text-center space-y-3">
                      <div className="bg-gradient-to-r from-medical-red/20 to-medical-orange/20 p-3 rounded-full w-fit mx-auto">
                        <X className="h-6 w-6 text-medical-red" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-2">You've Been Eliminated</h4>
                        <p className="text-sm text-muted-foreground">
                          You can watch the remaining players and chat, but cannot participate in discussions or voting.
                        </p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-sm">
                          <span className="font-medium">Current Phase:</span> {room.phase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Active Players: {room.players.filter(p => !p.isEliminated).length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 🔴 PERBAIKAN: Results Section - Now in Center */}
            {room.phase === GamePhase.RESULTS && room.winner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring" }}
              >
                <Card className="bg-game-card border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center">
                      <Trophy className="h-8 w-8 text-yellow-500 mr-2" />
                      Game Results
                    </h3>
                    
                    {/* Winner Banner */}
                    <motion.div 
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-6 rounded-lg text-white text-center mb-6"
                    >
                      <h4 className="text-lg opacity-90 mb-1">Winner</h4>
                      <p className="text-3xl font-bold">
                        {room.players.find(p => p.id === room.winner)?.name}
                      </p>
                    </motion.div>
                    
                    {/* Points Display */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-medical-blue/10 to-medical-green/10 rounded-lg">
                      <h5 className="font-semibold text-center mb-4">🏆 Final Points</h5>
                      <div className="space-y-2">
                        <AnimatePresence>
                          {room.players
                            .sort((a, b) => (b.points || 0) - (a.points || 0))
                            .map((player, index) => {
                              const playerPoints = points[player.id] || player.points || 0;
                              return (
                                <motion.div 
                                  key={player.id} 
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex justify-between items-center p-2 bg-background rounded"
                                >
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-gray-500 w-6">#{index + 1}</span>
                                    <div className={`w-2 h-2 rounded-full ${player.isEliminated ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                    <span className={player.id === room.winner ? 'font-bold text-medical-orange' : ''}>
                                      {player.name}{player.id === room.winner && ' 👑'}
                                    </span>
                                  </div>
                                  <span className="font-bold text-medical-blue">{playerPoints} pts</span>
                                </motion.div>
                              );
                            })}
                        </AnimatePresence>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* FINAL VOTING SECTION - MOVED TO CENTER COLUMN, ABOVE GAME CHAT */}
            {room.phase === GamePhase.VOTING_FINAL && currentPlayer.isEliminated && allFinalAnswersSubmitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring" }}
              >
                <Card className="bg-game-card border-0 shadow-lg border-2 border-medical-orange">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-center mb-4 flex items-center justify-center">
                      <Vote className="h-6 w-6 text-medical-orange mr-2" />
                      Final Voting
                    </h3>
                    
                    <p className="text-center text-muted-foreground mb-4">
                      Choose the winner from the {room.players.filter(p => !p.isEliminated).length} finalists
                    </p>
                    
                    <div className="grid gap-3 md:grid-cols-3">
                      <AnimatePresence>
                        {room.players.filter(p => !p.isEliminated).map((finalist, index) => (
                          <motion.div 
                            key={finalist.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${
                              myVote === finalist.id 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-gray-200 hover:border-medical-blue'
                            }`}
                            onClick={() => {
                              if (!myVote && finalist.finalAnswer && currentPlayer.isEliminated) {
                                console.log('Voting for:', finalist.name);
                                voteFinal(finalist.id);
                                setMyVote(finalist.id);
                              }
                            }}
                          >
                            <div className="text-2xl font-bold text-medical-blue mb-2">#{index + 1}</div>
                            <div className="font-semibold mb-1">{finalist.name}</div>
                            {finalist.finalAnswer ? (
                              <Badge className="bg-green-500 text-white">Ready</Badge>
                            ) : (
                              <Badge variant="outline" className="text-yellow-600">Waiting</Badge>
                            )}
                            {myVote === finalist.id && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="mt-2 text-green-600 font-bold"
                              >
                                ✓ Your Vote
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    
                    {myVote && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-green-100 rounded-lg text-center"
                      >
                        <p className="text-green-700">✅ You have voted! Waiting for other voters...</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Object.keys(room.finalVotes || {}).length} of {room.players.filter(p => p.isEliminated).length} votes cast
                        </p>
                      </motion.div>
                    )}
                    
                    {!myVote && allFinalAnswersSubmitted && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 p-3 bg-blue-100 rounded-lg text-center"
                      >
                        <p className="text-blue-700">👆 Click on a finalist above to cast your vote</p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Fallback jika voting belum bisa dimulai - MOVED TO CENTER COLUMN */}
            {room.phase === GamePhase.VOTING_FINAL && currentPlayer.isEliminated && !allFinalAnswersSubmitted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card className="bg-game-card border-0 shadow-lg border-2 border-yellow-400">
                  <CardContent className="p-4">
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-center">
                      <p className="text-yellow-700">⏳ Waiting for all finalists to submit answers...</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {debugInfo.submittedCount} of {debugInfo.finalistsCount} submitted
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Chat - Now in Center (Below Final Voting) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-game-chat border-0 shadow-lg">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Game Chat
                  </h4>
                  <ScrollArea className="h-64 mb-4 border rounded p-3" ref={chatScrollRef}>
                    <div className="space-y-2">
                      <AnimatePresence>
                        {room.chatMessages.map((msg, index) => (
                          <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="text-sm"
                          >
                            <span className={`font-medium ${getPlayerColor(msg.playerId)}`}>
                              {msg.playerName}:
                            </span>
                            <span className="ml-2">{msg.message}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {room.chatMessages.length === 0 && (
                        <div className="text-center text-muted-foreground text-sm py-4">
                          No messages yet. Start the conversation!
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Type your message..." 
                      value={chatMessage} 
                      onChange={(e) => setChatMessage(e.target.value)} 
                      onKeyPress={(e) => e.key === 'Enter' && handleSendChat()} 
                      className="flex-1" 
                    />
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        onClick={handleSendChat} 
                        disabled={!chatMessage.trim()} 
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN - Submit Your Diagnosis & Final Round Submissions */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="col-span-3 space-y-4"
          >
            {/* Discussion Input - Moved to Right Column */}
            {(room.phase === GamePhase.DISCUSSION || room.phase === GamePhase.ROLE_ASSIGNMENT) && 
             individuallyRevealed && hasRevealedRole && !currentPlayer.isEliminated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-game-card border-0 shadow-lg">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Submit Your Diagnosis</h4>
                    <div className="flex flex-col space-y-2">
                      <Textarea 
                        placeholder="Enter your medical diagnosis here..." 
                        value={answer} 
                        onChange={(e) => setAnswer(e.target.value)} 
                        className="w-full" 
                        rows={3}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            handleSubmitAnswer();
                          }
                        }}
                      />
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          onClick={handleSubmitAnswer} 
                          disabled={!answer.trim()} 
                          className="w-full bg-medical-blue hover:bg-medical-blue/90"
                        >
                          Submit
                        </Button>
                      </motion.div>
                      <p className="text-xs text-muted-foreground text-center">Press Ctrl+Enter to submit</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Final Round Submissions - Moved to Right Column (without Final Voting) */}
            {(room.phase === GamePhase.FINAL_ROUND || room.phase === GamePhase.VOTING_FINAL) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="bg-game-card border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold flex items-center">
                        <Trophy className="h-4 w-4 mr-2" />
                        Final Round Submissions
                      </h4>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                      >
                        <Badge className={`${showFinalAnswers ? 'bg-medical-green' : 'bg-medical-orange'} text-white`}>
                          {showFinalAnswers ? '👁️ Visible' : '👁️ Hidden'}
                        </Badge>
                      </motion.div>
                    </div>

                    {!showFinalAnswers && room.phase === GamePhase.FINAL_ROUND && !currentPlayer.isEliminated && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-medical-orange/10 p-3 rounded-lg mb-4"
                      >
                        <div className="flex items-center space-x-2">
                          <EyeOff className="h-4 w-4 text-medical-orange" />
                          <p className="text-sm text-medical-orange">
                            Answers are hidden until all finalists submit.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-4 pr-1">
                      <AnimatePresence>
                        {room.players.filter(p => !p.isEliminated).map((player, index) => (
                          <motion.div 
                            key={player.id} 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className={`border-2 rounded-lg p-4 transition-all duration-200 ${
                              room.phase === GamePhase.VOTING_FINAL && currentPlayer.isEliminated && myVote === player.id 
                                ? 'border-medical-green bg-medical-green/5 shadow-md' 
                                : 'border-border'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="bg-gradient-to-r from-medical-blue to-medical-green w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-bold text-lg">{player.name}</div>
                                  {player.id === currentPlayer.id && (
                                    <Badge className="bg-medical-blue text-white text-xs mt-1">You</Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            {player.finalAnswer ? (
                              (showFinalAnswers || currentPlayer.isEliminated) ? (
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                  className="space-y-3 bg-background/50 p-3 rounded-lg"
                                >
                                  <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Stethoscope className="h-4 w-4 text-medical-blue" />
                                      <span className="font-semibold text-medical-blue">Treatment Plan:</span>
                                    </div>
                                    <p className="text-sm pl-6 leading-relaxed text-muted-foreground">
                                      {player.finalAnswer.treatment}
                                    </p>
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Trophy className="h-4 w-4 text-medical-orange" />
                                      <span className="font-semibold text-medical-orange">Medical Innovation:</span>
                                    </div>
                                    <p className="text-sm pl-6 leading-relaxed text-muted-foreground">
                                      {player.finalAnswer.innovation}
                                    </p>
                                  </div>
                                </motion.div>
                              ) : (
                                <div className="bg-muted/50 p-4 rounded-lg text-center">
                                  <EyeOff className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    Answer submitted but hidden until all finalists finish
                                  </p>
                                </div>
                              )
                            ) : (
                              <div className="bg-muted/50 p-4 rounded-lg text-center">
                                <motion.div
                                  animate={{ opacity: [0.5, 1, 0.5] }}
                                  transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                  <p className="text-sm text-muted-foreground italic">
                                    Waiting for {player.name} to submit their final answer...
                                  </p>
                                </motion.div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Elimination Modal */}
        <AnimatePresence>
          {showEliminationModal && eliminatedPlayer && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center"
              >
                <div className="mb-4">
                  <div className="bg-medical-red/10 p-4 rounded-full w-fit mx-auto mb-4">
                    <Skull className="h-12 w-12 text-medical-red" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Player Eliminated!</h3>
                  <div className="bg-gradient-to-r from-medical-blue to-medical-green p-4 rounded-lg mb-4">
                    <div className="text-white">
                      <div className="text-lg font-bold">{eliminatedPlayer.name}</div>
                      <div className="text-sm opacity-90">has been eliminated</div>
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">Their role was:</div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className={`${getRoleColor(eliminatedPlayer.role)}`}>
                        {getRoleIcon(eliminatedPlayer.role)}
                      </div>
                      <div className="font-semibold">
                        {eliminatedPlayer.role?.replace('_', ' ').replace(/\b\w/g, (char: string) => char.toUpperCase())}
                      </div>
                    </div>
                    {eliminatedPlayer.disease && (
                      <div className="text-sm text-medical-blue font-medium mt-2">
                        Disease: {eliminatedPlayer.disease}
                      </div>
                    )}
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={() => { 
                      setShowEliminationModal(false); 
                      setEliminatedPlayer(null); 
                    }} 
                    className="w-full bg-medical-blue hover:bg-medical-blue/90"
                  >
                    Continue Game
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Leave Game Modal */}
        <AnimatePresence>
          {showLeaveConfirmation && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center"
              >
                <div className="mb-6">
                  <div className="bg-red-100 p-4 rounded-full w-fit mx-auto mb-4">
                    <LogOut className="h-12 w-12 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-red-600">Leave Game?</h3>
                  <p className="text-muted-foreground mb-4">
                    Are you sure you want to leave the game? You will lose your progress and won't be able to rejoin this round.
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="text-sm text-red-700">
                      <strong>Warning:</strong> Leaving will affect other players and you cannot undo this action.
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1"
                  >
                    <Button 
                      variant="outline" 
                      onClick={() => setShowLeaveConfirmation(false)} 
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1"
                  >
                    <Button 
                      onClick={() => { 
                        setShowLeaveConfirmation(false); 
                        leaveRoom(); 
                      }} 
                      className="w-full bg-red-500 hover:bg-red-600 text-white"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Leave Game
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add custom CSS for 3D transforms */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}