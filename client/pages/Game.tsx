import { useState, useEffect, useRef } from 'react';
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
  LogOut
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
  const [showFinalAnswers, setShowFinalAnswers] = useState(false);
  const [points, setPoints] = useState<Record<string, number>>({});
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Debug state
  const [debugInfo, setDebugInfo] = useState({
    phase: room?.phase,
    isEliminated: currentPlayer?.isEliminated,
    allFinalAnswersSubmitted: false,
    showFinalAnswers: false,
    finalistsCount: 0,
    submittedCount: 0,
    finalVotesCount: 0
  });

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
                         (room.phase === GamePhase.FINAL_ROUND && currentPlayer?.isEliminated),
        finalistsCount: finalists.length,
        submittedCount: submitted.length,
        finalVotesCount: Object.keys(room.finalVotes || {}).length
      });
    }
  }, [room, currentPlayer]);

    // Tambahkan setelah debugInfo useEffect
  useEffect(() => {
    if (room?.phase === GamePhase.VOTING_FINAL && room.finalVotes) {
      const eliminatedCount = room.players.filter(p => p.isEliminated).length;
      const voteCount = Object.keys(room.finalVotes).length;
      
      console.log('📊 Final vote status:', {
        votes: voteCount,
        total: eliminatedCount,
        percentage: Math.round((voteCount / eliminatedCount) * 100) + '%'
      });

      // Jika semua sudah vote, seharusnya server akan mengirim game-ended
      if (voteCount >= eliminatedCount && eliminatedCount > 0) {
        console.log('🎉 All votes received! Waiting for results...');
      }
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

  // Calculate points
  useEffect(() => {
    if (room?.winner) {
      const calculatedPoints = calculatePoints();
      setPoints(calculatedPoints);
    }
  }, [room?.winner]);

  // Restore reveal state
  useEffect(() => {
    if (currentPlayer?.id) {
      const savedRevealState = localStorage.getItem(`revealed_${currentPlayer.id}`);
      if (savedRevealState === 'true') {
        setIndividuallyRevealed(true);
        setCardFlipped(true);
      }
    }
  }, [currentPlayer?.id]);

  // Save reveal state
  useEffect(() => {
    if (currentPlayer?.id && individuallyRevealed) {
      localStorage.setItem(`revealed_${currentPlayer.id}`, 'true');
    }
  }, [individuallyRevealed, currentPlayer?.id]);

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
    return null;
  }

  const handleRevealRole = () => {
    setCardFlipped(true);
    setTimeout(() => {
      setIndividuallyRevealed(true);
      revealRole();
    }, 600);
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
    votePlayer(playerId);
  };

  const handleSubmitFinalAnswer = () => {
    if (finalAnswer.treatment.trim() && finalAnswer.innovation.trim()) {
      submitFinalAnswer(finalAnswer);
      setFinalAnswerSubmitted(true);
    }
  };

  const calculatePoints = () => {
    if (!room) return {};
    const pointsMap: Record<string, number> = {};
    room.players.forEach(player => { pointsMap[player.id] = 0; });
    if (room.winner) pointsMap[room.winner] = (pointsMap[room.winner] || 0) + 10;
    room.players.forEach(player => {
      if (!player.isEliminated) pointsMap[player.id] = (pointsMap[player.id] || 0) + 5;
    });
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
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/10 via-background to-medical-green/10">
      <div className="container mx-auto px-4 py-6">
        {/* Game Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Uncoverles Game</h1>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Room: {room.code}</span>
              <span>Round: {room.round}</span>
              <span>Phase: {room.phase.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Badge className={`${
              room.phase === GamePhase.FINAL_ROUND ? 'bg-medical-orange' : 
              room.phase === GamePhase.VOTING_FINAL ? 'bg-medical-purple' : 
              'bg-medical-blue'
            } text-white`}>
              {room.phase === GamePhase.FINAL_ROUND && 'Final Round'}
              {room.phase === GamePhase.VOTING_FINAL && 'Final Voting'}
              {room.phase !== GamePhase.FINAL_ROUND && room.phase !== GamePhase.VOTING_FINAL && `Round ${room.round}`}
            </Badge>

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
          </div>
        </div>

        {/* Debug Panel */}
        {process.env.NODE_ENV === 'development' && (
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
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Column - Players & Roles */}
          <div className="lg:col-span-1 space-y-4">
            {/* Role Assignment Card */}
            {!individuallyRevealed && (
              <Card className="bg-game-card border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold mb-4">Your Role Card</h3>
                  <div 
                    className={`relative w-32 h-48 mx-auto cursor-pointer transition-transform duration-600 preserve-3d ${cardFlipped ? 'rotate-y-180' : ''}`}
                    onClick={handleRevealRole}
                  >
                    <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-medical-blue to-medical-green rounded-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <Eye className="h-8 w-8 mx-auto mb-2" />
                        <div className="text-sm font-semibold">Click to Reveal</div>
                      </div>
                    </div>
                    <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white rounded-lg border shadow-lg flex flex-col items-center justify-center p-4">
                      {myRole && (
                        <>
                          <div className={`${getRoleColor(myRole)} mb-2`}>{getRoleIcon(myRole)}</div>
                          <div className="text-xs font-semibold text-center">
                            {myRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          {myDisease && <div className="text-xs text-muted-foreground mt-2 text-center">{myDisease}</div>}
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">Click the card to reveal your secret role</p>
                </CardContent>
              </Card>
            )}

            {/* Disease Info */}
            {individuallyRevealed && hasRevealedRole && myRole && (
              <Card className="bg-game-card border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <div className="bg-gradient-to-r from-medical-blue to-medical-green p-3 rounded-full w-fit mx-auto">
                      <Stethoscope className="h-6 w-6 text-white" />
                    </div>
                    {myDisease ? (
                      <div>
                        <h4 className="font-semibold">Your Disease</h4>
                        <p className="text-lg text-medical-blue font-bold">{myDisease}</p>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-semibold">Your Assignment</h4>
                        <p className="text-sm text-medical-purple font-medium">Mystery Role</p>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      {myDisease ? "Focus on this disease during discussions" : "No specific disease - observe and deduce from others"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Voting Status */}
            {room.phase === GamePhase.VOTING && (
              <Card className="bg-game-card border-0 shadow-lg">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center"><Vote className="h-4 w-4 mr-2" />Voting Status</h4>
                  <div className="space-y-3">
                    {myVote && <div className="bg-medical-green/10 p-3 rounded-lg"><div className="text-sm font-medium text-medical-green">✓ You voted for: {room.players.find(p => p.id === myVote)?.name}</div></div>}
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between"><span className="text-muted-foreground">Votes cast:</span><span className="font-medium">{Object.keys(room.currentVotes || {}).length}/{activePlayers.length}</span></div>
                      <div className="text-xs text-muted-foreground">{Object.keys(room.currentVotes || {}).length < activePlayers.length ? 'Waiting for all votes...' : 'All votes received! Ready to eliminate.'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Players */}
            <Card className="bg-game-card border-0 shadow-lg">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center"><Users className="h-4 w-4 mr-2" />Active Players ({activePlayers.length})</h4>
                <div className="space-y-2">
                  {activePlayers.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-2 bg-background rounded">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-medical-blue to-medical-green rounded-full flex items-center justify-center text-white text-xs font-bold">{player.name.charAt(0)}</div>
                        <span className="text-sm">{player.name}</span>
                        {player.isHost && <Badge variant="secondary" className="text-xs">Host</Badge>}
                      </div>
                      {room.phase === GamePhase.VOTING && player.id !== currentPlayer.id && !myVote && (
                        <Button size="sm" variant={selectedPlayer === player.id ? "default" : "outline"} onClick={() => { handleVotePlayer(player.id); setMyVote(player.id); }} className="text-xs">Vote</Button>
                      )}
                      {room.phase === GamePhase.VOTING && myVote === player.id && <Badge className="bg-medical-green text-white text-xs">✓ Voted</Badge>}
                    </div>
                  ))}
                </div>
                {eliminatedPlayers.length > 0 && (
                  <>
                    <h5 className="font-medium text-sm mt-4 mb-2 text-muted-foreground">Eliminated ({eliminatedPlayers.length})</h5>
                    <div className="space-y-1">
                      {eliminatedPlayers.map((player) => (
                        <div key={player.id} className="flex items-center space-x-2 p-1 opacity-60">
                          <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-xs">{player.name.charAt(0)}</div>
                          <span className="text-xs text-muted-foreground line-through">{player.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Game Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Phase Instructions */}
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
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {room.phase === GamePhase.ROLE_ASSIGNMENT && "Click your card to reveal your role and disease"}
                      {room.phase === GamePhase.DISCUSSION && "Share your diagnosis and discuss with other players"}
                      {room.phase === GamePhase.VOTING && "Vote to eliminate one player this round"}
                      {room.phase === GamePhase.FINAL_ROUND && "Submit your treatment plan and medical innovation"}
                      {room.phase === GamePhase.VOTING_FINAL && "Vote for the best final answer"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Discussion Input */}
            {(room.phase === GamePhase.DISCUSSION || room.phase === GamePhase.ROLE_ASSIGNMENT) && individuallyRevealed && hasRevealedRole && !currentPlayer.isEliminated && (
              <Card className="bg-game-card border-0 shadow-lg">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Submit Your Diagnosis</h4>
                  <div className="flex space-x-2">
                    <Textarea placeholder="Enter your medical diagnosis here..." value={answer} onChange={(e) => setAnswer(e.target.value)} className="flex-1" rows={3} />
                    <Button onClick={handleSubmitAnswer} disabled={!answer.trim()} className="bg-medical-blue hover:bg-medical-blue/90">Submit</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Eliminated Status */}
            {(room.phase === GamePhase.DISCUSSION || room.phase === GamePhase.VOTING) && currentPlayer.isEliminated && (
              <Card className="bg-game-card border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    <div className="bg-gradient-to-r from-medical-red/20 to-medical-orange/20 p-3 rounded-full w-fit mx-auto"><X className="h-6 w-6 text-medical-red" /></div>
                    <div><h4 className="text-lg font-bold mb-2">You've Been Eliminated</h4><p className="text-sm text-muted-foreground">You can watch the remaining players and chat, but cannot participate in discussions or voting.</p></div>
                    <div className="bg-muted/50 p-3 rounded-lg"><div className="text-sm"><span className="font-medium">Current Phase:</span> {room.phase.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div><div className="text-xs text-muted-foreground mt-1">Active Players: {room.players.filter(p => !p.isEliminated).length}</div></div>
                    <div className="text-xs text-muted-foreground">💬 You can still use the chat below to communicate with other players</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Final Round Form */}
            {room.phase === GamePhase.FINAL_ROUND && !currentPlayer.isEliminated && (
              <Card className="bg-game-card border-0 shadow-lg">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center space-x-2 mb-4"><Trophy className="h-5 w-5 text-medical-orange" /><h4 className="font-semibold">Final Challenge - You're a Finalist!</h4></div>
                  <div className="bg-medical-blue/10 p-3 rounded-lg mb-4"><div className="text-sm"><span className="font-medium">⚠️ Important:</span> You cannot see other finalists' answers until all have submitted. Your answers will be visible to eliminated players immediately.</div></div>
                  <div className="space-y-4">
                    <div><label className="text-sm font-medium mb-2 block">Treatment Plan</label><Textarea placeholder="Describe the treatment for your assigned disease..." value={finalAnswer.treatment} onChange={(e) => setFinalAnswer(prev => ({ ...prev, treatment: e.target.value }))} rows={3} disabled={finalAnswerSubmitted} /></div>
                    <div><label className="text-sm font-medium mb-2 block">Medical Innovation</label><Textarea placeholder="Propose an innovation for handling this disease..." value={finalAnswer.innovation} onChange={(e) => setFinalAnswer(prev => ({ ...prev, innovation: e.target.value }))} rows={3} disabled={finalAnswerSubmitted} /></div>
                    <Button onClick={handleSubmitFinalAnswer} disabled={!finalAnswer.treatment.trim() || !finalAnswer.innovation.trim() || finalAnswerSubmitted} className="w-full bg-gradient-to-r from-medical-orange to-medical-red hover:from-medical-orange/90 hover:to-medical-red/90">{finalAnswerSubmitted ? '✓ Final Answer Submitted' : 'Submit Final Answer'}</Button>
                    {finalAnswerSubmitted && <div className="bg-medical-green/10 p-3 rounded-lg"><div className="text-sm font-medium text-medical-green text-center">✓ Your final answer has been submitted successfully!</div><div className="text-xs text-muted-foreground text-center mt-2">Waiting for other finalists to submit their answers...</div></div>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Eliminated Players during Final Round */}
            {room.phase === GamePhase.FINAL_ROUND && currentPlayer.isEliminated && (
              <Card className="bg-game-card border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="text-center space-y-4">
                    <div className="bg-gradient-to-r from-medical-blue to-medical-green p-3 rounded-full w-fit mx-auto"><Eye className="h-8 w-8 text-white" /></div>
                    <div><h4 className="text-xl font-bold mb-2">🗳️ You're a Voter!</h4><p className="text-sm text-muted-foreground">As an eliminated player, you can see all finalists' answers in real-time. Once all finalists submit, you'll vote for the winner.</p></div>
                    <div className="bg-gradient-to-r from-medical-orange/10 to-medical-red/10 p-3 rounded-lg">
                      <div className="text-sm font-medium mb-2">Final Round Status</div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center"><span>Submissions:</span><span className="font-bold text-medical-blue">{room.players.filter(p => !p.isEliminated && p.finalAnswer).length} / {room.players.filter(p => !p.isEliminated).length}</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-medical-blue h-2.5 rounded-full transition-all duration-300" style={{ width: `${(room.players.filter(p => !p.isEliminated && p.finalAnswer).length / Math.max(1, room.players.filter(p => !p.isEliminated).length)) * 100}%` }}></div></div>
                      </div>
                    </div>
                    {allFinalAnswersSubmitted && <div className="bg-medical-green/10 p-3 rounded-lg animate-pulse"><div className="text-medical-green font-semibold">✓ All finalists have submitted! Voting will begin shortly...</div></div>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Finalists during Voting */}
            {room.phase === GamePhase.VOTING_FINAL && !currentPlayer.isEliminated && (
              <Card className="bg-game-card border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="text-center space-y-4">
                    <div className="bg-gradient-to-r from-medical-orange to-medical-red p-3 rounded-full w-fit mx-auto"><Trophy className="h-8 w-8 text-white" /></div>
                    <div><h4 className="text-xl font-bold mb-2">🏆 You're a Finalist!</h4><p className="text-sm text-muted-foreground">{showFinalAnswers ? "All answers are now visible. Eliminated players are voting." : "Waiting for all finalists to submit before answers are revealed."}</p><p className="text-xs text-muted-foreground mt-1">⚠️ Finalists cannot vote in this round.</p></div>
                    <div className="bg-gradient-to-r from-medical-blue/10 to-medical-green/10 p-3 rounded-lg"><div className="text-lg font-bold text-medical-blue">{Object.keys(room.finalVotes || {}).length} / {room.players.filter(p => p.isEliminated).length}</div><div className="text-xs text-muted-foreground">Eliminated players have voted</div></div>
                    {Object.keys(room.finalVotes || {}).length >= room.players.filter(p => p.isEliminated).length && <div className="bg-medical-green/10 p-3 rounded-lg"><div className="text-medical-green font-semibold text-sm">✓ All votes received! The winner will be announced soon...</div></div>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Final Answers Display */}
            {(room.phase === GamePhase.FINAL_ROUND || room.phase === GamePhase.VOTING_FINAL) && (
              <Card className="bg-game-card border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold flex items-center"><Trophy className="h-4 w-4 mr-2" />Final Round Submissions</h4>
                    <Badge className={`${showFinalAnswers ? 'bg-medical-green' : 'bg-medical-orange'} text-white`}>{showFinalAnswers ? '👁️ Visible' : '👁️ Hidden'}</Badge>
                  </div>

                  {!showFinalAnswers && room.phase === GamePhase.FINAL_ROUND && !currentPlayer.isEliminated && (
                    <div className="bg-medical-orange/10 p-3 rounded-lg mb-4"><div className="flex items-center space-x-2"><EyeOff className="h-4 w-4 text-medical-orange" /><p className="text-sm text-medical-orange">Answers are hidden until all finalists submit. {allFinalAnswersSubmitted ? 'All submitted! Revealing soon...' : ''}</p></div></div>
                  )}

                  <div className="space-y-4">
                    {room.players.filter(p => !p.isEliminated).map((player, index) => (
                      <div key={player.id} className={`border-2 rounded-lg p-4 transition-all duration-200 ${room.phase === GamePhase.VOTING_FINAL && currentPlayer.isEliminated && myVote === player.id ? 'border-medical-green bg-medical-green/5 shadow-md' : 'border-border'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-medical-blue to-medical-green w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">{index + 1}</div>
                            <div><div className="font-bold text-lg">{player.name}</div>{player.id === currentPlayer.id && <Badge className="bg-medical-blue text-white text-xs mt-1">You</Badge>}</div>
                          </div>
                        </div>

                        {player.finalAnswer ? (
                          (showFinalAnswers || currentPlayer.isEliminated) ? (
                            <div className="space-y-3 bg-background/50 p-3 rounded-lg">
                              <div><div className="flex items-center space-x-2 mb-2"><Stethoscope className="h-4 w-4 text-medical-blue" /><span className="font-semibold text-medical-blue">Treatment Plan:</span></div><p className="text-sm pl-6 leading-relaxed text-muted-foreground">{player.finalAnswer.treatment}</p></div>
                              <div><div className="flex items-center space-x-2 mb-2"><Trophy className="h-4 w-4 text-medical-orange" /><span className="font-semibold text-medical-orange">Medical Innovation:</span></div><p className="text-sm pl-6 leading-relaxed text-muted-foreground">{player.finalAnswer.innovation}</p></div>
                            </div>
                          ) : (
                            <div className="bg-muted/50 p-4 rounded-lg text-center"><EyeOff className="h-5 w-5 mx-auto mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground">Answer submitted but hidden until all finalists finish</p></div>
                          )
                        ) : (
                          <div className="bg-muted/50 p-4 rounded-lg text-center"><p className="text-sm text-muted-foreground italic">Waiting for {player.name} to submit their final answer...</p></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* FINAL VOTING SECTION - Untuk eliminated players */}
                  {room.phase === GamePhase.VOTING_FINAL && currentPlayer.isEliminated && allFinalAnswersSubmitted && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-medical-orange/10 to-medical-red/10 rounded-lg">
                      <h3 className="text-xl font-bold text-center mb-4 flex items-center justify-center">
                        <Vote className="h-6 w-6 text-medical-orange mr-2" />
                        Final Voting
                      </h3>
                      
                      <p className="text-center text-muted-foreground mb-4">
                        Choose the winner from the {room.players.filter(p => !p.isEliminated).length} finalists
                      </p>
                      
                      <div className="grid gap-3 md:grid-cols-3">
                        {room.players.filter(p => !p.isEliminated).map((finalist, index) => (
                          <div 
                            key={finalist.id}
                            className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all ${
                              myVote === finalist.id 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-gray-200 hover:border-medical-blue'
                            }`}
                            onClick={() => {
                              if (!myVote && finalist.finalAnswer) {
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
                            {myVote === finalist.id && <div className="mt-2 text-green-600 font-bold">✓ Your Vote</div>}
                          </div>
                        ))}
                      </div>
                      
                      {myVote && (
                        <div className="mt-4 p-3 bg-green-100 rounded-lg text-center">
                          <p className="text-green-700">✅ You have voted! Waiting for other voters...</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {Object.keys(room.finalVotes || {}).length} of {room.players.filter(p => p.isEliminated).length} votes cast
                          </p>
                        </div>
                      )}
                      
                      {!myVote && allFinalAnswersSubmitted && (
                        <div className="mt-4 p-3 bg-blue-100 rounded-lg text-center">
                          <p className="text-blue-700">👆 Click on a finalist above to cast your vote</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fallback jika voting belum bisa dimulai */}
                  {room.phase === GamePhase.VOTING_FINAL && currentPlayer.isEliminated && !allFinalAnswersSubmitted && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-center">
                      <p className="text-yellow-700">⏳ Waiting for all finalists to submit answers...</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {debugInfo.submittedCount} of {debugInfo.finalistsCount} submitted
                      </p>
                    </div>
                  )}

                  {/* Points Display */}
                  {room.winner && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-medical-blue/10 to-medical-green/10 rounded-lg">
                      <h5 className="font-semibold text-center mb-4">🏆 Final Points</h5>
                      <div className="space-y-2">
                        {room.players.map(player => {
                          const playerPoints = points[player.id] || 0;
                          return (
                            <div key={player.id} className="flex justify-between items-center p-2 bg-background rounded">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${player.isEliminated ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                <span className={player.id === room.winner ? 'font-bold text-medical-orange' : ''}>
                                  {player.name}{player.id === room.winner && ' 👑'}
                                </span>
                              </div>
                              <span className="font-bold text-medical-blue">{playerPoints} pts</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Chat */}
            <Card className="bg-game-chat border-0 shadow-lg">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center"><MessageCircle className="h-4 w-4 mr-2" />Game Chat</h4>
                <ScrollArea className="h-64 mb-4 border rounded p-3" ref={chatScrollRef}>
                  <div className="space-y-2">
                    {room.chatMessages.map((msg) => (
                      <div key={msg.id} className="text-sm">
                        <span className={`font-medium ${getPlayerColor(msg.playerId)}`}>{msg.playerName}:</span>
                        <span className="ml-2">{msg.message}</span>
                        <span className="text-xs text-muted-foreground ml-2">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                    {room.chatMessages.length === 0 && <div className="text-center text-muted-foreground text-sm py-4">No messages yet. Start the conversation!</div>}
                  </div>
                </ScrollArea>
                <div className="flex space-x-2">
                  <Input placeholder="Type your message..." value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendChat()} className="flex-1" />
                  <Button onClick={handleSendChat} disabled={!chatMessage.trim()} size="sm"><Send className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Elimination Modal */}
        {showEliminationModal && eliminatedPlayer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center animate-in fade-in duration-300">
              <div className="mb-4">
                <div className="bg-medical-red/10 p-4 rounded-full w-fit mx-auto mb-4"><Skull className="h-12 w-12 text-medical-red" /></div>
                <h3 className="text-2xl font-bold mb-2">Player Eliminated!</h3>
                <div className="bg-gradient-to-r from-medical-blue to-medical-green p-4 rounded-lg mb-4"><div className="text-white"><div className="text-lg font-bold">{eliminatedPlayer.name}</div><div className="text-sm opacity-90">has been eliminated</div></div></div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Their role was:</div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`${getRoleColor(eliminatedPlayer.role)}`}>{getRoleIcon(eliminatedPlayer.role)}</div>
                    <div className="font-semibold">{eliminatedPlayer.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                  </div>
                  {eliminatedPlayer.disease && <div className="text-sm text-medical-blue font-medium mt-2">Disease: {eliminatedPlayer.disease}</div>}
                </div>
              </div>
              <Button onClick={() => { setShowEliminationModal(false); setEliminatedPlayer(null); }} className="w-full bg-medical-blue hover:bg-medical-blue/90">Continue Game</Button>
            </div>
          </div>
        )}

        {/* Leave Game Modal */}
        {showLeaveConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center animate-in fade-in duration-300">
              <div className="mb-6">
                <div className="bg-red-100 p-4 rounded-full w-fit mx-auto mb-4"><LogOut className="h-12 w-12 text-red-500" /></div>
                <h3 className="text-2xl font-bold mb-2 text-red-600">Leave Game?</h3>
                <p className="text-muted-foreground mb-4">Are you sure you want to leave the game? You will lose your progress and won't be able to rejoin this round.</p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"><div className="text-sm text-red-700"><strong>Warning:</strong> Leaving will affect other players and you cannot undo this action.</div></div>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setShowLeaveConfirmation(false)} className="flex-1">Cancel</Button>
                <Button onClick={() => { setShowLeaveConfirmation(false); leaveRoom(); }} className="flex-1 bg-red-500 hover:bg-red-600 text-white"><LogOut className="h-4 w-4 mr-2" />Leave Game</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}