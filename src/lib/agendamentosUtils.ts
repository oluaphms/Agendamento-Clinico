// ============================================================================
// UTILITÁRIOS DE AGENDAMENTOS
// ============================================================================
// Funções para gerenciar agendamentos no sistema
// ============================================================================

import { localDb } from './database';

/**
 * Limpa todos os agendamentos do sistema
 */
export const limparTodosAgendamentos = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🗑️ Iniciando limpeza de todos os agendamentos...');

    // Limpar agendamentos do banco de dados mock
    const agendamentos = await localDb.from('agendamentos').select('*');
    
    if (agendamentos.data && agendamentos.data.length > 0) {
      // Deletar todos os agendamentos
      for (const agendamento of agendamentos.data) {
        await localDb.from('agendamentos').delete().eq('id', agendamento.id);
      }
      
      console.log(`✅ ${agendamentos.data.length} agendamentos removidos do banco de dados`);
    }

    // Limpar cache de agendamentos do localStorage
    const agendamentosKeys = Object.keys(localStorage).filter(key => 
      key.includes('agendamentos') || 
      key.includes('agenda') ||
      key.startsWith('agendamento_')
    );

    agendamentosKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🧹 Removido do cache: ${key}`);
    });

    // Limpar cache de notificações de agendamentos
    const notificationKeys = Object.keys(localStorage).filter(key => 
      key.includes('notification') && key.includes('agendamento')
    );

    notificationKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🧹 Removido notificação: ${key}`);
    });

    console.log('✅ Limpeza de agendamentos concluída com sucesso!');
    
    return {
      success: true,
      message: `Agendamentos limpos com sucesso! ${agendamentos.data?.length || 0} itens removidos.`
    };
  } catch (error) {
    console.error('❌ Erro ao limpar agendamentos:', error);
    return {
      success: false,
      message: 'Erro ao limpar agendamentos. Tente novamente.'
    };
  }
};

/**
 * Limpa agendamentos por período
 */
export const limparAgendamentosPorPeriodo = async (
  dataInicio: string, 
  dataFim: string
): Promise<{ success: boolean; message: string; removidos: number }> => {
  try {
    console.log(`🗑️ Limpando agendamentos de ${dataInicio} até ${dataFim}...`);

    // Buscar agendamentos no período
    const agendamentos = await localDb
      .from('agendamentos')
      .select('*')
      .gte('data', dataInicio)
      .lte('data', dataFim);

    if (!agendamentos.data || agendamentos.data.length === 0) {
      return {
        success: true,
        message: 'Nenhum agendamento encontrado no período especificado.',
        removidos: 0
      };
    }

    // Deletar agendamentos do período
    let removidos = 0;
    for (const agendamento of agendamentos.data) {
      await localDb.from('agendamentos').delete().eq('id', agendamento.id);
      removidos++;
    }

    console.log(`✅ ${removidos} agendamentos removidos do período ${dataInicio} até ${dataFim}`);

    return {
      success: true,
      message: `${removidos} agendamentos removidos do período especificado.`,
      removidos
    };
  } catch (error) {
    console.error('❌ Erro ao limpar agendamentos por período:', error);
    return {
      success: false,
      message: 'Erro ao limpar agendamentos por período. Tente novamente.',
      removidos: 0
    };
  }
};

/**
 * Limpa agendamentos por status
 */
export const limparAgendamentosPorStatus = async (
  status: string
): Promise<{ success: boolean; message: string; removidos: number }> => {
  try {
    console.log(`🗑️ Limpando agendamentos com status: ${status}...`);

    // Buscar agendamentos com o status especificado
    const agendamentos = await localDb
      .from('agendamentos')
      .select('*')
      .eq('status', status);

    if (!agendamentos.data || agendamentos.data.length === 0) {
      return {
        success: true,
        message: `Nenhum agendamento encontrado com status: ${status}`,
        removidos: 0
      };
    }

    // Deletar agendamentos com o status
    let removidos = 0;
    for (const agendamento of agendamentos.data) {
      await localDb.from('agendamentos').delete().eq('id', agendamento.id);
      removidos++;
    }

    console.log(`✅ ${removidos} agendamentos com status '${status}' removidos`);

    return {
      success: true,
      message: `${removidos} agendamentos com status '${status}' removidos.`,
      removidos
    };
  } catch (error) {
    console.error('❌ Erro ao limpar agendamentos por status:', error);
    return {
      success: false,
      message: 'Erro ao limpar agendamentos por status. Tente novamente.',
      removidos: 0
    };
  }
};

/**
 * Obtém estatísticas dos agendamentos
 */
export const obterEstatisticasAgendamentos = async (): Promise<{
  total: number;
  porStatus: Record<string, number>;
  porData: Record<string, number>;
}> => {
  try {
    const agendamentos = await localDb.from('agendamentos').select('*');
    
    if (!agendamentos.data) {
      return { total: 0, porStatus: {}, porData: {} };
    }

    const total = agendamentos.data.length;
    const porStatus: Record<string, number> = {};
    const porData: Record<string, number> = {};

    agendamentos.data.forEach((agendamento: any) => {
      // Contar por status
      const status = agendamento.status || 'indefinido';
      porStatus[status] = (porStatus[status] || 0) + 1;

      // Contar por data
      const data = agendamento.data || 'indefinida';
      porData[data] = (porData[data] || 0) + 1;
    });

    return { total, porStatus, porData };
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    return { total: 0, porStatus: {}, porData: {} };
  }
};
