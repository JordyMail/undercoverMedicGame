import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Users, Plus, LogIn, Stethoscope, Shield, Activity, Heart } from 'lucide-react';
import { useGame } from '../contexts/FixedGameContext';

export default function PlayPage() {
  // Separate states for create and join to fix input sharing bug
  const [createPlayerName, setCreatePlayerName] = useState('');
  const [joinPlayerName, setJoinPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const { createRoom, joinRoom, error, initializeConnection, isConnected } = useGame();

  // Initialize connection when page loads - fix dependency issue
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      initializeConnection();
    }
    return () => { mounted = false; };
  }, []);

  const handleCreateRoom = async (e?: React.FormEvent) => {
    e?.preventDefault(); // Prevent form submission
    if (!createPlayerName.trim()) return;

    setIsCreating(true);
    try {
      await createRoom(createPlayerName.trim());
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e?: React.FormEvent) => {
    e?.preventDefault(); // Prevent form submission
    if (!joinPlayerName.trim() || !roomCode.trim()) return;

    setIsJoining(true);
    try {
      await joinRoom(roomCode.trim().toUpperCase(), joinPlayerName.trim());
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/10 via-background to-medical-green/10 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-medical-blue/20 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-medical-green/20 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-medical-purple/10 rounded-full opacity-10 blur-3xl"></div>
        
        {/* Medical Icons Pattern */}
        <div className="absolute top-20 left-20 opacity-5">
          <Stethoscope className="w-24 h-24 text-medical-blue" />
        </div>
        <div className="absolute bottom-20 right-20 opacity-5">
          <Heart className="w-24 h-24 text-medical-green" />
        </div>
        <div className="absolute top-40 right-40 opacity-5">
          <Activity className="w-20 h-20 text-medical-purple" />
        </div>
        <div className="absolute bottom-40 left-40 opacity-5">
          <Shield className="w-20 h-20 text-medical-blue" />
        </div>
      </div>

      <div className="relative max-w-6xl container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center mb-8"
        >
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex justify-between w-full">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center mr-6"
            >
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.3 }}
                  className="bg-gradient-to-r from-medical-blue to-medical-green p-2 rounded-lg mr-3"
                >
                  <Stethoscope className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold">Join the Battle</h1>
                  <p className="text-muted-foreground">Create or join a medical diagnosis challenge</p>
                </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6"
                  >
                    {error}
                  </motion.div>
                )}

                {!isConnected && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6"
                  >
                    <div className="flex items-center">
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-2 h-2 bg-blue-500 rounded-full mr-3"
                      />
                      Connecting to game server...
                    </div>
                  </motion.div>
                )}

                {isConnected && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
                  >
                    <div className="flex items-center">
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" }}
                        className="w-2 h-2 bg-green-500 rounded-full mr-3"
                      />
                      Connected! Ready to play.
                    </div>
                  </motion.div>
                )}
            </motion.div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Create Room Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, type: "spring" }}
              whileHover={{ y: -5 }}
            >
              <Card className="bg-game-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.7 }}
                    whileHover={{ rotate: 360 }}
                    className="bg-medical-blue/10 p-4 rounded-full w-fit mx-auto mb-4"
                  >
                    <Plus className="h-8 w-8 text-medical-blue" />
                  </motion.div>
                  <CardTitle className="text-2xl">Create Room</CardTitle>
                  <p className="text-muted-foreground">
                    Host a new game and invite friends to join
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="create-name">Your Name</Label>
                    <Input
                      id="create-name"
                      placeholder="Enter your name"
                      value={createPlayerName}
                      onChange={(e) => setCreatePlayerName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom(e)}
                      className="text-lg py-3"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleCreateRoom}
                      disabled={!createPlayerName.trim() || isCreating || !isConnected}
                      className="w-full bg-gradient-to-r from-medical-blue to-medical-green hover:from-medical-blue/90 hover:to-medical-green/90 text-white py-6 text-lg font-semibold"
                    >
                      {isCreating ? (
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <Plus className="mr-2 h-5 w-5" />
                        </motion.div>
                      ) : (
                        <>
                          <Plus className="mr-2 h-5 w-5" />
                          Create Room
                        </>
                      )}
                    </Button>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="bg-muted/50 p-4 rounded-lg"
                  >
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Users className="h-4 w-4 mr-2" />
                      Room Details
                    </div>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Maximum 10 players</li>
                      <li>• Minimum 4 players to start</li>
                      <li>• You'll be the host</li>
                      <li>• Get a unique room code to share</li>
                    </ul>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Join Room Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, type: "spring" }}
              whileHover={{ y: -5 }}
            >
              <Card className="bg-game-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.7 }}
                    whileHover={{ rotate: 360 }}
                    className="bg-medical-green/10 p-4 rounded-full w-fit mx-auto mb-4"
                  >
                    <LogIn className="h-8 w-8 text-medical-green" />
                  </motion.div>
                  <CardTitle className="text-2xl">Join Room</CardTitle>
                  <p className="text-muted-foreground">
                    Enter a room code to join an existing game
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="join-name">Your Name</Label>
                    <Input
                      id="join-name"
                      placeholder="Enter your name"
                      value={joinPlayerName}
                      onChange={(e) => setJoinPlayerName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom(e)}
                      className="text-lg py-3"
                    />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="room-code">Room Code</Label>
                    <Input
                      id="room-code"
                      placeholder="Enter room code (e.g., ABCD123)"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom(e)}
                      className="text-lg py-3 font-mono tracking-wider"
                      maxLength={7}
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleJoinRoom}
                      disabled={!joinPlayerName.trim() || !roomCode.trim() || isJoining || !isConnected}
                      className="w-full bg-gradient-to-r from-medical-green to-medical-blue hover:from-medical-green/90 hover:to-medical-blue/90 text-white py-6 text-lg font-semibold"
                    >
                      {isJoining ? (
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <LogIn className="mr-2 h-5 w-5" />
                        </motion.div>
                      ) : (
                        <>
                          <LogIn className="mr-2 h-5 w-5" />
                          Join Room
                        </>
                      )}
                    </Button>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="bg-muted/50 p-4 rounded-lg"
                  >
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Users className="h-4 w-4 mr-2" />
                      Join Instructions
                    </div>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Get the room code from your host</li>
                      <li>• Room codes are 7 characters long</li>
                      <li>• Wait for the host to start the game</li>
                      <li>• Game starts with minimum 4 players</li>
                    </ul>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Game Rules Quick Reference */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, type: "spring" }}
          >
            <Card className="mt-8 bg-game-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-center">Quick Game Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div 
                      whileHover={{ rotate: 360 }}
                      className="bg-medical-blue text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2"
                    >
                      1
                    </motion.div>
                    <h4 className="font-semibold mb-1">Role Assignment</h4>
                    <p className="text-sm text-muted-foreground">
                      Get assigned a medical role and corresponding disease
                    </p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div 
                      whileHover={{ rotate: 360 }}
                      className="bg-medical-green text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2"
                    >
                      2
                    </motion.div>
                    <h4 className="font-semibold mb-1">Discussion & Voting</h4>
                    <p className="text-sm text-muted-foreground">
                      Discuss diagnoses and vote to eliminate players each round
                    </p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div 
                      whileHover={{ rotate: 360 }}
                      className="bg-medical-purple text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2"
                    >
                      3
                    </motion.div>
                    <h4 className="font-semibold mb-1">Final Challenge</h4>
                    <p className="text-sm text-muted-foreground">
                      Last 3 players compete with treatments and innovations
                    </p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}