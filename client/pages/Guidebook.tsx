import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  ArrowLeft, 
  BookOpen, 
  Stethoscope, 
  Users, 
  Target, 
  Trophy, 
  Clock, 
  AlertCircle,
  Sparkles,
  Heart,
  Brain,
  Shield,
  Medal,
  Award,
  Star
} from 'lucide-react';

export default function GuidebookPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/10 via-background to-medical-green/10 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-medical-blue/20 rounded-full opacity-20 blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-medical-green/20 rounded-full opacity-20 blur-3xl"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-medical-purple/10 rounded-full opacity-10 blur-3xl"
        />
        
        {/* Floating Medical Icons */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute top-20 left-20"
        >
          <Stethoscope className="w-24 h-24 text-medical-blue" />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute bottom-20 right-20"
        >
          <BookOpen className="w-24 h-24 text-medical-green" />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 0.1, x: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute top-40 right-40"
        >
          <Target className="w-20 h-20 text-medical-purple" />
        </motion.div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center"
          >
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.3 }}
              className="bg-gradient-to-r from-medical-blue to-medical-green p-2 rounded-lg mr-3"
            >
              <BookOpen className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold">Uncoverles Guidebook</h1>
              <p className="text-muted-foreground">Master the art of medical diagnosis in multiplayer battles</p>
            </div>
          </motion.div>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Game Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-game-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <Stethoscope className="h-6 w-6 mr-2 text-medical-blue" />
                  </motion.div>
                  Game Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-muted-foreground"
                >
                  Uncoverles is a competitive multiplayer medical diagnosis game where players take on different medical roles, 
                  diagnose diseases, and compete to be the last one standing. The game combines medical knowledge, 
                  strategy, and social deduction in an exciting real-time format.
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Player Roles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-game-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, delay: 0.2 }}
                  >
                    <Users className="h-6 w-6 mr-2 text-medical-green" />
                  </motion.div>
                  Player Roles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      role: 'Main Diagnose',
                      color: 'blue',
                      percentage: '60%',
                      description: 'Receives the primary disease to diagnose. Your goal is to provide accurate diagnosis while identifying other roles.',
                      icon: '🏥'
                    },
                    {
                      role: 'Differential Diagnose',
                      color: 'green',
                      percentage: '30%',
                      description: 'Receives a similar but different disease. Must blend in while providing plausible alternative diagnoses.',
                      icon: '🔄'
                    },
                    {
                      role: 'Doctor Grey',
                      color: 'purple',
                      percentage: '10%',
                      description: 'Receives no disease information. Must deduce from others\' discussions and survive using medical knowledge.',
                      icon: '👨‍⚕️'
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={item.role}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className={`bg-medical-${item.color}/10 p-4 rounded-lg relative overflow-hidden group`}
                    >
                      <motion.div 
                        className="absolute top-2 right-2 text-2xl opacity-30 group-hover:scale-150 transition-transform"
                        animate={{ rotate: [0, 360] }}
                        transition={{ repeat: Infinity, duration: 5 }}
                      >
                        {item.icon}
                      </motion.div>
                      <h4 className={`font-semibold text-medical-${item.color} mb-2`}>{item.role}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{item.percentage}</p>
                      <p className="text-sm">{item.description}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Game Phases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: "spring" }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-game-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4 }}
                  >
                    <Clock className="h-6 w-6 mr-2 text-medical-orange" />
                  </motion.div>
                  Game Phases
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    { step: 1, title: 'Lobby Phase', description: 'Players join the room and wait for the host to start the game. Minimum 4 players required.', color: 'blue' },
                    { step: 2, title: 'Role Assignment', description: 'Players click cards to reveal their secret roles and diseases. Keep your role hidden from others!', color: 'green' },
                    { step: 3, title: 'Discussion Rounds', description: 'Players share their diagnoses in chat, then vote to eliminate one player each round. Continue until 3 players remain.', color: 'purple' },
                    { step: 4, title: 'Final Round', description: 'Last 3 players submit treatment plans and medical innovations. Eliminated players vote for the winner.', color: 'orange' }
                  ].map((phase, index) => (
                    <motion.div
                      key={phase.step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 10 }}
                      className="flex items-start space-x-4"
                    >
                      <motion.div 
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className={`bg-medical-${phase.color} text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1`}
                      >
                        {phase.step}
                      </motion.div>
                      <div>
                        <h4 className="font-semibold mb-1">{phase.title}</h4>
                        <p className="text-sm text-muted-foreground">{phase.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Scoring System */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, type: "spring" }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-game-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Trophy className="h-6 w-6 mr-2 text-medical-purple" />
                  </motion.div>
                  Scoring & Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <h4 className="font-semibold mb-3">Point System</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {[
                        'Survival points for each round survived',
                        'Accuracy points for correct diagnoses',
                        'Elimination points for successful votes',
                        'Final round completion bonus',
                        'Victory bonus for winning'
                      ].map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                          whileHover={{ scale: 1.05, color: '#3b82f6' }}
                          className="flex items-center"
                        >
                          <Sparkles className="h-3 w-3 mr-2 text-medical-blue" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <h4 className="font-semibold mb-3">Special Rewards</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {[
                        { icon: '🎖️', title: 'Mastermind', desc: 'Highest overall score' },
                        { icon: '🧠', title: 'Diagnosis Division', desc: 'Most accurate diagnoses' },
                        { icon: '🥇', title: 'Survivor', desc: 'Reached final round' },
                        { icon: '🎯', title: 'Doctor Grey Champion', desc: 'Won as Doctor Grey' }
                      ].map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.9 + index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          className="flex items-start"
                        >
                          <motion.span
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
                            className="mr-2"
                          >
                            {item.icon}
                          </motion.span>
                          <div>
                            <strong>{item.title}</strong> - {item.desc}
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tips & Strategy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, type: "spring" }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-game-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    <Target className="h-6 w-6 mr-2 text-medical-red" />
                  </motion.div>
                  Tips & Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      title: 'For Main Diagnose',
                      tips: [
                        'Provide accurate but not overly detailed diagnoses',
                        'Watch for players giving similar answers',
                        'Form alliances with other Main Diagnose players',
                        'Be suspicious of vague or incorrect answers'
                      ],
                      icon: '🏥',
                      color: 'blue'
                    },
                    {
                      title: 'For Differential Diagnose',
                      tips: [
                        'Give plausible alternative diagnoses',
                        'Blend in with Main Diagnose players',
                        "Don't be too obvious about your different disease",
                        'Use medical knowledge to seem credible'
                      ],
                      icon: '🔄',
                      color: 'green'
                    },
                    {
                      title: 'For Doctor Grey',
                      tips: [
                        'Listen carefully to others\' diagnoses',
                        'Provide general medical knowledge',
                        'Avoid giving specific diagnoses early',
                        'Higher rewards if you reach the final!'
                      ],
                      icon: '👨‍⚕️',
                      color: 'purple'
                    },
                    {
                      title: 'General Tips',
                      tips: [
                        'Pay attention to voting patterns',
                        'Form temporary alliances',
                        "Don't reveal your role too early",
                        "Keep track of eliminated players' roles"
                      ],
                      icon: '💡',
                      color: 'orange'
                    }
                  ].map((section, index) => (
                    <motion.div
                      key={section.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className={`bg-medical-${section.color}/5 p-4 rounded-lg border border-medical-${section.color}/20`}
                    >
                      <motion.h4 
                        className={`font-semibold text-medical-${section.color} mb-3 flex items-center`}
                      >
                        <motion.span
                          animate={{ rotate: [0, 360] }}
                          transition={{ repeat: Infinity, duration: 3 }}
                          className="mr-2"
                        >
                          {section.icon}
                        </motion.span>
                        {section.title}
                      </motion.h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {section.tips.map((tip, tipIndex) => (
                          <motion.li
                            key={tipIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.0 + index * 0.1 + tipIndex * 0.05 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                          >
                            • {tip}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Important Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, type: "spring" }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-medical-red/5 border border-medical-red/20 hover:border-medical-red/40 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-medical-red">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <AlertCircle className="h-6 w-6 mr-2" />
                  </motion.div>
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {[
                    'Keep your role and disease information secret from other players',
                    'The game requires medical knowledge - study up on diseases and treatments!',
                    'Eliminated players can still participate in the final voting round',
                    'Doctor Grey players receive higher rewards for winning due to the challenge',
                    'Real-time communication is key - stay active in discussions'
                  ].map((note, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 10 }}
                      className="flex items-start"
                    >
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
                        className="mr-2 text-medical-red"
                      >
                        •
                      </motion.span>
                      {note}
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ready to Play */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, type: "spring" }}
            className="text-center py-8"
          >
            <Link to="/play">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-medical-blue to-medical-green hover:from-medical-blue/90 hover:to-medical-green/90 text-white px-8 py-4 text-lg font-semibold"
                >
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="mr-2"
                  >
                    🎮
                  </motion.span>
                  Ready to Play!
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            <p>Good luck, and may your diagnoses be accurate! 🏥</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}