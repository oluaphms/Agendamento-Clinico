import React, { useEffect } from 'react';
import { useGamificationStore } from '@/stores/gamificationStore';
import { useAuthStore } from '@/stores/authStore';
import { TrophyIcon, FireIcon, StarIcon } from '@heroicons/react/24/outline';

interface GamificationWidgetProps {
  className?: string;
  compact?: boolean;
}

export const GamificationWidget: React.FC<GamificationWidgetProps> = ({ 
  className = '', 
  compact = false 
}) => {
  const { user } = useAuthStore();
  const {
    userStats,
    initializeUserStats,
    getUnlockedAchievements,
    getProgressToNextLevel
  } = useGamificationStore();

  useEffect(() => {
    if (user?.id && !userStats) {
      initializeUserStats(user.id);
    }
  }, [user?.id, userStats, initializeUserStats]);

  if (!userStats) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 h-20 rounded-lg"></div>
      </div>
    );
  }

  const unlockedAchievements = getUnlockedAchievements();
  const progressToNext = getProgressToNextLevel(userStats.experience, userStats.level);

  if (compact) {
    return (
      <div className={`bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TrophyIcon className="h-6 w-6 text-yellow-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">Nível {userStats.level}</div>
              <div className="text-xs text-gray-600">{userStats.points} pontos</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600">{unlockedAchievements.length} conquistas</div>
            <div className="flex items-center space-x-1">
              <FireIcon className="h-3 w-3 text-orange-500" />
              <span className="text-xs text-gray-600">{userStats.streak}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrophyIcon className="h-6 w-6 text-yellow-500" />
            <h3 className="text-lg font-medium text-gray-900">Gamificação</h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">Nível {userStats.level}</div>
            <div className="text-sm text-gray-600">{userStats.points} pontos</div>
          </div>
        </div>

        {/* Progresso para próximo nível */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progresso para Nível {userStats.level + 1}</span>
            <span>{progressToNext.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressToNext}%` }}
            ></div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrophyIcon className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-lg font-bold text-gray-900">{unlockedAchievements.length}</div>
            <div className="text-xs text-gray-600">Conquistas</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <FireIcon className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-lg font-bold text-gray-900">{userStats.streak}</div>
            <div className="text-xs text-gray-600">Sequência</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <StarIcon className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-lg font-bold text-gray-900">{userStats.points}</div>
            <div className="text-xs text-gray-600">Pontos</div>
          </div>
        </div>

        {/* Conquistas recentes */}
        {unlockedAchievements.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Conquistas Recentes</h4>
            <div className="flex space-x-2">
              {unlockedAchievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">{achievement.icon}</span>
                  </div>
                </div>
              ))}
              {unlockedAchievements.length > 3 && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      +{unlockedAchievements.length - 3}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
