// ============================================================================
// PÁGINA: Profissionais - Gerenciamento de Profissionais de Saúde
// ============================================================================
// Esta página permite gerenciar todos os profissionais cadastrados no sistema,
// incluindo visualização, edição e controle de status.
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  Award,
  GraduationCap,
  Calendar,
  User,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { validateField, CLINIC_VALIDATIONS } from '@/lib/validation';
import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface Profissional {
  id: string;
  nome: string;
  cpf: string;
  email?: string;
  telefone: string;
  especialidade: string;
  crm_cro?: string;
  crm?: string;
  status: 'ativo' | 'inativo' | 'ferias';
  ativo?: boolean;
  created_at?: string;
  data_cadastro?: string;
  cidade?: string;
  observacoes?: string;
}

interface ProfissionalFormData {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  especialidade: string;
  crm_cro: string;
  cidade: string;
  observacoes: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Profissionais: React.FC = () => {
  // ============================================================================
  // ESTADO E HOOKS
  // ============================================================================

  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEspecialidade, setFilterEspecialidade] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingProfissional, setEditingProfissional] = useState<Profissional | null>(null);
  const [formData, setFormData] = useState<ProfissionalFormData>({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    especialidade: '',
    crm_cro: '',
    cidade: '',
    observacoes: '',
  });

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadProfissionais();
  }, []);

  // ============================================================================
  // FUNÇÕES DE DADOS
  // ============================================================================

  const loadProfissionais = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profissionais')
        .select('*')
        .order('nome', { ascending: true });

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      setProfissionais(data || []);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      toast.error('Erro ao carregar profissionais. Tente novamente.');
      setProfissionais([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // FUNÇÕES DE FORMULÁRIO
  // ============================================================================

  const resetForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      especialidade: '',
      crm_cro: '',
      cidade: '',
      observacoes: '',
    });
    setEditingProfissional(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string[] } = {};

    if (!formData.nome.trim()) {
      errors.nome = ['Nome é obrigatório'];
    } else {
      const nomeErrors = validateField(formData.nome, CLINIC_VALIDATIONS.profissional.nome);
      if (nomeErrors.length > 0) errors.nome = nomeErrors;
    }

    if (!formData.cpf.trim()) {
      errors.cpf = ['CPF é obrigatório'];
    } else {
      const cpfErrors = validateField(formData.cpf, CLINIC_VALIDATIONS.profissional.cpf);
      if (cpfErrors.length > 0) errors.cpf = cpfErrors;
    }

    if (!formData.telefone.trim()) {
      errors.telefone = ['Telefone é obrigatório'];
    } else {
      const telefoneErrors = validateField(formData.telefone, CLINIC_VALIDATIONS.profissional.telefone);
      if (telefoneErrors.length > 0) errors.telefone = telefoneErrors;
    }

    if (!formData.especialidade.trim()) {
      errors.especialidade = ['Especialidade é obrigatória'];
    }

    if (formData.email && formData.email.trim() !== '') {
      const emailErrors = validateField(formData.email, CLINIC_VALIDATIONS.profissional.email);
      if (emailErrors.length > 0) errors.email = emailErrors;
    }

    if (formData.crm_cro && formData.crm_cro.trim() !== '') {
      const crmErrors = validateField(formData.crm_cro, CLINIC_VALIDATIONS.profissional.crm_cro);
      if (crmErrors.length > 0) errors.crm_cro = crmErrors;
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros nos campos obrigatórios');
      return;
    }

    try {
      setLoading(true);

      const profissionalData = {
        nome: formData.nome.trim(),
        cpf: formData.cpf.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
        email: formData.email.trim() || null,
        especialidade: formData.especialidade.trim(),
        crm_cro: formData.crm_cro.trim() || null,
        cidade: formData.cidade.trim() || null,
        observacoes: formData.observacoes.trim() || null,
        status: 'ativo',
        ativo: true,
      };

      if (editingProfissional) {
        const { error } = await supabase
          .from('profissionais')
          .update(profissionalData)
          .eq('id', editingProfissional.id);

        if (error) throw error;
        toast.success('Profissional atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('profissionais')
          .insert([profissionalData]);

        if (error) throw error;
        toast.success('Profissional cadastrado com sucesso!');
      }

      await loadProfissionais();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
      toast.error('Erro ao salvar profissional. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (profissional: Profissional) => {
    setEditingProfissional(profissional);
    setFormData({
      nome: profissional.nome,
      cpf: profissional.cpf,
      telefone: profissional.telefone,
      email: profissional.email || '',
      especialidade: profissional.especialidade,
      crm_cro: profissional.crm_cro || profissional.crm || '',
      cidade: profissional.cidade || '',
      observacoes: profissional.observacoes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este profissional?')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('profissionais')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Profissional excluído com sucesso!');
      await loadProfissionais();
    } catch (error) {
      console.error('Erro ao excluir profissional:', error);
      toast.error('Erro ao excluir profissional. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (profissional: Profissional) => {
    try {
      setLoading(true);
      const newStatus = (profissional.status === 'ativo' || profissional.ativo) ? 'inativo' : 'ativo';
      const newAtivo = !(profissional.status === 'ativo' || profissional.ativo);

      const { error } = await supabase
        .from('profissionais')
        .update({ 
          status: newStatus,
          ativo: newAtivo 
        })
        .eq('id', profissional.id);

      if (error) throw error;
      
      toast.success(`Profissional ${newStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`);
      await loadProfissionais();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const getStatusColor = (status: string, ativo?: boolean) => {
    if (status === 'ativo' || ativo) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    if (status === 'ferias') {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  // ============================================================================
  // FILTROS E BUSCA
  // ============================================================================

  const filteredProfissionais = profissionais.filter(profissional => {
    const matchesSearch = searchTerm === '' || 
      profissional.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profissional.especialidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profissional.crm_cro || profissional.crm || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEspecialidade = filterEspecialidade === '' || 
      profissional.especialidade === filterEspecialidade;
    
    const matchesStatus = filterStatus === '' || 
      profissional.status === filterStatus ||
      (filterStatus === 'ativo' && (profissional.status === 'ativo' || profissional.ativo)) ||
      (filterStatus === 'inativo' && (profissional.status === 'inativo' || !profissional.ativo));

    return matchesSearch && matchesEspecialidade && matchesStatus;
  });

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-300'>Carregando profissionais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
             
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              <Plus size={20} className='mr-2' />
              Novo Profissional
            </button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <UserCheck className='h-8 w-8 text-blue-600' />
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                  Total de Profissionais
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {profissionais.length}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <Award className='h-8 w-8 text-green-600' />
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                  Profissionais Ativos
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {
                    profissionais.filter(
                      p => p.status === 'ativo' || p.ativo === true
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <GraduationCap className='h-8 w-8 text-purple-600' />
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                  Especialidades
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {new Set(profissionais.map(p => p.especialidade)).size}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <Calendar className='h-8 w-8 text-yellow-600' />
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                  Novos Este Mês
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {
                    profissionais.filter(p => {
                      const cadastro = new Date(
                        p.created_at || p.data_cadastro || new Date()
                      );
                      const hoje = new Date();
                      return (
                        cadastro.getMonth() === hoje.getMonth() &&
                        cadastro.getFullYear() === hoje.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow mb-6'>
          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Buscar
                </label>
                <div className='relative'>
                  <Search
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                    size={20}
                  />
                  <input
                    type='text'
                    placeholder='Nome, especialidade, CRM...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Especialidade
                </label>
                <select
                  value={filterEspecialidade}
                  onChange={e => setFilterEspecialidade(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>Todas as Especialidades</option>
                  <option value='Clínico Geral'>Clínico Geral</option>
                  <option value='Cardiologia'>Cardiologia</option>
                  <option value='Neurologia'>Neurologia</option>
                  <option value='Ortopedia'>Ortopedia</option>
                  <option value='Pediatria'>Pediatria</option>
                  <option value='Ginecologia'>Ginecologia</option>
                  <option value='Psiquiatria'>Psiquiatria</option>
                  <option value='Dermatologia'>Dermatologia</option>
                  <option value='Oftalmologia'>Oftalmologia</option>
                  <option value='Fisioterapia'>Fisioterapia</option>
                  <option value='Nutrição'>Nutrição</option>
                  <option value='Psicologia'>Psicologia</option>
                  <option value='Enfermagem'>Enfermagem</option>
                  <option value='Farmacêutico'>Farmacêutico</option>
                  <option value='Técnico'>Técnico</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>Todos os Status</option>
                  <option value='ativo'>Ativo</option>
                  <option value='inativo'>Inativo</option>
                  <option value='ferias'>Férias</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Profissionais */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow'>
          <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Lista de Profissionais ({filteredProfissionais.length})
            </h3>
          </div>
          <div className='p-6'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-200 dark:border-gray-700'>
                    <th className='text-left py-3 px-4 font-medium text-gray-900 dark:text-white'>
                      Profissional
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-gray-900 dark:text-white'>
                      CRM/Registro
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-gray-900 dark:text-white'>
                      Especialidade
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-gray-900 dark:text-white'>
                      Telefone
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-gray-900 dark:text-white'>
                      Email
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-gray-900 dark:text-white'>
                      Status
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-gray-900 dark:text-white'>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfissionais.length === 0 ? (
                    <tr>
                      <td colSpan={7} className='text-center py-12'>
                        <div className='flex flex-col items-center'>
                          <UserCheck size={48} className='text-gray-400 mb-4' />
                          <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                            Nenhum profissional encontrado
                          </h3>
                          <p className='text-gray-500 dark:text-gray-400'>
                            {searchTerm || filterEspecialidade || filterStatus
                              ? 'Tente ajustar os filtros de busca'
                              : 'Cadastre o primeiro profissional da clínica'
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProfissionais.map(profissional => (
                      <tr
                        key={profissional.id}
                        className='border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                      >
                        <td className='py-4 px-4'>
                          <div className='flex items-center'>
                            <div className='bg-blue-100 dark:bg-blue-900 rounded-full p-2 mr-3'>
                              <User size={20} className='text-blue-600 dark:text-blue-400' />
                            </div>
                            <div>
                              <p className='font-medium text-gray-900 dark:text-white'>
                                {profissional.nome}
                              </p>
                              <p className='text-sm text-gray-500 dark:text-gray-400'>
                                CPF: {formatCPF(profissional.cpf)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className='py-4 px-4 text-gray-600 dark:text-gray-300'>
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
                            {profissional.crm_cro ||
                              profissional.crm ||
                              'Não informado'}
                          </span>
                        </td>
                        <td className='py-4 px-4 text-gray-600 dark:text-gray-300'>
                          {profissional.especialidade}
                        </td>
                        <td className='py-4 px-4 text-gray-600 dark:text-gray-300'>
                          <div className='flex items-center'>
                            <Phone size={16} className='text-gray-400 mr-2' />
                            {formatPhone(profissional.telefone)}
                          </div>
                        </td>
                        <td className='py-4 px-4 text-gray-600 dark:text-gray-300'>
                          <div className='flex items-center'>
                            <Mail size={16} className='text-gray-400 mr-2' />
                            {profissional.email || 'Não informado'}
                          </div>
                        </td>
                        <td className='py-4 px-4'>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(profissional.status, profissional.ativo)}`}>
                            {profissional.status === 'ativo' || profissional.ativo ? 'Ativo' : 
                             profissional.status === 'ferias' ? 'Férias' : 'Inativo'}
                          </span>
                        </td>
                        <td className='py-4 px-4'>
                          <div className='flex space-x-2'>
                            <button
                              onClick={() => handleEdit(profissional)}
                              className='p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors'
                              title='Editar'
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => toggleStatus(profissional)}
                              className={`p-2 rounded-md transition-colors ${
                                (profissional.status === 'ativo' || profissional.ativo)
                                  ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900'
                                  : 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900'
                              }`}
                              title={
                                (profissional.status === 'ativo' || profissional.ativo)
                                  ? 'Desativar'
                                  : 'Ativar'
                              }
                            >
                              {(profissional.status === 'ativo' || profissional.ativo) ? (
                                <XCircle size={16} />
                              ) : (
                                <CheckCircle size={16} />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(profissional.id)}
                              className='p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors'
                              title='Excluir'
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal de Formulário */}
        {showForm && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto'>
              <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  {editingProfissional ? 'Editar Profissional' : 'Novo Profissional'}
                </h3>
              </div>
              <form onSubmit={handleSubmit} className='p-6 space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Nome Completo *
                    </label>
                    <input
                      type='text'
                      name='nome'
                      value={formData.nome}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      CPF *
                    </label>
                    <input
                      type='text'
                      name='cpf'
                      value={formData.cpf}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Telefone *
                    </label>
                    <input
                      type='text'
                      name='telefone'
                      value={formData.telefone}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Email
                    </label>
                    <input
                      type='email'
                      name='email'
                      value={formData.email}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Especialidade *
                    </label>
                    <select
                      name='especialidade'
                      value={formData.especialidade}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                      required
                    >
                      <option value=''>Selecione uma especialidade</option>
                      <option value='Clínico Geral'>Clínico Geral</option>
                      <option value='Cardiologia'>Cardiologia</option>
                      <option value='Neurologia'>Neurologia</option>
                      <option value='Ortopedia'>Ortopedia</option>
                      <option value='Pediatria'>Pediatria</option>
                      <option value='Ginecologia'>Ginecologia</option>
                      <option value='Psiquiatria'>Psiquiatria</option>
                      <option value='Dermatologia'>Dermatologia</option>
                      <option value='Oftalmologia'>Oftalmologia</option>
                      <option value='Fisioterapia'>Fisioterapia</option>
                      <option value='Nutrição'>Nutrição</option>
                      <option value='Psicologia'>Psicologia</option>
                      <option value='Enfermagem'>Enfermagem</option>
                      <option value='Farmacêutico'>Farmacêutico</option>
                      <option value='Técnico'>Técnico</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      CRM/CRO
                    </label>
                    <input
                      type='text'
                      name='crm_cro'
                      value={formData.crm_cro}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Cidade
                    </label>
                    <input
                      type='text'
                      name='cidade'
                      value={formData.cidade}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                    Observações
                  </label>
                  <textarea
                    name='observacoes'
                    value={formData.observacoes}
                    onChange={handleInputChange}
                    rows={3}
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>

                <div className='flex justify-end space-x-3 pt-4'>
                  <button
                    type='button'
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className='px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                  >
                    Cancelar
                  </button>
                  <button
                    type='submit'
                    disabled={loading}
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  >
                    {loading ? 'Salvando...' : editingProfissional ? 'Atualizar' : 'Cadastrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profissionais;