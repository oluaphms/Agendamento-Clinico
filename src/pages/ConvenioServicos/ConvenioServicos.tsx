import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../../stores/themeStore';
import { toast } from 'react-hot-toast';
import {
  Save,
  Trash2,
  Edit,
  Search,
  Building2,
  Stethoscope,
  DollarSign,
  X,
  Eye,
  CheckCircle,
  ClipboardList,
} from 'lucide-react';

// ============================================================================
// PÁGINA: Convênio/Serviços
// ============================================================================
// Página para cadastro e gerenciamento de convênios e serviços da clínica.
// ============================================================================

interface Convenio {
  id: string;
  nome: string;
  cobertura: string;
  observacoes: string;
  ativo: boolean;
  dataCriacao: string;
}

interface Servico {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
  ativo: boolean;
  dataCriacao: string;
}

interface FormData {
  convenio: {
    nome: string;
    cobertura: string;
    observacoes: string;
  };
  servico: {
    nome: string;
    descricao: string;
    valor: string;
  };
}

const ConvenioServicos: React.FC = () => {
  const { isDark } = useThemeStore();
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [showConvenioModal, setShowConvenioModal] = useState(false);
  const [showServicoModal, setShowServicoModal] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<FormData>({
    convenio: {
      nome: '',
      cobertura: '',
      observacoes: '',
    },
    servico: {
      nome: '',
      descricao: '',
      valor: '',
    },
  });
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Convenio | Servico | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: 'convenio' | 'servico';
  } | null>(null);

  // Carregar dados do localStorage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const conveniosData = localStorage.getItem('convenios');
      const servicosData = localStorage.getItem('servicos');

      if (conveniosData) {
        setConvenios(JSON.parse(conveniosData));
      }
      if (servicosData) {
        setServicos(JSON.parse(servicosData));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados salvos');
    }
  };

  const saveData = () => {
    try {
      localStorage.setItem('convenios', JSON.stringify(convenios));
      localStorage.setItem('servicos', JSON.stringify(servicos));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error('Erro ao salvar dados');
    }
  };

  const clearForm = () => {
    setFormData({
      convenio: {
        nome: '',
        cobertura: '',
        observacoes: '',
      },
      servico: {
        nome: '',
        descricao: '',
        valor: '',
      },
    });
    setEditingItem(null);
  };

  const openConvenioModal = () => {
    clearForm();
    setShowConvenioModal(true);
  };

  const openServicoModal = () => {
    clearForm();
    setShowServicoModal(true);
  };

  const closeModals = () => {
    setShowConvenioModal(false);
    setShowServicoModal(false);
    clearForm();
  };

  const handleConvenioSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.convenio.nome.trim()) {
      toast.error('Nome do convênio é obrigatório');
      return;
    }

    const convenioData: Convenio = {
      id: editingItem || Date.now().toString(),
      nome: formData.convenio.nome.trim(),
      cobertura: formData.convenio.cobertura.trim(),
      observacoes: formData.convenio.observacoes.trim(),
      ativo: true,
      dataCriacao: editingItem
        ? convenios.find(c => c.id === editingItem)?.dataCriacao ||
          new Date().toISOString()
        : new Date().toISOString(),
    };

    if (editingItem) {
      setConvenios(prev =>
        prev.map(c => (c.id === editingItem ? convenioData : c))
      );
      toast.success('Convênio atualizado com sucesso!');
    } else {
      setConvenios(prev => [...prev, convenioData]);
      toast.success('Convênio cadastrado com sucesso!');
    }

    closeModals();
    saveData();
  };

  const handleServicoSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.servico.nome.trim()) {
      toast.error('Nome do serviço é obrigatório');
      return;
    }

    if (!formData.servico.valor || parseFloat(formData.servico.valor) < 0) {
      toast.error('Valor do serviço deve ser válido');
      return;
    }

    const servicoData: Servico = {
      id: editingItem || Date.now().toString(),
      nome: formData.servico.nome.trim(),
      descricao: formData.servico.descricao.trim(),
      valor: parseFloat(formData.servico.valor),
      ativo: true,
      dataCriacao: editingItem
        ? servicos.find(s => s.id === editingItem)?.dataCriacao ||
          new Date().toISOString()
        : new Date().toISOString(),
    };

    if (editingItem) {
      setServicos(prev =>
        prev.map(s => (s.id === editingItem ? servicoData : s))
      );
      toast.success('Serviço atualizado com sucesso!');
    } else {
      setServicos(prev => [...prev, servicoData]);
      toast.success('Serviço cadastrado com sucesso!');
    }

    closeModals();
    saveData();
  };

  const handleEdit = (
    item: Convenio | Servico,
    type: 'convenio' | 'servico'
  ) => {
    setEditingItem(item.id);

    if (type === 'convenio') {
      const convenio = item as Convenio;
      setFormData(prev => ({
        ...prev,
        convenio: {
          nome: convenio.nome,
          cobertura: convenio.cobertura,
          observacoes: convenio.observacoes,
        },
      }));
      setShowConvenioModal(true);
    } else {
      const servico = item as Servico;
      setFormData(prev => ({
        ...prev,
        servico: {
          nome: servico.nome,
          descricao: servico.descricao,
          valor: servico.valor.toString(),
        },
      }));
      setShowServicoModal(true);
    }
  };

  const handleViewDetails = (item: Convenio | Servico) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  const handleDeleteClick = (id: string, type: 'convenio' | 'servico') => {
    setItemToDelete({ id, type });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'convenio') {
        setConvenios(prev => prev.filter(c => c.id !== itemToDelete.id));
        toast.success('Convênio excluído com sucesso!');
      } else {
        setServicos(prev => prev.filter(s => s.id !== itemToDelete.id));
        toast.success('Serviço excluído com sucesso!');
      }
      saveData();
    }
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const toggleStatus = (id: string, type: 'convenio' | 'servico') => {
    if (type === 'convenio') {
      setConvenios(prev =>
        prev.map(c => (c.id === id ? { ...c, ativo: !c.ativo } : c))
      );
    } else {
      setServicos(prev =>
        prev.map(s => (s.id === id ? { ...s, ativo: !s.ativo } : s))
      );
    }
    saveData();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredConvenios = convenios.filter(
    convenio =>
      convenio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convenio.cobertura.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredServicos = servicos.filter(
    servico =>
      servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servico.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allItems = [
    ...filteredConvenios.map(item => ({ ...item, type: 'convenio' as const })),
    ...filteredServicos.map(item => ({ ...item, type: 'servico' as const })),
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header Padrão do Sistema */}
        

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
              <Building2
                className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
              />
              <div className='ml-4'>
                <p
                  className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  Total de Convênios
                </p>
                <p
                  className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {convenios.length}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className='flex items-center'>
              <Stethoscope
                className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`}
              />
              <div className='ml-4'>
                <p
                  className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  Total de Serviços
                </p>
                <p
                  className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {servicos.length}
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
                  Convênios Ativos
                </p>
                <p
                  className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {convenios.filter(c => c.ativo).length}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
          >
            <div className='flex items-center'>
              <DollarSign
                className={`w-8 h-8 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}
              />
              <div className='ml-4'>
                <p
                  className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  Serviços Ativos
                </p>
                <p
                  className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {servicos.filter(s => s.ativo).length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Botões de Ação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex flex-col sm:flex-row gap-4 mb-8'
        >
          <button
            onClick={openConvenioModal}
            className={`flex items-center justify-center space-x-3 px-6 py-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
            }`}
          >
            <Building2 className='w-6 h-6' />
            <span>Cadastrar Convênio</span>
          </button>

          <button
            onClick={openServicoModal}
            className={`flex items-center justify-center space-x-3 px-6 py-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
              isDark
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
            }`}
          >
            <Stethoscope className='w-6 h-6' />
            <span>Cadastrar Serviço</span>
          </button>
        </motion.div>

        {/* Busca */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-6'
        >
          <div className='relative'>
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
            <input
              type='text'
              placeholder='Buscar convênios e serviços...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </motion.div>

        {/* Lista de Itens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
        >
          <div className='p-6'>
            <h3
              className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              Convênios e Serviços Cadastrados
            </h3>
            {allItems.length === 0 ? (
              <div className='text-center py-12'>
                <ClipboardList
                  className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
                />
                <p
                  className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  Nenhum item cadastrado
                </p>
                <p
                  className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                >
                  Use os botões acima para cadastrar convênios e serviços
                </p>
              </div>
            ) : (
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {allItems.map(item => (
                  <motion.div
                    key={`${item.type}-${item.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex items-center space-x-2'>
                        {item.type === 'convenio' ? (
                          <Building2
                            className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                          />
                        ) : (
                          <Stethoscope
                            className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`}
                          />
                        )}
                        <h4
                          className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                        >
                          {item.nome}
                        </h4>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <button
                          onClick={() => toggleStatus(item.id, item.type)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            item.ativo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.ativo ? 'Ativo' : 'Inativo'}
                        </button>
                      </div>
                    </div>

                    {item.type === 'convenio' ? (
                      <>
                        {(item as Convenio).cobertura && (
                          <p
                            className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                          >
                            <strong>Cobertura:</strong>{' '}
                            {(item as Convenio).cobertura}
                          </p>
                        )}
                        {(item as Convenio).observacoes && (
                          <p
                            className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                          >
                            <strong>Observações:</strong>{' '}
                            {(item as Convenio).observacoes}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p
                          className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                        >
                          <strong>Valor:</strong>{' '}
                          {formatCurrency((item as Servico).valor)}
                        </p>
                        {(item as Servico).descricao && (
                          <p
                            className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                          >
                            <strong>Descrição:</strong>{' '}
                            {(item as Servico).descricao}
                          </p>
                        )}
                      </>
                    )}

                    <div className='flex items-center justify-between'>
                      <span
                        className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        {new Date(item.dataCriacao).toLocaleDateString('pt-BR')}
                      </span>
                      <div className='flex items-center space-x-2'>
                        <button
                          onClick={() => handleViewDetails(item)}
                          className={`p-1 rounded hover:bg-gray-200 ${isDark ? 'hover:bg-gray-600' : ''}`}
                          title='Ver detalhes'
                        >
                          <Eye
                            className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                          />
                        </button>
                        <button
                          onClick={() => handleEdit(item, item.type)}
                          className={`p-1 rounded hover:bg-gray-200 ${isDark ? 'hover:bg-gray-600' : ''}`}
                          title='Editar'
                        >
                          <Edit
                            className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.id, item.type)}
                          className={`p-1 rounded hover:bg-red-100 ${isDark ? 'hover:bg-red-900' : ''}`}
                          title='Excluir'
                        >
                          <Trash2
                            className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`}
                          />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Modal de Convênio */}
        <AnimatePresence>
          {showConvenioModal && (
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
                <div
                  className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className='flex items-center justify-between'>
                    <h3
                      className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {editingItem ? 'Editar Convênio' : 'Cadastrar Convênio'}
                    </h3>
                    <button
                      onClick={closeModals}
                      className={`p-1 rounded hover:bg-gray-200 ${isDark ? 'hover:bg-gray-700' : ''}`}
                    >
                      <X
                        className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleConvenioSubmit} className='p-6'>
                  <div className='space-y-4'>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Nome do Convênio *
                      </label>
                      <input
                        type='text'
                        value={formData.convenio.nome}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            convenio: {
                              ...prev.convenio,
                              nome: e.target.value,
                            },
                          }))
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder='Ex: Unimed, Bradesco Saúde'
                        required
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Cobertura
                      </label>
                      <input
                        type='text'
                        value={formData.convenio.cobertura}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            convenio: {
                              ...prev.convenio,
                              cobertura: e.target.value,
                            },
                          }))
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder='Ex: 100% consultas, 80% exames'
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Observações
                      </label>
                      <textarea
                        value={formData.convenio.observacoes}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            convenio: {
                              ...prev.convenio,
                              observacoes: e.target.value,
                            },
                          }))
                        }
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder='Informações adicionais sobre o convênio'
                      />
                    </div>
                  </div>

                  <div className='flex items-center justify-end space-x-3 mt-6'>
                    <button
                      type='button'
                      onClick={closeModals}
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

        {/* Modal de Serviço */}
        <AnimatePresence>
          {showServicoModal && (
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
                <div
                  className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className='flex items-center justify-between'>
                    <h3
                      className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {editingItem ? 'Editar Serviço' : 'Cadastrar Serviço'}
                    </h3>
                    <button
                      onClick={closeModals}
                      className={`p-1 rounded hover:bg-gray-200 ${isDark ? 'hover:bg-gray-700' : ''}`}
                    >
                      <X
                        className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleServicoSubmit} className='p-6'>
                  <div className='space-y-4'>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Nome do Serviço *
                      </label>
                      <input
                        type='text'
                        value={formData.servico.nome}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            servico: { ...prev.servico, nome: e.target.value },
                          }))
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder='Ex: Consulta Cardiológica, Exame de Sangue'
                        required
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Descrição
                      </label>
                      <textarea
                        value={formData.servico.descricao}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            servico: {
                              ...prev.servico,
                              descricao: e.target.value,
                            },
                          }))
                        }
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder='Descrição detalhada do serviço'
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Valor (R$) *
                      </label>
                      <input
                        type='number'
                        step='0.01'
                        min='0'
                        value={formData.servico.valor}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            servico: { ...prev.servico, valor: e.target.value },
                          }))
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder='0,00'
                        required
                      />
                    </div>
                  </div>

                  <div className='flex items-center justify-end space-x-3 mt-6'>
                    <button
                      type='button'
                      onClick={closeModals}
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
                      className='flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors'
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
          {showDetails && selectedItem && (
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
                      Detalhes do{' '}
                      {allItems.find(item => item.id === selectedItem.id)
                        ?.type === 'convenio'
                        ? 'Convênio'
                        : 'Serviço'}
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
                  <div className='space-y-4'>
                    <div>
                      <h4
                        className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        {selectedItem.nome}
                      </h4>
                      <p
                        className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                        {allItems.find(item => item.id === selectedItem.id)
                          ?.type === 'convenio'
                          ? 'Convênio'
                          : 'Serviço'}
                      </p>
                    </div>

                    {allItems.find(item => item.id === selectedItem.id)
                      ?.type === 'convenio' ? (
                      <>
                        {(selectedItem as Convenio).cobertura && (
                          <div>
                            <p
                              className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              Cobertura:
                            </p>
                            <p
                              className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                            >
                              {(selectedItem as Convenio).cobertura}
                            </p>
                          </div>
                        )}
                        {(selectedItem as Convenio).observacoes && (
                          <div>
                            <p
                              className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              Observações:
                            </p>
                            <p
                              className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                            >
                              {(selectedItem as Convenio).observacoes}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div>
                          <p
                            className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            Valor:
                          </p>
                          <p
                            className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                          >
                            {formatCurrency((selectedItem as Servico).valor)}
                          </p>
                        </div>
                        {(selectedItem as Servico).descricao && (
                          <div>
                            <p
                              className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              Descrição:
                            </p>
                            <p
                              className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                            >
                              {(selectedItem as Servico).descricao}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    <div>
                      <p
                        className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Status:
                      </p>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          selectedItem.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {selectedItem.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <div>
                      <p
                        className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Data de Criação:
                      </p>
                      <p
                        className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        {new Date(selectedItem.dataCriacao).toLocaleDateString(
                          'pt-BR'
                        )}
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
                      <Trash2
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
                    Tem certeza que deseja excluir este{' '}
                    {itemToDelete?.type === 'convenio' ? 'convênio' : 'serviço'}
                    ? Esta ação não pode ser desfeita.
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

export default ConvenioServicos;
