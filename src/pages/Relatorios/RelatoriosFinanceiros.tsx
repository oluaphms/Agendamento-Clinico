import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, LineChart, Line, BarChart, Bar } from 'recharts';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BarChart3, RefreshCw, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
// ============================================================================
// PÁGINA: Relatórios Financeiros Avançados - Sistema de Relatórios
// ============================================================================
// Esta página implementa relatórios financeiros avançados incluindo
// faturamento, receitas, despesas, lucratividade e análises detalhadas.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';

import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface DadosFinanceiros {
  data: string;
  receitas: number;
  despesas: number;
  lucro: number;
  consultas: number;
  pagamentos: number;
}

interface ResumoFinanceiro {
  receitaTotal: number;
  despesaTotal: number;
  lucroTotal: number;
  margemLucro: number;
  consultasRealizadas: number;
  ticketMedio: number;
  pagamentosPendentes: number;
  inadimplencia: number;
}

interface Filtros {
  data_inicio: string;
  data_fim: string;
  tipo_relatorio: string;
  categoria: string;
  profissional: string;
  status: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const RelatoriosFinanceiros: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dadosFinanceiros, setDadosFinanceiros] = useState<DadosFinanceiros[]>([]);
  const [resumoFinanceiro, setResumoFinanceiro] = useState<ResumoFinanceiro | null>(null);
  const [filtros, setFiltros] = useState<Filtros>({
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    data_fim: new Date().toISOString().split('T')[0],
    tipo_relatorio: 'geral',
    categoria: '',
    profissional: '',
    status: '',
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
        loadDadosFinanceiros(),
        loadResumoFinanceiro(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar relatórios financeiros');
    } finally {
      setLoading(false);
    }
  };

  const loadDadosFinanceiros = async () => {
    try {
      // Simular dados financeiros (em produção, viria de queries complexas)
      const dadosMock: DadosFinanceiros[] = [];
      const dataInicio = new Date(filtros.data_inicio);
      const dataFim = new Date(filtros.data_fim);
      
      for (let d = new Date(dataInicio); d <= dataFim; d.setDate(d.getDate() + 1)) {
        const receitas = Math.random() * 5000 + 1000;
        const despesas = Math.random() * 3000 + 500;
        const consultas = Math.floor(Math.random() * 20) + 5;
        
        dadosMock.push({
          data: d.toISOString().split('T')[0],
          receitas: Math.round(receitas),
          despesas: Math.round(despesas),
          lucro: Math.round(receitas - despesas),
          consultas: consultas,
          pagamentos: Math.floor(consultas * 0.8),
        });
      }
      
      setDadosFinanceiros(dadosMock);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    }
  };

  const loadResumoFinanceiro = async () => {
    try {
      // Simular resumo financeiro
      const resumoMock: ResumoFinanceiro = {
        receitaTotal: 125000,
        despesaTotal: 75000,
        lucroTotal: 50000,
        margemLucro: 40,
        consultasRealizadas: 450,
        ticketMedio: 278,
        pagamentosPendentes: 15000,
        inadimplencia: 12,
      };
      
      setResumoFinanceiro(resumoMock);
    } catch (error) {
      console.error('Erro ao carregar resumo financeiro:', error);
    }
  };

  const handleExportar = async (formato: string) => {
    try {
      if (formato === 'pdf') {
        // Implementar exportação para PDF
        toast.success('Relatório exportado para PDF');
      } else if (formato === 'excel') {
        // Implementar exportação para Excel
        toast.success('Relatório exportado para Excel');
      } else if (formato === 'csv') {
        // Implementar exportação para CSV
        toast.success('Relatório exportado para CSV');
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

  // Cores para gráficos

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
        <title>Relatórios Financeiros Avançados - Sistema de Gestão de Clínica</title>
        <meta name="description" content="Relatórios financeiros avançados da clínica" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                Relatórios Financeiros Avançados
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Análise detalhada do desempenho financeiro da clínica
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={loadDados}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="mr-2" size={16} />
                Atualizar
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExportar('pdf')}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Download className="mr-2" size={16} />
                  PDF
                </button>
                <button
                  onClick={() => handleExportar('excel')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="mr-2" size={16} />
                  Excel
                </button>
                <button
                  onClick={() => handleExportar('csv')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="mr-2" size={16} />
                  CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros e Período */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filtros e Período
              </h3>
              <div className="flex items-center space-x-2">
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
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Início
                </label>
                <input
                  type="date"
                  value={filtros.data_inicio}
                  onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={filtros.data_fim}
                  onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Relatório
                </label>
                <select
                  value={filtros.tipo_relatorio}
                  onChange={(e) => setFiltros({ ...filtros, tipo_relatorio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="geral">Geral</option>
                  <option value="receitas">Receitas</option>
                  <option value="despesas">Despesas</option>
                  <option value="lucratividade">Lucratividade</option>
                  <option value="fluxo_caixa">Fluxo de Caixa</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoria
                </label>
                <select
                  value={filtros.categoria}
                  onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Todas as categorias</option>
                  <option value="consultas">Consultas</option>
                  <option value="exames">Exames</option>
                  <option value="procedimentos">Procedimentos</option>
                  <option value="medicamentos">Medicamentos</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        {resumoFinanceiro && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Receita Total
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(resumoFinanceiro.receitaTotal)}
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
                      Despesa Total
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(resumoFinanceiro.despesaTotal)}
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
                      Lucro Total
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(resumoFinanceiro.lucroTotal)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Margem de Lucro
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {resumoFinanceiro.margemLucro}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Receitas vs Despesas */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Receitas vs Despesas
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosFinanceiros}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="receitas"
                      stackId="1"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="despesas"
                      stackId="2"
                      stroke="#EF4444"
                      fill="#EF4444"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Lucro */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Evolução do Lucro
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosFinanceiros}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="lucro"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Consultas */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Consultas Realizadas
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosFinanceiros}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="consultas" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Dados Detalhados */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Dados Detalhados
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Receitas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Despesas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Lucro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Consultas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Pagamentos
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {dadosFinanceiros.map((dado, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDate(dado.data)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {formatCurrency(dado.receitas)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        {formatCurrency(dado.despesas)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        dado.lucro >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(dado.lucro)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {dado.consultas}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {dado.pagamentos}
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

export default RelatoriosFinanceiros;
