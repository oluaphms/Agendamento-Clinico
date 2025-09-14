import React from 'react';
import { FileText } from 'lucide-react';
import { TemplateManager } from '@/components/Templates/TemplateManager';

export const TemplatesPage: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white flex items-center'>
            <FileText className='mr-3 !text-blue-600' size={32} style={{ color: '#2563eb !important' }} />
            Sistema de Templates
          </h1>
          <p className='text-gray-600 dark:text-gray-300 mt-2'>
            Crie e gerencie templates personalizados
          </p>
        </div>
      </div>

      <TemplateManager />
    </div>
  );
};
