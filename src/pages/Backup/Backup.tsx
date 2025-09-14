// ============================================================================
// PÁGINA: Backup & Restore - Sistema Completo de Backup e Restauração
// ============================================================================
// Esta página fornece um sistema completo de backup e restauração de dados
// para garantir a segurança e integridade das informações da clínica.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Database,
  Download,
  RefreshCw,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Trash2,
  Eye,
  Pause,
  Archive,
  HardDrive,
  Cloud,
  Server,
  Calendar,
  User,
  Activity,
  Lock,
} from 'lucide-react';
import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface BackupInfo {
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

interface RestoreInfo {
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

interface ConfiguracaoBackup {
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
// DADOS MOCK
// ============================================================================

const MOCK_BACKUPS: BackupInfo[] = [
  {
    id: '1',
    nome: 'Backup Completo - Dezembro 2024',
    descricao: 'Backup completo de todos os dados da clínica',
    tipo: 'completo',
    status: 'concluido',
    dataCriacao: '2024-12-20T02:00:00Z',
    dataConclusao: '2024-12-20T02:15:00Z',
    tamanho: 524288000, // 500MB
    localizacao: 'nuvem',
    tabelas: [
      'usuarios',
      'pacientes',
      'agendamentos',
      'pagamentos',
      'profissionais',
      'servicos',
    ],
    registros: 15420,
    versao: '2.1.0',
    hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    criptografado: true,
    compressao: true,
    agendamento: {
      ativo: true,
      frequencia: 'diario',
      horario: '02:00',
    },
    retencao: {
      dias: 30,
      maxBackups: 10,
    },
    custo: 2.5,
  },
  {
    id: '2',
    nome: 'Backup Incremental - 19/12/2024',
    descricao: 'Backup incremental das alterações do dia',
    tipo: 'incremental',
    status: 'concluido',
    dataCriacao: '2024-12-19T02:00:00Z',
    dataConclusao: '2024-12-19T02:05:00Z',
    tamanho: 5242880, // 5MB
    localizacao: 'nuvem',
    tabelas: ['agendamentos', 'pagamentos'],
    registros: 45,
    versao: '2.1.0',
    hash: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7',
    criptografado: true,
    compressao: true,
    retencao: {
      dias: 30,
      maxBackups: 10,
    },
    custo: 0.25,
  },
  {
    id: '3',
    nome: 'Backup Manual - Antes da Atualização',
    descricao: 'Backup manual antes da atualização do sistema',
    tipo: 'manual',
    status: 'criando',
    dataCriacao: '2024-12-20T14:30:00Z',
    tamanho: 0,
    localizacao: 'local',
    tabelas: [
      'usuarios',
      'pacientes',
      'agendamentos',
      'pagamentos',
      'profissionais',
      'servicos',
    ],
    registros: 0,
    versao: '2.1.0',
    hash: '',
    criptografado: false,
    compressao: true,
    retencao: {
      dias: 7,
      maxBackups: 3,
    },
  },
];

const MOCK_RESTORES: RestoreInfo[] = [
  {
    id: '1',
    backupId: '1',
    status: 'concluido',
    dataInicio: '2024-12-15T10:00:00Z',
    dataConclusao: '2024-12-15T10:30:00Z',
    tabelasRestauradas: ['usuarios', 'pacientes', 'agendamentos'],
    registrosRestaurados: 8500,
    progresso: 100,
  },
  {
    id: '2',
    backupId: '2',
    status: 'restaurando',
    dataInicio: '2024-12-20T15:00:00Z',
    tabelasRestauradas: ['agendamentos'],
    registrosRestaurados: 25,
    progresso: 60,
  },
];

const MOCK_CONFIGURACAO: ConfiguracaoBackup = {
  ativo: true,
  frequencia: 'diario',
  horario: '02:00',
  diasSemana: [1, 2, 3, 4, 5], // Segunda a sexta
  diaMes: 1,
  retencao: {
    dias: 30,
    maxBackups: 10,
  },
  localizacao: {
    local: true,
    nuvem: true,
    servidor: false,
  },
  criptografia: true,
  compressao: true,
  notificacoes: true,
  emailNotificacao: 'admin@clinica.com',
  tabelasIncluidas: [
    'usuarios',
    'pacientes',
    'agendamentos',
    'pagamentos',
    'profissionais',
    'servicos',
  ],
  tabelasExcluidas: ['logs', 'sessions'],
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Backup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'backups' | 'restores' | 'configuracoes' | 'monitoramento'
  >('backups');
  const [backups, setBackups] = useState<BackupInfo[]>(MOCK_BACKUPS);
  const [restores, setRestores] = useState<RestoreInfo[]>(MOCK_RESTORES);
  const [configuracao, setConfiguracao] =
    useState<ConfiguracaoBackup>(MOCK_CONFIGURACAO);
  const [filtros, setFiltros] = useState({
    status: '',
    tipo: '',
    localizacao: '',
    dataInicio: '',
    dataFim: '',
    busca: '',
  });

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadDados();
  }, []);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadDados = async () => {
    setLoading(true);
    try {
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBackups(MOCK_BACKUPS);
      setRestores(MOCK_RESTORES);
      setConfiguracao(MOCK_CONFIGURACAO);
    } catch (error) {
      console.error('Erro ao carregar dados de backup:', error);
      toast.error('Erro ao carregar dados de backup');
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurarBackup = async (backupId: string) => {
    try {
      setLoading(true);

      const backup = backups.find(b => b.id === backupId);
      if (!backup) {
        throw new Error('Backup não encontrado');
      }

      const novoRestore: RestoreInfo = {
        id: Date.now().toString(),
        backupId,
        status: 'restaurando',
        dataInicio: new Date().toISOString(),
        tabelasRestauradas: [],
        registrosRestaurados: 0,
        progresso: 0,
      };

      setRestores(prev => [novoRestore, ...prev]);
      toast.success('Restauração iniciada com sucesso!');

      // Simular processo de restauração
      const interval = setInterval(() => {
        setRestores(prev =>
          prev.map(r =>
            r.id === novoRestore.id
              ? {
                  ...r,
                  progresso: Math.min(r.progresso + 10, 100),
                  registrosRestaurados: Math.floor(
                    (r.progresso / 100) * (backup.registros || 0)
                  ),
                  tabelasRestauradas: backup.tabelas.slice(
                    0,
                    Math.floor((r.progresso / 100) * backup.tabelas.length)
                  ),
                }
              : r
          )
        );
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
        setRestores(prev =>
          prev.map(r =>
            r.id === novoRestore.id
              ? {
                  ...r,
                  status: 'concluido',
                  dataConclusao: new Date().toISOString(),
                  progresso: 100,
                  registrosRestaurados: backup.registros || 0,
                  tabelasRestauradas: backup.tabelas,
                }
              : r
          )
        );
        toast.success('Restauração concluída com sucesso!');
      }, 10000);
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      toast.error('Erro ao restaurar backup');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirBackup = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este backup?')) {
      setBackups(prev => prev.filter(b => b.id !== id));
      toast.success('Backup excluído com sucesso!');
    }
  };

  const handleDownloadBackup = (backup: BackupInfo) => {
    // Simular download
    toast.success(`Download do backup "${backup.nome}" iniciado!`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'criando':
      case 'restaurando':
        return <RefreshCw className='h-4 w-4 text-blue-500 animate-spin' />;
      case 'falhou':
        return <XCircle className='h-4 w-4 text-red-500' />;
      case 'pausado':
        return <Pause className='h-4 w-4 text-yellow-500' />;
      default:
        return <AlertCircle className='h-4 w-4 text-gray-500' />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'Concluído';
      case 'criando':
        return 'Criando...';
      case 'restaurando':
        return 'Restaurando...';
      case 'falhou':
        return 'Falhou';
      case 'pausado':
        return 'Pausado';
      default:
        return 'Desconhecido';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'completo':
        return <Database className='h-4 w-4' />;
      case 'incremental':
        return <RefreshCw className='h-4 w-4' />;
      case 'diferencial':
        return <Activity className='h-4 w-4' />;
      case 'manual':
        return <Archive className='h-4 w-4' />;
      default:
        return <Database className='h-4 w-4' />;
    }
  };

  const getLocalizacaoIcon = (localizacao: string) => {
    switch (localizacao) {
      case 'local':
        return <HardDrive className='h-4 w-4' />;
      case 'nuvem':
        return <Cloud className='h-4 w-4' />;
      case 'híbrido':
        return <Server className='h-4 w-4' />;
      default:
        return <HardDrive className='h-4 w-4' />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const backupsFiltrados = backups.filter(backup => {
    const matchesStatus = !filtros.status || backup.status === filtros.status;
    const matchesTipo = !filtros.tipo || backup.tipo === filtros.tipo;
    const matchesLocalizacao =
      !filtros.localizacao || backup.localizacao === filtros.localizacao;
    const matchesBusca =
      !filtros.busca ||
      backup.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      backup.descricao.toLowerCase().includes(filtros.busca.toLowerCase());

    return matchesStatus && matchesTipo && matchesLocalizacao && matchesBusca;
  });

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-6'>
      <Helmet>
        <title>Backup & Restore - Sistema de Gestão de Clínica</title>
        <meta
          name='description'
          content='Sistema completo de backup e restauração de dados'
        />
      </Helmet>

      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white flex items-center'>
                <Shield
                  className='mr-3 !text-blue-600'
                  size={32}
                  style={{ color: '#2563eb !important' }}
                />
                Backup & Restore
                <span
                  className={`ml-3 px-2 py-1 rounded-full text-sm font-medium ${
                    configuracao.ativo
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {configuracao.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </h1>
              <p className='text-gray-600 dark:text-gray-300 mt-2'>
                Sistema completo de backup e restauração para segurança dos
                dados
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={loadDados}
                className='flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
              >
                <RefreshCw className='mr-2' size={16} />
                Atualizar
              </button>
              <button
                onClick={() => {}}
                className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <Database className='mr-2' size={16} />
                Novo Backup
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className='mb-6'>
          <div className='border-b border-gray-200 dark:border-gray-700'>
            <nav className='-mb-px flex space-x-8'>
              {[
                {
                  key: 'backups',
                  label: 'Backups',
                  icon: Database,
                  count: backups.length,
                },
                {
                  key: 'restores',
                  label: 'Restaurações',
                  icon: Download,
                  count: restores.length,
                },
                {
                  key: 'configuracoes',
                  label: 'Configurações',
                  icon: Settings,
                  count: 0,
                },
                {
                  key: 'monitoramento',
                  label: 'Monitoramento',
                  icon: Activity,
                  count: 0,
                },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className='mr-2' size={16} />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className='ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs'>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'backups' && (
          <div className='space-y-6'>
            {/* Filtros */}
            <Card>
              <CardContent className='p-6'>
                <div className='grid grid-cols-1 md:grid-cols-6 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Status
                    </label>
                    <select
                      value={filtros.status}
                      onChange={e =>
                        setFiltros({ ...filtros, status: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    >
                      <option value=''>Todos os status</option>
                      <option value='concluido'>Concluído</option>
                      <option value='criando'>Criando</option>
                      <option value='falhou'>Falhou</option>
                      <option value='pausado'>Pausado</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Tipo
                    </label>
                    <select
                      value={filtros.tipo}
                      onChange={e =>
                        setFiltros({ ...filtros, tipo: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    >
                      <option value=''>Todos os tipos</option>
                      <option value='completo'>Completo</option>
                      <option value='incremental'>Incremental</option>
                      <option value='diferencial'>Diferencial</option>
                      <option value='manual'>Manual</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Localização
                    </label>
                    <select
                      value={filtros.localizacao}
                      onChange={e =>
                        setFiltros({ ...filtros, localizacao: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    >
                      <option value=''>Todas as localizações</option>
                      <option value='local'>Local</option>
                      <option value='nuvem'>Nuvem</option>
                      <option value='híbrido'>Híbrido</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Data Início
                    </label>
                    <input
                      type='date'
                      value={filtros.dataInicio}
                      onChange={e =>
                        setFiltros({ ...filtros, dataInicio: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Data Fim
                    </label>
                    <input
                      type='date'
                      value={filtros.dataFim}
                      onChange={e =>
                        setFiltros({ ...filtros, dataFim: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Buscar
                    </label>
                    <input
                      type='text'
                      placeholder='Nome ou descrição...'
                      value={filtros.busca}
                      onChange={e =>
                        setFiltros({ ...filtros, busca: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Backups */}
            <div className='space-y-4'>
              {backupsFiltrados.map(backup => (
                <Card
                  key={backup.id}
                  className='hover:shadow-lg transition-shadow'
                >
                  <CardContent className='p-6'>
                    <div className='flex items-start space-x-4'>
                      <div className='flex-shrink-0'>
                        <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center'>
                          {getTipoIcon(backup.tipo)}
                        </div>
                      </div>

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between mb-2'>
                          <div className='flex items-center space-x-2'>
                            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                              {backup.nome}
                            </h3>
                            <span className='px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs'>
                              {backup.tipo.toUpperCase()}
                            </span>
                            {backup.criptografado && (
                              <Lock className='h-4 w-4 text-green-500' />
                            )}
                            {backup.compressao && (
                              <Archive className='h-4 w-4 text-blue-500' />
                            )}
                          </div>
                          <div className='flex items-center space-x-2'>
                            {getStatusIcon(backup.status)}
                            <span className='text-sm text-gray-500 dark:text-gray-400'>
                              {getStatusText(backup.status)}
                            </span>
                          </div>
                        </div>

                        <p className='text-gray-600 dark:text-gray-300 mb-3'>
                          {backup.descricao}
                        </p>

                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                          <div className='flex items-center space-x-2'>
                            <Calendar className='h-4 w-4 text-gray-400' />
                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                              {new Date(backup.dataCriacao).toLocaleString(
                                'pt-BR'
                              )}
                            </span>
                          </div>

                          <div className='flex items-center space-x-2'>
                            <HardDrive className='h-4 w-4 text-gray-400' />
                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                              {formatFileSize(backup.tamanho)}
                            </span>
                          </div>

                          <div className='flex items-center space-x-2'>
                            <User className='h-4 w-4 text-gray-400' />
                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                              {backup.registros.toLocaleString('pt-BR')}{' '}
                              registros
                            </span>
                          </div>

                          <div className='flex items-center space-x-2'>
                            {getLocalizacaoIcon(backup.localizacao)}
                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                              {backup.localizacao}
                            </span>
                          </div>
                        </div>

                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400'>
                            <span>Tabelas: {backup.tabelas.length}</span>
                            <span>Versão: {backup.versao}</span>
                            {backup.custo && (
                              <span>Custo: R$ {backup.custo.toFixed(2)}</span>
                            )}
                          </div>

                          <div className='flex items-center space-x-2'>
                            <button
                              onClick={() => handleDownloadBackup(backup)}
                              className='p-2 text-gray-400 hover:text-blue-600 transition-colors'
                            >
                              <Download size={16} />
                            </button>

                            <button
                              onClick={() => handleRestaurarBackup(backup.id)}
                              className='p-2 text-gray-400 hover:text-green-600 transition-colors'
                            >
                              <Download size={16} />
                            </button>

                            <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
                              <Eye size={16} />
                            </button>

                            <button
                              onClick={() => handleExcluirBackup(backup.id)}
                              className='p-2 text-gray-400 hover:text-red-600 transition-colors'
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {backup.erro && (
                          <div className='mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md'>
                            <p className='text-sm text-red-600 dark:text-red-400'>
                              <AlertCircle className='inline mr-1' size={14} />
                              {backup.erro}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mensagem quando não há backups */}
            {backupsFiltrados.length === 0 && (
              <Card className='text-center py-12'>
                <CardContent>
                  <Database className='mx-auto h-12 w-12 text-gray-400 mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                    Nenhum backup encontrado
                  </h3>
                  <p className='text-gray-500 dark:text-gray-400 mb-4'>
                    Ajuste os filtros de busca ou crie seu primeiro backup.
                  </p>
                  <button
                    onClick={() => {}}
                    className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto'
                  >
                    <Database className='mr-2' size={16} />
                    Criar Backup
                  </button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Outras tabs serão implementadas em seguida */}
        {activeTab === 'restores' && (
          <div className='text-center py-12'>
            <Download className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              Histórico de Restaurações
            </h3>
            <p className='text-gray-500 dark:text-gray-400'>
              Em desenvolvimento...
            </p>
          </div>
        )}

        {activeTab === 'configuracoes' && (
          <div className='text-center py-12'>
            <Settings className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              Configurações de Backup
            </h3>
            <p className='text-gray-500 dark:text-gray-400'>
              Em desenvolvimento...
            </p>
          </div>
        )}

        {activeTab === 'monitoramento' && (
          <div className='text-center py-12'>
            <Activity className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              Monitoramento do Sistema
            </h3>
            <p className='text-gray-500 dark:text-gray-400'>
              Em desenvolvimento...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Backup;
