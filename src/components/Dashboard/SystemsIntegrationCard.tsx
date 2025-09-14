import React from 'react';
import { useGamification } from '@/hooks/useGamification';
import { useTemplates } from '@/hooks/useTemplates';
import { GamificationWidget } from '@/components/Gamification';
import { 
  TrophyIcon, 
  DocumentDuplicateIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface SystemsIntegrationCardProps {
  className?: string;
}

export const SystemsIntegrationCard: React.FC<SystemsIntegrationCardProps> = ({ 
  className = '' 
}) => {
  const { userStats, currentLevel, currentPoints } = useGamification();
  const { totalTemplates, activeTemplates } = useTemplates();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
              Novos Sistemas
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Gamificação e Templates integrados ao sistema
            </p>
          </div>
          <div className="flex space-x-2">
            <Link
              to="/app/gamificacao"
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
            >
              <TrophyIcon className="h-4 w-4 mr-1" />
              Gamificação
            </Link>
            <Link
              to="/app/templates"
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
              Templates
            </Link>
          </div>
        </div>

        {/* Widget de Gamificação Compacto */}
        <div className="mb-6">
          <GamificationWidget compact />
        </div>

        {/* Estatísticas dos Sistemas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-700">
                  {currentLevel}
                </div>
                <div className="text-xs text-purple-600">Nível Atual</div>
              </div>
              <TrophyIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <div className="text-sm text-purple-700">
                {currentPoints} pontos totais
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-700">
                  {totalTemplates}
                </div>
                <div className="text-xs text-blue-600">Templates</div>
              </div>
              <DocumentDuplicateIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <div className="text-sm text-blue-700">
                {activeTemplates} ativos
              </div>
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Ações Rápidas
          </h4>
          <div className="grid grid-cols-1 gap-2">
            <Link
              to="/app/gamificacao"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <TrophyIcon className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">
                  Ver Conquistas
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {userStats?.achievements?.filter(a => a.isUnlocked).length || 0} desbloqueadas
              </span>
            </Link>

            <Link
              to="/app/templates"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <DocumentDuplicateIcon className="h-5 w-5 text-blue-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">
                  Gerenciar Templates
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {activeTemplates} disponíveis
              </span>
            </Link>

            <Link
              to="/app/examples"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <ChartBarIcon className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm font-medium text-gray-900">
                  Ver Exemplo de Integração
                </span>
              </div>
              <span className="text-xs text-gray-500">Demo completa</span>
            </Link>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start">
              <SparklesIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-medium text-blue-900 mb-1">
                  Sistemas Integrados
                </h5>
                <p className="text-xs text-blue-700">
                  Os sistemas de Gamificação e Templates estão totalmente integrados 
                  ao fluxo de trabalho. Cada ação gera pontos e pode usar templates 
                  personalizados para relatórios e comunicações.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
