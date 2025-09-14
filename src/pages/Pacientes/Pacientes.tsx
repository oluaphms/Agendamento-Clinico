import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Users,
  Plus,
  Search,
  FileText,
  User,
  Phone,
  Mail,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Heart,
  X,
  Tag,
  MessageCircle,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { validateField, CLINIC_VALIDATIONS } from '@/lib/validation';
import { printReport, ReportData } from '@/lib/reportTemplate';
// import { sendWhatsAppMessage } from '@/lib/whatsappUtils';

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  idade?: number;
  telefone: string;
  email?: string;
  convenio?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface Filtros {
  nome: string;
  cpf: string;
  convenio: string;
  buscaGlobal: string;
}

interface Ordenacao {
  campo: string;
  direcao: 'asc' | 'desc';
}

interface Paginacao {
  pagina: number;
  itensPorPagina: number;
  total: number;
}

const Pacientes: React.FC = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(
    null
  );

  const [filtros, setFiltros] = useState<Filtros>({
    nome: '',
    cpf: '',
    convenio: '',
    buscaGlobal: '',
  });
  const [ordenacao, setOrdenacao] = useState<Ordenacao>({
    campo: 'nome',
    direcao: 'asc',
  });
  const [paginacao, setPaginacao] = useState<Paginacao>({
    pagina: 1,
    itensPorPagina: 10,
    total: 0,
  });
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    telefone: '',
    email: '',
    convenio: '',
    observacoes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string[];
  }>({});

  // Componente para exibir erros de validação
  const ValidationError = ({ field }: { field: string }) => {
    if (!validationErrors[field] || validationErrors[field].length === 0) {
      return null;
    }

    return (
      <div className='invalid-feedback d-block'>
        {validationErrors[field].map((error, index) => (
          <div key={index} className='text-danger small'>
            {error}
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    loadPacientes();
  }, []);

  const loadPacientes = async () => {
    try {
      console.log('🔄 Carregando lista de pacientes...');
      setLoading(true);
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .order('nome');

      console.log('📥 Dados carregados:', data);

      if (error) throw error;

      setPacientes(data || []);
      console.log('✅ Lista de pacientes atualizada');
    } catch (error) {
      console.error('❌ Erro ao carregar pacientes:', error);
      toast.error('Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string[] } = {};

    // Validar campos obrigatórios
    if (!formData.nome || formData.nome.trim() === '') {
      errors.nome = ['Nome é obrigatório'];
    } else {
      const nomeErrors = validateField(
        formData.nome,
        CLINIC_VALIDATIONS.paciente.nome
      );
      if (nomeErrors.length > 0) errors.nome = nomeErrors;
    }

    if (!formData.cpf || formData.cpf.trim() === '') {
      errors.cpf = ['CPF é obrigatório'];
    } else {
      const cpfErrors = validateField(
        formData.cpf,
        CLINIC_VALIDATIONS.paciente.cpf
      );
      if (cpfErrors.length > 0) errors.cpf = cpfErrors;
    }

    if (!formData.telefone || formData.telefone.trim() === '') {
      errors.telefone = ['Telefone é obrigatório'];
    } else {
      const telefoneErrors = validateField(
        formData.telefone,
        CLINIC_VALIDATIONS.paciente.telefone
      );
      if (telefoneErrors.length > 0) errors.telefone = telefoneErrors;
    }

    if (!formData.data_nascimento || formData.data_nascimento.trim() === '') {
      errors.data_nascimento = ['Data de nascimento é obrigatória'];
    } else {
      const dataNascimentoErrors = validateField(
        formData.data_nascimento,
        CLINIC_VALIDATIONS.paciente.data_nascimento
      );
      if (dataNascimentoErrors.length > 0)
        errors.data_nascimento = dataNascimentoErrors;
    }

    // Validar email apenas se preenchido
    if (formData.email && formData.email.trim() !== '') {
      const emailErrors = validateField(
        formData.email,
        CLINIC_VALIDATIONS.paciente.email
      );
      if (emailErrors.length > 0) errors.email = emailErrors;
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Por favor, corrija os erros nos campos obrigatórios');
      return false;
    }

    return true;
  };

  const checkCPFDuplicate = async (cpf: string, excludeId?: string) => {
    try {
      let query = supabase.from('pacientes').select('id').eq('cpf', cpf);

      // Só adiciona o filtro neq se excludeId não for vazio
      if (excludeId && excludeId.trim() !== '') {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data && data.length > 0;
    } catch (error) {
      console.error('Erro ao verificar CPF duplicado:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Verificar CPF duplicado
    const isDuplicate = await checkCPFDuplicate(formData.cpf);
    if (isDuplicate) {
      toast.error('CPF já cadastrado no sistema');
      return;
    }

    setIsSubmitting(true);

    try {
      // Dados simplificados - apenas campos básicos que existem na tabela
      const cleanedData = {
        nome: formData.nome.trim(),
        cpf: formData.cpf.trim(),
        data_nascimento: formData.data_nascimento,
        telefone: formData.telefone.trim(),
        status: 'ativo', // Definir status como ativo por padrão
        // Campos opcionais básicos
        email:
          formData.email && formData.email.trim() !== ''
            ? formData.email.trim()
            : null,
        observacoes:
          formData.observacoes && formData.observacoes.trim() !== ''
            ? formData.observacoes
            : null,
        convenio:
          formData.convenio && formData.convenio.trim() !== ''
            ? formData.convenio
            : null,
      };

      console.log('📤 Dados que serão enviados:', cleanedData);

      const { data, error } = await supabase
        .from('pacientes')
        .insert(cleanedData);

      console.log('📥 Resposta do Supabase:', { data, error });

      if (error) {
        console.error('❌ Erro detalhado:', error);
        throw error;
      }

      toast.success('Paciente cadastrado com sucesso!');
      setShowModal(false);
      resetForm();
      loadPacientes();
    } catch (error: any) {
      console.error('Erro ao cadastrar paciente:', error);
      toast.error(
        `Erro ao cadastrar paciente: ${error?.message || 'Erro desconhecido'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPaciente || !validateForm()) return;

    // Verificar CPF duplicado (excluindo o paciente atual)
    const isDuplicate = await checkCPFDuplicate(
      formData.cpf,
      selectedPaciente.id
    );
    if (isDuplicate) {
      toast.error('CPF já cadastrado no sistema');
      return;
    }

    setIsSubmitting(true);

    try {
      const pacienteData = {
        ...formData,
        status: 'ativo', // Manter status como ativo
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('pacientes')
        .update(pacienteData)
        .eq('id', selectedPaciente.id);

      if (error) throw error;

      toast.success('Paciente atualizado com sucesso!');
      setShowModal(false);
      setSelectedPaciente(null);
      resetForm();
      loadPacientes();
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      toast.error('Erro ao atualizar paciente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    console.log('🔍 Tentando excluir paciente com ID:', id);

    if (!window.confirm('Tem certeza que deseja excluir este paciente?'))
      return;

    try {
      console.log('📡 Enviando requisição de exclusão...');
      const { error } = await supabase.from('pacientes').delete().eq('id', id);

      console.log('📥 Resposta da exclusão:', { error });

      if (error) throw error;

      console.log('✅ Exclusão bem-sucedida, recarregando lista...');
      toast.success('Paciente excluído com sucesso!');
      loadPacientes();
    } catch (error) {
      console.error('❌ Erro ao excluir paciente:', error);
      toast.error('Erro ao excluir paciente');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      data_nascimento: '',
      telefone: '',
      email: '',
      convenio: '',
      observacoes: '',
    });
    setValidationErrors({});
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    // Limpar erro do campo quando o usuário começar a digitar
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const openEditModal = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setFormData({
      nome: paciente.nome,
      cpf: paciente.cpf,
      data_nascimento: paciente.data_nascimento,
      telefone: paciente.telefone,
      email: paciente.email || '',
      convenio: paciente.convenio || '',
      observacoes: paciente.observacoes || '',
    });
    setValidationErrors({});
    setShowModal(true);
  };

  const openViewModal = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setShowViewModal(true);
  };

  const calculateAge = (dataNascimento: string) => {
    const today = new Date();
    const birthDate = new Date(dataNascimento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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

  // Função para aplicar filtros e busca global
  const applyFilters = (pacientes: Paciente[]) => {
    return pacientes.filter(paciente => {
      // Busca global
      if (filtros.buscaGlobal) {
        const searchTerm = filtros.buscaGlobal.toLowerCase();
        const searchableFields = [
          paciente.nome,
          paciente.cpf,
          paciente.email || '',
          paciente.telefone,
          paciente.convenio || '',
        ]
          .join(' ')
          .toLowerCase();

        if (!searchableFields.includes(searchTerm)) return false;
      }

      // Filtros específicos
      if (
        filtros.nome &&
        !paciente.nome.toLowerCase().includes(filtros.nome.toLowerCase())
      )
        return false;
      if (filtros.cpf && !paciente.cpf.includes(filtros.cpf)) return false;
      if (
        filtros.convenio &&
        !paciente.convenio
          ?.toLowerCase()
          .includes(filtros.convenio.toLowerCase())
      )
        return false;

      return true;
    });
  };

  // Função para ordenar pacientes
  const sortPacientes = (pacientes: Paciente[]) => {
    return [...pacientes].sort((a, b) => {
      let aValue = a[ordenacao.campo as keyof Paciente];
      let bValue = b[ordenacao.campo as keyof Paciente];

      // Tratar valores nulos/undefined
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Converter para string para comparação
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (ordenacao.direcao === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  };

  // Função para paginar pacientes
  const paginatePacientes = (pacientes: Paciente[]) => {
    const startIndex = (paginacao.pagina - 1) * paginacao.itensPorPagina;
    const endIndex = startIndex + paginacao.itensPorPagina;
    return pacientes.slice(startIndex, endIndex);
  };

  // Aplicar todos os filtros, ordenação e paginação
  const filteredPacientes = React.useMemo(() => {
    return applyFilters(pacientes);
  }, [pacientes, filtros]);

  const sortedPacientes = React.useMemo(() => {
    return sortPacientes(filteredPacientes);
  }, [filteredPacientes, ordenacao]);

  const processedPacientes = React.useMemo(() => {
    return paginatePacientes(sortedPacientes);
  }, [sortedPacientes, paginacao.pagina, paginacao.itensPorPagina]);

  // Atualizar total para paginação quando os dados filtrados mudarem
  React.useEffect(() => {
    setPaginacao(prev => ({ ...prev, total: filteredPacientes.length }));
  }, [filteredPacientes.length]);

  // Função para alterar ordenação
  const handleSort = (campo: string) => {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Função para alterar página
  const handlePageChange = (novaPagina: number) => {
    setPaginacao(prev => ({ ...prev, pagina: novaPagina }));
  };

  // Função para alterar itens por página
  const handleItemsPerPageChange = (itens: number) => {
    setPaginacao(prev => ({ ...prev, itensPorPagina: itens, pagina: 1 }));
  };

  // Função para imprimir lista de pacientes
  const imprimirPacientes = () => {
    if (filteredPacientes.length === 0) {
      toast.error('Nenhum paciente encontrado para imprimir');
      return;
    }

    try {
      // Calcular estatísticas
      const totalPacientes = filteredPacientes.length;
      const comConvenio = filteredPacientes.filter(
        p => p.convenio && p.convenio !== '' && p.convenio !== 'Particular'
      ).length;
      const semConvenio = totalPacientes - comConvenio;

      // Calcular novos pacientes deste mês
      const dataAtual = new Date();
      const primeiroDiaMes = new Date(
        dataAtual.getFullYear(),
        dataAtual.getMonth(),
        1
      );
      const novosEsteMes = filteredPacientes.filter(
        p => new Date(p.created_at) >= primeiroDiaMes
      ).length;

      const reportData: ReportData = {
        title: 'Relatório de Pacientes',
        data: filteredPacientes,
        columns: [
          { key: 'nome', label: 'Nome' },
          {
            key: 'cpf',
            label: 'CPF',
            format: (value: string) => formatCPF(value),
          },
          {
            key: 'data_nascimento',
            label: 'Idade',
            format: (value: string) => `${calculateAge(value)} anos`,
          },
          {
            key: 'telefone',
            label: 'Telefone',
            format: (value: string) => formatPhone(value),
          },
          {
            key: 'email',
            label: 'Email',
            format: (value: string) => value || 'Não informado',
          },
          {
            key: 'convenio',
            label: 'Convênio',
            format: (value: string) => value || 'Particular',
          },
          {
            key: 'created_at',
            label: 'Data Cadastro',
            format: (value: string) =>
              new Date(value).toLocaleDateString('pt-BR'),
          },
        ],
        summary: [
          { label: 'Com Convênio', value: comConvenio },
          { label: 'Particular', value: semConvenio },
          { label: 'Novos Este Mês', value: novosEsteMes },
        ],
        filters: {
          'Busca Global': filtros.buscaGlobal,
          Nome: filtros.nome,
          CPF: filtros.cpf,
          Convênio: filtros.convenio,
        },
      };

      printReport(reportData);
      toast.success('Relatório de impressão gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao imprimir relatório:', error);
      toast.error('Erro ao gerar relatório de impressão');
    }
  };

  // Função para enviar WhatsApp
  const enviarWhatsApp = (paciente: Paciente) => {
    const message = `Olá ${paciente.nome}! Este é um lembrete da clínica.`;
    const phoneNumber = paciente.telefone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Abrindo WhatsApp...');
  };

  if (loading) {
    return (
      <div
        className='d-flex justify-content-center align-items-center'
        style={{ height: '400px' }}
      >
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Pacientes - Sistema Clínica</title>
      </Helmet>

      <div className='container-fluid'>
        {/* Header */}
        <div className='row mb-4'>
          <div className='col-12'>
            <div className='mb-6'>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white flex items-center'>
                <Users className='mr-3 !text-blue-600' size={32} style={{ color: '#2563eb !important' }} />
                Cadastro de Pacientes
              </h1>
              <p className='text-gray-600 dark:text-gray-300 mt-2'>
                Gerencie o cadastro e informações dos pacientes da clínica
              </p>
            </div>
            <div className='d-flex justify-content-between align-items-center'>
              <div></div>
              <div className='d-flex gap-2'>
                <button
                  className='btn btn-primary'
                  onClick={() => {
                    setSelectedPaciente(null);
                    resetForm();
                    setShowModal(true);
                  }}
                >
                  <Plus size={16} className='me-2' />
                  Novo Paciente
                </button>

                <button
                  className='btn btn-outline-info btn-sm d-flex align-items-center gap-2'
                  onClick={imprimirPacientes}
                  title='Imprimir lista de pacientes'
                >
                  <FileText size={16} />
                  Imprimir
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className='row mb-4'>
          <div className='col-12'>
            <div className='card'>
              <div className='card-body'>
                <div className='row g-3'>
                  <div className='col-md-4'>
                    <label className='form-label'>
                      <Search size={16} className='me-1' />
                      Busca Global
                    </label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Buscar em todos os campos...'
                      value={filtros.buscaGlobal}
                      onChange={e =>
                        setFiltros({ ...filtros, buscaGlobal: e.target.value })
                      }
                    />
                  </div>
                  <div className='col-md-2'>
                    <label className='form-label'>Nome</label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Buscar por nome...'
                      value={filtros.nome}
                      onChange={e =>
                        setFiltros({ ...filtros, nome: e.target.value })
                      }
                    />
                  </div>
                  <div className='col-md-2'>
                    <label className='form-label'>CPF</label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Buscar por CPF...'
                      value={filtros.cpf}
                      onChange={e =>
                        setFiltros({ ...filtros, cpf: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className='row g-3 mt-2'>
                  <div className='col-md-3'>
                    <label className='form-label'>Convênio</label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Buscar por convênio...'
                      value={filtros.convenio}
                      onChange={e =>
                        setFiltros({ ...filtros, convenio: e.target.value })
                      }
                    />
                  </div>
                  <div className='col-md-2'>
                    <label className='form-label'>Itens por página</label>
                    <select
                      className='form-select'
                      value={paginacao.itensPorPagina}
                      onChange={e =>
                        handleItemsPerPageChange(Number(e.target.value))
                      }
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <div className='col-md-1 d-flex align-items-end'>
                    <button
                      className='btn btn-outline-secondary w-100'
                      onClick={() =>
                        setFiltros({
                          nome: '',
                          cpf: '',
                          convenio: '',
                          buscaGlobal: '',
                        })
                      }
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className='row mb-4'>
          <div className='col-md-3'>
            <div className='card bg-primary text-white'>
              <div className='card-body'>
                <div className='d-flex align-items-center'>
                  <div className='bg-white bg-opacity-20 rounded-circle p-3 me-3'>
                    <Users size={24} className='text-white' />
                  </div>
                  <div>
                    <h4 className='mb-0'>{pacientes.length}</h4>
                    <small>Total de Pacientes</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='col-md-3'>
            <div className='card bg-success text-white'>
              <div className='card-body'>
                <div className='d-flex align-items-center'>
                  <div className='bg-white bg-opacity-20 rounded-circle p-3 me-3'>
                    <Heart size={24} className='text-white' />
                  </div>
                  <div>
                    <h4 className='mb-0'>{pacientes.length}</h4>
                    <small>Total</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='col-md-3'>
            <div className='card bg-warning text-dark'>
              <div className='card-body'>
                <div className='d-flex align-items-center'>
                  <div className='bg-white bg-opacity-20 rounded-circle p-3 me-3'>
                    <Tag size={24} className='text-white' />
                  </div>
                  <div>
                    <h4 className='mb-0'>
                      {
                        pacientes.filter(p => p.convenio && p.convenio !== '')
                          .length
                      }
                    </h4>
                    <small>Convênio</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='col-md-3'>
            <div className='card bg-info text-white'>
              <div className='card-body'>
                <div className='d-flex align-items-center'>
                  <div className='bg-white bg-opacity-20 rounded-circle p-3 me-3'>
                    <Calendar size={24} className='text-white' />
                  </div>
                  <div>
                    <h4 className='mb-0'>
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
                    </h4>
                    <small>Novos Este Mês</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Pacientes */}
        <div className='row'>
          <div className='col-12'>
            <div className='card'>
              <div className='card-header'>
                <div className='d-flex justify-content-between align-items-center'>
                  <h5 className='card-title mb-0'>
                    <Users size={18} className='me-2 text-primary' />
                    Lista de Pacientes
                  </h5>
                  <span className='badge bg-primary fs-6'>
                    {paginacao.total} pacientes
                  </span>
                </div>
              </div>
              <div className='card-body p-0'>
                <div className='table-responsive'>
                  <table className='table table-hover mb-0'>
                    <thead className='table-light'>
                      <tr>
                        <th
                          className='cursor-pointer'
                          onClick={() => handleSort('nome')}
                        >
                          Nome
                          {ordenacao.campo === 'nome' &&
                            (ordenacao.direcao === 'asc' ? (
                              <SortAsc size={14} className='ms-1' />
                            ) : (
                              <SortDesc size={14} className='ms-1' />
                            ))}
                        </th>
                        <th
                          className='cursor-pointer'
                          onClick={() => handleSort('cpf')}
                        >
                          CPF
                          {ordenacao.campo === 'cpf' &&
                            (ordenacao.direcao === 'asc' ? (
                              <SortAsc size={14} className='ms-1' />
                            ) : (
                              <SortDesc size={14} className='ms-1' />
                            ))}
                        </th>
                        <th>Idade</th>
                        <th
                          className='cursor-pointer'
                          onClick={() => handleSort('telefone')}
                        >
                          Telefone
                          {ordenacao.campo === 'telefone' &&
                            (ordenacao.direcao === 'asc' ? (
                              <SortAsc size={14} className='ms-1' />
                            ) : (
                              <SortDesc size={14} className='ms-1' />
                            ))}
                        </th>
                        <th>Email</th>
                        <th>Convênio</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedPacientes.map(paciente => (
                        <tr key={paciente.id}>
                          <td>
                            <div className='d-flex align-items-center'>
                              <div className='bg-primary bg-gradient rounded-circle p-2 me-2'>
                                <User size={14} className='text-white' />
                              </div>
                              <div>
                                <div className='fw-bold'>{paciente.nome}</div>
                                <small className='text-muted'>
                                  Cadastrado em{' '}
                                  {new Date(
                                    paciente.created_at
                                  ).toLocaleDateString('pt-BR')}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className='fw-bold'>
                              {formatCPF(paciente.cpf)}
                            </span>
                          </td>
                          <td>
                            <span className='badge bg-info bg-opacity-10 text-info'>
                              {calculateAge(paciente.data_nascimento)} anos
                            </span>
                          </td>
                          <td>
                            <div className='d-flex align-items-center'>
                              <Phone size={14} className='text-muted me-1' />
                              {formatPhone(paciente.telefone)}
                            </div>
                          </td>
                          <td>
                            <div className='d-flex align-items-center'>
                              <Mail size={14} className='text-muted me-1' />
                              {paciente.email || 'Não informado'}
                            </div>
                          </td>
                          <td>
                            <span className='text-muted'>
                              {paciente.convenio || 'Particular'}
                            </span>
                          </td>
                          <td>
                            <div className='btn-group btn-group-sm'>
                              <button
                                className='btn btn-outline-success'
                                title='WhatsApp'
                                onClick={() => enviarWhatsApp(paciente)}
                              >
                                <MessageCircle size={14} />
                              </button>
                              <button
                                className='btn btn-outline-info'
                                title='Visualizar'
                                onClick={() => openViewModal(paciente)}
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                className='btn btn-outline-primary'
                                title='Editar'
                                onClick={() => openEditModal(paciente)}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className='btn btn-outline-danger'
                                title='Excluir'
                                onClick={() => handleDelete(paciente.id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginação */}
                {paginacao.total > paginacao.itensPorPagina && (
                  <div className='card-footer'>
                    <div className='d-flex justify-content-between align-items-center'>
                      <div className='text-muted'>
                        Mostrando{' '}
                        {(paginacao.pagina - 1) * paginacao.itensPorPagina + 1}{' '}
                        a{' '}
                        {Math.min(
                          paginacao.pagina * paginacao.itensPorPagina,
                          paginacao.total
                        )}{' '}
                        de {paginacao.total} pacientes
                      </div>
                      <div className='btn-group'>
                        <button
                          className='btn btn-outline-secondary btn-sm'
                          onClick={() => handlePageChange(paginacao.pagina - 1)}
                          disabled={paginacao.pagina === 1}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        {Array.from(
                          {
                            length: Math.ceil(
                              paginacao.total / paginacao.itensPorPagina
                            ),
                          },
                          (_, i) => i + 1
                        )
                          .filter(
                            page =>
                              page === 1 ||
                              page ===
                                Math.ceil(
                                  paginacao.total / paginacao.itensPorPagina
                                ) ||
                              Math.abs(page - paginacao.pagina) <= 2
                          )
                          .map((page, index, array) => (
                            <React.Fragment key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className='btn btn-outline-secondary btn-sm disabled'>
                                  ...
                                </span>
                              )}
                              <button
                                className={`btn btn-sm ${page === paginacao.pagina ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          ))}
                        <button
                          className='btn btn-outline-secondary btn-sm'
                          onClick={() => handlePageChange(paginacao.pagina + 1)}
                          disabled={
                            paginacao.pagina ===
                            Math.ceil(
                              paginacao.total / paginacao.itensPorPagina
                            )
                          }
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Cadastro/Edição */}
      {showModal && (
        <div
          className='modal fade show d-block'
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className='modal-dialog modal-lg'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>
                  {selectedPaciente ? (
                    <>
                      <Edit size={20} className='me-2' />
                      Editar Paciente
                    </>
                  ) : (
                    <>
                      <Plus size={20} className='me-2' />
                      Novo Paciente
                    </>
                  )}
                </h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setShowModal(false)}
                />
              </div>
              <form onSubmit={selectedPaciente ? handleEdit : handleSubmit}>
                <div className='modal-body'>
                  <div className='row g-3'>
                    <div className='col-md-6'>
                      <label className='form-label'>Nome Completo</label>
                      <input
                        type='text'
                        name='nome'
                        className={`form-control ${validationErrors.nome ? 'is-invalid' : ''}`}
                        value={formData.nome}
                        onChange={handleInputChange}
                      />
                      <ValidationError field='nome' />
                    </div>
                    <div className='col-md-3'>
                      <label className='form-label'>CPF</label>
                      <input
                        type='text'
                        name='cpf'
                        className={`form-control ${validationErrors.cpf ? 'is-invalid' : ''}`}
                        value={formData.cpf}
                        onChange={handleInputChange}
                        placeholder='00000000000'
                      />
                      <ValidationError field='cpf' />
                    </div>
                    <div className='col-md-3'>
                      <label className='form-label'>Data de Nascimento</label>
                      <input
                        type='date'
                        name='data_nascimento'
                        className={`form-control ${validationErrors.data_nascimento ? 'is-invalid' : ''}`}
                        value={formData.data_nascimento}
                        onChange={handleInputChange}
                      />
                      <ValidationError field='data_nascimento' />
                    </div>
                    <div className='col-md-4'>
                      <label className='form-label'>Telefone</label>
                      <input
                        type='text'
                        name='telefone'
                        className={`form-control ${validationErrors.telefone ? 'is-invalid' : ''}`}
                        value={formData.telefone}
                        onChange={handleInputChange}
                        placeholder='(00) 00000-0000'
                      />
                      <ValidationError field='telefone' />
                    </div>
                    <div className='col-md-4'>
                      <label className='form-label'>Email</label>
                      <input
                        type='email'
                        name='email'
                        className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder='email@exemplo.com'
                      />
                      <ValidationError field='email' />
                    </div>

                    <div className='col-md-6'>
                      <label className='form-label'>Convênio</label>
                      <input
                        type='text'
                        name='convenio'
                        className='form-control'
                        value={formData.convenio}
                        onChange={handleInputChange}
                        placeholder='Nome do convênio'
                      />
                    </div>

                    <div className='col-12'>
                      <label className='form-label'>Observações</label>
                      <textarea
                        name='observacoes'
                        className='form-control'
                        rows={3}
                        value={formData.observacoes}
                        onChange={handleInputChange}
                        placeholder='Informações adicionais sobre o paciente...'
                      />
                    </div>
                  </div>
                </div>
                <div className='modal-footer'>
                  <button
                    type='button'
                    className='btn btn-secondary'
                    onClick={() => setShowModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type='submit'
                    className='btn btn-primary'
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className='spinner-border spinner-border-sm me-2' />
                        {selectedPaciente ? 'Atualizando...' : 'Cadastrando...'}
                      </>
                    ) : selectedPaciente ? (
                      'Atualizar Paciente'
                    ) : (
                      'Cadastrar Paciente'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualização */}
      {showViewModal && selectedPaciente && (
        <div
          className='modal fade show d-block'
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className='modal-dialog modal-lg'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>
                  <Eye size={20} className='me-2' />
                  Dados do Paciente
                </h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setShowViewModal(false)}
                />
              </div>
              <div className='modal-body'>
                <div className='row g-3'>
                  <div className='col-md-6'>
                    <label className='form-label fw-bold'>Nome Completo</label>
                    <p className='form-control-plaintext'>
                      {selectedPaciente.nome}
                    </p>
                  </div>
                  <div className='col-md-3'>
                    <label className='form-label fw-bold'>CPF</label>
                    <p className='form-control-plaintext'>
                      {formatCPF(selectedPaciente.cpf)}
                    </p>
                  </div>
                  <div className='col-md-3'>
                    <label className='form-label fw-bold'>Idade</label>
                    <p className='form-control-plaintext'>
                      {calculateAge(selectedPaciente.data_nascimento)} anos
                    </p>
                  </div>
                  <div className='col-md-4'>
                    <label className='form-label fw-bold'>Telefone</label>
                    <p className='form-control-plaintext'>
                      {formatPhone(selectedPaciente.telefone)}
                    </p>
                  </div>
                  <div className='col-md-4'>
                    <label className='form-label fw-bold'>Email</label>
                    <p className='form-control-plaintext'>
                      {selectedPaciente.email || 'Não informado'}
                    </p>
                  </div>

                  <div className='col-md-6'>
                    <label className='form-label fw-bold'>Convênio</label>
                    <p className='form-control-plaintext'>
                      {selectedPaciente.convenio || 'Particular'}
                    </p>
                  </div>

                  {selectedPaciente.observacoes && (
                    <div className='col-12'>
                      <label className='form-label fw-bold'>Observações</label>
                      <p className='form-control-plaintext'>
                        {selectedPaciente.observacoes}
                      </p>
                    </div>
                  )}
                  <div className='col-md-6'>
                    <label className='form-label fw-bold'>
                      Data de Cadastro
                    </label>
                    <p className='form-control-plaintext'>
                      {new Date(selectedPaciente.created_at).toLocaleDateString(
                        'pt-BR'
                      )}
                    </p>
                  </div>
                  <div className='col-md-6'>
                    <label className='form-label fw-bold'>
                      Data de Nascimento
                    </label>
                    <p className='form-control-plaintext'>
                      {new Date(
                        selectedPaciente.data_nascimento
                      ).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
              <div className='modal-footer'>
                <button
                  type='button'
                  className='btn btn-secondary'
                  onClick={() => setShowViewModal(false)}
                >
                  Fechar
                </button>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedPaciente);
                  }}
                >
                  <Edit size={16} className='me-2' />
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Pacientes;
