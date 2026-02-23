import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // ✅ FIX: Tambah useLocation
import { playerStats } from '../lib/playerStats'; // ✅ Import playerStats
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
  Check,
  Loader2,
  Sliders,
  RotateCcw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MEDICAL_THEMES, MedicalTheme } from '../../shared/medicalData';

// Types
interface Player {
  id: string;
  name: string;
  avatar_id: number;
}

interface RoleDistribution {
  civilian: number;
  undercover: number;
  mrwhite: number;
}

interface CustomRoleConfig {
  enabled: boolean;
  distribution: RoleDistribution;
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
  { id: 10, icon: '📊', name: 'Epidemiolog' },
  { id: 11, icon: '🦠', name: 'Virus' },
  { id: 12, icon: '⚕️', name: 'Simbol Kesehatan' },
  { id: 13, icon: '🌡️', name: 'Termometer' },
  { id: 14, icon: '🩹', name: 'Plester' },
  { id: 15, icon: '🧠', name: 'Otak' },
  { id: 16, icon: '🫀', name: 'Jantung' },
  { id: 17, icon: '🫁', name: 'Paru-paru' },
  { id: 18, icon: '🦴', name: 'Tulang' },
  { id: 19, icon: '🩸', name: 'Darah' },
  { id: 20, icon: '💉', name: 'Suntikan' },
  { id: 21, icon: '🤒', name: 'Pasien Sakit' },
  { id: 22, icon: '🤕', name: 'Pasien Terluka' },
  { id: 23, icon: '😷', name: 'Pasien dengan Masker' },
  { id: 24, icon: '🤢', name: 'Pasien Mual' },
  { id: 25, icon: '🤧', name: 'Pasien Bersin' },
  { id: 26, icon: '🧼', name: 'Sabun' },
  { id: 27, icon: '🦷', name: 'Gigi' }
];

// Preset role configurations for 5 players
const PRESET_ROLES_FOR_5 = [
  { civilian: 3, undercover: 1, mrwhite: 1, label: '3 Civilian, 1 Undercover, 1 Mr. White' },
  { civilian: 3, undercover: 2, mrwhite: 0, label: '3 Civilian, 2 Undercover' }
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

const calculateRoles = (totalPlayers: number): RoleDistribution => {
  // Aturan distribusi otomatis:
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

const validateCustomRoles = (
  totalPlayers: number,
  distribution: RoleDistribution
): { valid: boolean; message?: string } => {
  const { civilian, undercover, mrwhite } = distribution;
  const total = civilian + undercover + mrwhite;

  // Cek total pemain
  if (total !== totalPlayers) {
    return { 
      valid: false, 
      message: `Total peran (${total}) harus sama dengan jumlah pemain (${totalPlayers})` 
    };
  }

  // Cek civilian harus terbanyak
  if (civilian < undercover + mrwhite) {
    return { 
      valid: false, 
      message: 'Jumlah Civilian harus lebih banyak dari gabungan Undercover dan Mr. White' 
    };
  }

  // Cek undercover harus minoritas
  if (undercover >= civilian) {
    return { 
      valid: false, 
      message: 'Jumlah Undercover harus lebih sedikit dari Civilian' 
    };
  }

  // Cek Mr. White tidak lebih banyak dari Undercover
  if (mrwhite > undercover) {
    return { 
      valid: false, 
      message: 'Jumlah Mr. White tidak boleh lebih banyak dari Undercover' 
    };
  }

  // Untuk 6-15 pemain, Mr. White bisa lebih dari 1 tapi tetap tidak lebih dari Undercover
  if (totalPlayers >= 6 && totalPlayers <= 15) {
    if (mrwhite < 0 || mrwhite > undercover) {
      return { 
        valid: false, 
        message: 'Jumlah Mr. White harus antara 0 sampai jumlah Undercover' 
      };
    }
  }

  return { valid: true };
};

export default function OfflineSetup() {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Tambahkan useLocation
  const [step, setStep] = useState(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerAvatar, setNewPlayerAvatar] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [customRoleConfig, setCustomRoleConfig] = useState<CustomRoleConfig>({
    enabled: false,
    distribution: { civilian: 0, undercover: 0, mrwhite: 0 }
  });
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [settings] = useState({
    civilian_percentage: 60,
    undercover_percentage: 30,
    mrwhite_percentage: 10,
  });

  // ✅ Effect untuk load data dari "Main Lagi"
  useEffect(() => {
    // Cek apakah ini mode "Main Lagi"
    const playAgainPlayers = sessionStorage.getItem('playAgainPlayers');
    
    if (playAgainPlayers) {
      try {
        const existingPlayers = JSON.parse(playAgainPlayers);
        // Set players dari game sebelumnya
        setPlayers(existingPlayers.map((p: any) => ({
          id: p.id,
          name: p.name,
          avatar_id: p.avatar_id
        })));
        
        // Bersihkan sessionStorage
        sessionStorage.removeItem('playAgainPlayers');
        
        console.log('Memuat pemain dari game sebelumnya');
      } catch (error) {
        console.error('Failed to load play again players:', error);
      }
    } else if (location.state?.playAgain && location.state?.existingPlayers) {
      // Alternative: menggunakan location state
      setPlayers(location.state.existingPlayers.map((p: any) => ({
        id: p.id,
        name: p.name,
        avatar_id: p.avatar_id
      })));
    }
  }, [location.state]);

  // Check if custom roles are available (more than 4 players)
  const canCustomizeRoles = players.length > 4;

  // Update custom distribution when players change or when toggling custom mode
  useEffect(() => {
    if (canCustomizeRoles && customRoleConfig.enabled) {
      // Reset to default calculated roles when enabling custom mode
      const defaultRoles = calculateRoles(players.length);
      setCustomRoleConfig(prev => ({
        ...prev,
        distribution: defaultRoles
      }));
      setValidationError(null);
    }
  }, [players.length, customRoleConfig.enabled, canCustomizeRoles]);

  // Reset custom config when players change significantly
  useEffect(() => {
    if (customRoleConfig.enabled) {
      const defaultRoles = calculateRoles(players.length);
      setCustomRoleConfig(prev => ({
        ...prev,
        distribution: defaultRoles
      }));
    }
  }, [players.length]);

  // ✅ Modifikasi fungsi addPlayer untuk mencegah duplikasi nama
  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 15) {
      // Cek apakah nama sudah ada
      const nameExists = players.some(p => 
        p.name.toLowerCase() === newPlayerName.trim().toLowerCase()
      );
      
      if (nameExists) {
        alert('Nama pemain sudah ada! Gunakan nama yang berbeda.');
        return;
      }
      
      const newPlayer: Player = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        avatar_id: newPlayerAvatar,
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
      setNewPlayerAvatar((prev) => (prev % 27) + 1);
    }
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  // ✅ Modifikasi updatePlayerAvatar untuk juga update di stats
  const updatePlayerAvatar = (playerId: string, avatarId: number) => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, avatar_id: avatarId } : p
    ));
    
    // Update juga di stats
    playerStats.updatePlayerAvatar(playerId, avatarId);
  };

  const toggleCustomRoles = () => {
    if (!canCustomizeRoles) return;
    
    setCustomRoleConfig(prev => ({
      enabled: !prev.enabled,
      distribution: !prev.enabled ? calculateRoles(players.length) : prev.distribution
    }));
    setValidationError(null);
    setSelectedPreset(null);
  };

  const applyPreset = (presetIndex: number) => {
    const preset = PRESET_ROLES_FOR_5[presetIndex];
    setCustomRoleConfig({
      enabled: true,
      distribution: preset
    });
    setSelectedPreset(presetIndex);
    setValidationError(null);
  };

  const updateRoleCount = (role: keyof RoleDistribution, increment: boolean) => {
    setCustomRoleConfig(prev => {
      const newDistribution = { ...prev.distribution };
      const change = increment ? 1 : -1;
      
      // Update the specific role
      newDistribution[role] = Math.max(0, newDistribution[role] + change);
      
      // Validate the new distribution
      const validation = validateCustomRoles(players.length, newDistribution);
      setValidationError(validation.valid ? null : validation.message || null);
      
      return {
        ...prev,
        distribution: newDistribution
      };
    });
    setSelectedPreset(null);
  };

  const resetToAutoRoles = () => {
    const autoRoles = calculateRoles(players.length);
    setCustomRoleConfig({
      enabled: true,
      distribution: autoRoles
    });
    setSelectedPreset(null);
    setValidationError(null);
  };

  const startGame = () => {
    // Get final role distribution
    let finalDistribution: RoleDistribution;
    
    if (customRoleConfig.enabled) {
      // Validate custom roles before starting
      const validation = validateCustomRoles(players.length, customRoleConfig.distribution);
      if (!validation.valid) {
        setValidationError(validation.message || 'Invalid role distribution');
        return;
      }
      finalDistribution = customRoleConfig.distribution;
    } else {
      finalDistribution = calculateRoles(players.length);
    }

    const gameData = {
      players,
      themeId: selectedTheme,
      settings,
      roomCode: generateRoomCode(),
      roleDistribution: finalDistribution // Simpan distribusi peran yang akan digunakan
    };
    
    // Store in sessionStorage for the game page
    sessionStorage.setItem('offlineGameData', JSON.stringify(gameData));
    navigate('/offline/game');
  };

  const canProceed = () => {
    if (step === 1) return players.length >= 4;
    if (step === 2) return selectedTheme !== null;
    return true;
  };

  // Get role distribution based on current configuration
  const getCurrentRoleDistribution = (): RoleDistribution => {
    if (customRoleConfig.enabled) {
      return customRoleConfig.distribution;
    }
    return calculateRoles(players.length);
  };

  const roleDistribution = getCurrentRoleDistribution();

  // Get theme name for display
  const getSelectedThemeName = () => {
    if (!selectedTheme) return '';
    if (selectedTheme === 'random') return 'Acak';
    const theme = MEDICAL_THEMES.find(t => t.id === selectedTheme);
    return theme ? theme.name : selectedTheme;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
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
            { num: 2, label: 'Tema Medis', icon: Stethoscope },
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
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Kiri: Tambah Pemain */}
              <Card className="border-0 shadow-lg h-fit">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-emerald-500" />
                    Tambah Pemain
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

                    <div className="pt-2">
                      <p className="text-sm text-gray-500">
                        Pemain ditambahkan: <span className="font-bold text-emerald-600">{players.length}/15</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Kanan: Daftar Pemain */}
              <Card className="border-0 shadow-lg">
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
                    <div className="text-center py-12 text-gray-400">
                      <Users className="w-16 h-16 mx-auto mb-3 opacity-30" />
                      <p className="text-lg font-medium mb-1">Belum ada pemain</p>
                      <p className="text-sm">Tambahkan minimal 4 pemain untuk melanjutkan</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px]  pr-1">
                        {players.map((player, index) => {
                          const avatar = AVATARS.find(a => a.id === player.avatar_id) || AVATARS[0];
                          const playerStat = playerStats.getPlayerStats(player.id); // ✅ Ambil stat pemain
                          
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
                                
                                {/* ✅ Tampilkan skor total jika ada */}
                                {playerStat && playerStat.totalScore > 0 && (
                                  <Badge className="mt-1 bg-amber-100 text-amber-700 border-0 text-xs">
                                    🏆 {playerStat.totalScore} pts
                                  </Badge>
                                )}
                                
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

                      {/* Role preview */}
                      {players.length >= 4 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t border-gray-100"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-500">Distribusi Peran:</p>
                            
                            {/* Custom role toggle - hanya muncul jika pemain > 4 */}
                            {canCustomizeRoles && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleCustomRoles}
                                className={cn(
                                  "text-xs gap-1",
                                  customRoleConfig.enabled 
                                    ? "text-emerald-600 bg-emerald-50" 
                                    : "text-gray-600"
                                )}
                              >
                                <Sliders className="w-3 h-3" />
                                {customRoleConfig.enabled ? "Custom Mode ON" : "Custom Mode OFF"}
                              </Button>
                            )}
                          </div>

                          {/* Custom role controls */}
                          {customRoleConfig.enabled && canCustomizeRoles && (
                            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs font-medium text-gray-700 mb-2">
                                Atur Jumlah Peran:
                              </p>
                              
                              {/* Preset untuk 5 pemain */}
                              {players.length === 5 && (
                                <div className="mb-3">
                                  <p className="text-xs text-gray-500 mb-2">Pilih preset:</p>
                                  <div className="flex gap-2">
                                    {PRESET_ROLES_FOR_5.map((preset, index) => (
                                      <Button
                                        key={index}
                                        size="sm"
                                        variant="outline"
                                        onClick={() => applyPreset(index)}
                                        className={cn(
                                          "text-xs flex-1",
                                          selectedPreset === index && "bg-emerald-50 border-emerald-500 text-emerald-700"
                                        )}
                                      >
                                        {preset.label}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-2 mb-2">
                                {(['civilian', 'undercover', 'mrwhite'] as const).map((role) => (
                                  <div key={role} className="flex-1 text-center">
                                    <p className="text-xs text-gray-500 mb-1">
                                      {role === 'civilian' ? '🏥 Civilian' : 
                                       role === 'undercover' ? '🕵️ Undercover' : '👻 Mr. White'}
                                    </p>
                                    <div className="flex items-center justify-center gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-6 h-6 p-0"
                                        onClick={() => updateRoleCount(role, false)}
                                        disabled={customRoleConfig.distribution[role] <= 0}
                                      >
                                        <Minus className="w-3 h-3" />
                                      </Button>
                                      <span className="w-8 text-center font-bold">
                                        {customRoleConfig.distribution[role]}
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-6 h-6 p-0"
                                        onClick={() => updateRoleCount(role, true)}
                                      >
                                        <Plus className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Reset button */}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={resetToAutoRoles}
                                className="w-full mt-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Reset ke distribusi otomatis
                              </Button>

                              {/* Validation error */}
                              {validationError && (
                                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                  ⚠️ {validationError}
                                </div>
                              )}
                            </div>
                          )}

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

                          {/* Info custom mode */}
                          {canCustomizeRoles && !customRoleConfig.enabled && (
                            <p className="text-xs text-emerald-600 mt-2">
                              💡 Aktifkan Custom Mode untuk mengatur jumlah peran sesuai keinginan
                            </p>
                          )}
                        </motion.div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Warning message */}
              {players.length < 4 && (
                <div className="md:col-span-2 flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">Tambahkan {4 - players.length} pemain lagi untuk melanjutkan</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Select Medical Theme */}
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
                    Pilih Tema Medis
                  </h2>
                  <p className="text-gray-500 text-sm mb-6">
                    Pilih spesialisasi medis untuk kata-kata dalam permainan ini
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* Random option */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTheme('random')}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all relative',
                        selectedTheme === 'random'
                          ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        <span className="font-bold text-gray-800">Acak</span>
                      </div>
                      <p className="text-xs text-gray-500">Sistem pilihkan secara acak</p>
                      {selectedTheme === 'random' && (
                        <Check className="absolute top-2 right-2 w-4 h-4 text-emerald-500" />
                      )}
                    </motion.button>

                    {MEDICAL_THEMES.map((theme) => (
                      <motion.button
                        key={theme.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTheme(theme.id)}
                        className={cn(
                          'p-4 rounded-xl border-2 text-left transition-all relative',
                          selectedTheme === theme.id
                            ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        )}
                      >
                        <span className="font-medium text-gray-800 text-sm block mb-1">{theme.name}</span>
                        <p className="text-xs text-gray-400 line-clamp-2">{theme.description}</p>
                        <Badge className="mt-2 bg-emerald-50 text-emerald-600 text-xs border-0">
                          {theme.diseases.length} pasang kata
                        </Badge>
                        {selectedTheme === theme.id && (
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
                        <p className="text-gray-500">Tema Medis</p>
                        <p className="font-bold text-gray-800 text-lg">
                          {selectedTheme === 'random' ? '🎲 Acak' : getSelectedThemeName()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Mode distribusi */}
                    {customRoleConfig.enabled && canCustomizeRoles && (
                      <div className="mt-3">
                        <Badge className="bg-emerald-100 text-emerald-700 border-0">
                          ⚙️ Custom Role Distribution
                        </Badge>
                      </div>
                    )}
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
                    
                    {/* Validation warning di step 3 */}
                    {validationError && (
                      <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{validationError}</span>
                      </div>
                    )}
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
                  disabled={validationError !== null}
                  className={cn(
                    "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-6 text-lg font-semibold",
                    validationError && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Mulai Permainan! 🎮
                </Button>
                {validationError && (
                  <p className="text-sm text-red-600 mt-2">{validationError}</p>
                )}
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