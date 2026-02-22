import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, Users, BookOpen, Sparkles, Heart, Activity, Brain, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full opacity-10 blur-3xl"></div>
        
        {/* Medical Icons Pattern */}
        <div className="absolute top-20 left-20 opacity-5">
          <Stethoscope className="w-24 h-24 text-emerald-800" />
        </div>
        <div className="absolute bottom-20 right-20 opacity-5">
          <Heart className="w-24 h-24 text-red-800" />
        </div>
        <div className="absolute top-40 right-40 opacity-5">
          <Activity className="w-20 h-20 text-blue-800" />
        </div>
        <div className="absolute bottom-40 left-40 opacity-5">
          <Brain className="w-20 h-20 text-purple-800" />
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-block mb-6"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-3xl shadow-xl shadow-emerald-500/30">
              <Stethoscope className="w-16 h-16 text-white" />
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent"
          >
            Uncoverles
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto"
          >
            Multiplayer Medical Diagnosis Game
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 text-sm text-gray-500"
          >
            <Badge variant="outline" className="bg-white/50 border-emerald-200 text-emerald-700">
              <Users className="w-3 h-3 mr-1" />
              4-15 Pemain
            </Badge>
            <Badge variant="outline" className="bg-white/50 border-blue-200 text-blue-700">
              <Heart className="w-3 h-3 mr-1" />
              Medis Theme
            </Badge>
            <Badge variant="outline" className="bg-white/50 border-purple-200 text-purple-700">
              <Brain className="w-3 h-3 mr-1" />
              Deduksi
            </Badge>
          </motion.div>
        </motion.div>

        {/* Game Modes */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {/* Offline Mode */}
          <motion.div
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link to="/offline/setup" className="block h-full">
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                <CardContent className="p-6 text-center">
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                  >
                    <Users className="w-10 h-10 text-emerald-600" />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Mode Offline</h2>
                  <p className="text-gray-500 mb-4">
                    Mainkan bersama teman-temanmu dalam satu perangkat
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>Pass & Play</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>4-15 pemain</span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0">
                    Main Offline
                  </Button>

                  <div className="mt-4 text-xs text-gray-400">
                    ⚡ Tidak perlu koneksi internet
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Online Mode */}
          <motion.div
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link to="/play" className="block h-full">
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative">
                <div className="h-2 bg-gradient-to-r from-blue-400 to-cyan-500"></div>
                <CardContent className="p-6 text-center">
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      New
                    </Badge>
                  </div>

                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                  >
                    <Activity className="w-10 h-10 text-blue-600" />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Mode Online</h2>
                  <p className="text-gray-500 mb-4">
                    Bermain dengan pemain dari seluruh dunia
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span>Multiplayer Online</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-cyan-500" />
                      <span>4-10 pemain per room</span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0">
                    Main Online
                  </Button>

                  <div className="mt-4 text-xs text-gray-400">
                    🌐 Butuh koneksi internet
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Guidebook */}
          <motion.div
            whileHover={{ y: -10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link to="/guidebook" className="block h-full">
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="h-2 bg-gradient-to-r from-purple-400 to-pink-500"></div>
                <CardContent className="p-6 text-center">
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                  >
                    <BookOpen className="w-10 h-10 text-purple-600" />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Guidebook</h2>
                  <p className="text-gray-500 mb-4">
                    Pelajari aturan dan strategi permainan
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Heart className="w-4 h-4 text-purple-500" />
                      <span>Aturan Lengkap</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Brain className="w-4 h-4 text-pink-500" />
                      <span>Tips & Strategi</span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
                    Baca Guidebook
                  </Button>

                  <div className="mt-4 text-xs text-gray-400">
                    📚 Panduan lengkap permainan
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { icon: Heart, text: 'Medis Theme', color: 'text-red-500', bg: 'bg-red-50' },
            { icon: Users, text: 'Social Deduksi', color: 'text-blue-500', bg: 'bg-blue-50' },
            { icon: Brain, text: 'Strategi', color: 'text-purple-500', bg: 'bg-purple-50' },
            { icon: Sparkles, text: 'Seru & Menegangkan', color: 'text-amber-500', bg: 'bg-amber-50' }
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className={`${feature.bg} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <p className="text-xs text-gray-600">{feature.text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-gray-400"
        >
          <p>© 2026 Uncoverles - Medical Diagnosis Game</p>
          <p className="mt-1">Diagnosa, Diskusi, Eliminasi, Menangkan!</p>
        </motion.div>
      </div>
    </div>
  );
}