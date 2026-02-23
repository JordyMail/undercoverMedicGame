// client/lib/playerStats.ts

export interface PlayerStat {
  playerId: string;
  playerName: string;
  avatarId: number;
  totalScore: number;
  gamesPlayed: number;
  wins: {
    civilian: number;
    undercover: number;
    mrwhite: number;
  };
  history: GameHistory[];
  lastPlayed: Date;
}

export interface GameHistory {
  gameId: string;
  date: Date;
  role: 'civilian' | 'undercover' | 'mrwhite';
  score: number;
  result: 'win' | 'lose';
  themeName: string;
}

class PlayerStatsManager {
  private static instance: PlayerStatsManager;
  private stats: Map<string, PlayerStat> = new Map();
  private readonly STORAGE_KEY = 'med_undercover_player_stats';

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): PlayerStatsManager {
    if (!PlayerStatsManager.instance) {
      PlayerStatsManager.instance = new PlayerStatsManager();
    }
    return PlayerStatsManager.instance;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Convert dates back to Date objects
        Object.keys(data).forEach(key => {
          data[key].lastPlayed = new Date(data[key].lastPlayed);
          data[key].history = data[key].history.map((h: any) => ({
            ...h,
            date: new Date(h.date)
          }));
        });
        this.stats = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Failed to load player stats:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.stats);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save player stats:', error);
    }
  }

  public updatePlayerStats(
    playerId: string,
    playerName: string,
    avatarId: number,
    score: number,
    role: 'civilian' | 'undercover' | 'mrwhite',
    gameResult: 'win' | 'lose',
    themeName: string
  ): void {
    const existing = this.stats.get(playerId) || {
      playerId,
      playerName,
      avatarId,
      totalScore: 0,
      gamesPlayed: 0,
      wins: { civilian: 0, undercover: 0, mrwhite: 0 },
      history: [],
      lastPlayed: new Date()
    };

    // Update stats
    existing.totalScore += score;
    existing.gamesPlayed += 1;
    existing.lastPlayed = new Date();
    
    if (gameResult === 'win') {
      existing.wins[role] += 1;
    }

    // Add to history
    existing.history.push({
      gameId: Date.now().toString(),
      date: new Date(),
      role,
      score,
      result: gameResult,
      themeName
    });

    // Keep only last 10 games history
    if (existing.history.length > 10) {
      existing.history = existing.history.slice(-10);
    }

    this.stats.set(playerId, existing);
    this.saveToStorage();
  }

  public getPlayerStats(playerId: string): PlayerStat | null {
    return this.stats.get(playerId) || null;
  }

  public getAllPlayerStats(): PlayerStat[] {
    return Array.from(this.stats.values());
  }

  public getPlayersForNewGame(playerIds: string[]): {
    id: string;
    name: string;
    avatar_id: number;
    totalScore: number;
  }[] {
    return playerIds.map(id => {
      const stat = this.stats.get(id);
      return {
        id,
        name: stat?.playerName || 'Unknown',
        avatar_id: stat?.avatarId || 1,
        totalScore: stat?.totalScore || 0
      };
    });
  }

  public updatePlayerAvatar(playerId: string, newAvatarId: number): void {
    const stat = this.stats.get(playerId);
    if (stat) {
      stat.avatarId = newAvatarId;
      this.saveToStorage();
    }
  }
}

export const playerStats = PlayerStatsManager.getInstance();