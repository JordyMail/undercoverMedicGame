import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft,
  Users,
  Plus,
  Minus,
  Settings,
  Play,
  Trash2,
  ChevronRight,
  Stethoscope,
  UserPlus,
  Sparkles,
  AlertCircle,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';

// Types
interface Player {
  id: string;
  name: string;
  avatar_id: number;
}

// Mock avatars
const AVATARS = [
  { id: 1, icon: '👨‍⚕️', name: 'Dokter Pria' },
  { id: 2, icon: '👩‍⚕️', name: 'Dokter Wanita' },
  { id: 3, icon: '🩺', name: 'Perawat' },
  { id: 4, icon: '💊', name: 'Apoteker' },
  { id: 5, icon: '🔬', name: 'Peneliti' },
  { id: 6, icon: '🏥', name: 'Rumah Sakit' },
  { id: 7, icon: '🚑', name: 'Paramedis' },
  { id: 8, icon: '🧬', name: 'Ahli Genetika' },
  { id: 9, icon: '🧪', name: 'Laboran' },
  { id: 10, icon: '📊', name: 'Epidemiolog' }
];

// Categories
const CATEGORIES = [
  'Penyakit Jantung',
  'Penyakit Paru-paru',
  'Penyakit Kulit',
  'Penyakit Saraf',
  'Penyakit Dalam',
  'Penyakit Anak'
];

// Utility functions
const generateRoomCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const calculateRoles = (totalPlayers: number) => {
  // Aturan distribusi:
  // - Undercover: ~30% dari total pemain (minimal 1)
  // - Mr. White: ~10% dari total pemain (maksimal 1 untuk permainan kecil)
  // - Sisanya: Civilian
  
  let undercover = Math.max(1, Math.floor(totalPlayers * 0.3));
  let mrwhite = totalPlayers >= 6 ? Math.floor(totalPlayers * 0.1) : 0;
  
  // Pastikan total roles tidak melebihi jumlah pemain
  if (undercover + mrwhite >= totalPlayers) {
    undercover = Math.max(1, Math.floor(totalPlayers * 0.25));
    mrwhite = totalPlayers >= 8 ? 1 : 0;
  }
  
  const civilian = totalPlayers - undercover - mrwhite;
  
  return { civilian, undercover, mrwhite };
};

export default function OfflineSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: players, 2: category, 3: settings
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerAvatar, setNewPlayerAvatar] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [settings] = useState({
    civilian_percentage: 60,
    undercover_percentage: 30,
    mrwhite_percentage: 10,
  });

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 15) {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        avatar_id: newPlayerAvatar,
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
      setNewPlayerAvatar((prev) => (prev % 10) + 1);
    }
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const updatePlayerAvatar = (playerId: string, avatarId: number) => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, avatar_id: avatarId } : p
    ));
  };

  const startGame = () => {
    const gameData = {
      players,
      category: selectedCategory,
      settings,
      roomCode: generateRoomCode(),
    };
    
    // Store in sessionStorage for the game page
    sessionStorage.setItem('offlineGameData', JSON.stringify(gameData));
    navigate('/offline/game');
  };

  const canProceed = () => {
    if (step === 1) return players.length >= 4;
    if (step === 2) return selectedCategory !== null;
    return true;
  };

  const roleDistribution = calculateRoles(players.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="hover:bg-emerald-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mode Offline</h1>
            <p className="text-gray-500 text-sm">Siapkan permainan untuk bermain bersama</p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          {[
            { num: 1, label: 'Pemain', icon: Users },
            { num: 2, label: 'Kategori', icon: Stethoscope },
            { num: 3, label: 'Siap Main', icon: Play },
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <button
                onClick={() => s.num < step && setStep(s.num)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl transition-all',
                  step === s.num
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : step > s.num
                      ? 'bg-emerald-100 text-emerald-700 cursor-pointer hover:bg-emerald-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
                disabled={s.num > step}
              >
                <s.icon className="w-4 h-4" />
                <span className="font-medium text-sm hidden sm:block">{s.label}</span>
                <span className="font-bold">{s.num}</span>
              </button>
              {i < 2 && (
                <ChevronRight className={cn(
                  'w-5 h-5',
                  step > s.num ? 'text-emerald-500' : 'text-gray-300'
                )} />
              )}
            </React.Fragment>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Add Players */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Card className="border-0 shadow-lg mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-emerald-500" />
                    Tambah Pemain ({players.length}/15)
                  </h2>
                  
                  {/* Add player form */}
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Input
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
                        placeholder="Nama pemain..."
                        className="flex-1"
                        maxLength={20}
                      />
                      <Button
                        onClick={addPlayer}
                        disabled={!newPlayerName.trim() || players.length >= 15}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah
                      </Button>
                    </div>

                    {/* Avatar selector */}
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Pilih avatar:</p>
                      <div className="flex flex-wrap gap-2">
                        {AVATARS.map((avatar) => (
                          <button
                            key={avatar.id}
                            onClick={() => setNewPlayerAvatar(avatar.id)}
                            className={cn(
                              'w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all',
                              newPlayerAvatar === avatar.id
                                ? 'bg-emerald-100 border-2 border-emerald-500 scale-110'
                                : 'bg-gray-100 border-2 border-transparent hover:border-emerald-300'
                            )}
                          >
                            {avatar.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Players list */}
              <Card className="border-0 shadow-lg mb-6">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-500" />
                      Daftar Pemain
                    </span>
                    {players.length >= 4 && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-0">
                        ✓ Minimal tercapai
                      </Badge>
                    )}
                  </h3>

                  {players.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>Belum ada pemain. Tambahkan minimal 4 pemain.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {players.map((player, index) => {
                        const avatar = AVATARS.find(a => a.id === player.avatar_id) || AVATARS[0];
                        return (
                          <motion.div
                            key={player.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative bg-white border-2 border-gray-200 rounded-xl p-3 group hover:border-emerald-300 transition-colors"
                          >
                            <div className="text-center">
                              <div className="text-3xl mb-1">{avatar.icon}</div>
                              <p className="font-medium text-gray-800 text-sm truncate">{player.name}</p>
                              <p className="text-xs text-gray-400">#{index + 1}</p>
                              
                              {/* Avatar selector dropdown */}
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <select
                                  value={player.avatar_id}
                                  onChange={(e) => updatePlayerAvatar(player.id, parseInt(e.target.value))}
                                  className="text-xs bg-white border border-gray-200 rounded p-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {AVATARS.map(a => (
                                    <option key={a.id} value={a.id}>{a.icon}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <button
                              onClick={() => removePlayer(player.id)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* Role preview */}
                  {players.length >= 4 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-gray-100"
                    >
                      <p className="text-sm text-gray-500 mb-2">Distribusi Peran:</p>
                      <div className="flex gap-3 flex-wrap">
                        <Badge className="bg-blue-100 text-blue-700 border-0">
                          🏥 Civilian: {roleDistribution.civilian}
                        </Badge>
                        <Badge className="bg-red-100 text-red-700 border-0">
                          🕵️ Undercover: {roleDistribution.undercover}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-700 border-0">
                          👻 Mr. White: {roleDistribution.mrwhite}
                        </Badge>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {players.length < 4 && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-3 rounded-xl mb-6">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">Tambahkan {4 - players.length} pemain lagi untuk melanjutkan</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Select Category */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Card className="border-0 shadow-lg mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-emerald-500" />
                    Pilih Kategori Penyakit
                  </h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Pilih spesialisasi medis untuk kata-kata dalam permainan ini
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* Random option */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedCategory('random')}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all relative',
                        selectedCategory === 'random'
                          ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        <span className="font-bold text-gray-800">Acak</span>
                      </div>
                      <p className="text-xs text-gray-500">Sistem pilihkan secara acak</p>
                      {selectedCategory === 'random' && (
                        <Check className="absolute top-2 right-2 w-4 h-4 text-emerald-500" />
                      )}
                    </motion.button>

                    {CATEGORIES.map((category) => (
                      <motion.button
                        key={category}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCategory(category)}
                        className={cn(
                          'p-4 rounded-xl border-2 text-left transition-all relative',
                          selectedCategory === category
                            ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        )}
                      >
                        <span className="font-medium text-gray-800 text-sm">{category}</span>
                        {selectedCategory === category && (
                          <Check className="absolute top-2 right-2 w-4 h-4 text-emerald-500" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Summary & Start */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Card className="border-0 shadow-lg mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-emerald-500" />
                    Ringkasan Permainan
                  </h2>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h3 className="font-medium text-gray-700 mb-3">Informasi Permainan</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Jumlah Pemain</p>
                        <p className="font-bold text-gray-800 text-lg">{players.length} orang</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Kategori</p>
                        <p className="font-bold text-gray-800 text-lg">
                          {selectedCategory === 'random' ? '🎲 Acak' : selectedCategory}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Role distribution */}
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-700 mb-3">Distribusi Peran Final</h3>
                    <div className="flex gap-4">
                      <div className="flex-1 bg-blue-50 rounded-xl p-4 text-center">
                        <div className="text-3xl mb-1">🏥</div>
                        <p className="text-2xl font-bold text-blue-700">{roleDistribution.civilian}</p>
                        <p className="text-xs text-blue-600">Civilian</p>
                      </div>
                      <div className="flex-1 bg-red-50 rounded-xl p-4 text-center">
                        <div className="text-3xl mb-1">🕵️</div>
                        <p className="text-2xl font-bold text-red-700">{roleDistribution.undercover}</p>
                        <p className="text-xs text-red-600">Undercover</p>
                      </div>
                      <div className="flex-1 bg-purple-50 rounded-xl p-4 text-center">
                        <div className="text-3xl mb-1">👻</div>
                        <p className="text-2xl font-bold text-purple-700">{roleDistribution.mrwhite}</p>
                        <p className="text-xs text-purple-600">Mr. White</p>
                      </div>
                    </div>
                  </div>

                  {/* Players preview */}
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3">Daftar Pemain</h3>
                    <div className="flex flex-wrap gap-2">
                      {players.map((player) => {
                        const avatar = AVATARS.find(a => a.id === player.avatar_id) || AVATARS[0];
                        return (
                          <Badge
                            key={player.id}
                            variant="outline"
                            className="px-3 py-1 bg-white border-gray-200"
                          >
                            <span className="mr-1">{avatar.icon}</span>
                            <span className="text-sm font-medium text-gray-700">{player.name}</span>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Start Game Button */}
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={startGame}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-6 text-lg font-semibold"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Mulai Permainan! 🎮
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className={cn(
                'bg-emerald-500 hover:bg-emerald-600 text-white',
                !canProceed() && 'opacity-50 cursor-not-allowed'
              )}
            >
              Lanjut
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}