import React, { useState, useEffect } from 'react';
import { limparTodosAgendamentos, obterEstatisticasAgendamentos } from '@/lib/agendamentosUtils';
import toast from 'react-hot-toast';

interface AgendamentosManagerProps {
  className?: string;
}

export const AgendamentosManager: React.FC<AgendamentosManagerProps> = ({
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    porStatus: {} as Record<string, number>,
    porData: {} as Record<string, number>,
  });

  const carregarEstatisticas = async () => {
    try {
      const stats = await obterEstatisticasAgendamentos();
      setEstatisticas(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      carregarEstatisticas();
    }
  }, [isOpen]);

  const handleLimparTodos = async () => {
    if (!confirm('Tem certeza que deseja limpar TODOS os agendamentos? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsLoading(true);
    try {
      const resultado = await limparTodosAgendamentos();
      
      if (resultado.success) {
        toast.success(resultado.message);
        await carregarEstatisticas();
      } else {
        toast.error(resultado.message);
      }
    } catch (error) {
      console.error('Erro ao limpar agendamentos:', error);
      toast.error('Erro ao limpar agendamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimparCache = () => {
    try {
      // Limpar cache de agendamentos
      const agendamentosKeys = Object.keys(localStorage).filter(key => 
        key.includes('agendamentos') || 
        key.includes('agenda') ||
        key.startsWith('agendamento_')
      );

      agendamentosKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      toast.success(`Cache limpo! ${agendamentosKeys.length} itens removidos.`);
      carregarEstatisticas();
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      toast.error('Erro ao limpar cache');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium ${className}`}
        title="Gerenciar Agendamentos"
      >
        🗑️ Gerenciar Agendamentos
      </button>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🗑️ Gerenciar Agendamentos
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Estatísticas */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Estatísticas Atuais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{estatisticas.total}</div>
                <div className="text-sm text-blue-800">Total de Agendamentos</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Object.keys(estatisticas.porStatus).length}
                </div>
                <div className="text-sm text-green-800">Status Diferentes</div>
              </div>
            </div>

            {/* Detalhes por Status */}
            {Object.keys(estatisticas.porStatus).length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Por Status:</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(estatisticas.porStatus).map(([status, count]) => (
                    <span
                      key={status}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {status}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">⚡ Ações Disponíveis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleLimparTodos}
                disabled={isLoading || estatisticas.total === 0}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Limpando...
                  </>
                ) : (
                  <>
                    🗑️ Limpar Todos ({estatisticas.total})
                  </>
                )}
              </button>

              <button
                onClick={handleLimparCache}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center"
              >
                🧹 Limpar Cache
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    ⚠️ Atenção
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      A ação de "Limpar Todos" remove permanentemente todos os agendamentos do sistema.
                      Esta ação não pode ser desfeita.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendamentosManager;
