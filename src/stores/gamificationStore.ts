import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserStats, Achievement, GamificationEvent, LeaderboardEntry, AchievementCategory } from '@/types/global';
import toast from 'react-hot-toast';

interface GamificationState {
  // Estado do usuário
  userStats: UserStats | null;
  achievements: Achievement[];
  events: GamificationEvent[];
  leaderboard: LeaderboardEntry[];
  
  // Estados de loading
  loading: boolean;
  error: string | null;
  
  // Métodos de gamificação
  initializeUserStats: (userId: string) => Promise<void>;
  addPoints: (points: number, reason: string) => Promise<void>;
  checkAchievements: (action: string, data?: Record<string, unknown>) => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  updateStreak: () => Promise<void>;
  levelUp: () => Promise<void>;
  
  // Métodos de conquistas
  getAchievementsByCategory: (category: AchievementCategory) => Achievement[];
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  
  // Métodos de leaderboard
  updateLeaderboard: () => Promise<void>;
  getUserRank: (userId: string) => number;
  
  // Métodos de eventos
  addEvent: (event: Omit<GamificationEvent, 'id' | 'timestamp'>) => Promise<void>;
  getRecentEvents: (limit?: number) => GamificationEvent[];
  
  // Utilitários
  calculateLevel: (experience: number) => number;
  getExperienceToNextLevel: (currentLevel: number) => number;
  getProgressToNextLevel: (currentExperience: number, currentLevel: number) => number;
  
  // Reset
  resetGamification: () => void;
}

// Conquistas padrão do sistema
const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'isUnlocked' | 'unlockedAt' | 'progress'>[] = [
  // Agendamentos
  {
    id: 'first_appointment',
    name: 'Primeiro Agendamento',
    description: 'Crie seu primeiro agendamento no sistema',
    icon: '📅',
    points: 10,
    category: 'agendamentos',
    requirement: { type: 'count', target: 1, entity: 'agendamentos' }
  },
  {
    id: 'appointment_master',
    name: 'Mestre dos Agendamentos',
    description: 'Crie 100 agendamentos',
    icon: '🎯',
    points: 100,
    category: 'agendamentos',
    requirement: { type: 'count', target: 100, entity: 'agendamentos' }
  },
  {
    id: 'appointment_streak',
    name: 'Sequência de Sucesso',
    description: 'Crie agendamentos por 7 dias consecutivos',
    icon: '🔥',
    points: 50,
    category: 'consecutivo',
    requirement: { type: 'streak', target: 7, entity: 'agendamentos' }
  },
  
  // Pacientes
  {
    id: 'first_patient',
    name: 'Primeiro Paciente',
    description: 'Cadastre seu primeiro paciente',
    icon: '👤',
    points: 15,
    category: 'pacientes',
    requirement: { type: 'count', target: 1, entity: 'pacientes' }
  },
  {
    id: 'patient_collector',
    name: 'Coletor de Pacientes',
    description: 'Cadastre 50 pacientes',
    icon: '👥',
    points: 75,
    category: 'pacientes',
    requirement: { type: 'count', target: 50, entity: 'pacientes' }
  },
  
  // Profissionais
  {
    id: 'first_professional',
    name: 'Primeiro Profissional',
    description: 'Cadastre seu primeiro profissional',
    icon: '👨‍⚕️',
    points: 20,
    category: 'profissionais',
    requirement: { type: 'count', target: 1, entity: 'profissionais' }
  },
  {
    id: 'team_builder',
    name: 'Construtor de Equipe',
    description: 'Cadastre 10 profissionais',
    icon: '🏥',
    points: 80,
    category: 'profissionais',
    requirement: { type: 'count', target: 10, entity: 'profissionais' }
  },
  
  // Sistema
  {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Acesse o sistema antes das 7h da manhã',
    icon: '🌅',
    points: 25,
    category: 'sistema',
    requirement: { type: 'date', target: 7, entity: 'login' }
  },
  {
    id: 'night_owl',
    name: 'Coruja Noturna',
    description: 'Acesse o sistema após as 22h',
    icon: '🦉',
    points: 25,
    category: 'sistema',
    requirement: { type: 'date', target: 22, entity: 'login' }
  },
  {
    id: 'power_user',
    name: 'Usuário Poderoso',
    description: 'Acesse o sistema por 30 dias consecutivos',
    icon: '⚡',
    points: 150,
    category: 'consecutivo',
    requirement: { type: 'streak', target: 30, entity: 'login' }
  }
];

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      userStats: null,
      achievements: [],
      events: [],
      leaderboard: [],
      loading: false,
      error: null,

      initializeUserStats: async (userId: string) => {
        try {
          set({ loading: true, error: null });
          
          // Carregar estatísticas do usuário do localStorage
          const storedStats = localStorage.getItem(`gamification_${userId}`);
          const storedAchievements = localStorage.getItem(`achievements_${userId}`);
          const storedEvents = localStorage.getItem(`events_${userId}`);
          
          let userStats: UserStats;
          let achievements: Achievement[];
          
          if (storedStats) {
            userStats = JSON.parse(storedStats);
          } else {
            // Criar estatísticas iniciais
            userStats = {
              userId,
              level: 1,
              experience: 0,
              points: 0,
              achievements: [],
              streak: 0,
              lastActivity: new Date().toISOString(),
              totalAgendamentos: 0,
              totalPacientes: 0,
              totalProfissionais: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          }
          
          if (storedAchievements) {
            achievements = JSON.parse(storedAchievements);
          } else {
            // Inicializar conquistas
            achievements = DEFAULT_ACHIEVEMENTS.map(ach => ({
              ...ach,
              isUnlocked: false,
              progress: 0
            }));
          }
          
          const events = storedEvents ? JSON.parse(storedEvents) : [];
          
          set({
            userStats,
            achievements,
            events,
            loading: false
          });
          
          // Atualizar streak
          await get().updateStreak();
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao inicializar gamificação';
          set({ error: errorMessage, loading: false });
          console.error('Erro ao inicializar gamificação:', error);
        }
      },

      addPoints: async (points: number, reason: string) => {
        const { userStats, userId } = get();
        if (!userStats) return;
        
        const newPoints = userStats.points + points;
        const newExperience = userStats.experience + points;
        const newLevel = get().calculateLevel(newExperience);
        
        const updatedStats = {
          ...userStats,
          points: newPoints,
          experience: newExperience,
          level: newLevel,
          updated_at: new Date().toISOString()
        };
        
        set({ userStats: updatedStats });
        
        // Salvar no localStorage
        localStorage.setItem(`gamification_${userStats.userId}`, JSON.stringify(updatedStats));
        
        // Adicionar evento
        await get().addEvent({
          userId: userStats.userId,
          type: 'points_earned',
          data: { points, reason }
        });
        
        // Verificar se subiu de nível
        if (newLevel > userStats.level) {
          await get().levelUp();
        }
        
        toast.success(`+${points} pontos! ${reason}`);
      },

      checkAchievements: async (action: string, data: Record<string, unknown> = {}) => {
        const { achievements, userStats } = get();
        if (!userStats) return;
        
        const updatedAchievements = [...achievements];
        let hasNewUnlocks = false;
        
        for (let i = 0; i < updatedAchievements.length; i++) {
          const achievement = updatedAchievements[i];
          if (achievement.isUnlocked) continue;
          
          let progress = 0;
          let shouldUnlock = false;
          
          switch (achievement.requirement.type) {
            case 'count':
              if (achievement.requirement.entity === action) {
                progress = (data.count as number) || 0;
                shouldUnlock = progress >= achievement.requirement.target;
              }
              break;
              
            case 'streak':
              if (achievement.requirement.entity === action) {
                progress = (data.streak as number) || 0;
                shouldUnlock = progress >= achievement.requirement.target;
              }
              break;
              
            case 'date':
              if (achievement.requirement.entity === action) {
                const hour = new Date().getHours();
                progress = 1;
                shouldUnlock = hour === achievement.requirement.target;
              }
              break;
          }
          
          updatedAchievements[i] = {
            ...achievement,
            progress: Math.min(progress, achievement.requirement.target)
          };
          
          if (shouldUnlock) {
            await get().unlockAchievement(achievement.id);
            hasNewUnlocks = true;
          }
        }
        
        set({ achievements: updatedAchievements });
        
        if (hasNewUnlocks) {
          // Salvar conquistas atualizadas
          localStorage.setItem(`achievements_${userStats.userId}`, JSON.stringify(updatedAchievements));
        }
      },

      unlockAchievement: async (achievementId: string) => {
        const { achievements, userStats } = get();
        if (!userStats) return;
        
        const achievement = achievements.find(a => a.id === achievementId);
        if (!achievement || achievement.isUnlocked) return;
        
        const updatedAchievements = achievements.map(a =>
          a.id === achievementId
            ? {
                ...a,
                isUnlocked: true,
                unlockedAt: new Date().toISOString(),
                progress: a.requirement.target
              }
            : a
        );
        
        set({ achievements: updatedAchievements });
        
        // Adicionar pontos da conquista
        await get().addPoints(achievement.points, `Conquista: ${achievement.name}`);
        
        // Adicionar evento
        await get().addEvent({
          userId: userStats.userId,
          type: 'achievement_unlocked',
          data: { achievementId, achievementName: achievement.name, points: achievement.points }
        });
        
        toast.success(`🏆 Conquista desbloqueada: ${achievement.name}!`);
      },

      updateStreak: async () => {
        const { userStats } = get();
        if (!userStats) return;
        
        const now = new Date();
        const lastActivity = new Date(userStats.lastActivity);
        const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        
        let newStreak = userStats.streak;
        
        if (daysDiff === 1) {
          // Dia consecutivo
          newStreak++;
        } else if (daysDiff > 1) {
          // Quebrou a sequência
          newStreak = 1;
        }
        // Se daysDiff === 0, é o mesmo dia, manter streak
        
        const updatedStats = {
          ...userStats,
          streak: newStreak,
          lastActivity: now.toISOString(),
          updated_at: now.toISOString()
        };
        
        set({ userStats: updatedStats });
        localStorage.setItem(`gamification_${userStats.userId}`, JSON.stringify(updatedStats));
      },

      levelUp: async () => {
        const { userStats } = get();
        if (!userStats) return;
        
        const newLevel = get().calculateLevel(userStats.experience);
        const updatedStats = {
          ...userStats,
          level: newLevel,
          updated_at: new Date().toISOString()
        };
        
        set({ userStats: updatedStats });
        localStorage.setItem(`gamification_${userStats.userId}`, JSON.stringify(updatedStats));
        
        // Adicionar evento
        await get().addEvent({
          userId: userStats.userId,
          type: 'level_up',
          data: { newLevel, previousLevel: userStats.level }
        });
        
        toast.success(`🎉 Nível ${newLevel} alcançado!`);
      },

      getAchievementsByCategory: (category: AchievementCategory) => {
        const { achievements } = get();
        return achievements.filter(a => a.category === category);
      },

      getUnlockedAchievements: () => {
        const { achievements } = get();
        return achievements.filter(a => a.isUnlocked);
      },

      getLockedAchievements: () => {
        const { achievements } = get();
        return achievements.filter(a => !a.isUnlocked);
      },

      updateLeaderboard: async () => {
        try {
          // Simular leaderboard com dados do localStorage
          const allUsers = Object.keys(localStorage)
            .filter(key => key.startsWith('gamification_'))
            .map(key => {
              const userId = key.replace('gamification_', '');
              const stats = JSON.parse(localStorage.getItem(key) || '{}');
              return {
                userId,
                userName: `Usuário ${userId.slice(-4)}`,
                level: stats.level || 1,
                points: stats.points || 0,
                position: 0,
                achievements: stats.achievements?.filter((a: Achievement) => a.isUnlocked).length || 0
              };
            })
            .sort((a, b) => b.points - a.points)
            .map((user, index) => ({
              ...user,
              position: index + 1
            }));
          
          set({ leaderboard: allUsers });
        } catch (error) {
          console.error('Erro ao atualizar leaderboard:', error);
        }
      },

      getUserRank: (userId: string) => {
        const { leaderboard } = get();
        const user = leaderboard.find(u => u.userId === userId);
        return user?.position || 0;
      },

      addEvent: async (event: Omit<GamificationEvent, 'id' | 'timestamp'>) => {
        const { events, userStats } = get();
        if (!userStats) return;
        
        const newEvent: GamificationEvent = {
          ...event,
          id: Date.now().toString(),
          timestamp: new Date().toISOString()
        };
        
        const updatedEvents = [newEvent, ...events].slice(0, 50); // Manter apenas os últimos 50 eventos
        
        set({ events: updatedEvents });
        localStorage.setItem(`events_${userStats.userId}`, JSON.stringify(updatedEvents));
      },

      getRecentEvents: (limit = 10) => {
        const { events } = get();
        return events.slice(0, limit);
      },

      calculateLevel: (experience: number) => {
        // Fórmula: nível = floor(sqrt(experiência / 100)) + 1
        return Math.floor(Math.sqrt(experience / 100)) + 1;
      },

      getExperienceToNextLevel: (currentLevel: number) => {
        const nextLevelExp = Math.pow(currentLevel, 2) * 100;
        const currentLevelExp = Math.pow(currentLevel - 1, 2) * 100;
        return nextLevelExp - currentLevelExp;
      },

      getProgressToNextLevel: (currentExperience: number, currentLevel: number) => {
        const currentLevelExp = Math.pow(currentLevel - 1, 2) * 100;
        const nextLevelExp = Math.pow(currentLevel, 2) * 100;
        const progressExp = currentExperience - currentLevelExp;
        const totalExp = nextLevelExp - currentLevelExp;
        return Math.min((progressExp / totalExp) * 100, 100);
      },

      resetGamification: () => {
        set({
          userStats: null,
          achievements: [],
          events: [],
          leaderboard: [],
          loading: false,
          error: null
        });
      }
    }),
    {
      name: 'gamification-storage',
      partialize: (state) => ({
        // Não persistir estados temporários
      })
    }
  )
);
