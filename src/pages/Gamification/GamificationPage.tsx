import React from 'react';
import { Trophy } from 'lucide-react';
import { GamificationDashboard } from '@/components/Gamification/GamificationDashboard';
import { GamificationWidget } from '@/components/Gamification/GamificationWidget';

export const GamificationPage: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white flex items-center'>
            <Trophy className='mr-3 !text-blue-600' size={32} style={{ color: '#2563eb !important' }} />
            Sistema de Gamificação
          </h1>
          <p className='text-gray-600 dark:text-gray-300 mt-2'>Acompanhe seu progresso e conquistas</p>
        </div>
      </div>

      <GamificationDashboard />
    </div>
  );
};

// Widget compacto para usar em outras páginas
export { GamificationWidget };
