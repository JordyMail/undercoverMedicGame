import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Trophy, Crown, Medal, Star, Home, RotateCcw, Sparkles, Award, Target, Users } from 'lucide-react';
import { useGame } from '../contexts/FixedGameContext';
import type { GameResult } from '@shared/game';

export default function ResultsPage() {
  const location = useLocation();
  const { room } = useGame();
  const [results, setResults] = useState<GameResult | null>(location.state as GameResult | null);

  // Try to get results from session storage if not in location state
  useEffect(() => {
    if (!results) {
      const savedResults = localStorage.getItem('uncoverles_results');
      if (savedResults) {
        try {
          setResults(JSON.parse(savedResults));
        } catch (error) {
          console.error('Failed to parse saved results:', error);
        }
      } else if (room && room.phase === 'results') {
        // Create basic results from room data if available
        const sortedPlayers = [...room.players].sort((a, b) => b.points - a.points);
        const basicResults: GameResult = {
          winner: sortedPlayers[0],
          finalRanking: sortedPlayers,
          rewards: {}
        };
        setResults(basicResults);
      }
    }
  }, [results, room]);

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-blue/10 via-background to-medical-green/10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-game-card border-0 shadow-lg max-w-md">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No Results Found</h2>
              <p className="text-muted-foreground mb-6">
                Game results are not available. Please start a new game.
              </p>
              <Link to="/play">
                <Button className="bg-gradient-to-r from-medical-blue to-medical-green hover:from-medical-blue/90 hover:to-medical-green/90 text-white">
                  Play Again
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-8 w-8 text-yellow-500" />;
      case 2:
        return <Medal className="h-8 w-8 text-gray-400" />;
      case 3:
        return <Medal className="h-8 w-8 text-amber-600" />;
      default:
        return <Star className="h-8 w-8 text-muted-foreground" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-amber-400 to-amber-600';
      default:
        return 'from-muted to-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/10 via-background to-medical-green/10 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400/20 rounded-full blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-medical-blue/20 rounded-full blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-medical-green/10 rounded-full blur-3xl"
        />
        
        {/* Floating Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute top-20 left-20"
        >
          <Trophy className="w-24 h-24 text-yellow-500" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute bottom-20 right-20"
        >
          <Crown className="w-24 h-24 text-medical-blue" />
        </motion.div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        

        {/* NEW LAYOUT: 3 Columns */}
        <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
          
          {/* LEFT COLUMN - Game Complete & Champion */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="col-span-12 lg:col-span-3 space-y-6"
          >
            {/* Game Complete Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring" }}
            >
              <Card className="bg-gradient-to-br from-medical-blue/20 to-medical-green/20 border-0 shadow-lg overflow-hidden">
                <CardContent className="p-6 text-center">
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="bg-gradient-to-r from-medical-blue to-medical-green p-4 rounded-full w-fit mx-auto mb-4"
                  >
                    <Sparkles className="h-8 w-8 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">Game Complete!</h2>
                  <p className="text-sm text-muted-foreground">
                    {results.finalRanking.length} players • {results.finalRanking.filter(p => !p.isEliminated).length} finalists
                  </p>
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-xs text-muted-foreground">Total Points Distributed</div>
                    <div className="text-2xl font-bold text-medical-blue">
                      {results.finalRanking.reduce((sum, p) => sum + p.points, 0)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Champion Spotlight */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring" }}
            >
              <Card className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-500/30 shadow-2xl overflow-hidden">
                <CardContent className="p-6 text-center">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 rounded-full w-fit mx-auto mb-4"
                  >
                    <Crown className="h-10 w-10 text-white" />
                  </motion.div>
                  
                  <h2 className="text-xl font-bold mb-2">🏆 Champion 🏆</h2>
                  
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.6 }}
                    className="text-2xl font-bold text-yellow-600 mb-2"
                  >
                    {results.winner.name}
                  </motion.div>
                  
                  <Badge className="bg-yellow-500 text-white text-lg px-4 py-2 mb-4">
                    {results.winner.points} Points
                  </Badge>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/50 backdrop-blur-sm rounded-lg p-4"
                  >
                    <h3 className="font-semibold mb-2">Champion Reward</h3>
                    <div className="flex items-center justify-center space-x-2">
                      <motion.span 
                        animate={{ rotate: [0, 360] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="text-2xl"
                      >
                        {results.rewards[results.winner.id]?.icon || '🏆'}
                      </motion.span>
                      <span className="font-bold">{results.rewards[results.winner.id]?.title || 'Ultimate Champion'}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {results.rewards[results.winner.id]?.description || 'Congratulations on your victory!'}
                    </p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* CENTER COLUMN - Final Rankings */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="col-span-12 lg:col-span-6"
          >
            <Card className="bg-game-card border-0 shadow-lg h-full">
              <CardHeader>
                <CardTitle className="text-2xl text-center flex items-center justify-center">
                  <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
                  Final Rankings
                  <Trophy className="h-6 w-6 ml-2 text-yellow-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AnimatePresence>
                    {results.finalRanking.map((player, index) => {
                      const rank = index + 1;
                      const reward = results.rewards[player.id];
                      
                      return (
                        <motion.div 
                          key={player.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                            rank === 1 
                              ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 shadow-md' 
                              : rank === 2
                              ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
                              : rank === 3
                              ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300'
                              : 'bg-background border-border hover:border-medical-blue/30'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <motion.div 
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                              className={`bg-gradient-to-r ${getRankColor(rank)} p-3 rounded-full text-white`}
                            >
                              {getRankIcon(rank)}
                            </motion.div>
                            
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xl font-bold">#{rank}</span>
                                <span className="text-lg font-semibold">{player.name}</span>
                                {player.isHost && <Badge variant="outline">Host</Badge>}
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>Role: {player.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                {player.isEliminated && <Badge variant="destructive" className="text-xs">Eliminated</Badge>}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.8 + index * 0.1 }}
                              className="text-2xl font-bold text-medical-blue"
                            >
                              {player.points}
                            </motion.div>
                            <div className="text-sm text-muted-foreground">points</div>
                            
                            {reward && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.9 + index * 0.1 }}
                                className="mt-2 bg-medical-blue/10 rounded-lg p-2"
                              >
                                <div className="flex items-center justify-center space-x-1">
                                  <span>{reward.icon}</span>
                                  <span className="text-xs font-medium">{reward.title}</span>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* RIGHT COLUMN - Special Achievements, Game Statistics, and Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="col-span-12 lg:col-span-3 space-y-6"
          >
            {/* Special Achievements */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring" }}
            >
              <Card className="bg-game-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-center flex items-center justify-center">
                    <Award className="h-5 w-5 mr-2 text-yellow-500" />
                    Special Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {Object.values(results.rewards).map((reward, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          className="bg-gradient-to-br from-medical-blue/10 to-medical-green/10 p-3 rounded-lg text-center border"
                        >
                          <motion.div 
                            animate={{ rotate: [0, 360] }}
                            transition={{ repeat: Infinity, duration: 3, delay: index * 0.2 }}
                            className="text-2xl mb-1"
                          >
                            {reward.icon}
                          </motion.div>
                          <div className="font-semibold text-sm mb-1">{reward.title}</div>
                          <div className="text-xs text-muted-foreground mb-2">{reward.description}</div>
                          <Badge className="bg-medical-blue text-white text-xs">
                            +{reward.points} pts
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {Object.values(results.rewards).length === 0 && (
                      <div className="text-center text-muted-foreground py-4">
                        No special achievements this game
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Game Statistics */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring" }}
            >
              <Card className="bg-game-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-center flex items-center justify-center">
                    <Target className="h-5 w-5 mr-2 text-medical-blue" />
                    Game Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 }}
                      className="bg-medical-blue/10 p-3 rounded-lg text-center"
                    >
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <Users className="h-4 w-4 text-medical-blue" />
                        <div className="text-sm font-medium">Total Players</div>
                      </div>
                      <div className="text-2xl font-bold text-medical-blue">
                        {results.finalRanking.length}
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.0 }}
                      className="bg-medical-green/10 p-3 rounded-lg text-center"
                    >
                      <div className="text-sm font-medium mb-1">Finalists</div>
                      <div className="text-2xl font-bold text-medical-green">
                        {results.finalRanking.filter(p => !p.isEliminated).length}
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.1 }}
                      className="bg-medical-purple/10 p-3 rounded-lg text-center"
                    >
                      <div className="text-sm font-medium mb-1">Highest Score</div>
                      <div className="text-2xl font-bold text-medical-purple">
                        {Math.max(...results.finalRanking.map(p => p.points))}
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 }}
                      className="bg-medical-orange/10 p-3 rounded-lg text-center"
                    >
                      <div className="text-sm font-medium mb-1">Average Score</div>
                      <div className="text-2xl font-bold text-medical-orange">
                        {Math.round(results.finalRanking.reduce((sum, p) => sum + p.points, 0) / results.finalRanking.length)}
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="space-y-3"
            >
              <Link to="/play" className="block">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg"
                    className="w-full bg-gradient-to-r from-medical-blue to-medical-green hover:from-medical-blue/90 hover:to-medical-green/90 text-white px-8 py-4"
                  >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Play Again
                  </Button>
                </motion.div>
              </Link>
              
              <Link to="/" className="block">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white px-8 py-4"
                  >
                    <Home className="mr-2 h-5 w-5" />
                    Back to Home
                  </Button>
                </motion.div>
              </Link>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="text-sm text-muted-foreground text-center pt-2"
              >
                Thank you for playing Uncoverles!<br />
                Share your results with friends.
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}