// ============================================================================
// SERVIÇO: Backup & Restore - Sistema Completo de Backup e Restauração
// ============================================================================
// Este serviço fornece funcionalidades completas de backup e restauração
// para garantir a segurança e integridade dos dados da clínica.
// ============================================================================

import { supabase } from '@/lib/supabase';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

export interface BackupInfo {
  id: string;
  nome: string;
  descricao: string;
  tipo: 'completo' | 'incremental' | 'diferencial' | 'manual';
  status: 'criando' | 'concluido' | 'falhou' | 'restaurando' | 'pausado';
  dataCriacao: string;
  dataConclusao?: string;
  tamanho: number;
  localizacao: 'local' | 'nuvem' | 'híbrido';
  tabelas: string[];
  registros: number;
  versao: string;
  hash: string;
  criptografado: boolean;
  compressao: boolean;
  agendamento?: {
    ativo: boolean;
    frequencia: 'diario' | 'semanal' | 'mensal';
    horario: string;
    diasSemana?: number[];
    diaMes?: number;
  };
  retencao: {
    dias: number;
    maxBackups: number;
  };
  custo?: number;
  erro?: string;
}

export interface RestoreInfo {
  id: string;
  backupId: string;
  status: 'preparando' | 'restaurando' | 'concluido' | 'falhou' | 'pausado';
  dataInicio: string;
  dataConclusao?: string;
  tabelasRestauradas: string[];
  registrosRestaurados: number;
  progresso: number;
  erro?: string;
}

export interface ConfiguracaoBackup {
  ativo: boolean;
  frequencia: 'diario' | 'semanal' | 'mensal';
  horario: string;
  diasSemana: number[];
  diaMes: number;
  retencao: {
    dias: number;
    maxBackups: number;
  };
  localizacao: {
    local: boolean;
    nuvem: boolean;
    servidor: boolean;
  };
  criptografia: boolean;
  compressao: boolean;
  notificacoes: boolean;
  emailNotificacao: string;
  tabelasIncluidas: string[];
  tabelasExcluidas: string[];
}

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const BACKUP_STORAGE_KEY = 'clinica_backups';

// ============================================================================
// FUNÇÕES PRINCIPAIS
// ============================================================================

/**
 * Cria um novo backup
 */
export const criarBackup = async (
  tipo: 'completo' | 'incremental' | 'diferencial' | 'manual',
  configuracao: ConfiguracaoBackup
): Promise<BackupInfo> => {
  try {
    const backup: BackupInfo = {
      id: Date.now().toString(),
      nome: `Backup ${tipo} - ${new Date().toLocaleDateString('pt-BR')}`,
      descricao: `Backup ${tipo} criado em ${new Date().toLocaleString('pt-BR')}`,
      tipo,
      status: 'criando',
      dataCriacao: new Date().toISOString(),
      tamanho: 0,
      localizacao: configuracao.localizacao.nuvem ? 'nuvem' : 'local',
      tabelas: configuracao.tabelasIncluidas,
      registros: 0,
      versao: '2.1.0',
      hash: '',
      criptografado: configuracao.criptografia,
      compressao: configuracao.compressao,
      retencao: configuracao.retencao,
    };

    // Salvar no banco de dados
    await salvarBackup(backup);

    // Iniciar processo de backup
    await executarBackup(backup);

    return backup;
  } catch (error) {
    console.error('Erro ao criar backup:', error);
    throw error;
  }
};

/**
 * Executa o processo de backup
 */
const executarBackup = async (backup: BackupInfo): Promise<void> => {
  try {
    // Simular processo de backup
    const tabelas = backup.tabelas;
    let totalRegistros = 0;
    let dadosBackup: any = {};

    // Fazer backup de cada tabela
    for (const tabela of tabelas) {
      const { data, error } = await supabase.from(tabela).select('*');

      if (error) {
        throw new Error(
          `Erro ao fazer backup da tabela ${tabela}: ${error.message}`
        );
      }

      dadosBackup[tabela] = data || [];
      totalRegistros += (data || []).length;
    }

    // Calcular hash dos dados
    const dadosString = JSON.stringify(dadosBackup);
    const hash = await calcularHash(dadosString);

    // Simular compressão se habilitada
    let dadosComprimidos = dadosString;
    if (backup.compressao) {
      dadosComprimidos = await comprimirDados(dadosString);
    }

    // Simular criptografia se habilitada
    if (backup.criptografado) {
      dadosComprimidos = await criptografarDados(dadosComprimidos);
    }

    // Calcular tamanho final
    const tamanho = new Blob([dadosComprimidos]).size;

    // Atualizar backup com dados finais
    const backupAtualizado: BackupInfo = {
      ...backup,
      status: 'concluido',
      dataConclusao: new Date().toISOString(),
      tamanho,
      registros: totalRegistros,
      hash,
    };

    await salvarBackup(backupAtualizado);

    // Salvar dados do backup (em produção, salvaria em storage seguro)
    await salvarDadosBackup(backup.id, dadosComprimidos);
  } catch (error) {
    console.error('Erro ao executar backup:', error);

    // Atualizar status para falhou
    const backupFalhou: BackupInfo = {
      ...backup,
      status: 'falhou',
      erro: error instanceof Error ? error.message : 'Erro desconhecido',
    };

    await salvarBackup(backupFalhou);
    throw error;
  }
};

/**
 * Restaura um backup
 */
export const restaurarBackup = async (
  backupId: string
): Promise<RestoreInfo> => {
  try {
    // Buscar backup
    const backup = await buscarBackup(backupId);
    if (!backup) {
      throw new Error('Backup não encontrado');
    }

    const restore: RestoreInfo = {
      id: Date.now().toString(),
      backupId,
      status: 'preparando',
      dataInicio: new Date().toISOString(),
      tabelasRestauradas: [],
      registrosRestaurados: 0,
      progresso: 0,
    };

    // Salvar no banco de dados
    await salvarRestore(restore);

    // Iniciar processo de restauração
    await executarRestore(restore, backup);

    return restore;
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    throw error;
  }
};

/**
 * Executa o processo de restauração
 */
const executarRestore = async (
  restore: RestoreInfo,
  backup: BackupInfo
): Promise<void> => {
  try {
    // Atualizar status para restaurando
    await atualizarRestore(restore.id, { status: 'restaurando' });

    // Carregar dados do backup
    const dadosBackup = await carregarDadosBackup(backup.id);

    // Descriptografar se necessário
    let dadosDescriptografados = dadosBackup;
    if (backup.criptografado) {
      dadosDescriptografados = await descriptografarDados(dadosBackup);
    }

    // Descomprimir se necessário
    let dadosDescomprimidos = dadosDescriptografados;
    if (backup.compressao) {
      dadosDescomprimidos = await descomprimirDados(dadosDescriptografados);
    }

    // Parse dos dados
    const dados = JSON.parse(dadosDescomprimidos);

    // Restaurar cada tabela
    let totalRestaurados = 0;
    const tabelasRestauradas: string[] = [];

    for (const [tabela, registros] of Object.entries(dados)) {
      if (Array.isArray(registros) && registros.length > 0) {
        // Limpar tabela existente (cuidado em produção!)
        await supabase.from(tabela).delete().neq('id', 0);

        // Inserir dados restaurados
        const { error } = await supabase.from(tabela).insert(registros);

        if (error) {
          throw new Error(
            `Erro ao restaurar tabela ${tabela}: ${error.message}`
          );
        }

        tabelasRestauradas.push(tabela);
        totalRestaurados += registros.length;
      }

      // Atualizar progresso
      const progresso = Math.round(
        (tabelasRestauradas.length / backup.tabelas.length) * 100
      );
      await atualizarRestore(restore.id, {
        progresso,
        tabelasRestauradas: [...tabelasRestauradas],
        registrosRestaurados: totalRestaurados,
      });
    }

    // Finalizar restauração
    await atualizarRestore(restore.id, {
      status: 'concluido',
      dataConclusao: new Date().toISOString(),
      progresso: 100,
    });
  } catch (error) {
    console.error('Erro ao executar restauração:', error);

    // Atualizar status para falhou
    await atualizarRestore(restore.id, {
      status: 'falhou',
      erro: error instanceof Error ? error.message : 'Erro desconhecido',
    });

    throw error;
  }
};

/**
 * Salva backup no banco de dados
 */
const salvarBackup = async (backup: BackupInfo): Promise<void> => {
  try {
    const { error } = await supabase.from('backups').upsert([backup]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erro ao salvar backup:', error);
    throw error;
  }
};

/**
 * Busca backup por ID
 */
export const buscarBackup = async (id: string): Promise<BackupInfo | null> => {
  try {
    const { data, error } = await supabase
      .from('backups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar backup:', error);
    return null;
  }
};

/**
 * Busca todos os backups
 */
export const buscarBackups = async (filtros?: {
  status?: string;
  tipo?: string;
  localizacao?: string;
  dataInicio?: string;
  dataFim?: string;
}): Promise<BackupInfo[]> => {
  try {
    let query = supabase
      .from('backups')
      .select('*')
      .order('dataCriacao', { ascending: false });

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    if (filtros?.tipo) {
      query = query.eq('tipo', filtros.tipo);
    }

    if (filtros?.localizacao) {
      query = query.eq('localizacao', filtros.localizacao);
    }

    if (filtros?.dataInicio) {
      query = query.gte('dataCriacao', filtros.dataInicio);
    }

    if (filtros?.dataFim) {
      query = query.lte('dataCriacao', filtros.dataFim);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar backups:', error);
    throw error;
  }
};

/**
 * Salva restore no banco de dados
 */
const salvarRestore = async (restore: RestoreInfo): Promise<void> => {
  try {
    const { error } = await supabase.from('restores').insert([restore]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erro ao salvar restore:', error);
    throw error;
  }
};

/**
 * Atualiza restore
 */
const atualizarRestore = async (
  id: string,
  updates: Partial<RestoreInfo>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('restores')
      .update(updates)
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erro ao atualizar restore:', error);
    throw error;
  }
};

/**
 * Busca restores
 */
export const buscarRestores = async (): Promise<RestoreInfo[]> => {
  try {
    const { data, error } = await supabase
      .from('restores')
      .select('*')
      .order('dataInicio', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar restores:', error);
    throw error;
  }
};

/**
 * Exclui backup
 */
export const excluirBackup = async (id: string): Promise<void> => {
  try {
    // Excluir dados do backup
    await excluirDadosBackup(id);

    // Excluir registro do banco
    const { error } = await supabase.from('backups').delete().eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erro ao excluir backup:', error);
    throw error;
  }
};

/**
 * Download de backup
 */
export const downloadBackup = async (id: string): Promise<void> => {
  try {
    const backup = await buscarBackup(id);
    if (!backup) {
      throw new Error('Backup não encontrado');
    }

    // Carregar dados do backup
    const dados = await carregarDadosBackup(id);

    // Criar arquivo para download
    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_${backup.nome.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao fazer download do backup:', error);
    throw error;
  }
};

// ============================================================================
// FUNÇÕES DE UTILIDADE
// ============================================================================

/**
 * Calcula hash dos dados
 */
const calcularHash = async (dados: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(dados);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Comprime dados
 */
const comprimirDados = async (dados: string): Promise<string> => {
  // Simular compressão (em produção, usar biblioteca de compressão real)
  return btoa(dados);
};

/**
 * Descomprime dados
 */
const descomprimirDados = async (dados: string): Promise<string> => {
  // Simular descompressão (em produção, usar biblioteca de compressão real)
  return atob(dados);
};

/**
 * Criptografa dados
 */
const criptografarDados = async (dados: string): Promise<string> => {
  // Simular criptografia (em produção, usar biblioteca de criptografia real)
  return btoa(dados);
};

/**
 * Descriptografa dados
 */
const descriptografarDados = async (dados: string): Promise<string> => {
  // Simular descriptografia (em produção, usar biblioteca de criptografia real)
  return atob(dados);
};

/**
 * Salva dados do backup
 */
const salvarDadosBackup = async (
  backupId: string,
  dados: string
): Promise<void> => {
  try {
    // Em produção, salvaria em storage seguro (AWS S3, Google Cloud Storage, etc.)
    localStorage.setItem(`${BACKUP_STORAGE_KEY}_${backupId}`, dados);
  } catch (error) {
    console.error('Erro ao salvar dados do backup:', error);
    throw error;
  }
};

/**
 * Carrega dados do backup
 */
const carregarDadosBackup = async (backupId: string): Promise<string> => {
  try {
    // Em produção, carregaria de storage seguro
    const dados = localStorage.getItem(`${BACKUP_STORAGE_KEY}_${backupId}`);
    if (!dados) {
      throw new Error('Dados do backup não encontrados');
    }
    return dados;
  } catch (error) {
    console.error('Erro ao carregar dados do backup:', error);
    throw error;
  }
};

/**
 * Exclui dados do backup
 */
const excluirDadosBackup = async (backupId: string): Promise<void> => {
  try {
    // Em produção, excluiria de storage seguro
    localStorage.removeItem(`${BACKUP_STORAGE_KEY}_${backupId}`);
  } catch (error) {
    console.error('Erro ao excluir dados do backup:', error);
    throw error;
  }
};

/**
 * Salva configuração de backup
 */
export const salvarConfiguracao = async (
  configuracao: ConfiguracaoBackup
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('configuracoes_backup')
      .upsert([configuracao]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    throw error;
  }
};

/**
 * Busca configuração de backup
 */
export const buscarConfiguracao =
  async (): Promise<ConfiguracaoBackup | null> => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_backup')
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      return null;
    }
  };

/**
 * Gera estatísticas de backup
 */
export const gerarEstatisticas = async (periodo: {
  inicio: string;
  fim: string;
}) => {
  try {
    const backups = await buscarBackups({
      dataInicio: periodo.inicio,
      dataFim: periodo.fim,
    });

    const estatisticas = {
      total: backups.length,
      concluidos: backups.filter(b => b.status === 'concluido').length,
      falhas: backups.filter(b => b.status === 'falhou').length,
      tamanhoTotal: backups.reduce((total, b) => total + b.tamanho, 0),
      registrosTotal: backups.reduce((total, b) => total + b.registros, 0),
      custoTotal: backups.reduce((total, b) => total + (b.custo || 0), 0),
      porTipo: {
        completo: backups.filter(b => b.tipo === 'completo').length,
        incremental: backups.filter(b => b.tipo === 'incremental').length,
        diferencial: backups.filter(b => b.tipo === 'diferencial').length,
        manual: backups.filter(b => b.tipo === 'manual').length,
      },
      porLocalizacao: {
        local: backups.filter(b => b.localizacao === 'local').length,
        nuvem: backups.filter(b => b.localizacao === 'nuvem').length,
        híbrido: backups.filter(b => b.localizacao === 'híbrido').length,
      },
    };

    return estatisticas;
  } catch (error) {
    console.error('Erro ao gerar estatísticas:', error);
    throw error;
  }
};

/**
 * Limpa backups antigos
 */
export const limparBackupsAntigos = async (): Promise<void> => {
  try {
    const configuracao = await buscarConfiguracao();
    if (!configuracao) {
      return;
    }

    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - configuracao.retencao.dias);

    const backupsAntigos = await buscarBackups({
      dataFim: dataLimite.toISOString(),
    });

    // Excluir backups antigos
    for (const backup of backupsAntigos) {
      await excluirBackup(backup.id);
    }

    // Limitar número máximo de backups
    const todosBackups = await buscarBackups();
    if (todosBackups.length > configuracao.retencao.maxBackups) {
      const backupsParaExcluir = todosBackups
        .sort(
          (a, b) =>
            new Date(a.dataCriacao).getTime() -
            new Date(b.dataCriacao).getTime()
        )
        .slice(0, todosBackups.length - configuracao.retencao.maxBackups);

      for (const backup of backupsParaExcluir) {
        await excluirBackup(backup.id);
      }
    }
  } catch (error) {
    console.error('Erro ao limpar backups antigos:', error);
    throw error;
  }
};
