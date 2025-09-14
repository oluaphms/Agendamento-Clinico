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
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Settings,
  Plus,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface Relatorio {
  id: string;
  nome: string;
  tipo: 'agendamentos' | 'pacientes' | 'profissionais' | 'financeiro' | 'customizado';
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

interface TemplateRelatorio {
  id: string;
  nome: string;
  descricao: string;
  tipo: string;
  parametros: Partial<RelatorioParametros>;
  isDefault: boolean;
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

const MOCK_TEMPLATES: TemplateRelatorio[] = [
  {
    id: '1',
    nome: 'Relatório Mensal de Agendamentos',
    descricao: 'Relatório padrão com agendamentos do mês',
    tipo: 'agendamentos',
    parametros: {
      formatoData: 'dd/mm/yyyy',
      incluirGraficos: true,
      incluirDetalhes: true,
      agruparPor: 'dia',
      ordenarPor: 'data',
      direcaoOrdem: 'asc',
    },
    isDefault: true,
  },
  {
    id: '2',
    nome: 'Relatório Financeiro Trimestral',
    descricao: 'Relatório financeiro com receitas e despesas',
    tipo: 'financeiro',
    parametros: {
      formatoData: 'dd/mm/yyyy',
      incluirGraficos: true,
      incluirDetalhes: true,
      agruparPor: 'mes',
      ordenarPor: 'valor',
      direcaoOrdem: 'desc',
    },
    isDefault: true,
  },
  {
    id: '3',
    nome: 'Relatório de Pacientes por Profissional',
    descricao: 'Lista de pacientes atendidos por cada profissional',
    tipo: 'pacientes',
    parametros: {
      formatoData: 'dd/mm/yyyy',
      incluirGraficos: false,
      incluirDetalhes: true,
      agruparPor: 'profissional',
      ordenarPor: 'nome',
      direcaoOrdem: 'asc',
    },
    isDefault: false,
  },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Relatorios: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [relatorios, setRelatorios] = useState<Relatorio[]>(MOCK_RELATORIOS);
  const [templates, setTemplates] = useState<TemplateRelatorio[]>(MOCK_TEMPLATES);
  const [showCriarRelatorio, setShowCriarRelatorio] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<Relatorio | null>(null);
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

  const handleCriarRelatorio = (template?: TemplateRelatorio) => {
    if (template) {
      // Criar relatório baseado no template
      const novoRelatorio: Relatorio = {
        id: Date.now().toString(),
        nome: `Relatório - ${template.nome}`,
        tipo: template.tipo as any,
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
          ...template.parametros,
        },
      };
      setRelatorios(prev => [novoRelatorio, ...prev]);
      setRelatorioSelecionado(novoRelatorio);
      setShowCriarRelatorio(true);
      toast.success('Relatório criado com base no template!');
    } else {
      setShowCriarRelatorio(true);
    }
  };

  const handleGerarRelatorio = async (relatorio: Relatorio) => {
    try {
      // Atualizar status para "gerando"
      setRelatorios(prev =>
        prev.map(r =>
          r.id === relatorio.id
            ? { ...r, status: 'gerando' as const }
            : r
        )
      );

      // Simular geração do relatório
      await new Promise(resolve => setTimeout(resolve, 3000));

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

      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      setRelatorios(prev =>
        prev.map(r =>
          r.id === relatorio.id
            ? { ...r, status: 'erro' as const }
            : r
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
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'gerando':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'erro':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
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
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const relatoriosFiltrados = relatorios.filter(relatorio => {
    const matchesTipo = !filtros.tipo || relatorio.tipo === filtros.tipo;
    const matchesStatus = !filtros.status || relatorio.status === filtros.status;
    const matchesBusca = !filtros.busca || 
      relatorio.nome.toLowerCase().includes(filtros.busca.toLowerCase());
    
    return matchesTipo && matchesStatus && matchesBusca;
  });

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Helmet>
        <title>Relatórios - Sistema de Gestão de Clínica</title>
        <meta name="description" content="Sistema completo de geração e exportação de relatórios" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <FileText className="mr-3 !text-blue-600" size={32} style={{ color: '#2563eb !important' }} />
                Relatórios Avançados
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Gere e exporte relatórios em múltiplos formatos
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowTemplates(true)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Settings className="mr-2" size={16} />
                Templates
              </button>
              <button
                onClick={() => handleCriarRelatorio()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="mr-2" size={16} />
                Novo Relatório
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo
                </label>
                <select
                  value={filtros.tipo}
                  onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Todos os tipos</option>
                  <option value="agendamentos">Agendamentos</option>
                  <option value="pacientes">Pacientes</option>
                  <option value="profissionais">Profissionais</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="customizado">Customizado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filtros.status}
                  onChange={(e) => setFiltros({...filtros, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Todos os status</option>
                  <option value="pronto">Pronto</option>
                  <option value="gerando">Gerando</option>
                  <option value="rascunho">Rascunho</option>
                  <option value="erro">Erro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Início
                </label>
                <input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buscar
                </label>
                <input
                  type="text"
                  placeholder="Nome do relatório..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Relatórios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {relatoriosFiltrados.map((relatorio) => (
            <Card key={relatorio.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{relatorio.nome}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(relatorio.status)}
                    <span className="text-sm text-gray-500">
                      {getStatusText(relatorio.status)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <FileText className="mr-1" size={14} />
                    {relatorio.formato.toUpperCase()}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="mr-1" size={14} />
                    {new Date(relatorio.dataCriacao).toLocaleDateString('pt-BR')}
                  </span>
                  {relatorio.tamanhoArquivo && (
                    <span>{formatFileSize(relatorio.tamanhoArquivo)}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Tipo: {relatorio.tipo}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Período: {relatorio.parametros.dataInicio} - {relatorio.parametros.dataFim}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {relatorio.status === 'pronto' && (
                        <button
                          onClick={() => handleDownloadRelatorio(relatorio)}
                          className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                        >
                          <Download className="mr-1" size={14} />
                          Download
                        </button>
                      )}
                      
                      {relatorio.status === 'rascunho' && (
                        <button
                          onClick={() => handleGerarRelatorio(relatorio)}
                          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <RefreshCw className="mr-1" size={14} />
                          Gerar
                        </button>
                      )}
                      
                      <button
                        onClick={() => setRelatorioSelecionado(relatorio)}
                        className="flex items-center px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                      >
                        <Eye className="mr-1" size={14} />
                        Ver
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleExcluirRelatorio(relatorio.id)}
                      className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                      <Trash2 className="mr-1" size={14} />
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
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum relatório encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Crie seu primeiro relatório ou ajuste os filtros de busca.
              </p>
              <button
                onClick={() => handleCriarRelatorio()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="mr-2" size={16} />
                Criar Relatório
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Relatorios;
