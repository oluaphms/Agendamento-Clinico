// ============================================================================
// PÁGINA: Fluxo de Caixa - Sistema Financeiro
// ============================================================================
// Esta página gerencia o fluxo de caixa da clínica, incluindo
// entradas, saídas e relatórios financeiros detalhados.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import { supabase } from '@/lib/supabase';
import { formatDate, formatCurrency } from '@/lib/utils';

import toast from 'react-hot-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUp, 
  ArrowDown, 
  BarChart3, 
  Filter, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface MovimentoCaixa {
  id: string;
  tipo: 'entrada' | 'saida';
  categoria: string;
  descricao: string;
  valor: number;
  data_movimento: string;
  forma_pagamento?: string;
  status: 'confirmado' | 'pendente' | 'cancelado';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface Filtros {
  tipo: string;
  categoria: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  busca: string;
}

interface ResumoFinanceiro {
  totalEntradas: number;
  totalSaidas: number;
  saldoAtual: number;
  entradasMes: number;
  saidasMes: number;
  saldoMes: number;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const FluxoCaixa: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [movimentos, setMovimentos] = useState<MovimentoCaixa[]>([]);
  const [resumo, setResumo] = useState<ResumoFinanceiro>({
    totalEntradas: 0,
    totalSaidas: 0,
    saldoAtual: 0,
    entradasMes: 0,
    saidasMes: 0,
    saldoMes: 0,
  });
  const [filtros, setFiltros] = useState<Filtros>({
    tipo: '',
    categoria: '',
    data_inicio: '',
    data_fim: '',
    status: '',
    busca: '',
  });
  const [viewMode, setViewMode] = useState<'lista' | 'grafico'>('lista');

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadMovimentos();
  }, [filtros]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadMovimentos = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('fluxo_caixa')
        .select('*')
        .order('data_movimento', { ascending: false });

      // Aplicar filtros
      if (filtros.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }
      if (filtros.categoria) {
        query = query.eq('categoria', filtros.categoria);
      }
      if (filtros.data_inicio) {
        query = query.gte('data_movimento', filtros.data_inicio);
      }
      if (filtros.data_fim) {
        query = query.lte('data_movimento', filtros.data_fim);
      }
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar movimentos:', error);
        toast.error('Erro ao carregar movimentos de caixa');
        return;
      }

      // Filtrar por busca se necessário
      let movimentosFiltrados = data || [];
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        movimentosFiltrados = movimentosFiltrados.filter((movimento: any) =>
          movimento.descricao.toLowerCase().includes(busca) ||
          movimento.categoria.toLowerCase().includes(busca) ||
          movimento.observacoes?.toLowerCase().includes(busca)
        );
      }

      setMovimentos(movimentosFiltrados);
      calcularResumo(movimentosFiltrados);
    } catch (error) {
      console.error('Erro ao carregar movimentos:', error);
      toast.error('Erro ao carregar movimentos de caixa');
    } finally {
      setLoading(false);
    }
  };

  const calcularResumo = (movimentos: MovimentoCaixa[]) => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    const movimentosConfirmados = movimentos.filter(m => m.status === 'confirmado');
    const movimentosMes = movimentosConfirmados.filter(m => 
      new Date(m.data_movimento) >= inicioMes
    );

    const totalEntradas = movimentosConfirmados
      .filter(m => m.tipo === 'entrada')
      .reduce((acc, m) => acc + m.valor, 0);

    const totalSaidas = movimentosConfirmados
      .filter(m => m.tipo === 'saida')
      .reduce((acc, m) => acc + m.valor, 0);

    const entradasMes = movimentosMes
      .filter(m => m.tipo === 'entrada')
      .reduce((acc, m) => acc + m.valor, 0);

    const saidasMes = movimentosMes
      .filter(m => m.tipo === 'saida')
      .reduce((acc, m) => acc + m.valor, 0);

    setResumo({
      totalEntradas,
      totalSaidas,
      saldoAtual: totalEntradas - totalSaidas,
      entradasMes,
      saidasMes,
      saldoMes: entradasMes - saidasMes,
    });
  };


  const handleExcluir = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este movimento?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('fluxo_caixa')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir movimento:', error);
        toast.error('Erro ao excluir movimento');
        return;
      }

      toast.success('Movimento excluído com sucesso');
      loadMovimentos();
    } catch (error) {
      console.error('Erro ao excluir movimento:', error);
      toast.error('Erro ao excluir movimento');
    }
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === 'entrada' ? (
      <ArrowUp className="h-5 w-5 text-green-500" />
    ) : (
      <ArrowDown className="h-5 w-5 text-red-500" />
    );
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'entrada' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const movimentosFiltrados = movimentos.filter(movimento => {
    const matchesTipo = !filtros.tipo || movimento.tipo === filtros.tipo;
    const matchesCategoria = !filtros.categoria || movimento.categoria === filtros.categoria;
    const matchesDataInicio = !filtros.data_inicio || new Date(movimento.data_movimento) >= new Date(filtros.data_inicio);
    const matchesDataFim = !filtros.data_fim || new Date(movimento.data_movimento) <= new Date(filtros.data_fim);
    const matchesStatus = !filtros.status || movimento.status === filtros.status;
    const matchesBusca = !filtros.busca || 
      movimento.descricao.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      movimento.categoria.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      movimento.observacoes?.toLowerCase().includes(filtros.busca.toLowerCase());

    return matchesTipo && matchesCategoria && matchesDataInicio && matchesDataFim && matchesStatus && matchesBusca;
  });

  // Dados para gráficos
  const dadosGrafico = movimentosFiltrados
    .filter(m => m.status === 'confirmado')
    .reduce((acc, movimento) => {
      const data = movimento.data_movimento.split('T')[0];
      const existing = acc.find(item => item.data === data);
      
      if (existing) {
        if (movimento.tipo === 'entrada') {
          existing.entradas += movimento.valor;
        } else {
          existing.saidas += movimento.valor;
        }
        existing.saldo = existing.entradas - existing.saidas;
      } else {
        acc.push({
          data,
          entradas: movimento.tipo === 'entrada' ? movimento.valor : 0,
          saidas: movimento.tipo === 'saida' ? movimento.valor : 0,
          saldo: movimento.tipo === 'entrada' ? movimento.valor : -movimento.valor,
        });
      }
      
      return acc;
    }, [] as any[])
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  const dadosPizza = [
    { name: 'Entradas', value: resumo.totalEntradas, color: '#10B981' },
    { name: 'Saídas', value: resumo.totalSaidas, color: '#EF4444' },
  ];

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
        <title>Fluxo de Caixa - Sistema de Gestão de Clínica</title>
        <meta name="description" content="Gerencie o fluxo de caixa da clínica" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                Fluxo de Caixa
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gerencie entradas, saídas e relatórios financeiros
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('lista')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'lista'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('grafico')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grafico'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Gráfico
                </button>
              </div>
              <button
                onClick={loadMovimentos}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="mr-2" size={16} />
                Atualizar
              </button>
              <button
                onClick={() => {}}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="mr-2" size={16} />
                Novo Movimento
              </button>
            </div>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total Entradas
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(resumo.totalEntradas)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total Saídas
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(resumo.totalSaidas)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Saldo Atual
                  </p>
                  <p className={`text-2xl font-bold ${
                    resumo.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(resumo.saldoAtual)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ArrowUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Entradas Mês
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(resumo.entradasMes)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ArrowDown className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Saídas Mês
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(resumo.saidasMes)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Saldo Mês
                  </p>
                  <p className={`text-2xl font-bold ${
                    resumo.saldoMes >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(resumo.saldoMes)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filtros:
                  </span>
                </div>
                <select
                  value={filtros.tipo}
                  onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Todos os tipos</option>
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
                <select
                  value={filtros.status}
                  onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Todos os status</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="pendente">Pendente</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={filtros.data_inicio}
                  onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  placeholder="Data início"
                />
                <input
                  type="date"
                  value={filtros.data_fim}
                  onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  placeholder="Data fim"
                />
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar movimentos..."
                    value={filtros.busca}
                    onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm min-w-[200px]"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo Principal */}
        {viewMode === 'lista' ? (
          /* Lista de Movimentos */
          <div className="space-y-4">
            {movimentosFiltrados.map((movimento) => (
              <Card key={movimento.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getTipoIcon(movimento.tipo)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(movimento.status)}`}>
                          {movimento.status.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {movimento.descricao}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {movimento.categoria} • {formatDate(movimento.data_movimento)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getTipoColor(movimento.tipo)}`}>
                          {movimento.tipo === 'entrada' ? '+' : '-'}{formatCurrency(movimento.valor)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {movimento.forma_pagamento || 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {}}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {}}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleExcluir(movimento.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {movimento.observacoes && (
                    <div className="mt-4">
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Observações</p>
                      <p className="text-gray-900 dark:text-white text-sm">{movimento.observacoes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Gráficos */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Fluxo de Caixa por Período
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dadosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="entradas" stroke="#10B981" strokeWidth={2} name="Entradas" />
                    <Line type="monotone" dataKey="saidas" stroke="#EF4444" strokeWidth={2} name="Saídas" />
                    <Line type="monotone" dataKey="saldo" stroke="#3B82F6" strokeWidth={2} name="Saldo" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Distribuição de Entradas e Saídas
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                   <PieChart>
                    <Pie
                      data={dadosPizza}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dadosPizza.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mensagem quando não há movimentos */}
        {movimentosFiltrados.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum movimento encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Não há movimentos que correspondam aos filtros selecionados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FluxoCaixa;
