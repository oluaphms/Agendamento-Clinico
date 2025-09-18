// ============================================================================
// PÁGINA: Contas a Receber - Sistema Financeiro
// ============================================================================
// Esta página gerencia todas as contas a receber, incluindo
// vencimentos, cobrança e controle de inadimplência.
// ============================================================================

// @ts-ignore
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  CreditCard,
  RefreshCw,
  Plus,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  DollarSign,
} from 'lucide-react';

import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate, formatPhone } from '@/lib/utils';

import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface ContaReceber {
  id: string;
  paciente_id: string;
  agendamento_id: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  forma_pagamento?: string;
  data_pagamento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  paciente?: {
    nome: string;
    telefone: string;
    email?: string;
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
  data_vencimento_inicio: string;
  data_vencimento_fim: string;
  busca: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const ContasReceber: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    status: '',
    data_vencimento_inicio: '',
    data_vencimento_fim: '',
    busca: '',
  });
  // @ts-ignore
  const [modalAberto, setModalAberto] = useState(false);
  // @ts-ignore
  const [contaSelecionada, setContaSelecionada] = useState<ContaReceber | null>(
    null
  );

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadContas = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('contas_receber')
        .select(
          `
          *,
          paciente:pacientes(nome, telefone, email),
          agendamento:agendamentos(
            data,
            hora,
            servico:servicos(nome, valor)
          )
        `
        )
        .order('data_vencimento', { ascending: true });

      // Aplicar filtros
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros.data_vencimento_inicio) {
        query = query.gte('data_vencimento', filtros.data_vencimento_inicio);
      }
      if (filtros.data_vencimento_fim) {
        query = query.lte('data_vencimento', filtros.data_vencimento_fim);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar contas a receber:', error);
        toast.error('Erro ao carregar contas a receber');
        return;
      }

      // Filtrar por busca se necessário
      let contasFiltradas = data || [];
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        contasFiltradas = contasFiltradas.filter(
          (conta: ContaReceber) =>
            conta.paciente?.nome.toLowerCase().includes(busca) ||
            conta.descricao.toLowerCase().includes(busca) ||
            conta.observacoes?.toLowerCase().includes(busca)
        );
      }

      setContas(contasFiltradas);
    } catch (error) {
      console.error('Erro ao carregar contas a receber:', error);
      toast.error('Erro ao carregar contas a receber');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadContas();
  }, [loadContas]);

  // const handleStatusChange = async (id: string, novoStatus: string) => {
  //   try {
  //     const { error } = await supabase
  //       .from('contas_receber')
  //       .update({
  //         status: novoStatus,
  //         data_pagamento: novoStatus === 'pago' ? new Date().toISOString() : null
  //       })
  //       .eq('id', id);

  //     if (error) {
  //       console.error('Erro ao atualizar status:', error);
  //       toast.error('Erro ao atualizar status da conta');
  //       return;
  //     }

  //     toast.success('Status atualizado com sucesso');
  //     loadContas();
  //   } catch (error) {
  //     console.error('Erro ao atualizar status:', error);
  //     toast.error('Erro ao atualizar status da conta');
  //   }
  // };

  const handleExcluir = async (id: string) => {
    if (
      !window.confirm('Tem certeza que deseja excluir esta conta a receber?')
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from('contas_receber')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir conta:', error);
        toast.error('Erro ao excluir conta a receber');
        return;
      }

      toast.success('Conta a receber excluída com sucesso');
      loadContas();
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast.error('Erro ao excluir conta a receber');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className='h-5 w-5 text-green-500' />;
      case 'pendente':
        return <Clock className='h-5 w-5 text-yellow-500' />;
      case 'vencido':
        return <AlertTriangle className='h-5 w-5 text-red-500' />;
      case 'cancelado':
        return <XCircle className='h-5 w-5 text-gray-500' />;
      default:
        return <Clock className='h-5 w-5 text-gray-500' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'vencido':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cancelado':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const isVencida = (dataVencimento: string) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    return vencimento < hoje;
  };

  const getDiasVencimento = (dataVencimento: string) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const contasFiltradas = contas.filter(conta => {
    const matchesStatus = !filtros.status || conta.status === filtros.status;
    const matchesDataInicio =
      !filtros.data_vencimento_inicio ||
      new Date(conta.data_vencimento) >=
        new Date(filtros.data_vencimento_inicio);
    const matchesDataFim =
      !filtros.data_vencimento_fim ||
      new Date(conta.data_vencimento) <= new Date(filtros.data_vencimento_fim);
    const matchesBusca =
      !filtros.busca ||
      conta.paciente?.nome
        .toLowerCase()
        .includes(filtros.busca.toLowerCase()) ||
      conta.descricao.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      conta.observacoes?.toLowerCase().includes(filtros.busca.toLowerCase());

    return matchesStatus && matchesDataInicio && matchesDataFim && matchesBusca;
  });

  // Estatísticas
  const totalContas = contas.length;
  const contasPendentes = contas.filter(c => c.status === 'pendente').length;
  const contasVencidas = contas.filter(
    c =>
      c.status === 'vencido' ||
      (c.status === 'pendente' && isVencida(c.data_vencimento))
  ).length;
  // const valorTotal = contas.filter(c => c.status === 'pago').reduce((acc, c) => acc + c.valor, 0);
  const valorPendente = contas
    .filter(c => c.status === 'pendente')
    .reduce((acc, c) => acc + c.valor, 0);

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
        <title>Contas a Receber - Sistema de Gestão de Clínica</title>
        <meta name='description' content='Gerencie todas as contas a receber' />
      </Helmet>

      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3'>
                <CreditCard className='h-8 w-8 text-blue-600' />
                Contas a Receber
              </h1>
              <p className='text-gray-600 dark:text-gray-400 mt-2'>
                Gerencie todas as contas a receber e controle de inadimplência
              </p>
            </div>
            <div className='flex items-center gap-4'>
              <button
                onClick={loadContas}
                className='flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
              >
                <RefreshCw className='mr-2' size={16} />
                Atualizar
              </button>
              <button
                onClick={() => setModalAberto(true)}
                className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <Plus className='mr-2' size={16} />
                Nova Conta
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <CreditCard className='h-8 w-8 text-blue-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Total de Contas
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {totalContas}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Clock className='h-8 w-8 text-yellow-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Pendentes
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {contasPendentes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <AlertTriangle className='h-8 w-8 text-red-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Vencidas
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {contasVencidas}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <DollarSign className='h-8 w-8 text-green-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Valor Pendente
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {formatCurrency(valorPendente)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0'>
              <div className='flex items-center space-x-4'>
                <div className='flex items-center space-x-2'>
                  <Filter className='h-5 w-5 text-gray-500' />
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Filtros:
                  </span>
                </div>
                <select
                  value={filtros.status}
                  onChange={e =>
                    setFiltros({ ...filtros, status: e.target.value })
                  }
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
                >
                  <option value=''>Todos os status</option>
                  <option value='pendente'>Pendente</option>
                  <option value='pago'>Pago</option>
                  <option value='vencido'>Vencido</option>
                  <option value='cancelado'>Cancelado</option>
                </select>
              </div>
              <div className='flex items-center space-x-4'>
                <input
                  type='date'
                  value={filtros.data_vencimento_inicio}
                  onChange={e =>
                    setFiltros({
                      ...filtros,
                      data_vencimento_inicio: e.target.value,
                    })
                  }
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
                  placeholder='Vencimento início'
                />
                <input
                  type='date'
                  value={filtros.data_vencimento_fim}
                  onChange={e =>
                    setFiltros({
                      ...filtros,
                      data_vencimento_fim: e.target.value,
                    })
                  }
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
                  placeholder='Vencimento fim'
                />
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Buscar contas...'
                    value={filtros.busca}
                    onChange={e =>
                      setFiltros({ ...filtros, busca: e.target.value })
                    }
                    className='pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm min-w-[200px]'
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Contas */}
        <div className='space-y-4'>
          {contasFiltradas.map(conta => {
            const diasVencimento = getDiasVencimento(conta.data_vencimento);
            const vencida = isVencida(conta.data_vencimento);

            return (
              <Card
                key={conta.id}
                className={`hover:shadow-lg transition-shadow ${
                  vencida && conta.status === 'pendente'
                    ? 'border-red-200 dark:border-red-800'
                    : ''
                }`}
              >
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                      <div className='flex items-center space-x-2'>
                        {getStatusIcon(conta.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conta.status)}`}
                        >
                          {conta.status.toUpperCase()}
                        </span>
                        {vencida && conta.status === 'pendente' && (
                          <span className='px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'>
                            VENCIDA
                          </span>
                        )}
                      </div>
                      <div className='text-sm text-gray-600 dark:text-gray-400'>
                        <div className='flex items-center space-x-1'>
                          <Calendar className='h-4 w-4' />
                          <span>
                            Vence em {formatDate(conta.data_vencimento)}
                          </span>
                        </div>
                        {conta.status === 'pendente' && (
                          <div className='flex items-center space-x-1 mt-1'>
                            {diasVencimento > 0 ? (
                              <>
                                <TrendingUp className='h-4 w-4 text-green-500' />
                                <span className='text-green-600 dark:text-green-400'>
                                  {diasVencimento} dias restantes
                                </span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className='h-4 w-4 text-red-500' />
                                <span className='text-red-600 dark:text-red-400'>
                                  {Math.abs(diasVencimento)} dias em atraso
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div className='text-right'>
                        <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                          {formatCurrency(conta.valor)}
                        </p>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          {conta.descricao}
                        </p>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <button
                          onClick={() => setContaSelecionada(conta)}
                          className='p-2 text-gray-400 hover:text-blue-600 transition-colors'
                          title='Ver detalhes'
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setContaSelecionada(conta)}
                          className='p-2 text-gray-400 hover:text-green-600 transition-colors'
                          title='Editar'
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleExcluir(conta.id)}
                          className='p-2 text-gray-400 hover:text-red-600 transition-colors'
                          title='Excluir'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                    <div>
                      <p className='text-gray-600 dark:text-gray-400'>
                        Paciente
                      </p>
                      <p className='font-medium text-gray-900 dark:text-white'>
                        {conta.paciente?.nome || 'N/A'}
                      </p>
                      <p className='text-gray-500 dark:text-gray-400'>
                        {formatPhone(conta.paciente?.telefone || '')}
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-600 dark:text-gray-400'>
                        Agendamento
                      </p>
                      <p className='font-medium text-gray-900 dark:text-white'>
                        {conta.agendamento?.data
                          ? formatDate(conta.agendamento.data)
                          : 'N/A'}
                      </p>
                      <p className='text-gray-500 dark:text-gray-400'>
                        {conta.agendamento?.hora || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {conta.observacoes && (
                    <div className='mt-4'>
                      <p className='text-gray-600 dark:text-gray-400 text-sm'>
                        Observações
                      </p>
                      <p className='text-gray-900 dark:text-white text-sm'>
                        {conta.observacoes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mensagem quando não há contas */}
        {contasFiltradas.length === 0 && (
          <Card className='text-center py-12'>
            <CardContent>
              <CreditCard className='mx-auto h-12 w-12 text-gray-400 mb-4' />
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                Nenhuma conta a receber encontrada
              </h3>
              <p className='text-gray-500 dark:text-gray-400'>
                Não há contas que correspondam aos filtros selecionados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ContasReceber;
