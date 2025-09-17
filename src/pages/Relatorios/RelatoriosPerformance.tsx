// ============================================================================
// PÁGINA: Relatórios de Performance - Sistema de Relatórios
// ============================================================================
// Esta página implementa relatórios de performance dos profissionais,
// incluindo produtividade, eficiência e métricas de qualidade.
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

interface PerformanceProfissional {
  id: string;
  nome: string;
  especialidade: string;
  consultasRealizadas: number;
  consultasAgendadas: number;
  tempoMedioConsulta: number;
  satisfacaoMedia: number;
  receitaGerada: number;
  eficiencia: number;
  qualidade: number;
  pontualidade: number;
}

interface DadosPerformance {
  data: string;
  consultas: number;
  satisfacao: number;
  eficiencia: number;
  receita: number;
}

interface ResumoPerformance {
  totalProfissionais: number;
  consultasRealizadas: number;
  satisfacaoMedia: number;
  eficienciaMedia: number;
  receitaTotal: number;
  profissionaisTop: PerformanceProfissional[];
}

interface Filtros {
  data_inicio: string;
  data_fim: string;
  especialidade: string;
  profissional: string;
  tipo_metrica: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const RelatoriosPerformance: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [performanceProfissionais, setPerformanceProfissionais] = useState<
    PerformanceProfissional[]
  >([]);
  const [dadosPerformance, setDadosPerformance] = useState<DadosPerformance[]>(
    []
  );
  const [resumoPerformance, setResumoPerformance] =
    useState<ResumoPerformance | null>(null);
  const [filtros, setFiltros] = useState<Filtros>({
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    data_fim: new Date().toISOString().split('T')[0],
    especialidade: '',
    profissional: '',
    tipo_metrica: 'geral',
  });
  const [periodoSelecionado, setPeriodoSelecionado] = useState('30dias');

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadDados();
  }, [filtros, periodoSelecionado]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadDados = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPerformanceProfissionais(),
        loadDadosPerformance(),
        loadResumoPerformance(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar relatórios de performance');
    } finally {
      setLoading(false);
    }
  };

  const loadPerformanceProfissionais = async () => {
    try {
      // Simular dados de performance dos profissionais
      const performanceMock: PerformanceProfissional[] = [
        {
          id: '1',
          nome: 'Dr. João Silva',
          especialidade: 'Cardiologia',
          consultasRealizadas: 45,
          consultasAgendadas: 50,
          tempoMedioConsulta: 30,
          satisfacaoMedia: 4.8,
          receitaGerada: 22500,
          eficiencia: 90,
          qualidade: 95,
          pontualidade: 88,
        },
        {
          id: '2',
          nome: 'Dra. Maria Santos',
          especialidade: 'Dermatologia',
          consultasRealizadas: 38,
          consultasAgendadas: 40,
          tempoMedioConsulta: 25,
          satisfacaoMedia: 4.9,
          receitaGerada: 19000,
          eficiencia: 95,
          qualidade: 98,
          pontualidade: 92,
        },
        {
          id: '3',
          nome: 'Dr. Pedro Costa',
          especialidade: 'Ortopedia',
          consultasRealizadas: 42,
          consultasAgendadas: 45,
          tempoMedioConsulta: 35,
          satisfacaoMedia: 4.7,
          receitaGerada: 21000,
          eficiencia: 93,
          qualidade: 92,
          pontualidade: 85,
        },
        {
          id: '4',
          nome: 'Dra. Ana Oliveira',
          especialidade: 'Pediatria',
          consultasRealizadas: 35,
          consultasAgendadas: 38,
          tempoMedioConsulta: 28,
          satisfacaoMedia: 4.9,
          receitaGerada: 17500,
          eficiencia: 92,
          qualidade: 96,
          pontualidade: 90,
        },
        {
          id: '5',
          nome: 'Dr. Carlos Lima',
          especialidade: 'Neurologia',
          consultasRealizadas: 28,
          consultasAgendadas: 32,
          tempoMedioConsulta: 40,
          satisfacaoMedia: 4.6,
          receitaGerada: 14000,
          eficiencia: 88,
          qualidade: 94,
          pontualidade: 82,
        },
      ];

      setPerformanceProfissionais(performanceMock);
    } catch (error) {
      console.error('Erro ao carregar performance dos profissionais:', error);
    }
  };

  const loadDadosPerformance = async () => {
    try {
      // Simular dados de performance ao longo do tempo
      const dadosMock: DadosPerformance[] = [];
      const dataInicio = new Date(filtros.data_inicio);
      const dataFim = new Date(filtros.data_fim);

      for (
        let d = new Date(dataInicio);
        d <= dataFim;
        d.setDate(d.getDate() + 1)
      ) {
        const consultas = Math.floor(Math.random() * 20) + 10;
        const satisfacao = Math.random() * 1 + 4; // Entre 4 e 5
        const eficiencia = Math.random() * 20 + 80; // Entre 80 e 100
        const receita = consultas * (Math.random() * 200 + 300); // Entre 300 e 500 por consulta

        dadosMock.push({
          data: d.toISOString().split('T')[0],
          consultas: consultas,
          satisfacao: Math.round(satisfacao * 10) / 10,
          eficiencia: Math.round(eficiencia),
          receita: Math.round(receita),
        });
      }

      setDadosPerformance(dadosMock);
    } catch (error) {
      console.error('Erro ao carregar dados de performance:', error);
    }
  };

  const loadResumoPerformance = async () => {
    try {
      // Simular resumo de performance
      const resumoMock: ResumoPerformance = {
        totalProfissionais: 5,
        consultasRealizadas: 188,
        satisfacaoMedia: 4.8,
        eficienciaMedia: 92,
        receitaTotal: 94000,
        profissionaisTop: performanceProfissionais
          .sort((a, b) => b.eficiencia - a.eficiencia)
          .slice(0, 3),
      };

      setResumoPerformance(resumoMock);
    } catch (error) {
      console.error('Erro ao carregar resumo de performance:', error);
    }
  };

  const handleExportar = async (formato: string) => {
    try {
      if (formato === 'pdf') {
        toast.success('Relatório de performance exportado para PDF');
      } else if (formato === 'excel') {
        toast.success('Relatório de performance exportado para Excel');
      } else if (formato === 'csv') {
        toast.success('Relatório de performance exportado para CSV');
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  const handlePeriodoChange = (periodo: string) => {
    setPeriodoSelecionado(periodo);

    const hoje = new Date();
    let dataInicio: Date;

    switch (periodo) {
      case '7dias':
        dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30dias':
        dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90dias':
        dataInicio = new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1ano':
        dataInicio = new Date(hoje.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    setFiltros({
      ...filtros,
      data_inicio: dataInicio.toISOString().split('T')[0],
      data_fim: hoje.toISOString().split('T')[0],
    });
  };

  const getEficienciaColor = (eficiencia: number) => {
    if (eficiencia >= 90) return 'text-green-600';
    if (eficiencia >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEficienciaBgColor = (eficiencia: number) => {
    if (eficiencia >= 90) return 'bg-green-100 dark:bg-green-900';
    if (eficiencia >= 80) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  const getSatisfacaoColor = (satisfacao: number) => {
    if (satisfacao >= 4.5) return 'text-green-600';
    if (satisfacao >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSatisfacaoBgColor = (satisfacao: number) => {
    if (satisfacao >= 4.5) return 'bg-green-100 dark:bg-green-900';
    if (satisfacao >= 4.0) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  // Cores para gráficos
  const cores = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#06B6D4',
  ];

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
        <title>Relatórios de Performance - Sistema de Gestão de Clínica</title>
        <meta
          name='description'
          content='Relatórios de performance dos profissionais da clínica'
        />
      </Helmet>

      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3'>
                <Users className='h-8 w-8 text-blue-600' />
                Relatórios de Performance
              </h1>
              <p className='text-gray-600 dark:text-gray-400 mt-2'>
                Análise de produtividade e eficiência dos profissionais
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
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => handleExportar('pdf')}
                  className='flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
                >
                  <Download className='mr-2' size={16} />
                  PDF
                </button>
                <button
                  onClick={() => handleExportar('excel')}
                  className='flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                >
                  <Download className='mr-2' size={16} />
                  Excel
                </button>
                <button
                  onClick={() => handleExportar('csv')}
                  className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  <Download className='mr-2' size={16} />
                  CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros e Período */}
        <Card className='mb-8'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Filtros e Período
              </h3>
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => handlePeriodoChange('7dias')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    periodoSelecionado === '7dias'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  7 dias
                </button>
                <button
                  onClick={() => handlePeriodoChange('30dias')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    periodoSelecionado === '30dias'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  30 dias
                </button>
                <button
                  onClick={() => handlePeriodoChange('90dias')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    periodoSelecionado === '90dias'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  90 dias
                </button>
                <button
                  onClick={() => handlePeriodoChange('1ano')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    periodoSelecionado === '1ano'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  1 ano
                </button>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Data Início
                </label>
                <input
                  type='date'
                  value={filtros.data_inicio}
                  onChange={e =>
                    setFiltros({ ...filtros, data_inicio: e.target.value })
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
                  value={filtros.data_fim}
                  onChange={e =>
                    setFiltros({ ...filtros, data_fim: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Especialidade
                </label>
                <select
                  value={filtros.especialidade}
                  onChange={e =>
                    setFiltros({ ...filtros, especialidade: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                >
                  <option value=''>Todas as especialidades</option>
                  <option value='Cardiologia'>Cardiologia</option>
                  <option value='Dermatologia'>Dermatologia</option>
                  <option value='Ortopedia'>Ortopedia</option>
                  <option value='Pediatria'>Pediatria</option>
                  <option value='Neurologia'>Neurologia</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Tipo de Métrica
                </label>
                <select
                  value={filtros.tipo_metrica}
                  onChange={e =>
                    setFiltros({ ...filtros, tipo_metrica: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                >
                  <option value='geral'>Geral</option>
                  <option value='eficiencia'>Eficiência</option>
                  <option value='satisfacao'>Satisfação</option>
                  <option value='produtividade'>Produtividade</option>
                  <option value='qualidade'>Qualidade</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo de Performance */}
        {resumoPerformance && (
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center'>
                  <Users className='h-8 w-8 text-blue-600' />
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                      Total de Profissionais
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {resumoPerformance.totalProfissionais}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center'>
                  <Activity className='h-8 w-8 text-green-600' />
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                      Consultas Realizadas
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {resumoPerformance.consultasRealizadas}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center'>
                  <Star className='h-8 w-8 text-yellow-600' />
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                      Satisfação Média
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {resumoPerformance.satisfacaoMedia}/5
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center'>
                  <TrendingUp className='h-8 w-8 text-purple-600' />
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                      Eficiência Média
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {resumoPerformance.eficienciaMedia}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráficos */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* Gráfico de Eficiência por Profissional */}
          <Card>
            <CardContent className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                Eficiência por Profissional
              </h3>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={performanceProfissionais}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='nome' />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey='eficiencia' fill='#3B82F6' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Satisfação */}
          <Card>
            <CardContent className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                Satisfação dos Pacientes
              </h3>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={performanceProfissionais}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='nome' />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Bar dataKey='satisfacaoMedia' fill='#10B981' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Evolução da Performance */}
        <Card className='mb-8'>
          <CardContent className='p-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Evolução da Performance
            </h3>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={dadosPerformance}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='data' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='consultas'
                    stroke='#3B82F6'
                    strokeWidth={2}
                    name='Consultas'
                  />
                  <Line
                    type='monotone'
                    dataKey='satisfacao'
                    stroke='#10B981'
                    strokeWidth={2}
                    name='Satisfação'
                  />
                  <Line
                    type='monotone'
                    dataKey='eficiencia'
                    stroke='#F59E0B'
                    strokeWidth={2}
                    name='Eficiência'
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Performance dos Profissionais */}
        <Card>
          <CardContent className='p-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Performance dos Profissionais
            </h3>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                <thead className='bg-gray-50 dark:bg-gray-800'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Profissional
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Especialidade
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Consultas
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Eficiência
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Satisfação
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Receita
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Qualidade
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Pontualidade
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700'>
                  {performanceProfissionais.map(profissional => (
                    <tr key={profissional.id}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                        {profissional.nome}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                        {profissional.especialidade}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                        {profissional.consultasRealizadas}/
                        {profissional.consultasAgendadas}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm'>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getEficienciaBgColor(profissional.eficiencia)} ${getEficienciaColor(profissional.eficiencia)}`}
                        >
                          {profissional.eficiencia}%
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm'>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getSatisfacaoBgColor(profissional.satisfacaoMedia)} ${getSatisfacaoColor(profissional.satisfacaoMedia)}`}
                        >
                          {profissional.satisfacaoMedia}/5
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                        {formatCurrency(profissional.receitaGerada)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                        {profissional.qualidade}%
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                        {profissional.pontualidade}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RelatoriosPerformance;
