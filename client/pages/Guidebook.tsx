import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, BookOpen, Stethoscope, Users, Target, Trophy, Clock, AlertCircle } from 'lucide-react';

export default function GuidebookPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/10 via-background to-medical-green/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-medical-blue to-medical-green p-2 rounded-lg mr-3">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Uncoverles Guidebook</h1>
              <p className="text-muted-foreground">Master the art of medical diagnosis in multiplayer battles</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Game Overview */}
          <Card className="bg-game-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="h-6 w-6 mr-2 text-medical-blue" />
                Game Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Uncoverles is a competitive multiplayer medical diagnosis game where players take on different medical roles, 
                diagnose diseases, and compete to be the last one standing. The game combines medical knowledge, 
                strategy, and social deduction in an exciting real-time format.
              </p>
            </CardContent>
          </Card>

          {/* Player Roles */}
          <Card className="bg-game-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 mr-2 text-medical-green" />
                Player Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-medical-blue/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-medical-blue mb-2">Main Diagnose</h4>
                  <p className="text-sm text-muted-foreground mb-2">60% of players</p>
                  <p className="text-sm">Receives the primary disease to diagnose. Your goal is to provide accurate diagnosis while identifying other roles.</p>
                </div>
                
                <div className="bg-medical-green/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-medical-green mb-2">Differential Diagnose</h4>
                  <p className="text-sm text-muted-foreground mb-2">30% of players</p>
                  <p className="text-sm">Receives a similar but different disease. Must blend in while providing plausible alternative diagnoses.</p>
                </div>
                
                <div className="bg-medical-purple/10 p-4 rounded-lg">
                  <h4 className="font-semibold text-medical-purple mb-2">Doctor Grey</h4>
                  <p className="text-sm text-muted-foreground mb-2">10% of players</p>
                  <p className="text-sm">Receives no disease information. Must deduce from others' discussions and survive using medical knowledge.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Phases */}
          <Card className="bg-game-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-6 w-6 mr-2 text-medical-orange" />
                Game Phases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-medical-blue text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Lobby Phase</h4>
                    <p className="text-sm text-muted-foreground">Players join the room and wait for the host to start the game. Minimum 4 players required.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-medical-green text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Role Assignment</h4>
                    <p className="text-sm text-muted-foreground">Players click cards to reveal their secret roles and diseases. Keep your role hidden from others!</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-medical-purple text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Discussion Rounds</h4>
                    <p className="text-sm text-muted-foreground">Players share their diagnoses in chat, then vote to eliminate one player each round. Continue until 3 players remain.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-medical-orange text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Final Round</h4>
                    <p className="text-sm text-muted-foreground">Last 3 players submit treatment plans and medical innovations. Eliminated players vote for the winner.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scoring System */}
          <Card className="bg-game-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-6 w-6 mr-2 text-medical-purple" />
                Scoring & Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Point System</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Survival points for each round survived</li>
                    <li>• Accuracy points for correct diagnoses</li>
                    <li>• Elimination points for successful votes</li>
                    <li>• Final round completion bonus</li>
                    <li>• Victory bonus for winning</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Special Rewards</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>🎖️ <strong>Mastermind</strong> - Highest overall score</li>
                    <li>🧠 <strong>Diagnosis Division</strong> - Most accurate diagnoses</li>
                    <li>🥇 <strong>Survivor</strong> - Reached final round</li>
                    <li>🎯 <strong>Doctor Grey Champion</strong> - Won as Doctor Grey</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips & Strategy */}
          <Card className="bg-game-card border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-6 w-6 mr-2 text-medical-red" />
                Tips & Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">For Main Diagnose</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Provide accurate but not overly detailed diagnoses</li>
                    <li>• Watch for players giving similar answers</li>
                    <li>• Form alliances with other Main Diagnose players</li>
                    <li>• Be suspicious of vague or incorrect answers</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">For Differential Diagnose</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Give plausible alternative diagnoses</li>
                    <li>• Blend in with Main Diagnose players</li>
                    <li>• Don't be too obvious about your different disease</li>
                    <li>• Use medical knowledge to seem credible</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">For Doctor Grey</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Listen carefully to others' diagnoses</li>
                    <li>• Provide general medical knowledge</li>
                    <li>• Avoid giving specific diagnoses early</li>
                    <li>• Higher rewards if you reach the final!</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">General Tips</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Pay attention to voting patterns</li>
                    <li>• Form temporary alliances</li>
                    <li>• Don't reveal your role too early</li>
                    <li>• Keep track of eliminated players' roles</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="bg-medical-red/5 border border-medical-red/20">
            <CardHeader>
              <CardTitle className="flex items-center text-medical-red">
                <AlertCircle className="h-6 w-6 mr-2" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="space-y-2 text-sm">
                <li>• Keep your role and disease information secret from other players</li>
                <li>• The game requires medical knowledge - study up on diseases and treatments!</li>
                <li>• Eliminated players can still participate in the final voting round</li>
                <li>• Doctor Grey players receive higher rewards for winning due to the challenge</li>
                <li>• Real-time communication is key - stay active in discussions</li>
              </ul>
            </CardContent>
          </Card>

          {/* Ready to Play */}
          <div className="text-center py-8">
            <Link to="/play">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-medical-blue to-medical-green hover:from-medical-blue/90 hover:to-medical-green/90 text-white px-8 py-4 text-lg font-semibold"
              >
                Ready to Play!
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
