import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Users, Crown, Play, Copy, Check, UserCheck, Clock, Stethoscope, ChevronDown } from 'lucide-react';
import { useGame } from '../contexts/FixedGameContext';
import { MEDICAL_THEMES } from '../../shared/medicalData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function LobbyPage() {
  const { room, currentPlayer, startGame, leaveRoom, initializeConnection, socket, isConnected } = useGame();
  const [copied, setCopied] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(room?.selectedTheme || '');

  // Ensure connection is initialized (only if not already connected)
  useEffect(() => {
    if (!socket || !isConnected) {
      initializeConnection();
    }
  }, [socket, isConnected, initializeConnection]);

  useEffect(() => {
    if (!room || !currentPlayer) {
      // Check if we have a session token
      const sessionToken = localStorage.getItem('uncoverles_session_token');

      if (!sessionToken) {
        // No session token, redirect to play page immediately
        window.location.href = '/play';
      } else {
        // Give socket time to restore session (3 seconds)
        const timer = setTimeout(() => {
          if (!room || !currentPlayer) {
            console.log('Session restoration timed out, redirecting to play page');
            window.location.href = '/play';
          }
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [room, currentPlayer]);

  if (!room || !currentPlayer) {
    return null;
  }

  const canStart = room.players.length >= room.minPlayers && currentPlayer.isHost && selectedTheme;
  const isRoomFull = room.players.length >= room.maxPlayers;

  const handleThemeSelect = (themeId: string) => {
    if (currentPlayer.isHost && socket && isConnected) {
      setSelectedTheme(themeId);
      socket.emit('select-theme', themeId);
    }
  };

  const copyRoomCode = async () => {
    // Always use fallback method to avoid permission policy issues
    try {
      const textArea = document.createElement('textarea');
      textArea.value = room.code;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // If execCommand fails, show manual copy option
        throw new Error('Copy command failed');
      }
    } catch (err) {
      console.error('Failed to copy room code:', err);
      // Show user feedback that copy failed with manual copy option
      const userResponse = confirm(`Automatic copy failed. Would you like to see the room code to copy manually?\n\nRoom Code: ${room.code}\n\nClick OK to dismiss this message.`);
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
          <Crown className="w-24 h-24 text-medical-green" />
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
          <Clock className="w-20 h-20 text-medical-blue" />
        </motion.div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button onClick={leaveRoom} variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Leave Room
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl font-bold">Game Lobby</h1>
              <p className="text-muted-foreground">Waiting for players to join</p>
            </motion.div>
          </div>

          {currentPlayer.isHost && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={startGame}
                disabled={!canStart}
                className="bg-gradient-to-r from-medical-blue to-medical-green hover:from-medical-blue/90 hover:to-medical-green/90 text-white px-6 py-3"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Game
              </Button>
            </motion.div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Room Info and Game Status */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Room Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <Card className="bg-game-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-center">Room Code</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <motion.div 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.6 }}
                    className="bg-gradient-to-r from-medical-blue to-medical-green p-4 rounded-lg"
                  >
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                      className="font-mono text-2xl font-bold text-white tracking-wider"
                    >
                      {room.code}
                    </motion.div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={copyRoomCode}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.div
                            key="copied"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Copied!
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex items-center"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Code
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                  
                  <p className="text-sm text-muted-foreground">
                    Share this code with friends to invite them to the game
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Game Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <Card className="bg-game-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Game Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.7 }}
                    className={`${getStatusColor()} text-white p-2 rounded-lg text-center font-semibold`}
                  >
                    {getStatusMessage()}
                  </motion.div>
                  
                  <div className="space-y-2 text-sm">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                      className="flex justify-between"
                    >
                      <span className="text-muted-foreground">Players:</span>
                      <span className="font-medium">{room.players.length}/{room.maxPlayers}</span>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                      className="flex justify-between"
                    >
                      <span className="text-muted-foreground">Min to start:</span>
                      <span className="font-medium">{room.minPlayers}</span>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 }}
                      className="flex justify-between"
                    >
                      <span className="text-muted-foreground">Phase:</span>
                      <span className="font-medium capitalize">{room.phase}</span>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Theme Selection - Only for Host */}
            {currentPlayer.isHost && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-game-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Game Theme
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Medical Theme:</label>
                      <Select value={selectedTheme} onValueChange={handleThemeSelect}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose a medical theme for this game" />
                        </SelectTrigger>
                        <SelectContent>
                          {MEDICAL_THEMES.map((theme, index) => (
                            <motion.div
                              key={theme.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * index }}
                            >
                              <SelectItem value={theme.id}>
                                <div>
                                  <div className="font-medium">{theme.name}</div>
                                  <div className="text-xs text-muted-foreground">{theme.description}</div>
                                </div>
                              </SelectItem>
                            </motion.div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <AnimatePresence>
                      {selectedTheme && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-medical-blue/10 p-3 rounded-lg overflow-hidden"
                        >
                          <div className="text-sm">
                            <span className="font-medium text-medical-blue">
                              Selected: {MEDICAL_THEMES.find(t => t.id === selectedTheme)?.name}
                            </span>
                            <div className="text-xs text-muted-foreground mt-1">
                              {MEDICAL_THEMES.find(t => t.id === selectedTheme)?.diseases.length} disease pairs available
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {!selectedTheme && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bg-medical-orange/10 p-3 rounded-lg"
                        >
                          <div className="text-sm text-medical-orange font-medium">
                            ⚠️ Please select a theme before starting the game
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Theme Display - For Non-Host Players */}
            {!currentPlayer.isHost && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-game-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Game Theme
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AnimatePresence mode="wait">
                      {selectedTheme ? (
                        <motion.div
                          key="theme-selected"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-medical-blue/10 p-3 rounded-lg"
                        >
                          <div className="text-sm">
                            <span className="font-medium text-medical-blue">
                              Theme: {MEDICAL_THEMES.find(t => t.id === selectedTheme)?.name}
                            </span>
                            <div className="text-xs text-muted-foreground mt-1">
                              Selected by host • {MEDICAL_THEMES.find(t => t.id === selectedTheme)?.diseases.length} disease pairs
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="theme-waiting"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-muted/50 p-3 rounded-lg"
                        >
                          <motion.div 
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="text-sm text-muted-foreground"
                          >
                            ⏳ Waiting for host to select game theme...
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Right Column - Players List and Quick Rules */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Players List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <Card className="bg-game-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Players ({room.players.length}/{room.maxPlayers})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {room.players.map((player, index) => (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -5 }}
                          className={`bg-background border rounded-lg p-4 transition-all duration-200 ${
                            player.id === currentPlayer.id 
                              ? 'border-medical-blue shadow-md' 
                              : 'border-border hover:border-medical-blue/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <motion.div 
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                                className="bg-gradient-to-r from-medical-blue to-medical-green w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                              >
                                {player.name.charAt(0).toUpperCase()}
                              </motion.div>
                              
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
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring" }}
                                >
                                  <Badge className="bg-medical-orange text-white">
                                    <Crown className="mr-1 h-3 w-3" />
                                    Host
                                  </Badge>
                                </motion.div>
                              )}
                              
                              <motion.div 
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="flex items-center text-medical-green"
                              >
                                <UserCheck className="h-4 w-4" />
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Empty slots */}
                    <AnimatePresence>
                      {Array.from({ length: 12 - room.players.length }, (_, index) => (
                        <motion.div
                          key={`empty-${index}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 0.5, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ delay: (room.players.length + index) * 0.05 }}
                          className="bg-muted/50 border-2 border-dashed border-muted rounded-lg p-4 flex items-center justify-center"
                        >
                          <div className="text-center text-muted-foreground">
                            <motion.div
                              animate={{ 
                                y: [0, -5, 0],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{ 
                                repeat: Infinity, 
                                duration: 2,
                                delay: index * 0.2
                              }}
                            >
                              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            </motion.div>
                            <div className="text-sm">Waiting for player...</div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Game Rules Quick Reference */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ y: -5 }}
            >
              <Card className="bg-game-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle>Quick Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-4 text-center">
                    {[
                      { color: 'blue', step: 1, text: 'Get assigned a secret medical role' },
                      { color: 'green', step: 2, text: 'Discuss diagnoses and vote out players' },
                      { color: 'purple', step: 3, text: 'Final 3 compete for the win' }
                    ].map((item, index) => (
                      <motion.div
                        key={item.step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className={`bg-medical-${item.color}/10 p-3 rounded-lg`}
                      >
                        <motion.div 
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className={`font-semibold text-medical-${item.color} mb-1`}
                        >
                          Step {item.step}
                        </motion.div>
                        <div className="text-sm text-muted-foreground">
                          {item.text}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}