import React, { useEffect, useState } from 'react';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useAuthStore } from '@/stores/authStore';
import { Achievement, AchievementCategory } from '@/types/global';
import { 
  TrophyIcon, 
  StarIcon, 
  FireIcon, 
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface GamificationDashboardProps {
  className?: string;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ className = '' }) => {
  const { user } = useAuthStore();
  const {
    userStats,
    achievements,
    events,
    leaderboard,
    loading,
    error,
    initializeUserStats,
    getAchievementsByCategory,
    getUnlockedAchievements,
    getLockedAchievements,
    getRecentEvents,
    updateLeaderboard,
    calculateLevel,
    getProgressToNextLevel
  } = useGamificationStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboard' | 'events'>('overview');

  useEffect(() => {
    if (user?.id) {
      initializeUserStats(user.id);
      updateLeaderboard();
    }
  }, [user?.id, initializeUserStats, updateLeaderboard]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-600">Erro ao carregar gamificação: {error}</p>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-8 text-center ${className}`}>
        <TrophyIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sistema de Gamificação</h3>
        <p className="text-gray-600">Inicializando sistema de conquistas...</p>
      </div>
    );
  }

  const unlockedAchievements = getUnlockedAchievements();
  const lockedAchievements = getLockedAchievements();
  const recentEvents = getRecentEvents(5);
  const progressToNext = getProgressToNextLevel(userStats.experience, userStats.level);

  const categoryStats = [
    {
      name: 'Agendamentos',
      icon: '📅',
      unlocked: getAchievementsByCategory('agendamentos').filter(a => a.isUnlocked).length,
      total: getAchievementsByCategory('agendamentos').length
    },
    {
      name: 'Pacientes',
      icon: '👤',
      unlocked: getAchievementsByCategory('pacientes').filter(a => a.isUnlocked).length,
      total: getAchievementsByCategory('pacientes').length
    },
    {
      name: 'Profissionais',
      icon: '👨‍⚕️',
      unlocked: getAchievementsByCategory('profissionais').filter(a => a.isUnlocked).length,
      total: getAchievementsByCategory('profissionais').length
    },
    {
      name: 'Sistema',
      icon: '⚙️',
      unlocked: getAchievementsByCategory('sistema').filter(a => a.isUnlocked).length,
      total: getAchievementsByCategory('sistema').length
    },
    {
      name: 'Consecutivo',
      icon: '🔥',
      unlocked: getAchievementsByCategory('consecutivo').filter(a => a.isUnlocked).length,
      total: getAchievementsByCategory('consecutivo').length
    }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TrophyIcon className="h-8 w-8 text-yellow-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gamificação</h2>
              <p className="text-sm text-gray-600">Sistema de conquistas e engajamento</p>
            </div>
          </div>
          
          {/* Nível do usuário */}
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">Nível {userStats.level}</div>
            <div className="text-sm text-gray-600">{userStats.points} pontos</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-3 border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Visão Geral', icon: ChartBarIcon },
            { id: 'achievements', label: 'Conquistas', icon: TrophyIcon },
            { id: 'leaderboard', label: 'Ranking', icon: UserGroupIcon },
            { id: 'events', label: 'Atividades', icon: ClockIcon }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Progresso para próximo nível */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900">Progresso para Nível {userStats.level + 1}</h3>
                <span className="text-sm text-gray-600">{progressToNext.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressToNext}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {userStats.experience} XP de experiência
              </p>
            </div>

            {/* Estatísticas gerais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🏆</div>
                  <div>
                    <div className="text-2xl font-bold text-green-700">{unlockedAchievements.length}</div>
                    <div className="text-sm text-green-600">Conquistas</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <FireIcon className="h-8 w-8 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold text-orange-700">{userStats.streak}</div>
                    <div className="text-sm text-orange-600">Sequência</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <StarIcon className="h-8 w-8 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold text-purple-700">{userStats.points}</div>
                    <div className="text-sm text-purple-600">Pontos</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estatísticas por categoria */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Conquistas por Categoria</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryStats.map((category) => (
                  <div key={category.name} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{category.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{category.name}</div>
                          <div className="text-sm text-gray-600">
                            {category.unlocked}/{category.total} conquistas
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {Math.round((category.unlocked / category.total) * 100)}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(category.unlocked / category.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {/* Conquistas desbloqueadas */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Conquistas Desbloqueadas ({unlockedAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedAchievements.map((achievement) => (
                  <div key={achievement.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-green-900">{achievement.name}</h4>
                        <p className="text-sm text-green-700 mt-1">{achievement.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                            {achievement.category}
                          </span>
                          <span className="text-sm font-medium text-green-700">
                            +{achievement.points} pts
                          </span>
                        </div>
                        {achievement.unlockedAt && (
                          <p className="text-xs text-green-600 mt-2">
                            Desbloqueada em: {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conquistas bloqueadas */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Próximas Conquistas ({lockedAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedAchievements.map((achievement) => (
                  <div key={achievement.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 opacity-75">
                    <div className="flex items-start space-x-3">
                      <div className="text-3xl grayscale">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-700">{achievement.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {achievement.category}
                          </span>
                          <span className="text-sm font-medium text-gray-500">
                            +{achievement.points} pts
                          </span>
                        </div>
                        {achievement.progress !== undefined && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Progresso</span>
                              <span>{achievement.progress}/{achievement.requirement.target}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${Math.min((achievement.progress / achievement.requirement.target) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Ranking de Usuários</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nível
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pontos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conquistas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaderboard.map((entry, index) => (
                      <tr key={entry.userId} className={index < 3 ? 'bg-yellow-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {index === 0 && <span className="text-2xl">🥇</span>}
                            {index === 1 && <span className="text-2xl">🥈</span>}
                            {index === 2 && <span className="text-2xl">🥉</span>}
                            {index >= 3 && <span className="text-lg font-medium text-gray-900">#{entry.position}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{entry.userName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{entry.level}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{entry.points}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{entry.achievements}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Atividades Recentes</h3>
            <div className="space-y-4">
              {recentEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhuma atividade recente</p>
                </div>
              ) : (
                recentEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {event.type === 'achievement_unlocked' && <span className="text-2xl">🏆</span>}
                      {event.type === 'level_up' && <span className="text-2xl">🎉</span>}
                      {event.type === 'points_earned' && <span className="text-2xl">⭐</span>}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {event.type === 'achievement_unlocked' && `Conquista desbloqueada: ${(event.data as any).achievementName}`}
                        {event.type === 'level_up' && `Nível ${(event.data as any).newLevel} alcançado!`}
                        {event.type === 'points_earned' && `+${(event.data as any).points} pontos: ${(event.data as any).reason}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
