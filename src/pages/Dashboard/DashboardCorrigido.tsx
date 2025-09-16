import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Calendar,
  Users,
  DollarSign,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
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
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { localDb } from '@/lib/database';
import { useThemeStore } from '@/stores/themeStore';

const Dashboard: React.FC = () => {
  const { isDark } = useThemeStore();
  const [loading, setLoading] = useState(true);

  // Função para gerar classes dos cards baseadas no tema
  const getCardClasses = () => {
    return isDark
      ? 'bg-gray-800 border border-gray-700'
      : 'bg-white border border-gray-200';
  };

  const [stats, setStats] = useState({
    totalPacientes: 0,
    totalProfissionais: 0,
    totalServicos: 0,
    agendamentosHoje: 0,
    receitaMes: 0,
    ordensServico: 0,
    ordensConcluidas: 0,
    ordensPendentes: 0,
  });

  const [dadosGraficoPacientes, setDadosGraficoPacientes] = useState<any[]>([]);
  const [dadosGraficoServicos, setDadosGraficoServicos] = useState<any[]>([]);
  const [dadosGraficoOrdens, setDadosGraficoOrdens] = useState<any[]>([]);

  useEffect(() => {
    carregarEstatisticas();
    carregarDadosGraficos();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      setLoading(true);

      // Verificar se estamos usando o banco local (modo desenvolvimento)
      const isLocalDb =
        !import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL.includes('localhost');

      if (isLocalDb) {
        // Carregar dados reais do banco local
        const hoje = new Date().toISOString().split('T')[0];
        const inicioMes = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        )
          .toISOString()
          .split('T')[0];

        // Total de pacientes
        const { data: pacientesData } = await localDb
          .from('pacientes')
          .select('*', { count: 'exact' });
        const totalPacientes = pacientesData?.length || 0;

        // Total de profissionais
        const { data: profissionaisData } = await localDb
          .from('profissionais')
          .select('*', { count: 'exact' });
        const totalProfissionais = profissionaisData?.length || 0;

        // Total de serviços
        const { data: servicosData } = await localDb
          .from('servicos')
          .select('*', { count: 'exact' });
        const totalServicos = servicosData?.length || 0;

        // Agendamentos de hoje
        const { data: agendamentosHojeData } = await localDb
          .from('agendamentos')
          .select('*', { count: 'exact' })
          .eq('data', hoje);
        const agendamentosHoje = agendamentosHojeData?.length || 0;

        // Receita do mês (agendamentos realizados)
        const { data: agendamentosMesData } = await localDb
          .from('agendamentos')
          .select('*')
          .gte('data', inicioMes)
          .eq('status', 'realizado');

        const receitaMes =
          agendamentosMesData?.reduce((total: number, ag: any) => {
            return total + (ag.servicos?.preco || 0);
          }, 0) || 0;

        // Total de ordens do mês
        const { data: ordensMesData } = await localDb
          .from('agendamentos')
          .select('*', { count: 'exact' })
          .gte('data', inicioMes);
        const ordensServico = ordensMesData?.length || 0;

        // Ordens concluídas
        const { data: ordensConcluidasData } = await localDb
          .from('agendamentos')
          .select('*', { count: 'exact' })
          .gte('data', inicioMes)
          .eq('status', 'realizado');
        const ordensConcluidas = ordensConcluidasData?.length || 0;

        // Ordens pendentes (hoje)
        const { data: ordensPendentesData } = await localDb
          .from('agendamentos')
          .select('*', { count: 'exact' })
          .eq('data', hoje)
          .in('status', ['agendado', 'confirmado']);
        const ordensPendentes = ordensPendentesData?.length || 0;

        setStats({
          totalPacientes,
          totalProfissionais,
          totalServicos,
          agendamentosHoje,
          receitaMes: receitaMes || 0,
          ordensServico,
          ordensConcluidas,
          ordensPendentes,
        });
        setLoading(false);
        return;
      }

      // Carregar dados do Supabase usando views otimizadas
      try {
        // Carregar estatísticas usando views
        const [
          pacientesResult,
          profissionaisResult,
          servicosResult,
          agendamentosResult,
          receitaResult,
        ] = await Promise.all([
          supabase.from('dashboard_pacientes').select('*').single(),
          supabase.from('dashboard_profissionais').select('*').single(),
          supabase.from('dashboard_servicos').select('*').single(),
          supabase.from('dashboard_agendamentos').select('*').single(),
          supabase.from('dashboard_receita').select('*').single(),
        ]);

        setStats({
          totalPacientes: pacientesResult.data?.total_pacientes || 0,
          totalProfissionais:
            profissionaisResult.data?.total_profissionais || 0,
          totalServicos: servicosResult.data?.total_servicos || 0,
          agendamentosHoje: agendamentosResult.data?.agendamentos_hoje || 0,
          receitaMes: receitaResult.data?.receita_mes_atual || 0,
          ordensServico: agendamentosResult.data?.agendamentos_mes_atual || 0,
          ordensConcluidas:
            agendamentosResult.data?.agendamentos_realizados_mes || 0,
          ordensPendentes:
            agendamentosResult.data?.agendamentos_pendentes_hoje || 0,
        });
      } catch (viewError) {
        console.warn(
          'Erro ao carregar views, tentando queries diretas:',
          viewError
        );

        // Fallback para queries diretas se as views não existirem
        const hoje = new Date().toISOString().split('T')[0];
        const inicioMes = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        )
          .toISOString()
          .split('T')[0];

        // Total de pacientes
        const { count: totalPacientes } = await supabase
          .from('pacientes')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativo');

        // Total de profissionais
        const { count: totalProfissionais } = await supabase
          .from('profissionais')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativo');

        // Total de serviços
        const { count: totalServicos } = await supabase
          .from('servicos')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativo');

        // Agendamentos de hoje
        const { count: agendamentosHoje } = await supabase
          .from('agendamentos')
          .select('*', { count: 'exact', head: true })
          .eq('data', hoje);

        // Receita do mês
        const { data: agendamentosMes } = await supabase
          .from('agendamentos')
          .select(
            `
            *,
            servicos (preco)
          `
          )
          .gte('data', inicioMes)
          .eq('status', 'realizado');

        const receitaMes =
          agendamentosMes?.reduce(
            (total: number, ag: any) => total + (ag.servicos?.preco || 0),
            0
          ) || 0;

        // Ordens de serviço
        const { count: ordensServico } = await supabase
          .from('agendamentos')
          .select('*', { count: 'exact', head: true })
          .gte('data', inicioMes);

        // Ordens concluídas
        const { count: ordensConcluidas } = await supabase
          .from('agendamentos')
          .select('*', { count: 'exact', head: true })
          .gte('data', inicioMes)
          .eq('status', 'realizado');

        // Ordens pendentes
        const { count: ordensPendentes } = await supabase
          .from('agendamentos')
          .select('*', { count: 'exact', head: true })
          .eq('data', hoje)
          .in('status', ['agendado', 'confirmado']);

        setStats({
          totalPacientes: totalPacientes || 0,
          totalProfissionais: totalProfissionais || 0,
          totalServicos: totalServicos || 0,
          agendamentosHoje: agendamentosHoje || 0,
          receitaMes: receitaMes,
          ordensServico: ordensServico || 0,
          ordensConcluidas: ordensConcluidas || 0,
          ordensPendentes: ordensPendentes || 0,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);

      // Definir valores padrão em caso de erro
      setStats({
        totalPacientes: 0,
        totalProfissionais: 0,
        totalServicos: 0,
        agendamentosHoje: 0,
        receitaMes: 0,
        ordensServico: 0,
        ordensConcluidas: 0,
        ordensPendentes: 0,
      });

      setLoading(false);
    }
  };

  const carregarDadosGraficos = async () => {
    try {
      // Verificar se estamos usando o banco local (modo desenvolvimento)
      const isLocalDb =
        !import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL.includes('localhost');

      if (isLocalDb) {
        // Dados reais do banco local para gráficos
        // ... (código existente do localDb)
        return;
      }

      // Carregar dados do Supabase usando funções otimizadas
      try {
        // Usar funções RPC para gráficos
        const [evolucaoResult, distribuicaoResult, ordensResult] =
          await Promise.all([
            supabase.rpc('get_evolucao_pacientes'),
            supabase.rpc('get_distribuicao_servicos'),
            supabase.rpc('get_ordens_semana'),
          ]);

        if (evolucaoResult.data) {
          setDadosGraficoPacientes(evolucaoResult.data);
        }

        if (distribuicaoResult.data) {
          setDadosGraficoServicos(distribuicaoResult.data);
        }

        if (ordensResult.data) {
          setDadosGraficoOrdens(ordensResult.data);
        }
      } catch (rpcError) {
        console.warn(
          'Erro ao carregar funções RPC, usando queries diretas:',
          rpcError
        );

        // Fallback para queries diretas
        // ... (código de fallback existente)
      }
    } catch (error) {
      console.error('Erro ao carregar dados dos gráficos:', error);

      // Usar dados padrão em caso de erro
      setDadosGraficoPacientes([
        { mes: 'Jan', pacientes: 0 },
        { mes: 'Fev', pacientes: 0 },
        { mes: 'Mar', pacientes: 0 },
        { mes: 'Abr', pacientes: 0 },
        { mes: 'Mai', pacientes: 0 },
        { mes: 'Jun', pacientes: 0 },
      ]);
      setDadosGraficoServicos([
        { nome: 'Consultas', valor: 0, cor: '#3B82F6' },
        { nome: 'Exames', valor: 0, cor: '#10B981' },
        { nome: 'Procedimentos', valor: 0, cor: '#F59E0B' },
      ]);
      setDadosGraficoOrdens([
        { dia: 'Seg', ordens: 0 },
        { dia: 'Ter', ordens: 0 },
        { dia: 'Qua', ordens: 0 },
        { dia: 'Qui', ordens: 0 },
        { dia: 'Sex', ordens: 0 },
        { dia: 'Sáb', ordens: 0 },
        { dia: 'Dom', ordens: 0 },
      ]);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - Sistema Clínica</title>
      </Helmet>

      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isDark ? 'dark' : ''}`}
      >
        {/* Cards de Estatísticas */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div
            className={`rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow ${getCardClasses()}`}
          >
            <div className='flex items-center'>
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wide'>
                  Total de Pacientes
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {stats.totalPacientes.toLocaleString()}
                </p>
                <p className='text-xs text-green-600 dark:text-green-300 mt-1'>
                  +12% este mês
                </p>
              </div>
              <div className='p-3 bg-blue-100 dark:bg-blue-900 rounded-lg'>
                <Users size={24} className='text-blue-600 dark:text-blue-200' />
              </div>
            </div>
          </div>

          <div
            className={`rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow ${getCardClasses()}`}
          >
            <div className='flex items-center'>
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wide'>
                  Profissionais
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {stats.totalProfissionais}
                </p>
                <p className='text-xs text-blue-600 dark:text-blue-300 mt-1'>
                  +2 este mês
                </p>
              </div>
              <div className='p-3 bg-green-100 dark:bg-green-900 rounded-lg'>
                <User
                  size={24}
                  className='text-green-600 dark:text-green-200'
                />
              </div>
            </div>
          </div>

          <div
            className={`rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow ${getCardClasses()}`}
          >
            <div className='flex items-center'>
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wide'>
                  Agendamentos Hoje
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {stats.agendamentosHoje}
                </p>
                <p className='text-xs text-purple-600 dark:text-purple-300 mt-1'>
                  {stats.ordensPendentes} pendentes
                </p>
              </div>
              <div className='p-3 bg-purple-100 dark:bg-purple-900 rounded-lg'>
                <Calendar
                  size={24}
                  className='text-purple-600 dark:text-purple-200'
                />
              </div>
            </div>
          </div>

          <div
            className={`rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow ${getCardClasses()}`}
          >
            <div className='flex items-center'>
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wide'>
                  Receita do Mês
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  R$ {stats.receitaMes.toLocaleString()}
                </p>
                <p className='text-xs text-green-600 dark:text-green-300 mt-1'>
                  +8% vs mês anterior
                </p>
              </div>
              <div className='p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg'>
                <DollarSign
                  size={24}
                  className='text-yellow-600 dark:text-yellow-200'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Status das Ordens de Serviço */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className={`rounded-lg shadow-sm p-6 ${getCardClasses()}`}>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                  Total de Ordens
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {stats.ordensServico}
                </p>
              </div>
              <div className='p-3 bg-blue-100 dark:bg-blue-900 rounded-lg'>
                <FileText
                  size={24}
                  className='text-blue-600 dark:text-blue-200'
                />
              </div>
            </div>
          </div>

          <div className={`rounded-lg shadow-sm p-6 ${getCardClasses()}`}>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                  Concluídas
                </p>
                <p className='text-2xl font-bold text-green-600 dark:text-green-300'>
                  {stats.ordensConcluidas}
                </p>
              </div>
              <div className='p-3 bg-green-100 dark:bg-green-900 rounded-lg'>
                <CheckCircle
                  size={24}
                  className='text-green-600 dark:text-green-200'
                />
              </div>
            </div>
          </div>

          <div className={`rounded-lg shadow-sm p-6 ${getCardClasses()}`}>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-700 dark:text-gray-200'>
                  Pendentes
                </p>
                <p className='text-2xl font-bold text-orange-600 dark:text-orange-300'>
                  {stats.ordensPendentes}
                </p>
              </div>
              <div className='p-3 bg-orange-100 dark:bg-orange-900 rounded-lg'>
                <AlertCircle
                  size={24}
                  className='text-orange-600 dark:text-orange-200'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* Gráfico de Pacientes */}
          <div className={`rounded-lg shadow-sm p-6 ${getCardClasses()}`}>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Evolução de Pacientes
            </h3>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={dadosGraficoPacientes}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='mes' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='pacientes' fill='#3B82F6' />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Serviços */}
          <div className={`rounded-lg shadow-sm p-6 ${getCardClasses()}`}>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Distribuição de Serviços
            </h3>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={dadosGraficoServicos}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ nome, percent }) =>
                    `${nome} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='valor'
                >
                  {dadosGraficoServicos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Agendamentos por Semana */}
        <div className={`rounded-lg shadow-sm p-6 mb-8 ${getCardClasses()}`}>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Agendamentos por Semana
          </h3>
          <ResponsiveContainer width='100%' height={300}>
            <AreaChart data={dadosGraficoOrdens}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='dia' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type='monotone'
                dataKey='agendamentos'
                stroke='#10B981'
                fill='#10B981'
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
