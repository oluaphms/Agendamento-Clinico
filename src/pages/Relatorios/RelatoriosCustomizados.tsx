// ============================================================================
// PÁGINA: Relatórios Customizados - Sistema de Relatórios
// ============================================================================
// Esta página implementa relatórios customizados permitindo aos usuários
// criar, configurar e personalizar relatórios específicos para suas necessidades.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Users,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Shield,
  CreditCard,
  FileText,
  Image,
  Bell,
  Lock,
  Unlock,
  Copy,
  ExternalLink,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Star,
  Heart,
  Award,
  Target,
  Activity,
  Database,
  Server,
  Cloud,
  Wifi,
  WifiOff,
  Check,
  X,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  MessageSquare,
  Send,
  Archive,
  Tag,
  Flag,
  Bookmark,
  Star as StarIcon,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Link,
  QrCode,
  Key,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  UserCog,
  UserEdit,
  UserSearch,
  UserShield,
  UserStar,
  UserHeart,
  UserAward,
  UserTarget,
  UserTrendingUp,
  UserBarChart,
  UserPieChart,
  UserActivity,
  UserDatabase,
  UserServer,
  UserCloud,
  UserWifi,
  UserWifiOff,
  UserCheck as UserCheckIcon,
  UserX as UserXIcon,
  UserPlus as UserPlusIcon,
  UserMinus as UserMinusIcon,
  UserCog as UserCogIcon,
  UserEdit as UserEditIcon,
  UserSearch as UserSearchIcon,
  UserShield as UserShieldIcon,
  UserStar as UserStarIcon,
  UserHeart as UserHeartIcon,
  UserAward as UserAwardIcon,
  UserTarget as UserTargetIcon,
  UserTrendingUp as UserTrendingUpIcon,
  UserBarChart as UserBarChartIcon,
  UserPieChart as UserPieChartIcon,
  UserActivity as UserActivityIcon,
  UserDatabase as UserDatabaseIcon,
  UserServer as UserServerIcon,
  UserCloud as UserCloudIcon,
  UserWifi as UserWifiIcon,
  UserWifiOff as UserWifiOffIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import {
  formatDate,
  formatTime,
  formatPhone,
  formatCurrency,
} from '@/lib/utils';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Legend,
  ScatterChart,
  Scatter,
} from 'recharts';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface RelatorioCustomizado {
  id: string;
  nome: string;
  descricao: string;
  tipo: string; // 'tabela', 'grafico', 'dashboard'
  categoria: string; // 'financeiro', 'operacional', 'clinico', 'administrativo'
  configuracoes: {
    campos: string[];
    filtros: string[];
    agrupamento: string;
    ordenacao: string;
    formato: string;
    periodicidade: string;
  };
  query: string;
  ativo: boolean;
  publico: boolean;
  created_at: string;
  updated_at: string;
  criado_por: string;
}

interface CampoDisponivel {
  id: string;
  nome: string;
  tipo: string; // 'texto', 'numero', 'data', 'booleano'
  tabela: string;
  descricao: string;
  categoria: string;
}

interface FiltroDisponivel {
  id: string;
  nome: string;
  tipo: string; // 'texto', 'numero', 'data', 'selecao'
  campo: string;
  operador: string;
  valores: string[];
}

interface Filtros {
  busca: string;
  tipo: string;
  categoria: string;
  ativo: string;
  publico: string;
  data_inicio: string;
  data_fim: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const RelatoriosCustomizados: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [relatorios, setRelatorios] = useState<RelatorioCustomizado[]>([]);
  const [camposDisponiveis, setCamposDisponiveis] = useState<CampoDisponivel[]>(
    []
  );
  const [filtrosDisponiveis, setFiltrosDisponiveis] = useState<
    FiltroDisponivel[]
  >([]);
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    tipo: '',
    categoria: '',
    ativo: '',
    publico: '',
    data_inicio: '',
    data_fim: '',
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [relatorioSelecionado, setRelatorioSelecionado] =
    useState<RelatorioCustomizado | null>(null);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState<Partial<RelatorioCustomizado>>({});
  const [previewAberto, setPreviewAberto] = useState(false);
  const [dadosPreview, setDadosPreview] = useState<any[]>([]);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadDados();
  }, [filtros]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadDados = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadRelatorios(),
        loadCamposDisponiveis(),
        loadFiltrosDisponiveis(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar relatórios customizados');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatorios = async () => {
    try {
      const { data, error } = await supabase
        .from('relatorios_customizados')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar relatórios:', error);
        return;
      }

      setRelatorios(data || []);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    }
  };

  const loadCamposDisponiveis = async () => {
    try {
      // Simular campos disponíveis
      const camposMock: CampoDisponivel[] = [
        {
          id: '1',
          nome: 'nome_paciente',
          tipo: 'texto',
          tabela: 'pacientes',
          descricao: 'Nome do Paciente',
          categoria: 'Paciente',
        },
        {
          id: '2',
          nome: 'data_consulta',
          tipo: 'data',
          tabela: 'consultas',
          descricao: 'Data da Consulta',
          categoria: 'Consulta',
        },
        {
          id: '3',
          nome: 'valor_consulta',
          tipo: 'numero',
          tabela: 'consultas',
          descricao: 'Valor da Consulta',
          categoria: 'Financeiro',
        },
        {
          id: '4',
          nome: 'nome_profissional',
          tipo: 'texto',
          tabela: 'profissionais',
          descricao: 'Nome do Profissional',
          categoria: 'Profissional',
        },
        {
          id: '5',
          nome: 'especialidade',
          tipo: 'texto',
          tabela: 'profissionais',
          descricao: 'Especialidade',
          categoria: 'Profissional',
        },
        {
          id: '6',
          nome: 'status_pagamento',
          tipo: 'texto',
          tabela: 'pagamentos',
          descricao: 'Status do Pagamento',
          categoria: 'Financeiro',
        },
        {
          id: '7',
          nome: 'data_pagamento',
          tipo: 'data',
          tabela: 'pagamentos',
          descricao: 'Data do Pagamento',
          categoria: 'Financeiro',
        },
        {
          id: '8',
          nome: 'valor_pagamento',
          tipo: 'numero',
          tabela: 'pagamentos',
          descricao: 'Valor do Pagamento',
          categoria: 'Financeiro',
        },
      ];

      setCamposDisponiveis(camposMock);
    } catch (error) {
      console.error('Erro ao carregar campos disponíveis:', error);
    }
  };

  const loadFiltrosDisponiveis = async () => {
    try {
      // Simular filtros disponíveis
      const filtrosMock: FiltroDisponivel[] = [
        {
          id: '1',
          nome: 'Período',
          tipo: 'data',
          campo: 'data_consulta',
          operador: 'entre',
          valores: [],
        },
        {
          id: '2',
          nome: 'Especialidade',
          tipo: 'selecao',
          campo: 'especialidade',
          operador: 'igual',
          valores: [
            'Cardiologia',
            'Dermatologia',
            'Ortopedia',
            'Pediatria',
            'Neurologia',
          ],
        },
        {
          id: '3',
          nome: 'Status Pagamento',
          tipo: 'selecao',
          campo: 'status_pagamento',
          operador: 'igual',
          valores: ['Pago', 'Pendente', 'Cancelado'],
        },
        {
          id: '4',
          nome: 'Valor Mínimo',
          tipo: 'numero',
          campo: 'valor_consulta',
          operador: 'maior_igual',
          valores: [],
        },
        {
          id: '5',
          nome: 'Valor Máximo',
          tipo: 'numero',
          campo: 'valor_consulta',
          operador: 'menor_igual',
          valores: [],
        },
      ];

      setFiltrosDisponiveis(filtrosMock);
    } catch (error) {
      console.error('Erro ao carregar filtros disponíveis:', error);
    }
  };

  const salvarRelatorio = async () => {
    if (!formData.nome || !formData.tipo || !formData.categoria) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (relatorioSelecionado) {
        // Atualizar relatório existente
        const { error } = await supabase
          .from('relatorios_customizados')
          .update(formData)
          .eq('id', relatorioSelecionado.id);

        if (error) {
          console.error('Erro ao atualizar relatório:', error);
          toast.error('Erro ao atualizar relatório');
          return;
        }
      } else {
        // Criar novo relatório
        const { error } = await supabase
          .from('relatorios_customizados')
          .insert([formData]);

        if (error) {
          console.error('Erro ao criar relatório:', error);
          toast.error('Erro ao criar relatório');
          return;
        }
      }

      toast.success('Relatório salvo com sucesso');
      loadRelatorios();
      setModalAberto(false);
      setRelatorioSelecionado(null);
      setFormData({});
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      toast.error('Erro ao salvar relatório');
    }
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este relatório?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('relatorios_customizados')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir relatório:', error);
        toast.error('Erro ao excluir relatório');
        return;
      }

      toast.success('Relatório excluído com sucesso');
      loadRelatorios();
    } catch (error) {
      console.error('Erro ao excluir relatório:', error);
      toast.error('Erro ao excluir relatório');
    }
  };

  const handleEditar = (relatorio: RelatorioCustomizado) => {
    setRelatorioSelecionado(relatorio);
    setFormData(relatorio);
    setEditando(true);
    setModalAberto(true);
  };

  const handleNovo = () => {
    setRelatorioSelecionado(null);
    setFormData({});
    setEditando(false);
    setModalAberto(true);
  };

  const handlePreview = async (relatorio: RelatorioCustomizado) => {
    try {
      // Simular dados de preview
      const dadosMock = [
        { nome: 'João Silva', data: '2024-01-15', valor: 150, status: 'Pago' },
        {
          nome: 'Maria Santos',
          data: '2024-01-16',
          valor: 200,
          status: 'Pendente',
        },
        { nome: 'Pedro Costa', data: '2024-01-17', valor: 180, status: 'Pago' },
      ];

      setDadosPreview(dadosMock);
      setPreviewAberto(true);
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      toast.error('Erro ao gerar preview');
    }
  };

  const handleDuplicar = async (relatorio: RelatorioCustomizado) => {
    try {
      const novoRelatorio = {
        ...relatorio,
        nome: `${relatorio.nome} (Cópia)`,
        publico: false,
      };
      delete novoRelatorio.id;
      delete novoRelatorio.created_at;
      delete novoRelatorio.updated_at;

      const { error } = await supabase
        .from('relatorios_customizados')
        .insert([novoRelatorio]);

      if (error) {
        console.error('Erro ao duplicar relatório:', error);
        toast.error('Erro ao duplicar relatório');
        return;
      }

      toast.success('Relatório duplicado com sucesso');
      loadRelatorios();
    } catch (error) {
      console.error('Erro ao duplicar relatório:', error);
      toast.error('Erro ao duplicar relatório');
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'tabela':
        return <FileText className='h-4 w-4 text-blue-500' />;
      case 'grafico':
        return <BarChart3 className='h-4 w-4 text-green-500' />;
      case 'dashboard':
        return <Activity className='h-4 w-4 text-purple-500' />;
      default:
        return <FileText className='h-4 w-4 text-gray-500' />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'tabela':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'grafico':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'dashboard':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'tabela':
        return 'Tabela';
      case 'grafico':
        return 'Gráfico';
      case 'dashboard':
        return 'Dashboard';
      default:
        return 'Desconhecido';
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    switch (categoria) {
      case 'financeiro':
        return 'Financeiro';
      case 'operacional':
        return 'Operacional';
      case 'clinico':
        return 'Clínico';
      case 'administrativo':
        return 'Administrativo';
      default:
        return 'Outros';
    }
  };

  const relatoriosFiltrados = relatorios.filter(relatorio => {
    const matchesBusca =
      !filtros.busca ||
      relatorio.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      relatorio.descricao.toLowerCase().includes(filtros.busca.toLowerCase());

    const matchesTipo = !filtros.tipo || relatorio.tipo === filtros.tipo;
    const matchesCategoria =
      !filtros.categoria || relatorio.categoria === filtros.categoria;
    const matchesAtivo =
      !filtros.ativo ||
      (filtros.ativo === 'ativo' && relatorio.ativo) ||
      (filtros.ativo === 'inativo' && !relatorio.ativo);
    const matchesPublico =
      !filtros.publico ||
      (filtros.publico === 'sim' && relatorio.publico) ||
      (filtros.publico === 'nao' && !relatorio.publico);

    const matchesDataInicio =
      !filtros.data_inicio ||
      new Date(relatorio.created_at) >= new Date(filtros.data_inicio);
    const matchesDataFim =
      !filtros.data_fim ||
      new Date(relatorio.created_at) <= new Date(filtros.data_fim);

    return (
      matchesBusca &&
      matchesTipo &&
      matchesCategoria &&
      matchesAtivo &&
      matchesPublico &&
      matchesDataInicio &&
      matchesDataFim
    );
  });

  // Estatísticas
  const totalRelatorios = relatorios.length;
  const relatoriosAtivos = relatorios.filter(r => r.ativo).length;
  const relatoriosPublicos = relatorios.filter(r => r.publico).length;
  const relatoriosPorTipo = relatorios.reduce(
    (acc, relatorio) => {
      acc[relatorio.tipo] = (acc[relatorio.tipo] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

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
        <title>Relatórios Customizados - Sistema de Gestão de Clínica</title>
        <meta
          name='description'
          content='Criação e gerenciamento de relatórios customizados'
        />
      </Helmet>

      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3'>
                <Settings className='h-8 w-8 text-blue-600' />
                Relatórios Customizados
              </h1>
              <p className='text-gray-600 dark:text-gray-400 mt-2'>
                Crie e gerencie relatórios personalizados para suas necessidades
              </p>
            </div>
            <div className='flex items-center gap-4'>
              <button
                onClick={loadDados}
                className='flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
              >
                <RefreshCw className='mr-2' size={16} />
                Atualizar
              </button>
              <button
                onClick={handleNovo}
                className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <Plus className='mr-2' size={16} />
                Novo Relatório
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <FileText className='h-8 w-8 text-blue-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Total de Relatórios
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {totalRelatorios}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <CheckCircle className='h-8 w-8 text-green-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Relatórios Ativos
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {relatoriosAtivos}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Globe className='h-8 w-8 text-purple-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Relatórios Públicos
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {relatoriosPublicos}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Tag className='h-8 w-8 text-yellow-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Tipos Diferentes
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {Object.keys(relatoriosPorTipo).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className='mb-8'>
          <CardContent className='p-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Filtros
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-6 gap-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <input
                  type='text'
                  placeholder='Buscar relatórios...'
                  value={filtros.busca}
                  onChange={e =>
                    setFiltros({ ...filtros, busca: e.target.value })
                  }
                  className='pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm w-full'
                />
              </div>
              <select
                value={filtros.tipo}
                onChange={e => setFiltros({ ...filtros, tipo: e.target.value })}
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
              >
                <option value=''>Todos os tipos</option>
                <option value='tabela'>Tabela</option>
                <option value='grafico'>Gráfico</option>
                <option value='dashboard'>Dashboard</option>
              </select>
              <select
                value={filtros.categoria}
                onChange={e =>
                  setFiltros({ ...filtros, categoria: e.target.value })
                }
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
              >
                <option value=''>Todas as categorias</option>
                <option value='financeiro'>Financeiro</option>
                <option value='operacional'>Operacional</option>
                <option value='clinico'>Clínico</option>
                <option value='administrativo'>Administrativo</option>
              </select>
              <select
                value={filtros.ativo}
                onChange={e =>
                  setFiltros({ ...filtros, ativo: e.target.value })
                }
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
              >
                <option value=''>Todos os status</option>
                <option value='ativo'>Ativo</option>
                <option value='inativo'>Inativo</option>
              </select>
              <select
                value={filtros.publico}
                onChange={e =>
                  setFiltros({ ...filtros, publico: e.target.value })
                }
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
              >
                <option value=''>Todos</option>
                <option value='sim'>Público</option>
                <option value='nao'>Privado</option>
              </select>
              <div className='flex space-x-2'>
                <input
                  type='date'
                  value={filtros.data_inicio}
                  onChange={e =>
                    setFiltros({ ...filtros, data_inicio: e.target.value })
                  }
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
                  placeholder='Data início'
                />
                <input
                  type='date'
                  value={filtros.data_fim}
                  onChange={e =>
                    setFiltros({ ...filtros, data_fim: e.target.value })
                  }
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
                  placeholder='Data fim'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Relatórios */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Relatórios Customizados
              </h3>
            </div>

            <div className='space-y-4'>
              {relatoriosFiltrados.map(relatorio => (
                <div
                  key={relatorio.id}
                  className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'
                >
                  <div className='flex items-center space-x-4'>
                    <div className='p-2 rounded-lg bg-gray-100 dark:bg-gray-700'>
                      {getTipoIcon(relatorio.tipo)}
                    </div>
                    <div>
                      <h4 className='text-sm font-medium text-gray-900 dark:text-white'>
                        {relatorio.nome}
                      </h4>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        {relatorio.descricao}
                      </p>
                      <p className='text-xs text-gray-400 dark:text-gray-500'>
                        {getTipoLabel(relatorio.tipo)} -{' '}
                        {getCategoriaLabel(relatorio.categoria)}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getTipoColor(relatorio.tipo)}`}
                    >
                      {getTipoLabel(relatorio.tipo)}
                    </span>
                    {relatorio.publico && (
                      <span className='px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'>
                        Público
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        relatorio.ativo
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {relatorio.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    <button
                      onClick={() => handlePreview(relatorio)}
                      className='p-2 text-gray-400 hover:text-blue-600 transition-colors'
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDuplicar(relatorio)}
                      className='p-2 text-gray-400 hover:text-green-600 transition-colors'
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleEditar(relatorio)}
                      className='p-2 text-gray-400 hover:text-blue-600 transition-colors'
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleExcluir(relatorio.id)}
                      className='p-2 text-gray-400 hover:text-red-600 transition-colors'
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RelatoriosCustomizados;


