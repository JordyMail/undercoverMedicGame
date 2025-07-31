import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Users, Crown, Play, Copy, Check, UserCheck, Clock } from 'lucide-react';
import { useGame } from '../contexts/FixedGameContext';
import { useState } from 'react';

export default function LobbyPage() {
  const { room, currentPlayer, startGame, leaveRoom, initializeConnection } = useGame();
  const [copied, setCopied] = useState(false);

  // Ensure connection is initialized - fix dependency issue
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      initializeConnection();
    }
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!room || !currentPlayer) {
      // Check if we have saved session data
      const savedRoom = localStorage.getItem('uncoverles_room');
      const savedPlayer = localStorage.getItem('uncoverles_player');

      if (!savedRoom || !savedPlayer) {
        // No session data, redirect to play page
        window.location.href = '/play';
      }
      // If we have session data, the context will restore it
    }
  }, [room, currentPlayer]);

  if (!room || !currentPlayer) {
    return null;
  }

  const canStart = room.players.length >= room.minPlayers && currentPlayer.isHost;
  const isRoomFull = room.players.length >= room.maxPlayers;

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  const getStatusMessage = () => {
    if (isRoomFull) return 'Room is full!';
    if (room.players.length < room.minPlayers) return `Waiting for ${room.minPlayers - room.players.length} more players...`;
    return 'Ready to start!';
  };

  const getStatusColor = () => {
    if (isRoomFull) return 'bg-medical-red';
    if (room.players.length < room.minPlayers) return 'bg-medical-orange';
    return 'bg-medical-green';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/10 via-background to-medical-green/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button onClick={leaveRoom} variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Leave Room
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold">Game Lobby</h1>
              <p className="text-muted-foreground">Waiting for players to join</p>
            </div>
          </div>

          {currentPlayer.isHost && (
            <Button
              onClick={startGame}
              disabled={!canStart}
              className="bg-gradient-to-r from-medical-blue to-medical-green hover:from-medical-blue/90 hover:to-medical-green/90 text-white px-6 py-3"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Game
            </Button>
          )}
        </div>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Room Info */}
          <div className="lg:col-span-1">
            <Card className="bg-game-card border-0 shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="text-center">Room Code</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="bg-gradient-to-r from-medical-blue to-medical-green p-4 rounded-lg">
                  <div className="font-mono text-2xl font-bold text-white tracking-wider">
                    {room.code}
                  </div>
                </div>
                
                <Button
                  onClick={copyRoomCode}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Code
                    </>
                  )}
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  Share this code with friends to invite them to the game
                </p>
              </CardContent>
            </Card>

            <Card className="bg-game-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Game Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`${getStatusColor()} text-white p-3 rounded-lg text-center font-semibold`}>
                  {getStatusMessage()}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Players:</span>
                    <span className="font-medium">{room.players.length}/{room.maxPlayers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min to start:</span>
                    <span className="font-medium">{room.minPlayers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phase:</span>
                    <span className="font-medium capitalize">{room.phase}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Players List */}
          <div className="lg:col-span-2">
            <Card className="bg-game-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Players ({room.players.length}/{room.maxPlayers})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {room.players.map((player, index) => (
                    <div
                      key={player.id}
                      className={`bg-background border rounded-lg p-4 transition-all duration-200 ${
                        player.id === currentPlayer.id 
                          ? 'border-medical-blue shadow-md' 
                          : 'border-border hover:border-medical-blue/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-r from-medical-blue to-medical-green w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                          
                          <div>
                            <div className="font-medium">
                              {player.name}
                              {player.id === currentPlayer.id && (
                                <span className="text-medical-blue text-sm ml-1">(You)</span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Player #{index + 1}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end space-y-1">
                          {player.isHost && (
                            <Badge className="bg-medical-orange text-white">
                              <Crown className="mr-1 h-3 w-3" />
                              Host
                            </Badge>
                          )}
                          
                          <div className="flex items-center text-medical-green">
                            <UserCheck className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Empty slots */}
                  {Array.from({ length: room.maxPlayers - room.players.length }, (_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="bg-muted/50 border-2 border-dashed border-muted rounded-lg p-4 flex items-center justify-center"
                    >
                      <div className="text-center text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <div className="text-sm">Waiting for player...</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Game Rules Quick Reference */}
            <Card className="bg-game-card border-0 shadow-lg mt-6">
              <CardHeader>
                <CardTitle>Quick Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-medical-blue/10 p-3 rounded-lg">
                    <div className="font-semibold text-medical-blue mb-1">Step 1</div>
                    <div className="text-sm text-muted-foreground">Get assigned a secret medical role</div>
                  </div>
                  
                  <div className="bg-medical-green/10 p-3 rounded-lg">
                    <div className="font-semibold text-medical-green mb-1">Step 2</div>
                    <div className="text-sm text-muted-foreground">Discuss diagnoses and vote out players</div>
                  </div>
                  
                  <div className="bg-medical-purple/10 p-3 rounded-lg">
                    <div className="font-semibold text-medical-purple mb-1">Step 3</div>
                    <div className="text-sm text-muted-foreground">Final 3 compete for the win</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
