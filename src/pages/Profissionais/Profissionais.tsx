import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../../stores/themeStore';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Save,
  Trash2,
  Edit,
  Search,
  Stethoscope,
  Eye,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
  Building2,
} from 'lucide-react';

// ============================================================================
// PÁGINA: Profissionais
// ============================================================================
// Página para cadastro e gerenciamento de profissionais da clínica.
// ============================================================================

interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
  registro: string;
  telefone: string;
  email: string;
  departamento: string;
  foto?: string;
  observacoes?: string;
  ativo: boolean;
  dataCriacao: string;
}

interface ProfissionalFormData {
  nome: string;
  especialidade: string;
  registro: string;
  telefone: string;
  email: string;
  departamento: string;
  foto: string;
  observacoes: string;
}

const Profissionais: React.FC = () => {
  const { isDark } = useThemeStore();
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [especialidadeFilter, setEspecialidadeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState<ProfissionalFormData>({
    nome: '',
    especialidade: '',
    registro: '',
    telefone: '',
    email: '',
    departamento: '',
    foto: '',
    observacoes: '',
  });
  const [showDetails, setShowDetails] = useState(false);
  const [selectedProfissional, setSelectedProfissional] =
    useState<Profissional | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<ProfissionalFormData>>(
    {}
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profissionalToDelete, setProfissionalToDelete] = useState<
    string | null
  >(null);

  // Carregar dados do localStorage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const data = localStorage.getItem('profissionais');
      if (data) {
        setProfissionais(JSON.parse(data));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados salvos');
    }
  };

  const saveData = () => {
    try {
      localStorage.setItem('profissionais', JSON.stringify(profissionais));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error('Erro ao salvar dados');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      especialidade: '',
      registro: '',
      telefone: '',
      email: '',
      departamento: '',
      foto: '',
      observacoes: '',
    });
    setEditingItem(null);
    setFormErrors({});
  };

  const handleInputChange = (
    field: keyof ProfissionalFormData,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<ProfissionalFormData> = {};

    if (!formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    }

    if (!formData.especialidade.trim()) {
      errors.especialidade = 'Especialidade é obrigatória';
    }

    if (!formData.registro.trim()) {
      errors.registro = 'Registro profissional é obrigatório';
    }

    if (!formData.telefone.trim()) {
      errors.telefone = 'Telefone é obrigatório';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.departamento.trim()) {
      errors.departamento = 'Departamento é obrigatório';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    const profissionalData: Profissional = {
      id: editingItem || Date.now().toString(),
      nome: formData.nome.trim(),
      especialidade: formData.especialidade.trim(),
      registro: formData.registro.trim(),
      telefone: formData.telefone.trim(),
      email: formData.email.trim(),
      departamento: formData.departamento.trim(),
      foto: formData.foto.trim(),
      observacoes: formData.observacoes.trim(),
      ativo: true,
      dataCriacao: editingItem
        ? profissionais.find(p => p.id === editingItem)?.dataCriacao ||
          new Date().toISOString()
        : new Date().toISOString(),
    };

    if (editingItem) {
      setProfissionais(prev =>
        prev.map(p => (p.id === editingItem ? profissionalData : p))
      );
      toast.success('Profissional atualizado com sucesso!');
    } else {
      setProfissionais(prev => [...prev, profissionalData]);
      toast.success('Profissional cadastrado com sucesso!');
    }

    resetForm();
    setShowForm(false);
    saveData();
  };

  const handleEdit = (profissional: Profissional) => {
    setEditingItem(profissional.id);
    setFormData({
      nome: profissional.nome,
      especialidade: profissional.especialidade,
      registro: profissional.registro,
      telefone: profissional.telefone,
      email: profissional.email,
      departamento: profissional.departamento,
      foto: profissional.foto || '',
      observacoes: profissional.observacoes || '',
    });
    setShowForm(true);
  };

  const handleViewDetails = (profissional: Profissional) => {
    setSelectedProfissional(profissional);
    setShowDetails(true);
  };

  const handleDelete = (id: string) => {
    setProfissionalToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (profissionalToDelete) {
      setProfissionais(prev => prev.filter(p => p.id !== profissionalToDelete));
      toast.success('Profissional excluído com sucesso!');
      saveData();
    }
    setShowDeleteConfirm(false);
    setProfissionalToDelete(null);
  };

  const toggleStatus = (id: string) => {
    setProfissionais(prev =>
      prev.map(p => (p.id === id ? { ...p, ativo: !p.ativo } : p))
    );
    saveData();
  };

  const filteredProfissionais = profissionais.filter(profissional => {
    const matchesSearch =
      profissional.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profissional.especialidade
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      profissional.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEspecialidade =
      !especialidadeFilter ||
      profissional.especialidade === especialidadeFilter;
    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'ativo' && profissional.ativo) ||
      (statusFilter === 'inativo' && !profissional.ativo);

    return matchesSearch && matchesEspecialidade && matchesStatus;
  });

  const especialidades = [...new Set(profissionais.map(p => p.especialidade))];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8'
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div
                className={`p-3 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-blue-100'}`}
              >
                <Stethoscope
                  className={`w-8 h-8 ${isDark ? 'text-white' : 'text-blue-600'}`}
                />
              </div>
              <div>
                <h1
                  className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  Profissionais da Clínica
                </h1>
                <p
                  className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                >
                  Gerencie profissionais e suas especialidades
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Plus className='w-5 h-5' />
              <span>Adicionar Profissional</span>
            </button>
          </div>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'
        >
          <div
            className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className='flex items-center'>
              <Stethoscope
                className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
              />
              <div className='ml-4'>
                <p
                  className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  Total de Profissionais
                </p>
                <p
                  className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {profissionais.length}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className='flex items-center'>
              <CheckCircle
                className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`}
              />
              <div className='ml-4'>
                <p
                  className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  Profissionais Ativos
                </p>
                <p
                  className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {profissionais.filter(p => p.ativo).length}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className='flex items-center'>
              <Building2
                className={`w-8 h-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}
              />
              <div className='ml-4'>
                <p
                  className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  Especialidades
                </p>
                <p
                  className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {especialidades.length}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className='flex items-center'>
              <Plus
                className={`w-8 h-8 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}
              />
              <div className='ml-4'>
                <p
                  className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  Novos Este Mês
                </p>
                <p
                  className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {
                    profissionais.filter(p => {
                      const dataCriacao = new Date(p.dataCriacao);
                      const now = new Date();
                      return (
                        dataCriacao.getMonth() === now.getMonth() &&
                        dataCriacao.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-8`}
        >
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Buscar
              </label>
              <div className='relative'>
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                />
                <input
                  type='text'
                  placeholder='Nome, especialidade ou email...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Especialidade
              </label>
              <select
                value={especialidadeFilter}
                onChange={e => setEspecialidadeFilter(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value=''>Todas as especialidades</option>
                {especialidades.map(especialidade => (
                  <option key={especialidade} value={especialidade}>
                    {especialidade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Status
              </label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value=''>Todos os status</option>
                <option value='ativo'>Ativo</option>
                <option value='inativo'>Inativo</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Lista de Profissionais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead
                className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <tr>
                  <th
                    className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    Profissional
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    Especialidade
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    Contato
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    Departamento
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    Status
                  </th>
                  <th
                    className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${
                      isDark ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}
              >
                {filteredProfissionais.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='px-6 py-12 text-center'>
                      <Stethoscope
                        className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
                      />
                      <p
                        className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        Nenhum profissional encontrado
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProfissionais.map(profissional => (
                    <motion.tr
                      key={profissional.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-10 w-10'>
                            {profissional.foto ? (
                              <img
                                className='h-10 w-10 rounded-full object-cover'
                                src={profissional.foto}
                                alt={profissional.nome}
                              />
                            ) : (
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                                }`}
                              >
                                <Stethoscope
                                  className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                                />
                              </div>
                            )}
                          </div>
                          <div className='ml-4'>
                            <div
                              className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
                            >
                              {profissional.nome}
                            </div>
                            <div
                              className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              {profissional.registro}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div
                          className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}
                        >
                          {profissional.especialidade}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div
                          className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}
                        >
                          {profissional.telefone}
                        </div>
                        <div
                          className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                          {profissional.email}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div
                          className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}
                        >
                          {profissional.departamento}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            profissional.ativo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {profissional.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <div className='flex items-center space-x-2'>
                          <button
                            onClick={() => handleViewDetails(profissional)}
                            className={`p-1 rounded hover:bg-gray-200 ${isDark ? 'hover:bg-gray-600' : ''}`}
                            title='Ver detalhes'
                          >
                            <Eye
                              className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                            />
                          </button>
                          <button
                            onClick={() => handleEdit(profissional)}
                            className={`p-1 rounded hover:bg-gray-200 ${isDark ? 'hover:bg-gray-600' : ''}`}
                            title='Editar'
                          >
                            <Edit
                              className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                            />
                          </button>
                          <button
                            onClick={() => toggleStatus(profissional.id)}
                            className={`p-1 rounded hover:bg-gray-200 ${isDark ? 'hover:bg-gray-600' : ''}`}
                            title={profissional.ativo ? 'Desativar' : 'Ativar'}
                          >
                            {profissional.ativo ? (
                              <XCircle
                                className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`}
                              />
                            ) : (
                              <CheckCircle
                                className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-500'}`}
                              />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(profissional.id)}
                            className={`p-1 rounded hover:bg-red-100 ${isDark ? 'hover:bg-red-900' : ''}`}
                            title='Excluir'
                          >
                            <Trash2
                              className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`}
                            />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Modal de Formulário */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`w-full max-w-2xl rounded-lg shadow-xl ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div
                  className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className='flex items-center justify-between'>
                    <h3
                      className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {editingItem
                        ? 'Editar Profissional'
                        : 'Adicionar Profissional'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                      className={`p-1 rounded hover:bg-gray-200 ${isDark ? 'hover:bg-gray-700' : ''}`}
                    >
                      <X
                        className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className='p-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Nome Completo *
                      </label>
                      <input
                        type='text'
                        value={formData.nome}
                        onChange={e =>
                          handleInputChange('nome', e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } ${formErrors.nome ? 'border-red-500' : ''}`}
                        placeholder='Nome completo do profissional'
                      />
                      {formErrors.nome && (
                        <p className='mt-1 text-sm text-red-600'>
                          {formErrors.nome}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Especialidade *
                      </label>
                      <input
                        type='text'
                        value={formData.especialidade}
                        onChange={e =>
                          handleInputChange('especialidade', e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } ${formErrors.especialidade ? 'border-red-500' : ''}`}
                        placeholder='Ex: Cardiologia, Pediatria'
                      />
                      {formErrors.especialidade && (
                        <p className='mt-1 text-sm text-red-600'>
                          {formErrors.especialidade}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Registro Profissional *
                      </label>
                      <input
                        type='text'
                        value={formData.registro}
                        onChange={e =>
                          handleInputChange('registro', e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } ${formErrors.registro ? 'border-red-500' : ''}`}
                        placeholder='CRM, CRO, etc.'
                      />
                      {formErrors.registro && (
                        <p className='mt-1 text-sm text-red-600'>
                          {formErrors.registro}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Telefone *
                      </label>
                      <input
                        type='tel'
                        value={formData.telefone}
                        onChange={e =>
                          handleInputChange('telefone', e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } ${formErrors.telefone ? 'border-red-500' : ''}`}
                        placeholder='(11) 99999-9999'
                      />
                      {formErrors.telefone && (
                        <p className='mt-1 text-sm text-red-600'>
                          {formErrors.telefone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Email *
                      </label>
                      <input
                        type='email'
                        value={formData.email}
                        onChange={e =>
                          handleInputChange('email', e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } ${formErrors.email ? 'border-red-500' : ''}`}
                        placeholder='profissional@clinica.com'
                      />
                      {formErrors.email && (
                        <p className='mt-1 text-sm text-red-600'>
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Departamento *
                      </label>
                      <input
                        type='text'
                        value={formData.departamento}
                        onChange={e =>
                          handleInputChange('departamento', e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } ${formErrors.departamento ? 'border-red-500' : ''}`}
                        placeholder='Ex: Cardiologia, Pediatria'
                      />
                      {formErrors.departamento && (
                        <p className='mt-1 text-sm text-red-600'>
                          {formErrors.departamento}
                        </p>
                      )}
                    </div>

                    <div className='md:col-span-2'>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        URL da Foto
                      </label>
                      <input
                        type='url'
                        value={formData.foto}
                        onChange={e =>
                          handleInputChange('foto', e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder='https://exemplo.com/foto.jpg'
                      />
                    </div>

                    <div className='md:col-span-2'>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Observações
                      </label>
                      <textarea
                        value={formData.observacoes}
                        onChange={e =>
                          handleInputChange('observacoes', e.target.value)
                        }
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder='Observações adicionais sobre o profissional'
                      />
                    </div>
                  </div>

                  <div className='flex items-center justify-end space-x-3 mt-6'>
                    <button
                      type='button'
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isDark
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type='submit'
                      className='flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors'
                    >
                      <Save className='w-4 h-4' />
                      <span>{editingItem ? 'Atualizar' : 'Salvar'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Detalhes */}
        <AnimatePresence>
          {showDetails && selectedProfissional && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`w-full max-w-lg rounded-lg shadow-xl ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div
                  className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className='flex items-center justify-between'>
                    <h3
                      className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      Detalhes do Profissional
                    </h3>
                    <button
                      onClick={() => setShowDetails(false)}
                      className={`p-1 rounded hover:bg-gray-200 ${isDark ? 'hover:bg-gray-700' : ''}`}
                    >
                      <X
                        className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      />
                    </button>
                  </div>
                </div>

                <div className='p-6'>
                  <div className='flex items-center space-x-4 mb-6'>
                    {selectedProfissional.foto ? (
                      <img
                        className='h-20 w-20 rounded-full object-cover'
                        src={selectedProfissional.foto}
                        alt={selectedProfissional.nome}
                      />
                    ) : (
                      <div
                        className={`h-20 w-20 rounded-full flex items-center justify-center ${
                          isDark ? 'bg-gray-700' : 'bg-gray-200'
                        }`}
                      >
                        <Stethoscope
                          className={`w-10 h-10 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                        />
                      </div>
                    )}
                    <div>
                      <h4
                        className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        {selectedProfissional.nome}
                      </h4>
                      <p
                        className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        {selectedProfissional.especialidade}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-2 ${
                          selectedProfissional.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {selectedProfissional.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <p
                        className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Registro Profissional:
                      </p>
                      <p
                        className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        {selectedProfissional.registro}
                      </p>
                    </div>

                    <div>
                      <p
                        className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Contato:
                      </p>
                      <p
                        className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        {selectedProfissional.telefone}
                      </p>
                      <p
                        className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        {selectedProfissional.email}
                      </p>
                    </div>

                    <div>
                      <p
                        className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Departamento:
                      </p>
                      <p
                        className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        {selectedProfissional.departamento}
                      </p>
                    </div>

                    {selectedProfissional.observacoes && (
                      <div>
                        <p
                          className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          Observações:
                        </p>
                        <p
                          className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                        >
                          {selectedProfissional.observacoes}
                        </p>
                      </div>
                    )}

                    <div>
                      <p
                        className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Data de Cadastro:
                      </p>
                      <p
                        className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        {new Date(
                          selectedProfissional.dataCriacao
                        ).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Confirmação de Exclusão */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`w-full max-w-md rounded-lg shadow-xl ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div className='p-6'>
                  <div className='flex items-center space-x-3 mb-4'>
                    <div
                      className={`p-2 rounded-full ${isDark ? 'bg-red-900' : 'bg-red-100'}`}
                    >
                      <AlertCircle
                        className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`}
                      />
                    </div>
                    <h3
                      className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      Confirmar Exclusão
                    </h3>
                  </div>

                  <p
                    className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    Tem certeza que deseja excluir este profissional? Esta ação
                    não pode ser desfeita.
                  </p>

                  <div className='flex items-center justify-end space-x-3'>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isDark
                          ? 'bg-gray-700 hover:bg-gray-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmDelete}
                      className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors'
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profissionais;
