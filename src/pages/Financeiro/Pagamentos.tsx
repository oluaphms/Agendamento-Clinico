// ============================================================================
// PÁGINA: Gestão de Pagamentos - Sistema Financeiro
// ============================================================================
// Esta página gerencia todos os pagamentos do sistema, incluindo
// registro, acompanhamento e controle de status dos pagamentos.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  CreditCard,
  Smartphone,
  Banknote,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate, formatPhone } from '@/lib/utils';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface Pagamento {
  id: string;
  agendamento_id: string;
  paciente_id: string;
  profissional_id: string;
  valor: number;
  forma_pagamento: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'boleto' | 'transferencia';
  status: 'pendente' | 'pago' | 'cancelado' | 'estornado' | 'processando';
  data_pagamento?: string;
  data_vencimento?: string;
  codigo_transacao?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  paciente?: {
    nome: string;
    telefone: string;
    email?: string;
  };
  profissional?: {
    nome: string;
    especialidade: string;
  };
  agendamento?: {
    data: string;
    hora: string;
    servico: {
      nome: string;
      valor: number;
    };
  };
}

interface Filtros {
  status: string;
  forma_pagamento: string;
  data_inicio: string;
  data_fim: string;
  busca: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Pagamentos: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    status: '',
    forma_pagamento: '',
    data_inicio: '',
    data_fim: '',
    busca: '',
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<Pagamento | null>(null);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadPagamentos();
  }, [filtros]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadPagamentos = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('pagamentos')
        .select(`
          *,
          paciente:pacientes(nome, telefone, email),
          profissional:profissionais(nome, especialidade),
          agendamento:agendamentos(
            data,
            hora,
            servico:servicos(nome, valor)
          )
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros.forma_pagamento) {
        query = query.eq('forma_pagamento', filtros.forma_pagamento);
      }
      if (filtros.data_inicio) {
        query = query.gte('created_at', filtros.data_inicio);
      }
      if (filtros.data_fim) {
        query = query.lte('created_at', filtros.data_fim);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar pagamentos:', error);
        toast.error('Erro ao carregar pagamentos');
        return;
      }

      // Filtrar por busca se necessário
      let pagamentosFiltrados = data || [];
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        pagamentosFiltrados = pagamentosFiltrados.filter(pagamento =>
          pagamento.paciente?.nome.toLowerCase().includes(busca) ||
          pagamento.codigo_transacao?.toLowerCase().includes(busca) ||
          pagamento.observacoes?.toLowerCase().includes(busca)
        );
      }

      setPagamentos(pagamentosFiltrados);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      toast.error('Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('pagamentos')
        .update({ 
          status: novoStatus,
          data_pagamento: novoStatus === 'pago' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast.error('Erro ao atualizar status do pagamento');
        return;
      }

      toast.success('Status atualizado com sucesso');
      loadPagamentos();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do pagamento');
    }
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este pagamento?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pagamentos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir pagamento:', error);
        toast.error('Erro ao excluir pagamento');
        return;
      }

      toast.success('Pagamento excluído com sucesso');
      loadPagamentos();
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      toast.error('Erro ao excluir pagamento');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pendente':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processando':
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      case 'cancelado':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'estornado':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'processando':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'estornado':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getFormaPagamentoIcon = (forma: string) => {
    switch (forma) {
      case 'pix':
        return <Smartphone className="h-4 w-4" />;
      case 'cartao_credito':
      case 'cartao_debito':
        return <CreditCard className="h-4 w-4" />;
      case 'dinheiro':
        return <Banknote className="h-4 w-4" />;
      case 'boleto':
        return <FileText className="h-4 w-4" />;
      case 'transferencia':
        return <Banknote className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getFormaPagamentoLabel = (forma: string) => {
    const labels = {
      pix: 'PIX',
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      dinheiro: 'Dinheiro',
      boleto: 'Boleto',
      transferencia: 'Transferência',
    };
    return labels[forma as keyof typeof labels] || forma;
  };

  const pagamentosFiltrados = pagamentos.filter(pagamento => {
    const matchesStatus = !filtros.status || pagamento.status === filtros.status;
    const matchesForma = !filtros.forma_pagamento || pagamento.forma_pagamento === filtros.forma_pagamento;
    const matchesDataInicio = !filtros.data_inicio || new Date(pagamento.created_at) >= new Date(filtros.data_inicio);
    const matchesDataFim = !filtros.data_fim || new Date(pagamento.created_at) <= new Date(filtros.data_fim);
    const matchesBusca = !filtros.busca || 
      pagamento.paciente?.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      pagamento.codigo_transacao?.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      pagamento.observacoes?.toLowerCase().includes(filtros.busca.toLowerCase());

    return matchesStatus && matchesForma && matchesDataInicio && matchesDataFim && matchesBusca;
  });

  // Estatísticas
  const totalPagamentos = pagamentos.length;
  const pagamentosPagos = pagamentos.filter(p => p.status === 'pago').length;
  const pagamentosPendentes = pagamentos.filter(p => p.status === 'pendente').length;
  const valorTotal = pagamentos.filter(p => p.status === 'pago').reduce((acc, p) => acc + p.valor, 0);

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
        <title>Gestão de Pagamentos - Sistema de Gestão de Clínica</title>
        <meta name="description" content="Gerencie todos os pagamentos do sistema" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-blue-600" />
                Gestão de Pagamentos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gerencie todos os pagamentos e transações financeiras
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={loadPagamentos}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="mr-2" size={16} />
                Atualizar
              </button>
              <button
                onClick={() => setModalAberto(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="mr-2" size={16} />
                Novo Pagamento
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total de Pagamentos
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalPagamentos}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Pagos
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {pagamentosPagos}
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
                    Pendentes
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {pagamentosPendentes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Banknote className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Valor Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(valorTotal)}
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
                  value={filtros.status}
                  onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Todos os status</option>
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="processando">Processando</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="estornado">Estornado</option>
                </select>
                <select
                  value={filtros.forma_pagamento}
                  onChange={(e) => setFiltros({ ...filtros, forma_pagamento: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Todas as formas</option>
                  <option value="pix">PIX</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="boleto">Boleto</option>
                  <option value="transferencia">Transferência</option>
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
                    placeholder="Buscar pagamentos..."
                    value={filtros.busca}
                    onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm min-w-[200px]"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Pagamentos */}
        <div className="space-y-4">
          {pagamentosFiltrados.map((pagamento) => (
            <Card key={pagamento.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(pagamento.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pagamento.status)}`}>
                        {pagamento.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getFormaPagamentoIcon(pagamento.forma_pagamento)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getFormaPagamentoLabel(pagamento.forma_pagamento)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(pagamento.valor)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(pagamento.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPagamentoSelecionado(pagamento)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setPagamentoSelecionado(pagamento)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleExcluir(pagamento.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Paciente</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {pagamento.paciente?.nome || 'N/A'}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {formatPhone(pagamento.paciente?.telefone || '')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Profissional</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {pagamento.profissional?.nome || 'N/A'}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {pagamento.profissional?.especialidade || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Agendamento</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {pagamento.agendamento?.data ? formatDate(pagamento.agendamento.data) : 'N/A'}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {pagamento.agendamento?.hora || 'N/A'}
                    </p>
                  </div>
                </div>

                {pagamento.observacoes && (
                  <div className="mt-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Observações</p>
                    <p className="text-gray-900 dark:text-white text-sm">{pagamento.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensagem quando não há pagamentos */}
        {pagamentosFiltrados.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum pagamento encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Não há pagamentos que correspondam aos filtros selecionados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Pagamentos;
