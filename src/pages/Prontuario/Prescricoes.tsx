// ============================================================================
// PÁGINA: Prescrições - Prontuário Eletrônico
// ============================================================================
// Esta página gerencia as prescrições médicas, incluindo
// medicamentos, dosagens, frequências e observações.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Pill,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  FileText,
  Printer,
  Copy,
} from 'lucide-react';
import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { formatDate, formatPhone } from '@/lib/utils';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface Prescricao {
  id: string;
  prontuario_id: string;
  medicamento: string;
  dosagem: string;
  frequencia: string;
  duracao: string;
  observacoes?: string;
  created_at: string;
  // Relacionamentos
  prontuario?: {
    id: string;
    data_consulta: string;
    paciente?: {
      nome: string;
      telefone: string;
      email?: string;
    };
    profissional?: {
      nome: string;
      especialidade: string;
      crm_cro: string;
    };
  };
}

interface Filtros {
  medicamento: string;
  paciente: string;
  profissional: string;
  data_inicio: string;
  data_fim: string;
  busca: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Prescricoes: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    medicamento: '',
    paciente: '',
    profissional: '',
    data_inicio: '',
    data_fim: '',
    busca: '',
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [prescricaoSelecionada, setPrescricaoSelecionada] = useState<Prescricao | null>(null);

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
        loadPrescricoes(),
        loadPacientes(),
        loadProfissionais(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados das prescrições');
    } finally {
      setLoading(false);
    }
  };

  const loadPrescricoes = async () => {
    try {
      let query = supabase
        .from('prescricoes')
        .select(`
          *,
          prontuario:prontuarios(
            id,
            data_consulta,
            paciente:pacientes(nome, telefone, email),
            profissional:profissionais(nome, especialidade, crm_cro)
          )
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filtros.medicamento) {
        query = query.ilike('medicamento', `%${filtros.medicamento}%`);
      }
      if (filtros.paciente) {
        query = query.eq('prontuario.paciente_id', filtros.paciente);
      }
      if (filtros.profissional) {
        query = query.eq('prontuario.profissional_id', filtros.profissional);
      }
      if (filtros.data_inicio) {
        query = query.gte('prontuario.data_consulta', filtros.data_inicio);
      }
      if (filtros.data_fim) {
        query = query.lte('prontuario.data_consulta', filtros.data_fim);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar prescrições:', error);
        toast.error('Erro ao carregar prescrições');
        return;
      }

      // Filtrar por busca se necessário
      let prescricoesFiltradas = data || [];
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        prescricoesFiltradas = prescricoesFiltradas.filter(prescricao =>
          prescricao.medicamento.toLowerCase().includes(busca) ||
          prescricao.dosagem.toLowerCase().includes(busca) ||
          prescricao.frequencia.toLowerCase().includes(busca) ||
          prescricao.observacoes?.toLowerCase().includes(busca) ||
          prescricao.prontuario?.paciente?.nome.toLowerCase().includes(busca)
        );
      }

      setPrescricoes(prescricoesFiltradas);
    } catch (error) {
      console.error('Erro ao carregar prescrições:', error);
      toast.error('Erro ao carregar prescrições');
    }
  };

  const loadPacientes = async () => {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nome, telefone, email')
        .eq('status', 'ativo')
        .order('nome');

      if (error) {
        console.error('Erro ao carregar pacientes:', error);
        return;
      }

      setPacientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const loadProfissionais = async () => {
    try {
      const { data, error } = await supabase
        .from('profissionais')
        .select('id, nome, especialidade, crm_cro')
        .eq('status', 'ativo')
        .order('nome');

      if (error) {
        console.error('Erro ao carregar profissionais:', error);
        return;
      }

      setProfissionais(data || []);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta prescrição?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('prescricoes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir prescrição:', error);
        toast.error('Erro ao excluir prescrição');
        return;
      }

      toast.success('Prescrição excluída com sucesso');
      loadPrescricoes();
    } catch (error) {
      console.error('Erro ao excluir prescrição:', error);
      toast.error('Erro ao excluir prescrição');
    }
  };

  const handleImprimir = (prescricao: Prescricao) => {
    const conteudo = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receita Médica</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #2563eb; margin-bottom: 10px; }
            .info { margin-bottom: 20px; }
            .info p { margin: 5px 0; }
            .prescricao { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .medicamento { font-weight: bold; font-size: 18px; margin-bottom: 10px; }
            .detalhes { margin-left: 20px; }
            .footer { margin-top: 30px; text-align: center; }
            .assinatura { margin-top: 50px; border-top: 1px solid #ccc; padding-top: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RECEITA MÉDICA</h1>
            <p>Sistema de Gestão de Clínica</p>
          </div>
          
          <div class="info">
            <p><strong>Paciente:</strong> ${prescricao.prontuario?.paciente?.nome || 'N/A'}</p>
            <p><strong>Data:</strong> ${formatDate(prescricao.created_at)}</p>
            <p><strong>Médico:</strong> ${prescricao.prontuario?.profissional?.nome || 'N/A'}</p>
            <p><strong>CRM/CRO:</strong> ${prescricao.prontuario?.profissional?.crm_cro || 'N/A'}</p>
          </div>
          
          <div class="prescricao">
            <div class="medicamento">${prescricao.medicamento}</div>
            <div class="detalhes">
              <p><strong>Dosagem:</strong> ${prescricao.dosagem}</p>
              <p><strong>Frequência:</strong> ${prescricao.frequencia}</p>
              <p><strong>Duração:</strong> ${prescricao.duracao}</p>
              ${prescricao.observacoes ? `<p><strong>Observações:</strong> ${prescricao.observacoes}</p>` : ''}
            </div>
          </div>
          
          <div class="assinatura">
            <p>_________________________________</p>
            <p>Dr(a). ${prescricao.prontuario?.profissional?.nome || 'N/A'}</p>
            <p>CRM/CRO: ${prescricao.prontuario?.profissional?.crm_cro || 'N/A'}</p>
          </div>
        </body>
      </html>
    `;

    const janela = window.open('', '_blank');
    if (janela) {
      janela.document.write(conteudo);
      janela.document.close();
      janela.print();
    }
  };

  const handleCopiar = (prescricao: Prescricao) => {
    const texto = `
Medicamento: ${prescricao.medicamento}
Dosagem: ${prescricao.dosagem}
Frequência: ${prescricao.frequencia}
Duração: ${prescricao.duracao}
${prescricao.observacoes ? `Observações: ${prescricao.observacoes}` : ''}
    `.trim();

    navigator.clipboard.writeText(texto).then(() => {
      toast.success('Prescrição copiada para a área de transferência');
    }).catch(() => {
      toast.error('Erro ao copiar prescrição');
    });
  };

  const prescricoesFiltradas = prescricoes.filter(prescricao => {
    const matchesMedicamento = !filtros.medicamento || 
      prescricao.medicamento.toLowerCase().includes(filtros.medicamento.toLowerCase());
    const matchesPaciente = !filtros.paciente || 
      prescricao.prontuario?.paciente?.id === filtros.paciente;
    const matchesProfissional = !filtros.profissional || 
      prescricao.prontuario?.profissional?.id === filtros.profissional;
    const matchesDataInicio = !filtros.data_inicio || 
      new Date(prescricao.created_at) >= new Date(filtros.data_inicio);
    const matchesDataFim = !filtros.data_fim || 
      new Date(prescricao.created_at) <= new Date(filtros.data_fim);
    const matchesBusca = !filtros.busca || 
      prescricao.medicamento.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      prescricao.dosagem.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      prescricao.frequencia.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      prescricao.observacoes?.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      prescricao.prontuario?.paciente?.nome.toLowerCase().includes(filtros.busca.toLowerCase());

    return matchesMedicamento && matchesPaciente && matchesProfissional && 
           matchesDataInicio && matchesDataFim && matchesBusca;
  });

  // Estatísticas
  const totalPrescricoes = prescricoes.length;
  const medicamentosUnicos = new Set(prescricoes.map(p => p.medicamento)).size;
  const prescricoesHoje = prescricoes.filter(p => 
    new Date(p.created_at).toDateString() === new Date().toDateString()
  ).length;

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
        <title>Prescrições - Sistema de Gestão de Clínica</title>
        <meta name="description" content="Gerencie as prescrições médicas" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Pill className="h-8 w-8 text-blue-600" />
                Prescrições Médicas
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gerencie medicamentos, dosagens e prescrições médicas
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
                onClick={() => setModalAberto(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="mr-2" size={16} />
                Nova Prescrição
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Pill className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total de Prescrições
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalPrescricoes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Medicamentos Únicos
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {medicamentosUnicos}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Hoje
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {prescricoesHoje}
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
                <input
                  type="text"
                  placeholder="Medicamento"
                  value={filtros.medicamento}
                  onChange={(e) => setFiltros({ ...filtros, medicamento: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
                <select
                  value={filtros.paciente}
                  onChange={(e) => setFiltros({ ...filtros, paciente: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Todos os pacientes</option>
                  {pacientes.map(paciente => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nome}
                    </option>
                  ))}
                </select>
                <select
                  value={filtros.profissional}
                  onChange={(e) => setFiltros({ ...filtros, profissional: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Todos os profissionais</option>
                  {profissionais.map(profissional => (
                    <option key={profissional.id} value={profissional.id}>
                      {profissional.nome}
                    </option>
                  ))}
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
                    placeholder="Buscar prescrições..."
                    value={filtros.busca}
                    onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm min-w-[200px]"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Prescrições */}
        <div className="space-y-4">
          {prescricoesFiltradas.map((prescricao) => (
            <Card key={prescricao.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Pill className="h-6 w-6 text-blue-500" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {prescricao.medicamento}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(prescricao.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Dosagem
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {prescricao.dosagem}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Frequência
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {prescricao.frequencia}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Duração
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {prescricao.duracao}
                        </p>
                      </div>
                    </div>

                    {prescricao.observacoes && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Observações
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {prescricao.observacoes}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Paciente</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {prescricao.prontuario?.paciente?.nome || 'N/A'}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          {formatPhone(prescricao.prontuario?.paciente?.telefone || '')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Médico</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {prescricao.prontuario?.profissional?.nome || 'N/A'}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          {prescricao.prontuario?.profissional?.crm_cro || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleImprimir(prescricao)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Imprimir receita"
                    >
                      <Printer size={16} />
                    </button>
                    <button
                      onClick={() => handleCopiar(prescricao)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Copiar prescrição"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => setPrescricaoSelecionada(prescricao)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => setPrescricaoSelecionada(prescricao)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleExcluir(prescricao.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensagem quando não há prescrições */}
        {prescricoesFiltradas.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Pill className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma prescrição encontrada
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Não há prescrições que correspondam aos filtros selecionados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Prescricoes;
