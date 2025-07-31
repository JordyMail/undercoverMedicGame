import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Trophy, Crown, Medal, Star, Home, RotateCcw } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/10 via-background to-medical-green/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-medical-blue to-medical-green p-6 rounded-full w-fit mx-auto mb-6">
            <Trophy className="h-16 w-16 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4">Game Complete!</h1>
          <p className="text-xl text-muted-foreground">
            Congratulations to all players on an amazing game
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Winner Spotlight */}
          <Card className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-500/30 shadow-2xl mb-8">
            <CardContent className="p-8 text-center">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 rounded-full w-fit mx-auto mb-4">
                <Crown className="h-12 w-12 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold mb-2">🎉 Champion 🎉</h2>
              <div className="text-2xl font-bold text-yellow-600 mb-2">
                {results.winner.name}
              </div>
              <Badge className="bg-yellow-500 text-white text-lg px-4 py-2">
                {results.winner.points} Points
              </Badge>
              
              <div className="mt-6 bg-white/50 backdrop-blur-sm rounded-lg p-4">
                <h3 className="font-semibold mb-2">Champion Reward</h3>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">{results.rewards[results.winner.id]?.icon}</span>
                  <span className="font-bold">{results.rewards[results.winner.id]?.title}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {results.rewards[results.winner.id]?.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Final Rankings */}
          <Card className="bg-game-card border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Final Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.finalRanking.map((player, index) => {
                  const rank = index + 1;
                  const reward = results.rewards[player.id];
                  
                  return (
                    <div 
                      key={player.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                        rank === 1 
                          ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300' 
                          : rank === 2
                          ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
                          : rank === 3
                          ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300'
                          : 'bg-background border-border'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`bg-gradient-to-r ${getRankColor(rank)} p-3 rounded-full text-white`}>
                          {getRankIcon(rank)}
                        </div>
                        
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
                        <div className="text-2xl font-bold text-medical-blue">
                          {player.points}
                        </div>
                        <div className="text-sm text-muted-foreground">points</div>
                        
                        {reward && (
                          <div className="mt-2 bg-medical-blue/10 rounded-lg p-2">
                            <div className="flex items-center justify-center space-x-1">
                              <span>{reward.icon}</span>
                              <span className="text-xs font-medium">{reward.title}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Rewards Overview */}
          <Card className="bg-game-card border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-center">Special Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.values(results.rewards).map((reward, index) => (
                  <div 
                    key={index}
                    className="bg-gradient-to-br from-medical-blue/10 to-medical-green/10 p-4 rounded-lg text-center border"
                  >
                    <div className="text-3xl mb-2">{reward.icon}</div>
                    <div className="font-semibold mb-1">{reward.title}</div>
                    <div className="text-sm text-muted-foreground mb-2">{reward.description}</div>
                    <Badge className="bg-medical-blue text-white">
                      +{reward.points} pts
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Game Statistics */}
          <Card className="bg-game-card border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-center">Game Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="bg-medical-blue/10 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-medical-blue">
                    {results.finalRanking.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Players</div>
                </div>
                
                <div className="bg-medical-green/10 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-medical-green">
                    {results.finalRanking.filter(p => !p.isEliminated).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Finalists</div>
                </div>
                
                <div className="bg-medical-purple/10 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-medical-purple">
                    {Math.max(...results.finalRanking.map(p => p.points))}
                  </div>
                  <div className="text-sm text-muted-foreground">Highest Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/play">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-medical-blue to-medical-green hover:from-medical-blue/90 hover:to-medical-green/90 text-white px-8 py-4"
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Play Again
                </Button>
              </Link>
              
              <Link to="/">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-medical-blue text-medical-blue hover:bg-medical-blue hover:text-white px-8 py-4"
                >
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Thank you for playing Uncoverles! Share your results with friends and challenge them to beat your score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
