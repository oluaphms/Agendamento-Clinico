// ============================================================================
// PÁGINA: Pacientes - Gerenciamento de Pacientes do Sistema
// ============================================================================
// Esta página permite gerenciar todos os pacientes cadastrados no sistema,
// incluindo visualização, edição e controle de informações.
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Heart,
  UserCheck,
  UserX,
  Calendar,
  Phone,
  Mail,
  MessageCircle,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
} from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import { supabase, checkSupabaseConnection } from '@/lib/supabase';
import { localDb } from '@/lib/database';
import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  email?: string;
  convenio?: string;
  observacoes?: string;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
}

interface PacienteFormData {
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  email: string;
  convenio: string;
  observacoes: string;
}

// ============================================================================
// DADOS MOCK
// ============================================================================

const MOCK_PACIENTES: Paciente[] = [
  {
    id: '1',
    nome: 'ELEN DE OLIVEIRA CUNHA',
    cpf: '003.641.765-39',
    data_nascimento: '1980-05-15',
    telefone: '(79) 99973-7648',
    email: 'elinhap@gmail.com',
    convenio: 'Particular',
    observacoes: 'Paciente com acompanhamento regular',
    status: 'ativo',
    created_at: '2025-09-11T10:30:00Z',
    updated_at: '2025-09-11T10:30:00Z',
  },
  {
    id: '2',
    nome: 'PAULO HENRIQUE DE MORAIS SILVA',
    cpf: '068.915.164-04',
    data_nascimento: '1984-03-22',
    telefone: '(79) 99141-2945',
    email: 'paulohmorais@hotmail.com',
    convenio: 'Particular',
    observacoes: 'Paciente com histórico de consultas regulares',
    status: 'ativo',
    created_at: '2025-09-11T14:20:00Z',
    updated_at: '2025-09-11T14:20:00Z',
  },
  {
    id: '3',
    nome: 'João Silva Santos',
    cpf: '123.456.789-00',
    data_nascimento: '1985-03-15',
    telefone: '(11) 99999-1111',
    email: 'joao.silva@email.com',
    convenio: 'Unimed',
    observacoes: 'Paciente com histórico de hipertensão',
    status: 'ativo',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '4',
    nome: 'Maria Oliveira Costa',
    cpf: '987.654.321-00',
    data_nascimento: '1990-07-22',
    telefone: '(11) 99999-2222',
    email: 'maria.oliveira@email.com',
    convenio: 'Bradesco Saúde',
    observacoes: 'Alergia a penicilina',
    status: 'ativo',
    created_at: '2024-02-10T14:20:00Z',
    updated_at: '2024-02-10T14:20:00Z',
  },
  {
    id: '5',
    nome: 'Pedro Santos Lima',
    cpf: '456.789.123-00',
    data_nascimento: '1978-11-08',
    telefone: '(11) 99999-3333',
    email: 'pedro.santos@email.com',
    convenio: 'Particular',
    observacoes: '',
    status: 'ativo',
    created_at: '2024-03-05T09:15:00Z',
    updated_at: '2024-03-05T09:15:00Z',
  },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Pacientes: React.FC = () => {
  // ============================================================================
  // ESTADO
  // ============================================================================

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterConvenio, setFilterConvenio] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [formData, setFormData] = useState<PacienteFormData>({
    nome: '',
    cpf: '',
    data_nascimento: '',
    telefone: '',
    email: '',
    convenio: '',
    observacoes: '',
  });

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadPacientes();
  }, []);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadPacientes = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando lista de pacientes...');

      const isSupabaseAvailable = await checkSupabaseConnection();

      if (isSupabaseAvailable) {
        console.log('Supabase disponível, buscando dados...');
        const { data, error } = await supabase
          .from('pacientes')
          .select('*')
          .order('nome');

        if (error) {
          console.error('Erro ao buscar pacientes do Supabase:', error);
          throw error;
        }

        if (data && data.length > 0) {
          const pacientesConvertidos = data.map((paciente: any) => ({
            id: paciente.id,
            nome: paciente.nome,
            cpf: paciente.cpf,
            data_nascimento: paciente.data_nascimento,
            telefone: paciente.telefone,
            email: paciente.email,
            convenio: paciente.convenio,
            observacoes: paciente.observacoes,
            status: paciente.status || 'ativo',
            created_at: paciente.created_at,
            updated_at: paciente.updated_at,
          }));

          setPacientes(pacientesConvertidos);
        }
      } else {
        console.log('Supabase não disponível, usando banco local...');

        // Buscar pacientes do banco local usando a interface from()
        const { data: localPacientes, error: localError } = await localDb
          .from('pacientes')
          .select('*')
          .order('nome');

        if (localError) {
          console.error('Erro ao buscar pacientes do banco local:', localError);
          throw localError;
        }

        console.log(
          'Pacientes carregados do banco local:',
          localPacientes?.length || 0
        );

        if (localPacientes && localPacientes.length > 0) {
          // Converter os dados para o tipo Paciente
          const pacientesConvertidos = localPacientes.map((paciente: any) => ({
            id: paciente.id,
            nome: paciente.nome,
            cpf: paciente.cpf,
            data_nascimento: paciente.data_nascimento,
            telefone: paciente.telefone,
            email: paciente.email,
            convenio: paciente.convenio,
            observacoes: paciente.observacoes,
            status: paciente.status || 'ativo',
            created_at: paciente.created_at,
            updated_at: paciente.updated_at,
          }));
          setPacientes(pacientesConvertidos);
        } else {
          // Fallback para dados mock se não houver pacientes no banco local
          setPacientes(MOCK_PACIENTES);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      // Fallback para dados mock em caso de erro
      setPacientes(MOCK_PACIENTES);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterStatus = (status: string) => {
    setFilterStatus(status);
  };

  const handleFilterConvenio = (convenio: string) => {
    setFilterConvenio(convenio);
  };

  const handleCreatePaciente = () => {
    setEditingPaciente(null);
    setFormData({
      nome: '',
      cpf: '',
      data_nascimento: '',
      telefone: '',
      email: '',
      convenio: '',
      observacoes: '',
    });
    setShowForm(true);
  };

  const handleEditPaciente = (paciente: Paciente) => {
    setEditingPaciente(paciente);
    setFormData({
      nome: paciente.nome,
      cpf: paciente.cpf,
      data_nascimento: paciente.data_nascimento,
      telefone: paciente.telefone,
      email: paciente.email || '',
      convenio: paciente.convenio || '',
      observacoes: paciente.observacoes || '',
    });
    setShowForm(true);
  };

  const handleDeletePaciente = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
      try {
        setLoading(true);

        const isSupabaseAvailable = await checkSupabaseConnection();

        if (isSupabaseAvailable) {
          // Excluir do Supabase
          const { error } = await supabase
            .from('pacientes')
            .delete()
            .eq('id', id);

          if (error) {
            console.error('Erro ao excluir paciente do Supabase:', error);
            throw error;
          }
        } else {
          // Excluir do banco local
          const { error } = await localDb
            .from('pacientes')
            .delete()
            .eq('id', id);

          if (error) {
            console.error('Erro ao excluir paciente do banco local:', error);
            throw error;
          }
        }

        // Atualizar estado local
        setPacientes(prev => prev.filter(p => p.id !== id));
        toast.success('Paciente excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir paciente:', error);
        toast.error('Erro ao excluir paciente. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTogglePacienteStatus = async (paciente: Paciente) => {
    const newStatus = paciente.status === 'ativo' ? 'inativo' : 'ativo';
    const message =
      newStatus === 'ativo'
        ? 'Tem certeza que deseja ativar este paciente?'
        : 'Tem certeza que deseja desativar este paciente?';

    if (window.confirm(message)) {
      try {
        setLoading(true);

        const isSupabaseAvailable = await checkSupabaseConnection();
        const statusData = {
          status: newStatus,
          updated_at: new Date().toISOString(),
        };

        if (isSupabaseAvailable) {
          const { error } = await supabase
            .from('pacientes')
            .update(statusData)
            .eq('id', paciente.id);

          if (error) {
            console.error(
              'Erro ao atualizar status do paciente no Supabase:',
              error
            );
            throw error;
          }
        } else {
          const { error } = await localDb
            .from('pacientes')
            .update(statusData)
            .eq('id', paciente.id);

          if (error) {
            console.error(
              'Erro ao atualizar status do paciente no banco local:',
              error
            );
            throw error;
          }
        }

        // Atualizar estado local
        setPacientes(prev =>
          prev.map(p =>
            p.id === paciente.id
              ? {
                  ...p,
                  status: newStatus as 'ativo' | 'inativo',
                  updated_at: new Date().toISOString(),
                }
              : p
          )
        );

        toast.success(
          `Paciente ${newStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`
        );
      } catch (error) {
        console.error('Erro ao alterar status do paciente:', error);
        toast.error('Erro ao alterar status do paciente. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatCPF = (cpf: string) => {
    return cpf
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;

    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    // Algoritmo de validação do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
  };

  const handleSavePaciente = async () => {
    // Validar campos obrigatórios
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!formData.cpf.trim()) {
      toast.error('CPF é obrigatório');
      return;
    }

    // Validar CPF
    if (!validateCPF(formData.cpf)) {
      toast.error('CPF inválido');
      return;
    }

    // Verificar se CPF já existe
    const cpfExists = pacientes.some(
      p =>
        p.cpf.replace(/\D/g, '') === formData.cpf.replace(/\D/g, '') &&
        (!editingPaciente || p.id !== editingPaciente.id)
    );

    if (cpfExists) {
      toast.error('CPF já cadastrado no sistema');
      return;
    }

    try {
      setLoading(true);

      const isSupabaseAvailable = await checkSupabaseConnection();
      const pacienteData = {
        nome: formData.nome.trim(),
        cpf: formData.cpf.replace(/\D/g, ''),
        data_nascimento: formData.data_nascimento,
        telefone: formData.telefone.replace(/\D/g, ''),
        email: formData.email.trim() || undefined,
        convenio: formData.convenio.trim() || undefined,
        observacoes: formData.observacoes.trim() || undefined,
        status: 'ativo' as 'ativo' | 'inativo',
        updated_at: new Date().toISOString(),
      };

      if (editingPaciente) {
        // Editar paciente existente
        if (isSupabaseAvailable) {
          const { error } = await supabase
            .from('pacientes')
            .update(pacienteData)
            .eq('id', editingPaciente.id);

          if (error) {
            console.error('Erro ao atualizar paciente no Supabase:', error);
            throw error;
          }
        } else {
          const { error } = await localDb
            .from('pacientes')
            .update(pacienteData)
            .eq('id', editingPaciente.id);

          if (error) {
            console.error('Erro ao atualizar paciente no banco local:', error);
            throw error;
          }
        }

        // Atualizar estado local
        setPacientes(prev =>
          prev.map(p =>
            p.id === editingPaciente.id
              ? {
                  ...p,
                  ...pacienteData,
                  updated_at: new Date().toISOString(),
                }
              : p
          )
        );
      } else {
        // Criar novo paciente
        const novoPacienteData = {
          ...pacienteData,
          created_at: new Date().toISOString(),
        };

        if (isSupabaseAvailable) {
          const { data, error } = await supabase
            .from('pacientes')
            .insert([novoPacienteData])
            .select()
            .single();

          if (error) {
            console.error('Erro ao criar paciente no Supabase:', error);
            throw error;
          }

          // Adicionar ao estado local com o ID retornado
          setPacientes(prev => [
            ...prev,
            {
              id: data.id,
              ...novoPacienteData,
            },
          ]);
        } else {
          const { error } = await localDb
            .from('pacientes')
            .insert(novoPacienteData);

          if (error) {
            console.error('Erro ao criar paciente no banco local:', error);
            throw error;
          }

          // Gerar ID único para o banco local
          const novoId = Date.now().toString();
          const novoPaciente: Paciente = {
            id: novoId,
            ...novoPacienteData,
          };

          // Adicionar ao estado local
          setPacientes(prev => [...prev, novoPaciente]);
        }
      }

      toast.success(
        editingPaciente
          ? 'Paciente atualizado com sucesso!'
          : 'Paciente criado com sucesso!'
      );
      setShowForm(false);
      setEditingPaciente(null);
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      toast.error('Erro ao salvar paciente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ativo:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inativo: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[status as keyof typeof colors] || colors.ativo;
  };

  const getConvenioColor = (convenio: string) => {
    if (!convenio || convenio === 'Particular') {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  const enviarWhatsApp = (paciente: Paciente) => {
    const message = `Olá ${paciente.nome}! Este é um lembrete da clínica.`;
    const phoneNumber = paciente.telefone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Abrindo WhatsApp...');
  };

  // ============================================================================
  // FILTROS
  // ============================================================================

  const filteredPacientes = pacientes.filter(paciente => {
    const matchesSearch =
      paciente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.cpf.includes(searchTerm) ||
      (paciente.email &&
        paciente.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterStatus === 'todos' || paciente.status === filterStatus;
    const matchesConvenio =
      filterConvenio === 'todos' ||
      (filterConvenio === 'particular' &&
        (!paciente.convenio || paciente.convenio === 'Particular')) ||
      (filterConvenio !== 'particular' && paciente.convenio === filterConvenio);

    return matchesSearch && matchesStatus && matchesConvenio;
  });

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
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div></div>
            <Button
              onClick={handleCreatePaciente}
              className='flex items-center'
            >
              <Plus size={20} className='mr-2' />
              Novo Paciente
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Users className='h-8 w-8 text-blue-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Total de Pacientes
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {pacientes.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <UserCheck className='h-8 w-8 text-green-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Pacientes Ativos
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {pacientes.filter(p => p.status === 'ativo').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Heart className='h-8 w-8 text-purple-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Com Convênio
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {
                      pacientes.filter(
                        p => p.convenio && p.convenio !== 'Particular'
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Calendar className='h-8 w-8 text-orange-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Novos Este Mês
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {
                      pacientes.filter(p => {
                        const cadastro = new Date(p.created_at);
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
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
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
                  <Input
                    placeholder='Nome, CPF ou email...'
                    value={searchTerm}
                    onChange={e => handleSearch(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={e => handleFilterStatus(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                >
                  <option value='todos'>Todos os Status</option>
                  <option value='ativo'>Ativo</option>
                  <option value='inativo'>Inativo</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Convênio
                </label>
                <select
                  value={filterConvenio}
                  onChange={e => handleFilterConvenio(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                >
                  <option value='todos'>Todos os Convênios</option>
                  <option value='particular'>Particular</option>
                  <option value='Unimed'>Unimed</option>
                  <option value='Bradesco Saúde'>Bradesco Saúde</option>
                  <option value='SulAmérica'>SulAmérica</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Pacientes */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Pacientes ({filteredPacientes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop Table - Hidden on mobile */}
            <div className='hidden lg:block overflow-x-auto'>
              <table className='w-full table-auto'>
                <thead>
                  <tr className='border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'>
                    <th className='text-left py-2 px-3 font-semibold text-gray-900 dark:text-white min-w-[160px]'>
                      Nome
                    </th>
                    <th className='text-left py-2 px-3 font-semibold text-gray-900 dark:text-white min-w-[110px]'>
                      CPF
                    </th>
                    <th className='text-left py-2 px-3 font-semibold text-gray-900 dark:text-white min-w-[110px]'>
                      Telefone
                    </th>
                    <th className='text-left py-2 px-3 font-semibold text-gray-900 dark:text-white min-w-[140px]'>
                      Email
                    </th>
                    <th className='text-left py-2 px-3 font-semibold text-gray-900 dark:text-white min-w-[80px]'>
                      Convênio
                    </th>
                    <th className='text-left py-2 px-3 font-semibold text-gray-900 dark:text-white min-w-[60px]'>
                      Status
                    </th>
                    <th className='text-left py-2 px-3 font-semibold text-gray-900 dark:text-white min-w-[100px]'>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPacientes.map(paciente => (
                    <tr
                      key={paciente.id}
                      className='border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150'
                    >
                      <td className='py-2 px-3'>
                        <span className='font-semibold text-gray-900 dark:text-white text-xs'>
                          {paciente.nome}
                        </span>
                      </td>
                      <td className='py-2 px-3'>
                        <span className='text-gray-700 dark:text-gray-300 font-mono text-xs'>
                          {formatCPF(paciente.cpf)}
                        </span>
                      </td>
                      <td className='py-2 px-3'>
                        <span className='text-gray-700 dark:text-gray-300 text-xs'>
                          {formatPhone(paciente.telefone)}
                        </span>
                      </td>
                      <td className='py-2 px-3'>
                        <span className='text-gray-700 dark:text-gray-300 text-xs truncate max-w-[130px]'>
                          {paciente.email || 'Não informado'}
                        </span>
                      </td>
                      <td className='py-2 px-3'>
                        <Badge
                          className={`${getConvenioColor(
                            paciente.convenio || 'Particular'
                          )} text-xs px-2 py-1`}
                        >
                          {paciente.convenio || 'Particular'}
                        </Badge>
                      </td>
                      <td className='py-2 px-3'>
                        <Badge
                          className={`${getStatusColor(paciente.status)} text-xs px-2 py-1`}
                        >
                          {paciente.status}
                        </Badge>
                      </td>
                      <td className='py-2 px-3'>
                        <div className='flex items-center justify-center space-x-1'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => enviarWhatsApp(paciente)}
                            title='Enviar WhatsApp'
                            className='text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 p-1.5 h-7 w-7'
                          >
                            <MessageCircle size={14} />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleEditPaciente(paciente)}
                            title='Editar paciente'
                            className='text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-1.5 h-7 w-7'
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleTogglePacienteStatus(paciente)}
                            title={
                              paciente.status === 'ativo'
                                ? 'Desativar paciente'
                                : 'Ativar paciente'
                            }
                            className={`p-1.5 h-7 w-7 ${
                              paciente.status === 'ativo'
                                ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                          >
                            <UserX size={14} />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDeletePaciente(paciente.id)}
                            title='Excluir paciente'
                            className='text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 h-7 w-7'
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Visible on mobile and tablet */}
            <div className='lg:hidden space-y-2'>
              {filteredPacientes.map(paciente => (
                <Card
                  key={paciente.id}
                  className='p-3 shadow-sm hover:shadow-md transition-shadow duration-200'
                >
                  <div className='space-y-2'>
                    {/* Dados em uma única linha */}
                    <div className='flex flex-wrap items-center gap-2 text-xs'>
                      <span className='font-semibold text-gray-900 dark:text-white min-w-[140px]'>
                        {paciente.nome}
                      </span>
                      <span className='text-gray-700 dark:text-gray-300 font-mono'>
                        {formatCPF(paciente.cpf)}
                      </span>
                      <div className='flex items-center space-x-1'>
                        <Phone
                          size={12}
                          className='text-gray-400 flex-shrink-0'
                        />
                        <span className='text-gray-700 dark:text-gray-300'>
                          {formatPhone(paciente.telefone)}
                        </span>
                      </div>
                      <div className='flex items-center space-x-1'>
                        <Mail
                          size={12}
                          className='text-gray-400 flex-shrink-0'
                        />
                        <span className='text-gray-700 dark:text-gray-300 truncate max-w-[120px]'>
                          {paciente.email || 'Não informado'}
                        </span>
                      </div>
                      <Badge
                        className={`${getConvenioColor(
                          paciente.convenio || 'Particular'
                        )} text-xs px-2 py-1`}
                      >
                        {paciente.convenio || 'Particular'}
                      </Badge>
                      <Badge
                        className={`${getStatusColor(paciente.status)} text-xs px-2 py-1`}
                      >
                        {paciente.status}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className='flex flex-wrap gap-1 pt-2 border-t border-gray-200 dark:border-gray-700'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => enviarWhatsApp(paciente)}
                        className='text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 flex-1 sm:flex-none text-xs px-2 py-1'
                      >
                        <MessageCircle size={14} className='mr-1' />
                        WhatsApp
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleEditPaciente(paciente)}
                        className='text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-1 sm:flex-none text-xs px-2 py-1'
                      >
                        <Edit size={14} className='mr-1' />
                        Editar
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleTogglePacienteStatus(paciente)}
                        className={`flex-1 sm:flex-none text-xs px-2 py-1 ${
                          paciente.status === 'ativo'
                            ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                      >
                        <UserX size={14} className='mr-1' />
                        {paciente.status === 'ativo' ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDeletePaciente(paciente.id)}
                        className='text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-1 sm:flex-none text-xs px-2 py-1'
                      >
                        <Trash2 size={14} className='mr-1' />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modal de Formulário */}
        {showForm && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto'>
            <div className='w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl my-8 max-h-[90vh] flex flex-col'>
              {/* Header */}
              <div className='text-center p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0'>
                <div className='mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mb-3 sm:mb-4'>
                  <Users size={24} className='text-white sm:hidden' />
                  <Users size={32} className='text-white hidden sm:block' />
                </div>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2'>
                  {editingPaciente ? 'Editar Paciente' : 'Novo Paciente'}
                </h2>
                <p className='text-sm sm:text-base text-gray-600 dark:text-gray-300'>
                  Preencha os dados do paciente
                </p>
              </div>

              {/* Form - Scrollable */}
              <div className='p-4 sm:p-6 overflow-y-auto flex-1'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Nome Completo *
                    </label>
                    <Input
                      value={formData.nome}
                      onChange={e =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      placeholder='Nome completo do paciente'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      CPF *
                    </label>
                    <Input
                      value={formData.cpf}
                      onChange={e => {
                        const formatted = formatCPF(e.target.value);
                        setFormData({ ...formData, cpf: formatted });
                      }}
                      placeholder='000.000.000-00'
                      maxLength={14}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Data de Nascimento *
                    </label>
                    <Input
                      type='date'
                      value={formData.data_nascimento}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          data_nascimento: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Telefone *
                    </label>
                    <Input
                      value={formData.telefone}
                      onChange={e => {
                        const formatted = formatPhone(e.target.value);
                        setFormData({ ...formData, telefone: formatted });
                      }}
                      placeholder='(00) 00000-0000'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Email
                    </label>
                    <Input
                      type='email'
                      value={formData.email}
                      onChange={e =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder='email@exemplo.com'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Convênio
                    </label>
                    <Input
                      value={formData.convenio}
                      onChange={e =>
                        setFormData({ ...formData, convenio: e.target.value })
                      }
                      placeholder='Nome do convênio'
                    />
                  </div>

                  <div className='sm:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Observações
                    </label>
                    <textarea
                      value={formData.observacoes}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          observacoes: e.target.value,
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                      rows={3}
                      placeholder='Informações adicionais sobre o paciente...'
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className='flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0'>
                <Button
                  variant='outline'
                  onClick={() => setShowForm(false)}
                  className='w-full sm:w-auto order-2 sm:order-1'
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSavePaciente}
                  className='w-full sm:w-auto order-1 sm:order-2'
                >
                  {editingPaciente
                    ? 'Atualizar Paciente'
                    : 'Cadastrar Paciente'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pacientes;
