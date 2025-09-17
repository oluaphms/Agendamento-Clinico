// ============================================================================
// PÁGINA: Serviços e Convênios
// ============================================================================
// Página para cadastro e gerenciamento de serviços e convênios da clínica.
// Inclui formulários para cadastro e listagem dos itens cadastrados.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Save,
  Trash2,
  Edit,
  Search,
  DollarSign,
  FileText,
  Shield,
} from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface Servico {
  id: string;
  nome: string;
  descricao: string;
  valorPadrao: number;
  ativo: boolean;
  dataCriacao: string;
}

interface Convenio {
  id: string;
  nome: string;
  servicosCobertos: string[];
  observacoes?: string;
  ativo: boolean;
  dataCriacao: string;
}

interface FormData {
  servico: {
    nome: string;
    descricao: string;
    valorPadrao: string;
  };
  convenio: {
    nome: string;
    servicosCobertos: string[];
    observacoes: string;
  };
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ServicosConvenios() {
  const { isDark } = useThemeStore();

  // Estados do formulário
  const [formData, setFormData] = useState<FormData>({
    servico: {
      nome: '',
      descricao: '',
      valorPadrao: '',
    },
    convenio: {
      nome: '',
      servicosCobertos: [],
      observacoes: '',
    },
  });

  // Estados dos dados
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [activeTab, setActiveTab] = useState<'servicos' | 'convenios'>(
    'servicos'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const servicosData = localStorage.getItem('servicos');
      const conveniosData = localStorage.getItem('convenios');

      if (servicosData) {
        setServicos(JSON.parse(servicosData));
      }
      if (conveniosData) {
        setConvenios(JSON.parse(conveniosData));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados salvos');
    }
  };

  const saveData = (newServicos: Servico[], newConvenios: Convenio[]) => {
    try {
      localStorage.setItem('servicos', JSON.stringify(newServicos));
      localStorage.setItem('convenios', JSON.stringify(newConvenios));
      setServicos(newServicos);
      setConvenios(newConvenios);
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error('Erro ao salvar dados');
    }
  };

  const handleServicoSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.servico.nome.trim()) {
      toast.error('Nome do serviço é obrigatório');
      return;
    }

    if (
      !formData.servico.valorPadrao ||
      parseFloat(formData.servico.valorPadrao) <= 0
    ) {
      toast.error('Valor padrão deve ser maior que zero');
      return;
    }

    const novoServico: Servico = {
      id: editingItem || Date.now().toString(),
      nome: formData.servico.nome.trim(),
      descricao: formData.servico.descricao.trim(),
      valorPadrao: parseFloat(formData.servico.valorPadrao),
      ativo: true,
      dataCriacao: editingItem
        ? servicos.find(s => s.id === editingItem)?.dataCriacao ||
          new Date().toISOString()
        : new Date().toISOString(),
    };

    const newServicos = editingItem
      ? servicos.map(s => (s.id === editingItem ? novoServico : s))
      : [...servicos, novoServico];

    saveData(newServicos, convenios);

    toast.success(
      editingItem
        ? 'Serviço atualizado com sucesso!'
        : 'Serviço cadastrado com sucesso!'
    );
    clearForm();
  };

  const handleConvenioSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.convenio.nome.trim()) {
      toast.error('Nome do convênio é obrigatório');
      return;
    }

    const novoConvenio: Convenio = {
      id: editingItem || Date.now().toString(),
      nome: formData.convenio.nome.trim(),
      servicosCobertos: formData.convenio.servicosCobertos,
      observacoes: formData.convenio.observacoes.trim(),
      ativo: true,
      dataCriacao: editingItem
        ? convenios.find(c => c.id === editingItem)?.dataCriacao ||
          new Date().toISOString()
        : new Date().toISOString(),
    };

    const newConvenios = editingItem
      ? convenios.map(c => (c.id === editingItem ? novoConvenio : c))
      : [...convenios, novoConvenio];

    saveData(servicos, newConvenios);

    toast.success(
      editingItem
        ? 'Convênio atualizado com sucesso!'
        : 'Convênio cadastrado com sucesso!'
    );
    clearForm();
  };

  const clearForm = () => {
    setFormData({
      servico: {
        nome: '',
        descricao: '',
        valorPadrao: '',
      },
      convenio: {
        nome: '',
        servicosCobertos: [],
        observacoes: '',
      },
    });
    setEditingItem(null);
  };

  const handleEdit = (
    item: Servico | Convenio,
    type: 'servico' | 'convenio'
  ) => {
    setEditingItem(item.id);
    setActiveTab(type === 'servico' ? 'servicos' : 'convenios');

    if (type === 'servico') {
      const servico = item as Servico;
      setFormData(prev => ({
        ...prev,
        servico: {
          nome: servico.nome,
          descricao: servico.descricao,
          valorPadrao: servico.valorPadrao.toString(),
        },
      }));
    } else {
      const convenio = item as Convenio;
      setFormData(prev => ({
        ...prev,
        convenio: {
          nome: convenio.nome,
          servicosCobertos: convenio.servicosCobertos,
          observacoes: convenio.observacoes || '',
        },
      }));
    }
  };

  const handleDelete = (id: string, type: 'servico' | 'convenio') => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      if (type === 'servico') {
        const newServicos = servicos.filter(s => s.id !== id);
        saveData(newServicos, convenios);
        toast.success('Serviço excluído com sucesso!');
      } else {
        const newConvenios = convenios.filter(c => c.id !== id);
        saveData(servicos, newConvenios);
        toast.success('Convênio excluído com sucesso!');
      }
    }
  };

  const toggleServicoCoberto = (servicoId: string) => {
    const isCoberto = formData.convenio.servicosCobertos.includes(servicoId);
    setFormData(prev => ({
      ...prev,
      convenio: {
        ...prev.convenio,
        servicosCobertos: isCoberto
          ? prev.convenio.servicosCobertos.filter(id => id !== servicoId)
          : [...prev.convenio.servicosCobertos, servicoId],
      },
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredServicos = servicos.filter(
    servico =>
      servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servico.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConvenios = convenios.filter(
    convenio =>
      convenio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convenio.observacoes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <div className='max-w-7xl mx-auto p-6'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-8'
        >
          <div className='flex items-center space-x-3 mb-4'>
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <ClipboardList
                size={32}
                className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`}
              />
            </motion.div>
            <div>
              <h1
                className={`text-3xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                Serviços e Convênios
              </h1>
              <p
                className={`text-lg ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Gerencie os serviços e convênios da clínica
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className='flex space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1'>
            <button
              onClick={() => setActiveTab('servicos')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'servicos'
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 shadow-sm'
                  : isDark
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText size={20} />
              <span>Serviços ({servicos.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('convenios')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'convenios'
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 shadow-sm'
                  : isDark
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Shield size={20} />
              <span>Convênios ({convenios.length})</span>
            </button>
          </div>
        </motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Formulário */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`p-6 rounded-xl shadow-lg ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h2
              className={`text-xl font-semibold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {editingItem ? 'Editar' : 'Cadastrar'}{' '}
              {activeTab === 'servicos' ? 'Serviço' : 'Convênio'}
            </h2>

            {activeTab === 'servicos' ? (
              <form onSubmit={handleServicoSubmit} className='space-y-4'>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
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
                    placeholder='Ex: Consulta médica, Exame de sangue...'
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Descrição
                  </label>
                  <textarea
                    value={formData.servico.descricao}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        servico: { ...prev.servico, descricao: e.target.value },
                      }))
                    }
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder='Descreva o serviço oferecido...'
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Valor Padrão (R$) *
                  </label>
                  <div className='relative'>
                    <DollarSign
                      size={20}
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    />
                    <input
                      type='number'
                      step='0.01'
                      min='0'
                      value={formData.servico.valorPadrao}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          servico: {
                            ...prev.servico,
                            valorPadrao: e.target.value,
                          },
                        }))
                      }
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder='0,00'
                    />
                  </div>
                </div>

                <div className='flex space-x-3 pt-4'>
                  <button
                    type='submit'
                    className='flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2'
                  >
                    <Save size={20} />
                    <span>{editingItem ? 'Atualizar' : 'Salvar'}</span>
                  </button>
                  <button
                    type='button'
                    onClick={clearForm}
                    className='px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                  >
                    Limpar
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConvenioSubmit} className='space-y-4'>
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Nome do Convênio *
                  </label>
                  <input
                    type='text'
                    value={formData.convenio.nome}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        convenio: { ...prev.convenio, nome: e.target.value },
                      }))
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder='Ex: Unimed, Bradesco Saúde...'
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Serviços Cobertos
                  </label>
                  <div
                    className={`max-h-40 overflow-y-auto border rounded-lg p-3 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    {servicos.length === 0 ? (
                      <p
                        className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        Nenhum serviço cadastrado ainda
                      </p>
                    ) : (
                      servicos.map(servico => (
                        <label
                          key={servico.id}
                          className='flex items-center space-x-2 py-1 cursor-pointer'
                        >
                          <input
                            type='checkbox'
                            checked={formData.convenio.servicosCobertos.includes(
                              servico.id
                            )}
                            onChange={() => toggleServicoCoberto(servico.id)}
                            className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                          />
                          <span
                            className={`text-sm ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            {servico.nome} -{' '}
                            {formatCurrency(servico.valorPadrao)}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
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
                    placeholder='Observações adicionais sobre o convênio...'
                  />
                </div>

                <div className='flex space-x-3 pt-4'>
                  <button
                    type='submit'
                    className='flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2'
                  >
                    <Save size={20} />
                    <span>{editingItem ? 'Atualizar' : 'Salvar'}</span>
                  </button>
                  <button
                    type='button'
                    onClick={clearForm}
                    className='px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                  >
                    Limpar
                  </button>
                </div>
              </form>
            )}
          </motion.div>

          {/* Lista */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`p-6 rounded-xl shadow-lg ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className='flex items-center justify-between mb-6'>
              <h2
                className={`text-xl font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {activeTab === 'servicos'
                  ? 'Serviços Cadastrados'
                  : 'Convênios Cadastrados'}
              </h2>
              <div className='flex items-center space-x-2'>
                <div className='relative'>
                  <Search
                    size={20}
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  />
                  <input
                    type='text'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder='Buscar...'
                    className={`pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className='space-y-3 max-h-96 overflow-y-auto'>
              {activeTab === 'servicos' ? (
                filteredServicos.length === 0 ? (
                  <div
                    className={`text-center py-8 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    <FileText size={48} className='mx-auto mb-4 opacity-50' />
                    <p>Nenhum serviço cadastrado</p>
                  </div>
                ) : (
                  filteredServicos.map(servico => (
                    <motion.div
                      key={servico.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border ${
                        isDark
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <h3
                            className={`font-medium ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {servico.nome}
                          </h3>
                          {servico.descricao && (
                            <p
                              className={`text-sm mt-1 ${
                                isDark ? 'text-gray-300' : 'text-gray-600'
                              }`}
                            >
                              {servico.descricao}
                            </p>
                          )}
                          <div className='flex items-center space-x-4 mt-2'>
                            <span
                              className={`text-sm font-medium ${
                                isDark ? 'text-blue-400' : 'text-blue-600'
                              }`}
                            >
                              {formatCurrency(servico.valorPadrao)}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                servico.ativo
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}
                            >
                              {servico.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </div>
                        <div className='flex items-center space-x-2 ml-4'>
                          <button
                            onClick={() => handleEdit(servico, 'servico')}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? 'text-gray-400 hover:text-white hover:bg-gray-600'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(servico.id, 'servico')}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20'
                                : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )
              ) : filteredConvenios.length === 0 ? (
                <div
                  className={`text-center py-8 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <Shield size={48} className='mx-auto mb-4 opacity-50' />
                  <p>Nenhum convênio cadastrado</p>
                </div>
              ) : (
                filteredConvenios.map(convenio => (
                  <motion.div
                    key={convenio.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <h3
                          className={`font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {convenio.nome}
                        </h3>
                        <div className='mt-2'>
                          <p
                            className={`text-sm ${
                              isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            Serviços cobertos:{' '}
                            {convenio.servicosCobertos.length}
                          </p>
                          {convenio.observacoes && (
                            <p
                              className={`text-sm mt-1 ${
                                isDark ? 'text-gray-300' : 'text-gray-600'
                              }`}
                            >
                              {convenio.observacoes}
                            </p>
                          )}
                        </div>
                        <div className='flex items-center space-x-4 mt-2'>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              convenio.ativo
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {convenio.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                      <div className='flex items-center space-x-2 ml-4'>
                        <button
                          onClick={() => handleEdit(convenio, 'convenio')}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark
                              ? 'text-gray-400 hover:text-white hover:bg-gray-600'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(convenio.id, 'convenio')}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark
                              ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20'
                              : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
