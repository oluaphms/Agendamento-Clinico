import React, { useState, useEffect } from 'react';
import { connectivityManager } from '@/lib/connectivityManager';

interface ConnectivityStatusProps {
  className?: string;
}

export const ConnectivityStatus: React.FC<ConnectivityStatusProps> = ({
  className = '',
}) => {
  const [status, setStatus] = useState(connectivityManager.getStatus());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(connectivityManager.getStatus());
    };

    // Atualizar status a cada 5 segundos
    const interval = setInterval(updateStatus, 5000);

    // Atualizar quando a conectividade mudar
    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mostrar apenas se houver problemas de conectividade reais
  useEffect(() => {
    // Verificar se as notificações estão desabilitadas
    const notificationsDisabled =
      import.meta.env.VITE_DISABLE_CONNECTIVITY_NOTIFICATIONS === 'true';

    if (notificationsDisabled) {
      setIsVisible(false);
      return;
    }

    // Se estamos offline, sempre mostrar
    if (!status.isOnline) {
      setIsVisible(true);
      return;
    }

    // Se estamos online mas Supabase não está disponível, verificar se é intencional
    if (!status.supabaseAvailable) {
      // Verificar se estamos usando dados mock intencionalmente
      const isUsingMockData =
        import.meta.env.VITE_ENABLE_MOCK_DATA === 'true' ||
        !import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL === '' ||
        import.meta.env.VITE_SUPABASE_ANON_KEY === '' ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Só mostrar se não for uso intencional de dados mock
      setIsVisible(!isUsingMockData);
    } else {
      setIsVisible(false);
    }
  }, [status]);

  const handleReconnect = async () => {
    try {
      await connectivityManager.forceReconnect();
      setStatus(connectivityManager.getStatus());
    } catch (error) {
      console.error('Erro ao tentar reconectar:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className='bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow-lg max-w-sm'>
        <div className='flex items-center'>
          <div className='flex-shrink-0'>
            {!status.isOnline ? (
              <svg
                className='h-5 w-5 text-yellow-400'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
            ) : !status.supabaseAvailable ? (
              <svg
                className='h-5 w-5 text-yellow-400'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
            ) : null}
          </div>
          <div className='ml-3 flex-1'>
            <h3 className='text-sm font-medium'>
              {!status.isOnline ? 'Sem conexão' : 'Problemas de conectividade'}
            </h3>
            <div className='mt-1 text-sm'>
              {!status.isOnline ? (
                <p>
                  Você está offline. Algumas funcionalidades podem estar
                  limitadas.
                </p>
              ) : (
                <p>Servidor indisponível. Usando dados locais.</p>
              )}
            </div>
            <div className='mt-2'>
              <button
                onClick={handleReconnect}
                className='text-sm bg-yellow-200 hover:bg-yellow-300 text-yellow-800 font-medium py-1 px-2 rounded'
              >
                Tentar reconectar
              </button>
            </div>
          </div>
          <div className='ml-4 flex-shrink-0'>
            <button
              onClick={handleDismiss}
              className='text-yellow-400 hover:text-yellow-600'
              title='Fechar notificação'
            >
              <svg className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectivityStatus;
