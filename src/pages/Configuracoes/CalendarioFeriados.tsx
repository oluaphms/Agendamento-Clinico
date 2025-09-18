// ============================================================================
// PÁGINA: Calendário de Feriados - Sistema de Configurações Avançadas
// ============================================================================
// Esta página implementa o calendário de feriados da clínica, incluindo
// feriados nacionais, estaduais, municipais e feriados personalizados.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Flag,
  MapPin,
  Building2,
  Settings,
  Calendar,
  RefreshCw,
  Plus,
  CheckCircle,
  Repeat,
  Sun,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
} from 'lucide-react';

import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface Feriado {
  id: string;
  configuracao_clinica_id: string;
  nome: string;
  data: string;
  tipo: string; // 'nacional', 'estadual', 'municipal', 'personalizado'
  descricao?: string;
  ativo: boolean;
  recorrente: boolean; // Se é um feriado que se repete todo ano
  created_at: string;
  updated_at: string;
}

interface Filtros {
  busca: string;
  tipo: string;
  ativo: string;
  data_inicio: string;
  data_fim: string;
  recorrente: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const CalendarioFeriados: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    tipo: '',
    ativo: '',
    data_inicio: '',
    data_fim: '',
    recorrente: '',
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [feriadoSelecionado, setFeriadoSelecionado] = useState<Feriado | null>(null);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState<Partial<Feriado>>({});
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadDados();
  }, [filtros, anoAtual]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadDados = async () => {
    setLoading(true);
    try {
      await loadFeriados();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar calendário de feriados');
    } finally {
      setLoading(false);
    }
  };

  const loadFeriados = async () => {
    try {
      const { data, error } = await supabase
        .from('feriados')
        .select('*')
        .order('data');

      if (error) {
        console.error('Erro ao carregar feriados:', error);
        return;
      }

      setFeriados(data || []);
    } catch (error) {
      console.error('Erro ao carregar feriados:', error);
    }
  };

  const salvarFeriado = async () => {
    if (!formData.nome || !formData.data || !formData.tipo) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (feriadoSelecionado) {
        // Atualizar feriado existente
        const { error } = await supabase
          .from('feriados')
          .update(formData)
          .eq('id', feriadoSelecionado.id);

        if (error) {
          console.error('Erro ao atualizar feriado:', error);
          toast.error('Erro ao atualizar feriado');
          return;
        }
      } else {
        // Criar novo feriado
        const { error } = await supabase
          .from('feriados')
          .insert([formData]);

        if (error) {
          console.error('Erro ao criar feriado:', error);
          toast.error('Erro ao criar feriado');
          return;
        }
      }

      toast.success('Feriado salvo com sucesso');
      loadFeriados();
      setModalAberto(false);
      setFeriadoSelecionado(null);
      setFormData({});
    } catch (error) {
      console.error('Erro ao salvar feriado:', error);
      toast.error('Erro ao salvar feriado');
    }
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este feriado?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('feriados')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir feriado:', error);
        toast.error('Erro ao excluir feriado');
        return;
      }

      toast.success('Feriado excluído com sucesso');
      loadFeriados();
    } catch (error) {
      console.error('Erro ao excluir feriado:', error);
      toast.error('Erro ao excluir feriado');
    }
  };

  const handleEditar = (feriado: Feriado) => {
    setFeriadoSelecionado(feriado);
    setFormData(feriado);
    setEditando(true);
    setModalAberto(true);
  };

  const handleNovo = () => {
    setFeriadoSelecionado(null);
    setFormData({});
    setEditando(false);
    setModalAberto(true);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'nacional':
        return <Flag className="h-4 w-4 text-green-500" />;
      case 'estadual':
        return <MapPin className="h-4 w-4 text-blue-500" />;
      case 'municipal':
        return <Building2 className="h-4 w-4 text-purple-500" />;
      case 'personalizado':
        return <Settings className="h-4 w-4 text-orange-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'nacional':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'estadual':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'municipal':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900';
      case 'personalizado':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'nacional':
        return 'Nacional';
      case 'estadual':
        return 'Estadual';
      case 'municipal':
        return 'Municipal';
      case 'personalizado':
        return 'Personalizado';
      default:
        return 'Desconhecido';
    }
  };

  const feriadosFiltrados = feriados.filter(feriado => {
    const matchesBusca = !filtros.busca || 
      feriado.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      feriado.descricao?.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchesTipo = !filtros.tipo || feriado.tipo === filtros.tipo;
    const matchesAtivo = !filtros.ativo || 
      (filtros.ativo === 'ativo' && feriado.ativo) ||
      (filtros.ativo === 'inativo' && !feriado.ativo);
    
    const matchesRecorrente = !filtros.recorrente || 
      (filtros.recorrente === 'sim' && feriado.recorrente) ||
      (filtros.recorrente === 'nao' && !feriado.recorrente);
    
    const matchesDataInicio = !filtros.data_inicio || 
      new Date(feriado.data) >= new Date(filtros.data_inicio);
    const matchesDataFim = !filtros.data_fim || 
      new Date(feriado.data) <= new Date(filtros.data_fim);

    return matchesBusca && matchesTipo && matchesAtivo && matchesRecorrente && matchesDataInicio && matchesDataFim;
  });

  // Estatísticas
  const totalFeriados = feriados.length;
  const feriadosAtivos = feriados.filter(f => f.ativo).length;
  const feriadosRecorrentes = feriados.filter(f => f.recorrente).length;
  const feriadosNesteAno = feriados.filter(f => 
    new Date(f.data).getFullYear() === anoAtual
  ).length;

  // Feriados por tipo
  const feriadosPorTipo = feriados.reduce((acc, feriado) => {
    acc[feriado.tipo] = (acc[feriado.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
        <title>Calendário de Feriados - Sistema de Gestão de Clínica</title>
        <meta name="description" content="Calendário de feriados da clínica" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                Calendário de Feriados
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gerencie os feriados nacionais, estaduais, municipais e personalizados
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
              <button
                onClick={handleNovo}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="mr-2" size={16} />
                Novo Feriado
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total de Feriados
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalFeriados}
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
                    Feriados Ativos
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {feriadosAtivos}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Repeat className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Recorrentes
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {feriadosRecorrentes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Sun className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Em {anoAtual}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {feriadosNesteAno}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Filtros
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar feriados..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm w-full"
                />
              </div>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Todos os tipos</option>
                <option value="nacional">Nacional</option>
                <option value="estadual">Estadual</option>
                <option value="municipal">Municipal</option>
                <option value="personalizado">Personalizado</option>
              </select>
              <select
                value={filtros.ativo}
                onChange={(e) => setFiltros({ ...filtros, ativo: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
              <select
                value={filtros.recorrente}
                onChange={(e) => setFiltros({ ...filtros, recorrente: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Todos</option>
                <option value="sim">Recorrentes</option>
                <option value="nao">Não Recorrentes</option>
              </select>
              <div className="flex space-x-2">
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Feriados */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Feriados
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAnoAtual(anoAtual - 1)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {anoAtual}
                </span>
                <button
                  onClick={() => setAnoAtual(anoAtual + 1)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {feriadosFiltrados.map((feriado) => (
                <div
                  key={feriado.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                      {getTipoIcon(feriado.tipo)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {feriado.nome}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(feriado.data)}
                      </p>
                      {feriado.descricao && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {feriado.descricao}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTipoColor(feriado.tipo)}`}>
                      {getTipoLabel(feriado.tipo)}
                    </span>
                    {feriado.recorrente && (
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        Recorrente
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      feriado.ativo
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {feriado.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    <button
                      onClick={() => handleEditar(feriado)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleExcluir(feriado.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
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

export default CalendarioFeriados;
