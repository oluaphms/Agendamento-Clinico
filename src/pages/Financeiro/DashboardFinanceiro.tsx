// ============================================================================
// PÁGINA: Dashboard Financeiro - Sistema Financeiro
// ============================================================================
// Esta página fornece uma visão geral completa das finanças da clínica,
// incluindo métricas, gráficos e indicadores de performance.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Clock,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Users,
  FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface MetricasFinanceiras {
  receitaTotal: number;
  receitaMes: number;
  receitaAnterior: number;
  despesasTotal: number;
  despesasMes: number;
  despesasAnterior: number;
  lucroTotal: number;
  lucroMes: number;
  lucroAnterior: number;
  margemLucro: number;
  pagamentosPendentes: number;
  contasVencidas: number;
  valorContasVencidas: number;
  ticketMedio: number;
  ticketMedioAnterior: number;
  crescimentoReceita: number;
  crescimentoLucro: number;
}

interface DadosGrafico {
  data: string;
  receita: number;
  despesas: number;
  lucro: number;
  pagamentos: number;
}

interface DadosCategoria {
  categoria: string;
  valor: number;
  percentual: number;
  cor: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const DashboardFinanceiro: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [metricas, setMetricas] = useState<MetricasFinanceiras>({
    receitaTotal: 0,
    receitaMes: 0,
    receitaAnterior: 0,
    despesasTotal: 0,
    despesasMes: 0,
    despesasAnterior: 0,
    lucroTotal: 0,
    lucroMes: 0,
    lucroAnterior: 0,
    margemLucro: 0,
    pagamentosPendentes: 0,
    contasVencidas: 0,
    valorContasVencidas: 0,
    ticketMedio: 0,
    ticketMedioAnterior: 0,
    crescimentoReceita: 0,
    crescimentoLucro: 0,
  });
  const [dadosGrafico, setDadosGrafico] = useState<DadosGrafico[]>([]);
  const [dadosCategorias, setDadosCategorias] = useState<DadosCategoria[]>([]);
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadDados();
  }, [periodo]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadDados = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMetricas(),
        loadDadosGrafico(),
        loadDadosCategorias(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const loadMetricas = async () => {
    try {
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);

      // Receitas
      const { data: receitas } = await supabase
        .from('pagamentos')
        .select('valor, created_at')
        .eq('status', 'pago');

      const { data: despesas } = await supabase
        .from('fluxo_caixa')
        .select('valor, data_movimento, tipo')
        .eq('status', 'confirmado')
        .eq('tipo', 'saida');

      const { data: pagamentosPendentes } = await supabase
        .from('pagamentos')
        .select('valor')
        .eq('status', 'pendente');

      const { data: contasVencidas } = await supabase
        .from('contas_receber')
        .select('valor, data_vencimento')
        .eq('status', 'pendente')
        .lt('data_vencimento', hoje.toISOString().split('T')[0]);

      // Calcular métricas
      const receitaTotal = receitas?.reduce((acc, r) => acc + r.valor, 0) || 0;
      const receitaMes = receitas?.filter(r => 
        new Date(r.created_at) >= inicioMes
      ).reduce((acc, r) => acc + r.valor, 0) || 0;
      const receitaAnterior = receitas?.filter(r => {
        const data = new Date(r.created_at);
        return data >= inicioMesAnterior && data <= fimMesAnterior;
      }).reduce((acc, r) => acc + r.valor, 0) || 0;

      const despesasTotal = despesas?.reduce((acc, d) => acc + d.valor, 0) || 0;
      const despesasMes = despesas?.filter(d => 
        new Date(d.data_movimento) >= inicioMes
      ).reduce((acc, d) => acc + d.valor, 0) || 0;
      const despesasAnterior = despesas?.filter(d => {
        const data = new Date(d.data_movimento);
        return data >= inicioMesAnterior && data <= fimMesAnterior;
      }).reduce((acc, d) => acc + d.valor, 0) || 0;

      const lucroTotal = receitaTotal - despesasTotal;
      const lucroMes = receitaMes - despesasMes;
      const lucroAnterior = receitaAnterior - despesasAnterior;

      const margemLucro = receitaMes > 0 ? (lucroMes / receitaMes) * 100 : 0;

      const pagamentosPendentesCount = pagamentosPendentes?.length || 0;
      const contasVencidasCount = contasVencidas?.length || 0;
      const valorContasVencidas = contasVencidas?.reduce((acc, c) => acc + c.valor, 0) || 0;

      const ticketMedio = receitas?.length ? receitaTotal / receitas.length : 0;
      const ticketMedioAnterior = receitas?.filter(r => {
        const data = new Date(r.created_at);
        return data >= inicioMesAnterior && data <= fimMesAnterior;
      }).length || 0;
      const ticketMedioAnteriorValor = ticketMedioAnterior > 0 ? 
        receitaAnterior / ticketMedioAnterior : 0;

      const crescimentoReceita = receitaAnterior > 0 ? 
        ((receitaMes - receitaAnterior) / receitaAnterior) * 100 : 0;
      const crescimentoLucro = lucroAnterior > 0 ? 
        ((lucroMes - lucroAnterior) / lucroAnterior) * 100 : 0;

      setMetricas({
        receitaTotal,
        receitaMes,
        receitaAnterior,
        despesasTotal,
        despesasMes,
        despesasAnterior,
        lucroTotal,
        lucroMes,
        lucroAnterior,
        margemLucro,
        pagamentosPendentes: pagamentosPendentesCount,
        contasVencidas: contasVencidasCount,
        valorContasVencidas,
        ticketMedio,
        ticketMedioAnterior: ticketMedioAnteriorValor,
        crescimentoReceita,
        crescimentoLucro,
      });
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  };

  const loadDadosGrafico = async () => {
    try {
      const hoje = new Date();
      const diasAtras = periodo === '7d' ? 7 : periodo === '30d' ? 30 : period === '90d' ? 90 : 365;
      const dataInicio = new Date(hoje.getTime() - diasAtras * 24 * 60 * 60 * 1000);

      const { data: pagamentos } = await supabase
        .from('pagamentos')
        .select('valor, created_at, status')
        .gte('created_at', dataInicio.toISOString());

      const { data: despesas } = await supabase
        .from('fluxo_caixa')
        .select('valor, data_movimento, tipo')
        .gte('data_movimento', dataInicio.toISOString().split('T')[0])
        .eq('tipo', 'saida')
        .eq('status', 'confirmado');

      // Agrupar por data
      const dadosPorData: { [key: string]: DadosGrafico } = {};

      // Inicializar todas as datas do período
      for (let i = 0; i < diasAtras; i++) {
        const data = new Date(hoje.getTime() - i * 24 * 60 * 60 * 1000);
        const dataStr = data.toISOString().split('T')[0];
        dadosPorData[dataStr] = {
          data: dataStr,
          receita: 0,
          despesas: 0,
          lucro: 0,
          pagamentos: 0,
        };
      }

      // Processar pagamentos
      pagamentos?.forEach(pagamento => {
        if (pagamento.status === 'pago') {
          const data = pagamento.created_at.split('T')[0];
          if (dadosPorData[data]) {
            dadosPorData[data].receita += pagamento.valor;
            dadosPorData[data].pagamentos += 1;
          }
        }
      });

      // Processar despesas
      despesas?.forEach(despesa => {
        const data = despesa.data_movimento;
        if (dadosPorData[data]) {
          dadosPorData[data].despesas += despesa.valor;
        }
      });

      // Calcular lucro e ordenar
      const dados = Object.values(dadosPorData)
        .map(d => ({
          ...d,
          lucro: d.receita - d.despesas,
        }))
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

      setDadosGrafico(dados);
    } catch (error) {
      console.error('Erro ao carregar dados do gráfico:', error);
    }
  };

  const loadDadosCategorias = async () => {
    try {
      const { data: despesas } = await supabase
        .from('fluxo_caixa')
        .select('categoria, valor')
        .eq('tipo', 'saida')
        .eq('status', 'confirmado');

      const totalDespesas = despesas?.reduce((acc, d) => acc + d.valor, 0) || 0;

      const categorias: { [key: string]: number } = {};
      despesas?.forEach(despesa => {
        categorias[despesa.categoria] = (categorias[despesa.categoria] || 0) + despesa.valor;
      });

      const cores = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

      const dados = Object.entries(categorias)
        .map(([categoria, valor], index) => ({
          categoria,
          valor,
          percentual: totalDespesas > 0 ? (valor / totalDespesas) * 100 : 0,
          cor: cores[index % cores.length],
        }))
        .sort((a, b) => b.valor - a.valor);

      setDadosCategorias(dados);
    } catch (error) {
      console.error('Erro ao carregar dados das categorias:', error);
    }
  };

  const getCrescimentoIcon = (valor: number) => {
    return valor >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getCrescimentoColor = (valor: number) => {
    return valor >= 0 ? 'text-green-600' : 'text-red-600';
  };

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
        <title>Dashboard Financeiro - Sistema de Gestão de Clínica</title>
        <meta name="description" content="Visão geral das finanças da clínica" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                Dashboard Financeiro
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Visão geral das finanças e performance da clínica
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="1y">Último ano</option>
              </select>
              <button
                onClick={loadDados}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="mr-2" size={16} />
                Atualizar
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="mr-2" size={16} />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Receita Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(metricas.receitaTotal)}
                  </p>
                  <div className="flex items-center mt-2">
                    {getCrescimentoIcon(metricas.crescimentoReceita)}
                    <span className={`text-sm font-medium ml-1 ${getCrescimentoColor(metricas.crescimentoReceita)}`}>
                      {Math.abs(metricas.crescimentoReceita).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Despesas Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(metricas.despesasTotal)}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Margem: {metricas.margemLucro.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Lucro Total
                  </p>
                  <p className={`text-2xl font-bold ${
                    metricas.lucroTotal >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(metricas.lucroTotal)}
                  </p>
                  <div className="flex items-center mt-2">
                    {getCrescimentoIcon(metricas.crescimentoLucro)}
                    <span className={`text-sm font-medium ml-1 ${getCrescimentoColor(metricas.crescimentoLucro)}`}>
                      {Math.abs(metricas.crescimentoLucro).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Ticket Médio
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(metricas.ticketMedio)}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {metricas.pagamentosPendentes} pendentes
                    </span>
                  </div>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas e Indicadores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className={metricas.contasVencidas > 0 ? 'border-red-200 dark:border-red-800' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Contas Vencidas
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metricas.contasVencidas}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(metricas.valorContasVencidas)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Pagamentos Pendentes
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metricas.pagamentosPendentes}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aguardando confirmação
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Performance
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metricas.margemLucro.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Margem de lucro
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Fluxo de Caixa
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area type="monotone" dataKey="receita" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Receita" />
                  <Area type="monotone" dataKey="despesas" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Despesas" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Distribuição de Despesas
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={dadosCategorias}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ categoria, percentual }) => `${categoria} ${percentual.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="valor"
                  >
                    {dadosCategorias.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Barras - Receita vs Despesas */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Receita vs Despesas por Período
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="receita" fill="#10B981" name="Receita" />
                <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resumo das Categorias */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resumo por Categoria de Despesas
            </h3>
            <div className="space-y-4">
              {dadosCategorias.map((categoria, index) => (
                <div key={categoria.categoria} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: categoria.cor }}
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {categoria.categoria}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(categoria.valor)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {categoria.percentual.toFixed(1)}%
                    </p>
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

export default DashboardFinanceiro;
