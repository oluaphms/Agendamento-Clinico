// ============================================================================
// PÁGINA: Relatórios Avançados - Sistema Completo de Relatórios
// ============================================================================
// Esta página fornece um sistema completo de geração e exportação de
// relatórios em múltiplos formatos para gestão clínica.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FileText,
  Download,
  Calendar,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Settings,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import { supabase } from '@/lib/supabase';
import { printReport, ReportData } from '@/lib/reportTemplate';
import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface Relatorio {
  id: string;
  nome: string;
  tipo:
    | 'agendamentos'
    | 'pacientes'
    | 'usuarios'
    | 'profissionais'
    | 'financeiro'
    | 'customizado';
  formato: 'pdf' | 'excel' | 'csv' | 'html';
  status: 'rascunho' | 'gerando' | 'pronto' | 'erro';
  dataCriacao: string;
  dataUltimaExecucao?: string;
  parametros: RelatorioParametros;
  tamanhoArquivo?: number;
  urlDownload?: string;
  descricao?: string;
}

interface RelatorioParametros {
  dataInicio: string;
  dataFim: string;
  profissionalId?: string;
  servicoId?: string;
  statusAgendamento?: string;
  formatoData: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  incluirGraficos: boolean;
  incluirDetalhes: boolean;
  agruparPor?: 'dia' | 'semana' | 'mes' | 'profissional' | 'servico';
  ordenarPor?: 'data' | 'nome' | 'valor' | 'status';
  direcaoOrdem: 'asc' | 'desc';
}

// ============================================================================
// DADOS MOCK
// ============================================================================

const MOCK_RELATORIOS: Relatorio[] = [
  {
    id: '1',
    nome: 'Relatório de Agendamentos - Janeiro 2024',
    tipo: 'agendamentos',
    formato: 'pdf',
    status: 'pronto',
    dataCriacao: '2024-01-15T10:30:00Z',
    dataUltimaExecucao: '2024-01-15T10:35:00Z',
    parametros: {
      dataInicio: '2024-01-01',
      dataFim: '2024-01-31',
      formatoData: 'dd/mm/yyyy',
      incluirGraficos: true,
      incluirDetalhes: true,
      agruparPor: 'dia',
      ordenarPor: 'data',
      direcaoOrdem: 'asc',
    },
    tamanhoArquivo: 2048576,
    urlDownload: '/downloads/relatorio_agendamentos_jan_2024.pdf',
  },
  {
    id: '2',
    nome: 'Relatório Financeiro - Q1 2024',
    tipo: 'financeiro',
    formato: 'excel',
    status: 'pronto',
    dataCriacao: '2024-04-01T09:00:00Z',
    dataUltimaExecucao: '2024-04-01T09:15:00Z',
    parametros: {
      dataInicio: '2024-01-01',
      dataFim: '2024-03-31',
      formatoData: 'dd/mm/yyyy',
      incluirGraficos: true,
      incluirDetalhes: true,
      agruparPor: 'mes',
      ordenarPor: 'valor',
      direcaoOrdem: 'desc',
    },
    tamanhoArquivo: 1536000,
    urlDownload: '/downloads/relatorio_financeiro_q1_2024.xlsx',
  },
  {
    id: '3',
    nome: 'Relatório de Pacientes - Ativos',
    tipo: 'pacientes',
    formato: 'csv',
    status: 'gerando',
    dataCriacao: '2024-12-20T14:30:00Z',
    parametros: {
      dataInicio: '2024-01-01',
      dataFim: '2024-12-31',
      formatoData: 'dd/mm/yyyy',
      incluirGraficos: false,
      incluirDetalhes: true,
      ordenarPor: 'nome',
      direcaoOrdem: 'asc',
    },
  },
];

// const MOCK_TEMPLATES: TemplateRelatorio[] = [
//   {
//     id: '1',
//     nome: 'Relatório Mensal de Agendamentos',
//     descricao: 'Relatório padrão com agendamentos do mês',
//     tipo: 'agendamentos',
//     parametros: {
//       formatoData: 'dd/mm/yyyy',
//       incluirGraficos: true,
//       incluirDetalhes: true,
//       agruparPor: 'dia',
//       ordenarPor: 'data',
//       direcaoOrdem: 'asc',
//     },
//     isDefault: true,
//   },
//   {
//     id: '2',
//     nome: 'Relatório Financeiro Trimestral',
//     descricao: 'Relatório financeiro com receitas e despesas',
//     tipo: 'financeiro',
//     parametros: {
//       formatoData: 'dd/mm/yyyy',
//       incluirGraficos: true,
//       incluirDetalhes: true,
//       agruparPor: 'mes',
//       ordenarPor: 'valor',
//       direcaoOrdem: 'desc',
//     },
//     isDefault: true,
//   },
//   {
//     id: '3',
//     nome: 'Relatório de Pacientes por Profissional',
//     descricao: 'Lista de pacientes atendidos por cada profissional',
//     tipo: 'pacientes',
//     parametros: {
//       formatoData: 'dd/mm/yyyy',
//       incluirGraficos: false,
//       incluirDetalhes: true,
//       agruparPor: 'profissional',
//       ordenarPor: 'nome',
//       direcaoOrdem: 'asc',
//     },
//     isDefault: false,
//   },
// ];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Relatorios: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [relatorios, setRelatorios] = useState<Relatorio[]>(MOCK_RELATORIOS);
  // const [templates, setTemplates] = useState<TemplateRelatorio[]>(MOCK_TEMPLATES);
  // const [showCriarRelatorio, setShowCriarRelatorio] = useState(false);
  // const [showTemplates, setShowTemplates] = useState(false);
  // const [relatorioSelecionado, setRelatorioSelecionado] = useState<Relatorio | null>(null);
  const [filtros, setFiltros] = useState({
    tipo: '',
    status: '',
    dataInicio: '',
    dataFim: '',
    busca: '',
  });

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadRelatorios();
  }, []);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadRelatorios = async () => {
    setLoading(true);
    try {
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRelatorios(MOCK_RELATORIOS);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const handleCriarRelatorio = (
    tipo: 'agendamentos' | 'pacientes' | 'usuarios' = 'agendamentos'
  ) => {
    const novoRelatorio: Relatorio = {
      id: Date.now().toString(),
      nome: `Relatório de ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} - ${new Date().toLocaleDateString('pt-BR')}`,
      tipo: tipo,
      formato: 'pdf',
      status: 'rascunho',
      dataCriacao: new Date().toISOString(),
      parametros: {
        dataInicio: '',
        dataFim: '',
        formatoData: 'dd/mm/yyyy',
        incluirGraficos: true,
        incluirDetalhes: true,
        agruparPor: 'dia',
        ordenarPor: 'data',
        direcaoOrdem: 'asc',
      },
    };
    setRelatorios(prev => [novoRelatorio, ...prev]);
    toast.success('Relatório criado com sucesso!');
  };

  // Função para gerar relatório de Agendamentos
  const gerarRelatorioAgendamentos = async (relatorio: Relatorio) => {
    try {
      setLoading(true);

      // Buscar dados de agendamentos
      const { data: agendamentos, error } = await supabase
        .from('agendamentos')
        .select(
          `
          *,
          pacientes(nome, telefone, email),
          profissionais(nome, especialidade),
          servicos(nome, preco, duracao_min)
        `
        )
        .gte('data', relatorio.parametros.dataInicio || '2024-01-01')
        .lte('data', relatorio.parametros.dataFim || '2024-12-31')
        .order('data', { ascending: true });

      if (error) throw error;

      const reportData: ReportData = {
        title: 'Relatório de Agendamentos',
        subtitle: `Período: ${relatorio.parametros.dataInicio} a ${relatorio.parametros.dataFim}`,
        data: agendamentos || [],
        columns: [
          { key: 'data', label: 'Data' },
          { key: 'hora', label: 'Hora' },
          { key: 'pacientes.nome', label: 'Paciente' },
          { key: 'profissionais.nome', label: 'Profissional' },
          { key: 'servicos.nome', label: 'Serviço' },
          { key: 'status', label: 'Status' },
          { key: 'observacoes', label: 'Observações' },
        ],
        summary: [
          { label: 'Total de Agendamentos', value: agendamentos?.length || 0 },
          {
            label: 'Agendados',
            value:
              agendamentos?.filter((a: any) => a.status === 'agendado')
                .length || 0,
          },
          {
            label: 'Confirmados',
            value:
              agendamentos?.filter((a: any) => a.status === 'confirmado')
                .length || 0,
          },
          {
            label: 'Realizados',
            value:
              agendamentos?.filter((a: any) => a.status === 'realizado')
                .length || 0,
          },
          {
            label: 'Cancelados',
            value:
              agendamentos?.filter((a: any) => a.status === 'cancelado')
                .length || 0,
          },
        ],
        filters: {
          'Data Início': relatorio.parametros.dataInicio,
          'Data Fim': relatorio.parametros.dataFim,
          Status: relatorio.parametros.statusAgendamento || 'Todos',
          Profissional: relatorio.parametros.profissionalId || 'Todos',
          Serviço: relatorio.parametros.servicoId || 'Todos',
        },
      };

      printReport(reportData);
      toast.success('Relatório de agendamentos gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório de agendamentos:', error);
      toast.error('Erro ao gerar relatório de agendamentos');
    } finally {
      setLoading(false);
    }
  };

  // Função para gerar relatório de Pacientes
  const gerarRelatorioPacientes = async (relatorio: Relatorio) => {
    try {
      setLoading(true);

      // Buscar dados de pacientes
      const { data: pacientes, error } = await supabase
        .from('pacientes')
        .select('*')
        .gte('created_at', relatorio.parametros.dataInicio || '2024-01-01')
        .lte('created_at', relatorio.parametros.dataFim || '2024-12-31')
        .order('nome', { ascending: true });

      if (error) throw error;

      const reportData: ReportData = {
        title: 'Relatório de Pacientes',
        subtitle: `Período: ${relatorio.parametros.dataInicio} a ${relatorio.parametros.dataFim}`,
        data: pacientes || [],
        columns: [
          { key: 'nome', label: 'Nome' },
          { key: 'cpf', label: 'CPF' },
          { key: 'telefone', label: 'Telefone' },
          { key: 'email', label: 'Email' },
          { key: 'convenio', label: 'Convênio' },
          { key: 'status', label: 'Status' },
          { key: 'data_nascimento', label: 'Data de Nascimento' },
        ],
        summary: [
          { label: 'Total de Pacientes', value: pacientes?.length || 0 },
          {
            label: 'Pacientes Ativos',
            value:
              pacientes?.filter((p: any) => p.status === 'ativo').length || 0,
          },
          {
            label: 'Pacientes Inativos',
            value:
              pacientes?.filter((p: any) => p.status === 'inativo').length || 0,
          },
          {
            label: 'Com Convênio',
            value:
              pacientes?.filter(
                (p: any) => p.convenio && p.convenio !== 'Particular'
              ).length || 0,
          },
          {
            label: 'Particulares',
            value:
              pacientes?.filter(
                (p: any) => !p.convenio || p.convenio === 'Particular'
              ).length || 0,
          },
        ],
        filters: {
          'Data Início': relatorio.parametros.dataInicio,
          'Data Fim': relatorio.parametros.dataFim,
          Status: 'Todos',
        },
      };

      printReport(reportData);
      toast.success('Relatório de pacientes gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório de pacientes:', error);
      toast.error('Erro ao gerar relatório de pacientes');
    } finally {
      setLoading(false);
    }
  };

  // Função para gerar relatório de Usuários
  const gerarRelatorioUsuarios = async (relatorio: Relatorio) => {
    try {
      setLoading(true);

      // Buscar dados de usuários
      const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select('*')
        .gte('created_at', relatorio.parametros.dataInicio || '2024-01-01')
        .lte('created_at', relatorio.parametros.dataFim || '2024-12-31')
        .order('nome', { ascending: true });

      if (error) throw error;

      const reportData: ReportData = {
        title: 'Relatório de Usuários',
        subtitle: `Período: ${relatorio.parametros.dataInicio} a ${relatorio.parametros.dataFim}`,
        data: usuarios || [],
        columns: [
          { key: 'nome', label: 'Nome' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Função' },
          { key: 'status', label: 'Status' },
          { key: 'created_at', label: 'Data de Criação' },
          { key: 'last_login', label: 'Último Login' },
        ],
        summary: [
          { label: 'Total de Usuários', value: usuarios?.length || 0 },
          {
            label: 'Administradores',
            value: usuarios?.filter((u: any) => u.role === 'admin').length || 0,
          },
          {
            label: 'Gerentes',
            value:
              usuarios?.filter((u: any) => u.role === 'gerente').length || 0,
          },
          {
            label: 'Recepcionistas',
            value:
              usuarios?.filter((u: any) => u.role === 'recepcao').length || 0,
          },
          {
            label: 'Profissionais',
            value:
              usuarios?.filter((u: any) => u.role === 'profissional').length ||
              0,
          },
        ],
        filters: {
          'Data Início': relatorio.parametros.dataInicio,
          'Data Fim': relatorio.parametros.dataFim,
          Função: 'Todas',
        },
      };

      printReport(reportData);
      toast.success('Relatório de usuários gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório de usuários:', error);
      toast.error('Erro ao gerar relatório de usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleGerarRelatorio = async (relatorio: Relatorio) => {
    try {
      // Atualizar status para "gerando"
      setRelatorios(prev =>
        prev.map(r =>
          r.id === relatorio.id ? { ...r, status: 'gerando' as const } : r
        )
      );

      // Chamar função específica baseada no tipo
      switch (relatorio.tipo) {
        case 'agendamentos':
          await gerarRelatorioAgendamentos(relatorio);
          break;
        case 'pacientes':
          await gerarRelatorioPacientes(relatorio);
          break;
        case 'usuarios':
          await gerarRelatorioUsuarios(relatorio);
          break;
        default:
          throw new Error('Tipo de relatório não suportado');
      }

      // Atualizar status para "pronto"
      setRelatorios(prev =>
        prev.map(r =>
          r.id === relatorio.id
            ? {
                ...r,
                status: 'pronto' as const,
                dataUltimaExecucao: new Date().toISOString(),
                tamanhoArquivo: Math.floor(Math.random() * 5000000) + 1000000,
                urlDownload: `/downloads/relatorio_${relatorio.id}.${relatorio.formato}`,
              }
            : r
        )
      );
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      setRelatorios(prev =>
        prev.map(r =>
          r.id === relatorio.id ? { ...r, status: 'erro' as const } : r
        )
      );
      toast.error('Erro ao gerar relatório');
    }
  };

  const handleDownloadRelatorio = (relatorio: Relatorio) => {
    if (relatorio.urlDownload) {
      // Simular download
      const link = document.createElement('a');
      link.href = relatorio.urlDownload;
      link.download = `${relatorio.nome}.${relatorio.formato}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download iniciado!');
    }
  };

  const handleExcluirRelatorio = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este relatório?')) {
      setRelatorios(prev => prev.filter(r => r.id !== id));
      toast.success('Relatório excluído com sucesso!');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pronto':
        return <CheckCircle className='h-5 w-5 text-green-500' />;
      case 'gerando':
        return <RefreshCw className='h-5 w-5 text-blue-500 animate-spin' />;
      case 'erro':
        return <XCircle className='h-5 w-5 text-red-500' />;
      default:
        return <AlertCircle className='h-5 w-5 text-yellow-500' />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pronto':
        return 'Pronto';
      case 'gerando':
        return 'Gerando...';
      case 'erro':
        return 'Erro';
      default:
        return 'Rascunho';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const relatoriosFiltrados = relatorios.filter(relatorio => {
    const matchesTipo = !filtros.tipo || relatorio.tipo === filtros.tipo;
    const matchesStatus =
      !filtros.status || relatorio.status === filtros.status;
    const matchesBusca =
      !filtros.busca ||
      relatorio.nome.toLowerCase().includes(filtros.busca.toLowerCase());

    return matchesTipo && matchesStatus && matchesBusca;
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
        <title>Relatórios - Sistema de Gestão de Clínica</title>
        <meta
          name='description'
          content='Sistema completo de geração e exportação de relatórios'
        />
      </Helmet>

      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div></div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => handleCriarRelatorio('agendamentos')}
                className='flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
              >
                <Calendar className='mr-2' size={16} />
                Relatório de Agendamentos
              </button>
              <button
                onClick={() => handleCriarRelatorio('pacientes')}
                className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <FileText className='mr-2' size={16} />
                Relatório de Pacientes
              </button>
              <button
                onClick={() => handleCriarRelatorio('usuarios')}
                className='flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
              >
                <Settings className='mr-2' size={16} />
                Relatório de Usuários
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
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
                  <option value='agendamentos'>Agendamentos</option>
                  <option value='pacientes'>Pacientes</option>
                  <option value='usuarios'>Usuários</option>
                  <option value='profissionais'>Profissionais</option>
                  <option value='financeiro'>Financeiro</option>
                  <option value='customizado'>Customizado</option>
                </select>
              </div>

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
                  <option value='pronto'>Pronto</option>
                  <option value='gerando'>Gerando</option>
                  <option value='rascunho'>Rascunho</option>
                  <option value='erro'>Erro</option>
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
                  placeholder='Nome do relatório...'
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

        {/* Lista de Relatórios */}
        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
          {relatoriosFiltrados.map(relatorio => (
            <Card
              key={relatorio.id}
              className='hover:shadow-lg transition-shadow'
            >
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg'>{relatorio.nome}</CardTitle>
                  <div className='flex items-center space-x-2'>
                    {getStatusIcon(relatorio.status)}
                    <span className='text-sm text-gray-500'>
                      {getStatusText(relatorio.status)}
                    </span>
                  </div>
                </div>
                <div className='flex items-center space-x-4 text-sm text-gray-500'>
                  <span className='flex items-center'>
                    <FileText className='mr-1' size={14} />
                    {relatorio.formato.toUpperCase()}
                  </span>
                  <span className='flex items-center'>
                    <Calendar className='mr-1' size={14} />
                    {new Date(relatorio.dataCriacao).toLocaleDateString(
                      'pt-BR'
                    )}
                  </span>
                  {relatorio.tamanhoArquivo && (
                    <span>{formatFileSize(relatorio.tamanhoArquivo)}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                      Tipo: {relatorio.tipo}
                    </span>
                    <span className='text-sm text-gray-600 dark:text-gray-400'>
                      Período: {relatorio.parametros.dataInicio} -{' '}
                      {relatorio.parametros.dataFim}
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='flex space-x-2'>
                      {relatorio.status === 'pronto' && (
                        <button
                          onClick={() => handleDownloadRelatorio(relatorio)}
                          className='flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm'
                        >
                          <Download className='mr-1' size={14} />
                          Download
                        </button>
                      )}

                      {relatorio.status === 'rascunho' && (
                        <button
                          onClick={() => handleGerarRelatorio(relatorio)}
                          className='flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm'
                        >
                          <RefreshCw className='mr-1' size={14} />
                          Gerar
                        </button>
                      )}

                      <button
                        onClick={() => {}}
                        className='flex items-center px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm'
                      >
                        <Eye className='mr-1' size={14} />
                        Ver
                      </button>
                    </div>

                    <button
                      onClick={() => handleExcluirRelatorio(relatorio.id)}
                      className='flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm'
                    >
                      <Trash2 className='mr-1' size={14} />
                      Excluir
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensagem quando não há relatórios */}
        {relatoriosFiltrados.length === 0 && (
          <Card className='text-center py-12'>
            <CardContent>
              <FileText className='mx-auto h-12 w-12 text-gray-400 mb-4' />
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                Nenhum relatório encontrado
              </h3>
              <p className='text-gray-500 dark:text-gray-400 mb-4'>
                Crie seu primeiro relatório ou ajuste os filtros de busca.
              </p>
              <div className='flex flex-wrap gap-2 justify-center'>
                <button
                  onClick={() => handleCriarRelatorio('agendamentos')}
                  className='flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                >
                  <Calendar className='mr-2' size={16} />
                  Relatório de Agendamentos
                </button>
                <button
                  onClick={() => handleCriarRelatorio('pacientes')}
                  className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  <FileText className='mr-2' size={16} />
                  Relatório de Pacientes
                </button>
                <button
                  onClick={() => handleCriarRelatorio('usuarios')}
                  className='flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
                >
                  <Settings className='mr-2' size={16} />
                  Relatório de Usuários
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Relatorios;
