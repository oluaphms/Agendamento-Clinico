// ============================================================================
// PÁGINA: Sistema de Templates - Sistema de Configurações Avançadas
// ============================================================================
// Esta página implementa o sistema de templates para personalização de
// documentos, mensagens e relatórios da clínica.
// ============================================================================

// @ts-ignore
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FileText,
  MessageSquare,
  BarChart3,
  Mail,
  Phone,
  RefreshCw,
  Plus,
  CheckCircle,
  Star,
  Tag,
  Search,
  Eye,
  Copy,
  Edit,
  Trash2,
} from 'lucide-react';

import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import { supabase } from '@/lib/supabase';
// import { formatDate } from '@/lib/utils';

import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface Template {
  id: string;
  configuracao_clinica_id: string;
  nome: string;
  tipo: string; // 'documento', 'mensagem', 'relatorio', 'email', 'sms', 'whatsapp'
  categoria: string; // 'agendamento', 'consulta', 'pagamento', 'relatorio', 'comunicacao'
  conteudo: string;
  variaveis: string[]; // Lista de variáveis disponíveis no template
  ativo: boolean;
  padrao: boolean; // Se é o template padrão para o tipo/categoria
  created_at: string;
  updated_at: string;
}

interface Filtros {
  busca: string;
  tipo: string;
  categoria: string;
  ativo: string;
  padrao: string;
  data_inicio: string;
  data_fim: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const SistemaTemplates: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    tipo: '',
    categoria: '',
    ativo: '',
    padrao: '',
    data_inicio: '',
    data_fim: '',
  });
  // @ts-ignore
  const [modalAberto, setModalAberto] = useState(false);
  // @ts-ignore
  const [templateSelecionado, setTemplateSelecionado] =
    useState<Template | null>(null);
  // @ts-ignore
  const [editando, setEditando] = useState(false);
  // @ts-ignore
  const [formData, setFormData] = useState<Partial<Template>>({});
  // @ts-ignore
  const [previewAberto, setPreviewAberto] = useState(false);
  // @ts-ignore
  const [templatePreview, setTemplatePreview] = useState<string>('');

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
      await loadTemplates();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('tipo, categoria, nome');

      if (error) {
        console.error('Erro ao carregar templates:', error);
        return;
      }

      setTemplates(data || []);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  // const salvarTemplate = async () => { // Comentado - não utilizado
  //   if (
  //     !formData.nome ||
  //     !formData.tipo ||
  //     !formData.categoria ||
  //     !formData.conteudo
  //   ) {
  //     toast.error('Preencha todos os campos obrigatórios');
  //     return;
  //   }

  //   try {
  //     if (templateSelecionado) {
  //       // Atualizar template existente
  //       const { error } = await supabase
  //         .from('templates')
  //         .update(formData)
  //         .eq('id', templateSelecionado.id);

  //       if (error) {
  //         console.error('Erro ao atualizar template:', error);
  //         toast.error('Erro ao atualizar template');
  //         return;
  //       }
  //     } else {
  //       // Criar novo template
  //       const { error } = await supabase.from('templates').insert([formData]);

  //       if (error) {
  //         console.error('Erro ao criar template:', error);
  //         toast.error('Erro ao criar template');
  //         return;
  //       }
  //     }

  //     toast.success('Template salvo com sucesso');
  //     loadTemplates();
  //     setModalAberto(false);
  //     setTemplateSelecionado(null);
  //     setFormData({});
  //   } catch (error) {
  //     console.error('Erro ao salvar template:', error);
  //     toast.error('Erro ao salvar template');
  //   }
  // };

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este template?')) {
      return;
    }

    try {
      const { error } = await supabase.from('templates').delete().eq('id', id);

      if (error) {
        console.error('Erro ao excluir template:', error);
        toast.error('Erro ao excluir template');
        return;
      }

      toast.success('Template excluído com sucesso');
      loadTemplates();
    } catch (error) {
      console.error('Erro ao excluir template:', error);
      toast.error('Erro ao excluir template');
    }
  };

  const handleEditar = (template: Template) => {
    setTemplateSelecionado(template);
    setFormData(template);
    setEditando(true);
    setModalAberto(true);
  };

  const handleNovo = () => {
    setTemplateSelecionado(null);
    setFormData({});
    setEditando(false);
    setModalAberto(true);
  };

  const handlePreview = (template: Template) => {
    setTemplatePreview(template.conteudo);
    setPreviewAberto(true);
  };

  const handleDuplicar = async (template: Template) => {
    try {
      const { id, created_at, updated_at, ...novoTemplate } = {
        ...template,
        nome: `${template.nome} (Cópia)`,
        padrao: false,
      };

      const { error } = await supabase.from('templates').insert([novoTemplate]);

      if (error) {
        console.error('Erro ao duplicar template:', error);
        toast.error('Erro ao duplicar template');
        return;
      }

      toast.success('Template duplicado com sucesso');
      loadTemplates();
    } catch (error) {
      console.error('Erro ao duplicar template:', error);
      toast.error('Erro ao duplicar template');
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'documento':
        return <FileText className='h-4 w-4 text-blue-500' />;
      case 'mensagem':
        return <MessageSquare className='h-4 w-4 text-green-500' />;
      case 'relatorio':
        return <BarChart3 className='h-4 w-4 text-purple-500' />;
      case 'email':
        return <Mail className='h-4 w-4 text-orange-500' />;
      case 'sms':
        return <Phone className='h-4 w-4 text-red-500' />;
      case 'whatsapp':
        return <MessageSquare className='h-4 w-4 text-green-600' />;
      default:
        return <FileText className='h-4 w-4 text-gray-500' />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'documento':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'mensagem':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'relatorio':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900';
      case 'email':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
      case 'sms':
        return 'text-red-600 bg-red-100 dark:bg-red-900';
      case 'whatsapp':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'documento':
        return 'Documento';
      case 'mensagem':
        return 'Mensagem';
      case 'relatorio':
        return 'Relatório';
      case 'email':
        return 'Email';
      case 'sms':
        return 'SMS';
      case 'whatsapp':
        return 'WhatsApp';
      default:
        return 'Desconhecido';
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    switch (categoria) {
      case 'agendamento':
        return 'Agendamento';
      case 'consulta':
        return 'Consulta';
      case 'pagamento':
        return 'Pagamento';
      case 'relatorio':
        return 'Relatório';
      case 'comunicacao':
        return 'Comunicação';
      default:
        return 'Outros';
    }
  };

  const templatesFiltrados = templates.filter(template => {
    const matchesBusca =
      !filtros.busca ||
      template.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      template.conteudo.toLowerCase().includes(filtros.busca.toLowerCase());

    const matchesTipo = !filtros.tipo || template.tipo === filtros.tipo;
    const matchesCategoria =
      !filtros.categoria || template.categoria === filtros.categoria;
    const matchesAtivo =
      !filtros.ativo ||
      (filtros.ativo === 'ativo' && template.ativo) ||
      (filtros.ativo === 'inativo' && !template.ativo);
    const matchesPadrao =
      !filtros.padrao ||
      (filtros.padrao === 'sim' && template.padrao) ||
      (filtros.padrao === 'nao' && !template.padrao);

    const matchesDataInicio =
      !filtros.data_inicio ||
      new Date(template.created_at) >= new Date(filtros.data_inicio);
    const matchesDataFim =
      !filtros.data_fim ||
      new Date(template.created_at) <= new Date(filtros.data_fim);

    return (
      matchesBusca &&
      matchesTipo &&
      matchesCategoria &&
      matchesAtivo &&
      matchesPadrao &&
      matchesDataInicio &&
      matchesDataFim
    );
  });

  // Estatísticas
  const totalTemplates = templates.length;
  const templatesAtivos = templates.filter(t => t.ativo).length;
  const templatesPadrao = templates.filter(t => t.padrao).length;
  const templatesPorTipo = templates.reduce(
    (acc, template) => {
      acc[template.tipo] = (acc[template.tipo] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

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
        <title>Sistema de Templates - Sistema de Gestão de Clínica</title>
        <meta
          name='description'
          content='Sistema de templates para personalização de documentos e mensagens'
        />
      </Helmet>

      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3'>
                <FileText className='h-8 w-8 text-blue-600' />
                Sistema de Templates
              </h1>
              <p className='text-gray-600 dark:text-gray-400 mt-2'>
                Gerencie templates para documentos, mensagens e relatórios
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
                onClick={handleNovo}
                className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <Plus className='mr-2' size={16} />
                Novo Template
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <FileText className='h-8 w-8 text-blue-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Total de Templates
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {totalTemplates}
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
                    Templates Ativos
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {templatesAtivos}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Star className='h-8 w-8 text-yellow-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Templates Padrão
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {templatesPadrao}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Tag className='h-8 w-8 text-purple-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Tipos Diferentes
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {Object.keys(templatesPorTipo).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className='mb-8'>
          <CardContent className='p-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Filtros
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-6 gap-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <input
                  type='text'
                  placeholder='Buscar templates...'
                  value={filtros.busca}
                  onChange={e =>
                    setFiltros({ ...filtros, busca: e.target.value })
                  }
                  className='pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm w-full'
                />
              </div>
              <select
                value={filtros.tipo}
                onChange={e => setFiltros({ ...filtros, tipo: e.target.value })}
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
              >
                <option value=''>Todos os tipos</option>
                <option value='documento'>Documento</option>
                <option value='mensagem'>Mensagem</option>
                <option value='relatorio'>Relatório</option>
                <option value='email'>Email</option>
                <option value='sms'>SMS</option>
                <option value='whatsapp'>WhatsApp</option>
              </select>
              <select
                value={filtros.categoria}
                onChange={e =>
                  setFiltros({ ...filtros, categoria: e.target.value })
                }
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
              >
                <option value=''>Todas as categorias</option>
                <option value='agendamento'>Agendamento</option>
                <option value='consulta'>Consulta</option>
                <option value='pagamento'>Pagamento</option>
                <option value='relatorio'>Relatório</option>
                <option value='comunicacao'>Comunicação</option>
              </select>
              <select
                value={filtros.ativo}
                onChange={e =>
                  setFiltros({ ...filtros, ativo: e.target.value })
                }
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
              >
                <option value=''>Todos os status</option>
                <option value='ativo'>Ativo</option>
                <option value='inativo'>Inativo</option>
              </select>
              <select
                value={filtros.padrao}
                onChange={e =>
                  setFiltros({ ...filtros, padrao: e.target.value })
                }
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
              >
                <option value=''>Todos</option>
                <option value='sim'>Padrão</option>
                <option value='nao'>Não Padrão</option>
              </select>
              <div className='flex space-x-2'>
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Templates */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Templates
              </h3>
            </div>

            <div className='space-y-4'>
              {templatesFiltrados.map(template => (
                <div
                  key={template.id}
                  className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'
                >
                  <div className='flex items-center space-x-4'>
                    <div className='p-2 rounded-lg bg-gray-100 dark:bg-gray-700'>
                      {getTipoIcon(template.tipo)}
                    </div>
                    <div>
                      <h4 className='text-sm font-medium text-gray-900 dark:text-white'>
                        {template.nome}
                      </h4>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        {getTipoLabel(template.tipo)} -{' '}
                        {getCategoriaLabel(template.categoria)}
                      </p>
                      <p className='text-xs text-gray-400 dark:text-gray-500'>
                        {template.variaveis?.length || 0} variáveis disponíveis
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getTipoColor(template.tipo)}`}
                    >
                      {getTipoLabel(template.tipo)}
                    </span>
                    {template.padrao && (
                      <span className='px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'>
                        Padrão
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        template.ativo
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {template.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    <button
                      onClick={() => handlePreview(template)}
                      className='p-2 text-gray-400 hover:text-blue-600 transition-colors'
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDuplicar(template)}
                      className='p-2 text-gray-400 hover:text-green-600 transition-colors'
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleEditar(template)}
                      className='p-2 text-gray-400 hover:text-blue-600 transition-colors'
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleExcluir(template.id)}
                      className='p-2 text-gray-400 hover:text-red-600 transition-colors'
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

export default SistemaTemplates;
