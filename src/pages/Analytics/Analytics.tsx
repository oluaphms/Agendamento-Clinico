// ============================================================================
// PÁGINA: Analytics - Dashboard Avançado de Análises
// ============================================================================
// Esta página fornece análises detalhadas e métricas essenciais para
// tomada de decisão em clínicas médicas.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Clock,
  Activity,
  Target,
  Award,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface AnalyticsData {
  // Métricas gerais
  totalPacientes: number;
  totalProfissionais: number;
  totalAgendamentos: number;
  receitaTotal: number;
  receitaMes: number;
  receitaAno: number;

  // Métricas de performance
  taxaOcupacao: number;
  tempoMedioConsulta: number;
  satisfacaoMedia: number;
  cancelamentos: number;
  faltas: number;

  // Crescimento
  crescimentoPacientes: number;
  crescimentoReceita: number;
  crescimentoAgendamentos: number;
}

interface Filtros {
  periodo: '7d' | '30d' | '90d' | '1a' | 'custom';
  dataInicio: string;
  dataFim: string;
  profissional: string;
  servico: string;
}

// ============================================================================
// DADOS MOCK PARA DESENVOLVIMENTO
// ============================================================================

const MOCK_ANALYTICS: AnalyticsData = {
  totalPacientes: 1247,
  totalProfissionais: 23,
  totalAgendamentos: 3421,
  receitaTotal: 485670.5,
  receitaMes: 45670.3,
  receitaAno: 485670.5,
  taxaOcupacao: 78.5,
  tempoMedioConsulta: 32,
  satisfacaoMedia: 4.7,
  cancelamentos: 45,
  faltas: 23,
  crescimentoPacientes: 12.5,
  crescimentoReceita: 18.3,
  crescimentoAgendamentos: 15.2,
};

const MOCK_CHART_DATA = {
  agendamentosPorDia: [
    { data: '2024-01-01', agendamentos: 45, receita: 6750, pacientes: 38 },
    { data: '2024-01-02', agendamentos: 52, receita: 7800, pacientes: 42 },
    { data: '2024-01-03', agendamentos: 38, receita: 5700, pacientes: 35 },
    { data: '2024-01-04', agendamentos: 61, receita: 9150, pacientes: 48 },
    { data: '2024-01-05', agendamentos: 47, receita: 7050, pacientes: 39 },
    { data: '2024-01-06', agendamentos: 29, receita: 4350, pacientes: 25 },
    { data: '2024-01-07', agendamentos: 33, receita: 4950, pacientes: 28 },
  ],

  agendamentosPorProfissional: [
    {
      nome: 'Dr. Carlos Silva',
      agendamentos: 156,
      receita: 23400,
      satisfacao: 4.8,
    },
    {
      nome: 'Dra. Maria Santos',
      agendamentos: 142,
      receita: 21300,
      satisfacao: 4.9,
    },
    {
      nome: 'Dr. João Oliveira',
      agendamentos: 134,
      receita: 20100,
      satisfacao: 4.6,
    },
    {
      nome: 'Dra. Ana Costa',
      agendamentos: 128,
      receita: 19200,
      satisfacao: 4.7,
    },
    {
      nome: 'Dr. Pedro Lima',
      agendamentos: 98,
      receita: 14700,
      satisfacao: 4.5,
    },
  ],

  servicosMaisProcurados: [
    {
      nome: 'Consulta Cardiológica',
      quantidade: 234,
      receita: 35100,
      cor: '#8884d8',
    },
    { nome: 'Ultrassom', quantidade: 189, receita: 37800, cor: '#82ca9d' },
    {
      nome: 'Eletrocardiograma',
      quantidade: 156,
      receita: 18720,
      cor: '#ffc658',
    },
    { nome: 'Consulta Geral', quantidade: 134, receita: 20100, cor: '#ff7300' },
    { nome: 'Exame de Sangue', quantidade: 98, receita: 7840, cor: '#00ff00' },
  ],

  statusAgendamentos: [
    { status: 'Concluído', quantidade: 2847, cor: '#10b981' },
    { status: 'Agendado', quantidade: 342, cor: '#3b82f6' },
    { status: 'Cancelado', quantidade: 145, cor: '#ef4444' },
    { status: 'Faltou', quantidade: 87, cor: '#f59e0b' },
  ],

  receitaPorMes: [
    { mes: 'Jan', receita: 45670, agendamentos: 342 },
    { mes: 'Fev', receita: 52340, agendamentos: 389 },
    { mes: 'Mar', receita: 48920, agendamentos: 367 },
    { mes: 'Abr', receita: 56780, agendamentos: 425 },
    { mes: 'Mai', receita: 61230, agendamentos: 458 },
    { mes: 'Jun', receita: 58450, agendamentos: 437 },
  ],

  horariosMaisMovimentados: [
    { horario: '08:00', agendamentos: 45 },
    { horario: '09:00', agendamentos: 67 },
    { horario: '10:00', agendamentos: 89 },
    { horario: '11:00', agendamentos: 78 },
    { horario: '14:00', agendamentos: 92 },
    { horario: '15:00', agendamentos: 85 },
    { horario: '16:00', agendamentos: 73 },
    { horario: '17:00', agendamentos: 58 },
  ],
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] =
    useState<AnalyticsData>(MOCK_ANALYTICS);
  const [chartData, setChartData] = useState(MOCK_CHART_DATA);
  const [filtros, setFiltros] = useState<Filtros>({
    periodo: '30d',
    dataInicio: '',
    dataFim: '',
    profissional: '',
    servico: '',
  });

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadAnalyticsData();
  }, [filtros]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simular carregamento de dados
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Aqui você implementaria a lógica real de busca no Supabase
      // const { data } = await supabase.from('analytics_view').select('*');

      setAnalyticsData(MOCK_ANALYTICS);
      setChartData(MOCK_CHART_DATA);
    } catch (error) {
      console.error('Erro ao carregar dados de analytics:', error);
      toast.error('Erro ao carregar dados de analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = (format: 'pdf' | 'excel' | 'csv') => {
    toast.success(`Exportando dados em formato ${format.toUpperCase()}...`);
    // Implementar exportação real
  };

  const handleRefreshData = () => {
    loadAnalyticsData();
  };

  // ============================================================================
  // COMPONENTES DE MÉTRICAS
  // ============================================================================

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    color = 'blue',
    format = 'number',
  }: {
    title: string;
    value: number;
    change?: number;
    icon: React.ComponentType<any>;
    color?: string;
    format?: 'number' | 'currency' | 'percentage';
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case 'currency':
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(val);
        case 'percentage':
          return `${val.toFixed(1)}%`;
        default:
          return val.toLocaleString('pt-BR');
      }
    };

    const colorClasses = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      red: 'text-red-600',
      yellow: 'text-yellow-600',
      purple: 'text-purple-600',
    };

    return (
      <Card className='hover:shadow-lg transition-shadow'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                {title}
              </p>
              <p
                className={`text-2xl font-bold ${colorClasses[color as keyof typeof colorClasses]}`}
              >
                {formatValue(value)}
              </p>
              {change !== undefined && (
                <div className='flex items-center mt-1'>
                  {change >= 0 ? (
                    <TrendingUp className='h-4 w-4 text-green-500 mr-1' />
                  ) : (
                    <TrendingDown className='h-4 w-4 text-red-500 mr-1' />
                  )}
                  <span
                    className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {Math.abs(change).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <Icon
              className={`h-8 w-8 ${colorClasses[color as keyof typeof colorClasses]}`}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

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
        <title>Analytics - Sistema de Gestão de Clínica</title>
        <meta
          name='description'
          content='Dashboard de analytics e métricas para tomada de decisão'
        />
      </Helmet>

      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white flex items-center'>
                <BarChart3
                  className='mr-3 !text-blue-600'
                  size={32}
                  style={{ color: '#2563eb !important' }}
                />
                Analytics & Métricas
              </h1>
              <p className='text-gray-600 dark:text-gray-300 mt-2'>
                Análises detalhadas para tomada de decisão estratégica
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={handleRefreshData}
                className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <RefreshCw className='mr-2' size={16} />
                Atualizar
              </button>
              <button
                onClick={() => handleExportData('pdf')}
                className='flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
              >
                <Download className='mr-2' size={16} />
                Exportar
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
                  Período
                </label>
                <select
                  value={filtros.periodo}
                  onChange={e =>
                    setFiltros({ ...filtros, periodo: e.target.value as any })
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                >
                  <option value='7d'>Últimos 7 dias</option>
                  <option value='30d'>Últimos 30 dias</option>
                  <option value='90d'>Últimos 90 dias</option>
                  <option value='1a'>Último ano</option>
                  <option value='custom'>Personalizado</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Profissional
                </label>
                <select
                  value={filtros.profissional}
                  onChange={e =>
                    setFiltros({ ...filtros, profissional: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                >
                  <option value=''>Todos</option>
                  <option value='1'>Dr. Carlos Silva</option>
                  <option value='2'>Dra. Maria Santos</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Serviço
                </label>
                <select
                  value={filtros.servico}
                  onChange={e =>
                    setFiltros({ ...filtros, servico: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                >
                  <option value=''>Todos</option>
                  <option value='1'>Consulta Cardiológica</option>
                  <option value='2'>Ultrassom</option>
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
            </div>
          </CardContent>
        </Card>

        {/* Métricas Principais */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <MetricCard
            title='Total de Pacientes'
            value={analyticsData.totalPacientes}
            change={analyticsData.crescimentoPacientes}
            icon={Users}
            color='blue'
          />
          <MetricCard
            title='Receita Total'
            value={analyticsData.receitaTotal}
            change={analyticsData.crescimentoReceita}
            icon={DollarSign}
            color='green'
            format='currency'
          />
          <MetricCard
            title='Agendamentos'
            value={analyticsData.totalAgendamentos}
            change={analyticsData.crescimentoAgendamentos}
            icon={Calendar}
            color='purple'
          />
          <MetricCard
            title='Taxa de Ocupação'
            value={analyticsData.taxaOcupacao}
            icon={Target}
            color='yellow'
            format='percentage'
          />
        </div>

        {/* Gráficos Principais */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          {/* Gráfico de Agendamentos por Dia */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <LineChartIcon className='mr-2' size={20} />
                Agendamentos por Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <AreaChart data={chartData.agendamentosPorDia}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='data' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type='monotone'
                    dataKey='agendamentos'
                    stackId='1'
                    stroke='#3b82f6'
                    fill='#3b82f6'
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Status dos Agendamentos */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <PieChartIcon className='mr-2' size={20} />
                Status dos Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={chartData.statusAgendamentos}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='quantidade'
                  >
                    {chartData.statusAgendamentos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos Secundários */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          {/* Top Profissionais */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Award className='mr-2' size={20} />
                Top Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart
                  data={chartData.agendamentosPorProfissional}
                  layout='horizontal'
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis type='number' />
                  <YAxis dataKey='nome' type='category' width={100} />
                  <Tooltip />
                  <Bar dataKey='agendamentos' fill='#3b82f6' />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Serviços Mais Procurados */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Activity className='mr-2' size={20} />
                Serviços Mais Procurados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={chartData.servicosMaisProcurados}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='nome'
                    angle={-45}
                    textAnchor='end'
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='quantidade' fill='#10b981' />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Métricas de Performance */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <MetricCard
            title='Tempo Médio de Consulta'
            value={analyticsData.tempoMedioConsulta}
            icon={Clock}
            color='blue'
            format='number'
          />
          <MetricCard
            title='Satisfação Média'
            value={analyticsData.satisfacaoMedia}
            icon={CheckCircle}
            color='green'
            format='number'
          />
          <MetricCard
            title='Taxa de Cancelamento'
            value={
              (analyticsData.cancelamentos / analyticsData.totalAgendamentos) *
              100
            }
            icon={XCircle}
            color='red'
            format='percentage'
          />
        </div>

        {/* Gráfico de Receita por Mês */}
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <TrendingUp className='mr-2' size={20} />
              Evolução da Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={400}>
              <ComposedChart data={chartData.receitaPorMes}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='mes' />
                <YAxis yAxisId='left' />
                <YAxis yAxisId='right' orientation='right' />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId='left'
                  dataKey='receita'
                  fill='#3b82f6'
                  name='Receita (R$)'
                />
                <Area
                  yAxisId='right'
                  type='monotone'
                  dataKey='agendamentos'
                  stroke='#10b981'
                  fill='#10b981'
                  name='Agendamentos'
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Horários Mais Movimentados */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Clock className='mr-2' size={20} />
              Horários Mais Movimentados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={chartData.horariosMaisMovimentados}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='horario' />
                <YAxis />
                <Tooltip />
                <Bar dataKey='agendamentos' fill='#f59e0b' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
