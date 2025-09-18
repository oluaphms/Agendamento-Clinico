import { formatDate, formatPhone } from '@/lib/utils';
import {
  FileImage,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Upload,
  FileText,
  Image,
  File,
} from 'lucide-react';
// ============================================================================
// PÁGINA: Exames - Prontuário Eletrônico
// ============================================================================
// Esta página gerencia os exames dos pacientes, incluindo
// anexos, resultados e status dos exames.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface Exame {
  id: string;
  paciente_id: string;
  prontuario_id: string;
  nome_exame: string;
  tipo_exame: string;
  data_exame: string;
  resultado: string;
  arquivo_url?: string;
  status: 'pendente' | 'realizado' | 'cancelado';
  observacoes?: string;
  created_at: string;
  // Relacionamentos
  paciente?: {
    nome: string;
    telefone: string;
    email?: string;
  };
  prontuario?: {
    id: string;
    data_consulta: string;
    profissional?: {
      nome: string;
      especialidade: string;
    };
  };
}

interface Filtros {
  nome_exame: string;
  tipo_exame: string;
  paciente: string;
  status: string;
  data_inicio: string;
  data_fim: string;
  busca: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Exames: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exames, setExames] = useState<Exame[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    nome_exame: '',
    tipo_exame: '',
    paciente: '',
    status: '',
    data_inicio: '',
    data_fim: '',
    busca: '',
  });
  const [uploading, setUploading] = useState(false);

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
      await Promise.all([loadExames(), loadPacientes()]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados dos exames');
    } finally {
      setLoading(false);
    }
  };

  const loadExames = async () => {
    try {
      let query = supabase
        .from('exames')
        .select(
          `
          *,
          paciente:pacientes(nome, telefone, email),
          prontuario:prontuarios(
            id,
            data_consulta,
            profissional:profissionais(nome, especialidade)
          )
        `
        )
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filtros.nome_exame) {
        query = query.ilike('nome_exame', `%${filtros.nome_exame}%`);
      }
      if (filtros.tipo_exame) {
        query = query.eq('tipo_exame', filtros.tipo_exame);
      }
      if (filtros.paciente) {
        query = query.eq('paciente_id', filtros.paciente);
      }
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros.data_inicio) {
        query = query.gte('data_exame', filtros.data_inicio);
      }
      if (filtros.data_fim) {
        query = query.lte('data_exame', filtros.data_fim);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar exames:', error);
        toast.error('Erro ao carregar exames');
        return;
      }

      // Filtrar por busca se necessário
      let examesFiltrados = data || [];
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        examesFiltrados = examesFiltrados.filter(
          (exame: any) =>
            exame.nome_exame.toLowerCase().includes(busca) ||
            exame.tipo_exame.toLowerCase().includes(busca) ||
            exame.resultado.toLowerCase().includes(busca) ||
            exame.observacoes?.toLowerCase().includes(busca) ||
            exame.paciente?.nome.toLowerCase().includes(busca)
        );
      }

      setExames(examesFiltrados);
    } catch (error) {
      console.error('Erro ao carregar exames:', error);
      toast.error('Erro ao carregar exames');
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

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este exame?')) {
      return;
    }

    try {
      const { error } = await supabase.from('exames').delete().eq('id', id);

      if (error) {
        console.error('Erro ao excluir exame:', error);
        toast.error('Erro ao excluir exame');
        return;
      }

      toast.success('Exame excluído com sucesso');
      loadExames();
    } catch (error) {
      console.error('Erro ao excluir exame:', error);
      toast.error('Erro ao excluir exame');
    }
  };

  const handleUpload = async (exameId: string, file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${exameId}_${Date.now()}.${fileExt}`;
      const filePath = `exames/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('exames')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro ao fazer upload:', uploadError);
        toast.error('Erro ao fazer upload do arquivo');
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('exames').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('exames')
        .update({ arquivo_url: publicUrl })
        .eq('id', exameId);

      if (updateError) {
        console.error('Erro ao atualizar exame:', updateError);
        toast.error('Erro ao atualizar exame');
        return;
      }

      toast.success('Arquivo enviado com sucesso');
      loadExames();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload do arquivo');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'realizado':
        return <CheckCircle className='h-5 w-5 text-green-500' />;
      case 'pendente':
        return <Clock className='h-5 w-5 text-yellow-500' />;
      case 'cancelado':
        return <AlertCircle className='h-5 w-5 text-red-500' />;
      default:
        return <Clock className='h-5 w-5 text-gray-500' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'realizado':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTipoExameIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'imagem':
        return <Image className='h-4 w-4' />;
      case 'laboratorio':
        return <FileText className='h-4 w-4' />;
      case 'radiologia':
        return <FileImage className='h-4 w-4' />;
      default:
        return <File className='h-4 w-4' />;
    }
  };

  const examesFiltrados = exames.filter(exame => {
    const matchesNome =
      !filtros.nome_exame ||
      exame.nome_exame.toLowerCase().includes(filtros.nome_exame.toLowerCase());
    const matchesTipo =
      !filtros.tipo_exame || exame.tipo_exame === filtros.tipo_exame;
    const matchesPaciente =
      !filtros.paciente || exame.paciente_id === filtros.paciente;
    const matchesStatus = !filtros.status || exame.status === filtros.status;
    const matchesDataInicio =
      !filtros.data_inicio ||
      new Date(exame.data_exame) >= new Date(filtros.data_inicio);
    const matchesDataFim =
      !filtros.data_fim ||
      new Date(exame.data_exame) <= new Date(filtros.data_fim);
    const matchesBusca =
      !filtros.busca ||
      exame.nome_exame.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      exame.tipo_exame.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      exame.resultado.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      exame.observacoes?.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      exame.paciente?.nome.toLowerCase().includes(filtros.busca.toLowerCase());

    return (
      matchesNome &&
      matchesTipo &&
      matchesPaciente &&
      matchesStatus &&
      matchesDataInicio &&
      matchesDataFim &&
      matchesBusca
    );
  });

  // Estatísticas
  const totalExames = exames.length;
  const examesRealizados = exames.filter(e => e.status === 'realizado').length;
  const examesPendentes = exames.filter(e => e.status === 'pendente').length;
  const examesComArquivo = exames.filter(e => e.arquivo_url).length;

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
        <title>Exames - Sistema de Gestão de Clínica</title>
        <meta name='description' content='Gerencie os exames dos pacientes' />
      </Helmet>

      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3'>
                <FileImage className='h-8 w-8 text-blue-600' />
                Exames
              </h1>
              <p className='text-gray-600 dark:text-gray-400 mt-2'>
                Gerencie exames, resultados e anexos dos pacientes
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
              <button
                onClick={() => {}}
                className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <Plus className='mr-2' size={16} />
                Novo Exame
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <FileImage className='h-8 w-8 text-blue-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Total de Exames
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {totalExames}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <CheckCircle className='h-8 w-8 text-green-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Realizados
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {examesRealizados}
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
                    {examesPendentes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <File className='h-8 w-8 text-purple-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Com Arquivo
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {examesComArquivo}
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
                <input
                  type='text'
                  placeholder='Nome do exame'
                  value={filtros.nome_exame}
                  onChange={e =>
                    setFiltros({ ...filtros, nome_exame: e.target.value })
                  }
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
                />
                <select
                  value={filtros.tipo_exame}
                  onChange={e =>
                    setFiltros({ ...filtros, tipo_exame: e.target.value })
                  }
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
                >
                  <option value=''>Todos os tipos</option>
                  <option value='imagem'>Imagem</option>
                  <option value='laboratorio'>Laboratório</option>
                  <option value='radiologia'>Radiologia</option>
                  <option value='outros'>Outros</option>
                </select>
                <select
                  value={filtros.paciente}
                  onChange={e =>
                    setFiltros({ ...filtros, paciente: e.target.value })
                  }
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
                >
                  <option value=''>Todos os pacientes</option>
                  {pacientes.map(paciente => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nome}
                    </option>
                  ))}
                </select>
                <select
                  value={filtros.status}
                  onChange={e =>
                    setFiltros({ ...filtros, status: e.target.value })
                  }
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
                >
                  <option value=''>Todos os status</option>
                  <option value='pendente'>Pendente</option>
                  <option value='realizado'>Realizado</option>
                  <option value='cancelado'>Cancelado</option>
                </select>
              </div>
              <div className='flex items-center space-x-4'>
                <input
                  type='date'
                  value={filtros.data_inicio}
                  onChange={e =>
                    setFiltros({ ...filtros, data_inicio: e.target.value })
                  }
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
                  placeholder='Data início'
                />
                <input
                  type='date'
                  value={filtros.data_fim}
                  onChange={e =>
                    setFiltros({ ...filtros, data_fim: e.target.value })
                  }
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
                  placeholder='Data fim'
                />
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Buscar exames...'
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

        {/* Lista de Exames */}
        <div className='space-y-4'>
          {examesFiltrados.map(exame => (
            <Card key={exame.id} className='hover:shadow-lg transition-shadow'>
              <CardContent className='p-6'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-4 mb-4'>
                      <div className='flex items-center space-x-2'>
                        {getTipoExameIcon(exame.tipo_exame)}
                        <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
                          {exame.nome_exame}
                        </h3>
                      </div>
                      <div className='flex items-center space-x-2'>
                        {getStatusIcon(exame.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exame.status)}`}
                        >
                          {exame.status.toUpperCase()}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Calendar className='h-4 w-4 text-gray-500' />
                        <span className='text-sm text-gray-600 dark:text-gray-400'>
                          {formatDate(exame.data_exame)}
                        </span>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                      <div>
                        <p className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>
                          Tipo de Exame
                        </p>
                        <p className='text-sm text-gray-900 dark:text-white'>
                          {exame.tipo_exame}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>
                          Resultado
                        </p>
                        <p className='text-sm text-gray-900 dark:text-white'>
                          {exame.resultado || 'Não informado'}
                        </p>
                      </div>
                    </div>

                    {exame.observacoes && (
                      <div className='mb-4'>
                        <p className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>
                          Observações
                        </p>
                        <p className='text-sm text-gray-900 dark:text-white'>
                          {exame.observacoes}
                        </p>
                      </div>
                    )}

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                      <div>
                        <p className='text-gray-600 dark:text-gray-400'>
                          Paciente
                        </p>
                        <p className='font-medium text-gray-900 dark:text-white'>
                          {exame.paciente?.nome || 'N/A'}
                        </p>
                        <p className='text-gray-500 dark:text-gray-400'>
                          {formatPhone(exame.paciente?.telefone || '')}
                        </p>
                      </div>
                      <div>
                        <p className='text-gray-600 dark:text-gray-400'>
                          Médico
                        </p>
                        <p className='font-medium text-gray-900 dark:text-white'>
                          {exame.prontuario?.profissional?.nome || 'N/A'}
                        </p>
                        <p className='text-gray-500 dark:text-gray-400'>
                          {exame.prontuario?.profissional?.especialidade ||
                            'N/A'}
                        </p>
                      </div>
                    </div>

                    {exame.arquivo_url && (
                      <div className='mt-4'>
                        <p className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-2'>
                          Arquivo Anexado
                        </p>
                        <a
                          href={exame.arquivo_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors'
                        >
                          <File className='h-4 w-4 mr-2' />
                          Ver Arquivo
                        </a>
                      </div>
                    )}
                  </div>

                  <div className='flex items-center space-x-2 ml-4'>
                    {!exame.arquivo_url && exame.status === 'realizado' && (
                      <label className='p-2 text-gray-400 hover:text-green-600 transition-colors cursor-pointer'>
                        <Upload size={16} />
                        <input
                          type='file'
                          className='hidden'
                          accept='image/*,.pdf,.doc,.docx'
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleUpload(exame.id, file);
                            }
                          }}
                          disabled={uploading}
                        />
                      </label>
                    )}
                    <button
                      onClick={() => {}}
                      className='p-2 text-gray-400 hover:text-blue-600 transition-colors'
                      title='Ver detalhes'
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => {}}
                      className='p-2 text-gray-400 hover:text-green-600 transition-colors'
                      title='Editar'
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleExcluir(exame.id)}
                      className='p-2 text-gray-400 hover:text-red-600 transition-colors'
                      title='Excluir'
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensagem quando não há exames */}
        {examesFiltrados.length === 0 && (
          <Card className='text-center py-12'>
            <CardContent>
              <FileImage className='mx-auto h-12 w-12 text-gray-400 mb-4' />
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                Nenhum exame encontrado
              </h3>
              <p className='text-gray-500 dark:text-gray-400'>
                Não há exames que correspondam aos filtros selecionados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Exames;
