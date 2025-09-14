import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  UserCheck,
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
  Award,
  CheckCircle,
  XCircle,
  X,
  GraduationCap,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { validateField, CLINIC_VALIDATIONS } from '@/lib/validation';
import toast from 'react-hot-toast';
import { printReport, ReportData } from '@/lib/reportTemplate';

interface Profissional {
  id: number; // INTEGER
  usuario_id?: string | null;
  nome: string;
  cpf: string;
  crm?: string | null; // Campo atual na tabela
  crm_cro?: string | null; // Campo que será adicionado
  especialidade: string;
  subespecialidade?: string | null;
  telefone: string;
  email?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  formacao?: string | null;
  experiencia_anos?: number | null;
  horario_trabalho?: any; // JSONB
  disponibilidade?: any; // JSONB
  valor_consulta?: number | null;
  ativo?: boolean; // Campo atual na tabela
  status?: 'ativo' | 'inativo' | 'ferias'; // Campo que será adicionado
  observacoes?: string | null;
  data_cadastro?: string;
  ultima_atualizacao?: string;
  created_at?: string;
}

interface Filtros {
  buscaGlobal: string;
  nome: string;
  especialidade: string;
  status: string;
  crm_cro: string;
  cidade: string;
  dataInicio: string;
  dataFim: string;
}

interface Paginacao {
  pagina: number;
  itensPorPagina: number;
  total: number;
}

const Profissionais: React.FC = () => {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProfissional, setSelectedProfissional] =
    useState<Profissional | null>(null);

  const [filtros, setFiltros] = useState<Filtros>({
    buscaGlobal: '',
    nome: '',
    especialidade: '',
    status: '',
    crm_cro: '',
    cidade: '',
    dataInicio: '',
    dataFim: '',
  });

  const [paginacao, setPaginacao] = useState<Paginacao>({
    pagina: 1,
    itensPorPagina: 10,
    total: 0,
  });

  const [ordenacao] = useState({
    campo: 'nome' as keyof Profissional,
    direcao: 'asc' as 'asc' | 'desc',
  });
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    especialidade: '',
    crm: '',
    observacoes: '',
    ativo: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string[];
  }>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Hook de debounce para busca
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Função para registrar log de alterações
  const logAlteracao = async (
    acao: string,
    dados: any,
    profissionalId?: string
  ) => {
    try {
      const logData = {
        tabela: 'profissionais',
        acao,
        dados_anteriores: profissionalId
          ? await getDadosAnteriores(profissionalId)
          : null,
        dados_novos: dados,
        profissional_id: profissionalId,
        usuario_id: 'sistema', // Em um sistema real, pegaria do contexto de autenticação
        timestamp: new Date().toISOString(),
        ip: 'localhost', // Em um sistema real, pegaria o IP real
      };

      const { error } = await supabase.from('audit_log').insert(logData);

      if (error) {
        console.error('Erro ao registrar log:', error);
      }
    } catch (error) {
      console.error('Erro ao registrar log de alteração:', error);
    }
  };

  // Função para obter dados anteriores (para comparação)
  const getDadosAnteriores = async (profissionalId: string) => {
    try {
      const { data } = await supabase
        .from('profissionais')
        .select('*')
        .eq('id', profissionalId)
        .single();

      return data;
    } catch (error) {
      console.error('Erro ao obter dados anteriores:', error);
      return null;
    }
  };

  useEffect(() => {
    loadProfissionais();
  }, []);

  // Sincronizar busca com debounce
  useEffect(() => {
    setFiltros(prev => ({ ...prev, buscaGlobal: debouncedSearchTerm }));
  }, [debouncedSearchTerm]);

  const loadProfissionais = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);

      // Buscar todos os dados (sem paginação no backend)
      const { data, error } = await supabase.from('profissionais').select('*');

      if (error) throw error;

      setProfissionais(data || []);
      setPaginacao(prev => ({
        ...prev,
        total: (data || []).length,
        pagina: page,
        itensPorPagina: limit,
      }));
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      toast.error('Erro ao carregar profissionais');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string[] } = {};

    // Validar apenas campos preenchidos (formato e estrutura)
    if (formData.nome && formData.nome.trim() !== '') {
      const nomeErrors = validateField(
        formData.nome,
        CLINIC_VALIDATIONS.profissional.nome
      );
      if (nomeErrors.length > 0) errors.nome = nomeErrors;
    }

    if (formData.cpf && formData.cpf.trim() !== '') {
      const cpfErrors = validateField(
        formData.cpf,
        CLINIC_VALIDATIONS.profissional.cpf
      );
      if (cpfErrors.length > 0) errors.cpf = cpfErrors;
    }

    if (formData.telefone && formData.telefone.trim() !== '') {
      const telefoneErrors = validateField(
        formData.telefone,
        CLINIC_VALIDATIONS.profissional.telefone
      );
      if (telefoneErrors.length > 0) errors.telefone = telefoneErrors;
    }

    if (formData.email && formData.email.trim() !== '') {
      const emailErrors = validateField(
        formData.email,
        CLINIC_VALIDATIONS.profissional.email
      );
      if (emailErrors.length > 0) errors.email = emailErrors;
    }

    if (formData.especialidade && formData.especialidade.trim() !== '') {
      const especialidadeErrors = validateField(
        formData.especialidade,
        CLINIC_VALIDATIONS.profissional.especialidade
      );
      if (especialidadeErrors.length > 0)
        errors.especialidade = especialidadeErrors;
    }

    if (formData.crm && formData.crm.trim() !== '') {
      const crmErrors = validateField(
        formData.crm,
        CLINIC_VALIDATIONS.profissional.crm_cro
      );
      if (crmErrors.length > 0) errors.crm = crmErrors;
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Por favor, corrija os erros nos campos preenchidos');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const profissionalData = {
        nome: formData.nome,
        cpf: formData.cpf,
        telefone: formData.telefone,
        email: formData.email,
        especialidade: formData.especialidade,
        crm: formData.crm,
        observacoes: formData.observacoes,
        ativo: formData.ativo,
        data_cadastro: new Date().toISOString(),
        ultima_atualizacao: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profissionais')
        .insert(profissionalData);

      if (error) throw error;

      // Registrar log de criação
      await logAlteracao('CREATE', profissionalData);

      toast.success('Profissional cadastrado com sucesso!');
      setShowModal(false);
      resetForm();
      loadProfissionais();
    } catch (error) {
      console.error('Erro ao cadastrar profissional:', error);
      toast.error('Erro ao cadastrar profissional');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProfissional || !validateForm()) return;

    setIsSubmitting(true);

    try {
      const profissionalData = {
        nome: formData.nome,
        cpf: formData.cpf,
        telefone: formData.telefone,
        email: formData.email,
        especialidade: formData.especialidade,
        crm: formData.crm,
        observacoes: formData.observacoes,
        ativo: formData.ativo,
        // ultima_atualizacao será atualizado automaticamente pelo trigger
      };

      const { error } = await supabase
        .from('profissionais')
        .update(profissionalData)
        .eq('id', selectedProfissional.id);

      if (error) throw error;

      // Registrar log de atualização
      await logAlteracao(
        'UPDATE',
        profissionalData,
        selectedProfissional.id.toString()
      );

      toast.success('Profissional atualizado com sucesso!');
      setShowModal(false);
      setSelectedProfissional(null);
      resetForm();
      loadProfissionais();
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error);
      toast.error('Erro ao atualizar profissional');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este profissional?'))
      return;

    try {
      const { error } = await supabase
        .from('profissionais')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Registrar log de exclusão
      await logAlteracao('DELETE', { id }, id.toString());

      toast.success('Profissional excluído com sucesso!');
      loadProfissionais();
    } catch (error) {
      console.error('Erro ao excluir profissional:', error);
      toast.error('Erro ao excluir profissional');
    }
  };

  const toggleStatus = async (profissional: Profissional) => {
    try {
      const novoStatus = !profissional.ativo;
      const { error } = await supabase
        .from('profissionais')
        .update({
          ativo: novoStatus,
          ultima_atualizacao: new Date().toISOString(),
        })
        .eq('id', profissional.id);

      if (error) throw error;

      // Registrar log de alteração de status
      await logAlteracao(
        'STATUS_CHANGE',
        {
          status_anterior: profissional.ativo,
          status_novo: novoStatus,
        },
        profissional.id.toString()
      );

      toast.success(
        profissional.ativo ? 'Profissional desativado' : 'Profissional ativado'
      );
      loadProfissionais();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      especialidade: '',
      crm: '',
      observacoes: '',
      ativo: true,
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

  const openEditModal = (profissional: Profissional) => {
    setSelectedProfissional(profissional);
    setFormData({
      nome: profissional.nome || '',
      cpf: profissional.cpf || '',
      telefone: profissional.telefone || '',
      email: profissional.email || '',
      especialidade: profissional.especialidade || '',
      crm: profissional.crm || '',
      observacoes: profissional.observacoes || '',
      ativo: profissional.ativo !== false,
    });
    setValidationErrors({});
    setShowModal(true);
  };

  const openViewModal = (profissional: Profissional) => {
    setSelectedProfissional(profissional);
    setShowViewModal(true);
  };

  const getStatusBadge = (profissional: Profissional) => {
    // Usar o campo status se existir, senão usar o campo ativo
    const isAtivo = profissional.status
      ? profissional.status === 'ativo'
      : profissional.ativo === true;

    if (isAtivo) {
      return (
        <span className='badge bg-success text-white d-flex align-items-center gap-1'>
          <CheckCircle size={14} />
          Ativo
        </span>
      );
    } else {
      return (
        <span className='badge bg-secondary text-white d-flex align-items-center gap-1'>
          <XCircle size={14} />
          Inativo
        </span>
      );
    }
  };

  const formatCPF = (cpf: string | null | undefined) => {
    if (!cpf) return 'Não informado';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string | null | undefined) => {
    if (!phone) return 'Não informado';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Função para aplicar filtros
  const applyFilters = (data: Profissional[]) => {
    return data.filter(profissional => {
      // Busca global
      if (filtros.buscaGlobal) {
        const busca = filtros.buscaGlobal.toLowerCase();
        const matchGlobal =
          profissional.nome.toLowerCase().includes(busca) ||
          profissional.especialidade.toLowerCase().includes(busca) ||
          profissional.cpf?.toLowerCase().includes(busca) ||
          (profissional.crm_cro || profissional.crm)
            ?.toLowerCase()
            .includes(busca) ||
          profissional.email?.toLowerCase().includes(busca) ||
          profissional.cidade?.toLowerCase().includes(busca);
        if (!matchGlobal) return false;
      }

      // Filtros específicos
      if (
        filtros.nome &&
        !profissional.nome.toLowerCase().includes(filtros.nome.toLowerCase())
      )
        return false;
      if (
        filtros.especialidade &&
        !profissional.especialidade
          .toLowerCase()
          .includes(filtros.especialidade.toLowerCase())
      )
        return false;
      if (filtros.status && profissional.status !== filtros.status)
        return false;
      if (
        filtros.crm_cro &&
        !(profissional.crm_cro || profissional.crm)
          ?.toLowerCase()
          .includes(filtros.crm_cro.toLowerCase())
      )
        return false;
      if (
        filtros.cidade &&
        !profissional.cidade
          ?.toLowerCase()
          .includes(filtros.cidade.toLowerCase())
      )
        return false;

      // Filtros por data
      if (filtros.dataInicio) {
        const dataInicio = new Date(filtros.dataInicio);
        const dataCadastro = new Date(
          profissional.created_at || profissional.data_cadastro || new Date()
        );
        if (dataCadastro < dataInicio) return false;
      }

      if (filtros.dataFim) {
        const dataFim = new Date(filtros.dataFim);
        dataFim.setHours(23, 59, 59, 999); // Incluir o dia inteiro
        const dataCadastro = new Date(
          profissional.created_at || profissional.data_cadastro || new Date()
        );
        if (dataCadastro > dataFim) return false;
      }

      return true;
    });
  };

  // Função para ordenar dados
  const sortProfissionais = (data: Profissional[]) => {
    return [...data].sort((a, b) => {
      let aValue = a[ordenacao.campo as keyof Profissional];
      let bValue = b[ordenacao.campo as keyof Profissional];

      // Tratar valores nulos
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

  // Processar dados com useMemo para otimização
  const filteredProfissionais = React.useMemo(() => {
    return applyFilters(profissionais);
  }, [profissionais, filtros]);

  // Função para paginar dados
  const paginateProfissionais = (data: Profissional[]) => {
    const startIndex = (paginacao.pagina - 1) * paginacao.itensPorPagina;
    const endIndex = startIndex + paginacao.itensPorPagina;
    return data.slice(startIndex, endIndex);
  };

  const sortedProfissionais = React.useMemo(() => {
    return sortProfissionais(filteredProfissionais);
  }, [filteredProfissionais]);

  const processedProfissionais = React.useMemo(() => {
    return paginateProfissionais(sortedProfissionais);
  }, [sortedProfissionais, paginacao]);

  // Atualizar total de itens quando filtros mudarem
  React.useEffect(() => {
    setPaginacao(prev => ({
      ...prev,
      total: filteredProfissionais.length,
      pagina: 1,
    }));
  }, [filteredProfissionais.length]);

  const handlePageChange = (pagina: number) => {
    setPaginacao(prev => ({ ...prev, pagina }));
  };

  const handleItemsPerPageChange = (itens: number) => {
    setPaginacao(prev => ({ ...prev, itensPorPagina: itens, pagina: 1 }));
  };

  // Função para imprimir lista de profissionais
  const imprimirProfissionais = () => {
    if (filteredProfissionais.length === 0) {
      toast.error('Nenhum profissional encontrado para impressão');
      return;
    }

    try {
      // Estatísticas para o relatório
      const profissionaisAtivos = filteredProfissionais.filter(
        p => p.status === 'ativo' || p.ativo === true
      ).length;
      const profissionaisInativos = filteredProfissionais.filter(
        p => p.status === 'inativo' || p.ativo === false
      ).length;
      const profissionaisFerias = filteredProfissionais.filter(
        p => p.status === 'ferias'
      ).length;
      const especialidadesUnicas = new Set(
        filteredProfissionais.map(p => p.especialidade)
      ).size;

      const reportData: ReportData = {
        title: 'Relatório de Profissionais',
        data: filteredProfissionais,
        columns: [
          { key: 'nome', label: 'Nome' },
          { key: 'especialidade', label: 'Especialidade' },
          {
            key: 'crm_cro',
            label: 'CRM/CRO',
            format: (value: string) => value || 'Não informado',
          },
          {
            key: 'telefone',
            label: 'Telefone',
            format: (value: string) =>
              value ? formatPhone(value) : 'Não informado',
          },
          {
            key: 'email',
            label: 'Email',
            format: (value: string) => value || 'Não informado',
          },
          {
            key: 'status',
            label: 'Status',
            format: (value: string, item: any) => {
              const status = value || (item.ativo ? 'ativo' : 'inativo');
              return `<span class="status-${status}">${status}</span>`;
            },
          },
          {
            key: 'cidade',
            label: 'Cidade',
            format: (value: string) => value || 'Não informado',
          },
          {
            key: 'created_at',
            label: 'Data Cadastro',
            format: (value: string, item: any) =>
              new Date(
                value || item.data_cadastro || new Date()
              ).toLocaleDateString('pt-BR'),
          },
        ],
        summary: [
          { label: 'Ativos', value: profissionaisAtivos },
          { label: 'Inativos', value: profissionaisInativos },
          { label: 'Férias', value: profissionaisFerias },
          { label: 'Especialidades', value: especialidadesUnicas },
        ],
        filters: {
          'Busca Global': filtros.buscaGlobal,
          Nome: filtros.nome,
          Especialidade: filtros.especialidade,
          Status: filtros.status,
          'CRM/CRO': filtros.crm_cro,
          Cidade: filtros.cidade,
        },
      };

      printReport(reportData);
      toast.success('Relatório de impressão gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao imprimir relatório:', error);
      toast.error('Erro ao gerar relatório de impressão');
    }
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
        <title>Profissionais - Sistema Clínica</title>
      </Helmet>

      <div className='container-fluid'>
        {/* Header */}
        <div className='row mb-4'>
          <div className='col-12'>
            <div className='mb-6'>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white flex items-center'>
                <UserCheck className='mr-3 !text-blue-600' size={32} style={{ color: '#2563eb !important' }} />
                Cadastro de Profissionais
              </h1>
              <p className='text-gray-600 dark:text-gray-300 mt-2'>
                Gerencie o cadastro e informações dos profissionais da clínica
              </p>
            </div>
            <div className='d-flex justify-content-between align-items-center'>
              <div></div>
              <div className='d-flex gap-2'>
                <button
                  className='btn btn-primary'
                  onClick={() => {
                    setSelectedProfissional(null);
                    resetForm();
                    setShowModal(true);
                  }}
                >
                  <Plus size={16} className='me-2' />
                  Novo Profissional
                </button>

                <button
                  className='btn btn-outline-info btn-sm d-flex align-items-center gap-2'
                  onClick={imprimirProfissionais}
                  title='Imprimir lista de profissionais'
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
                  <div className='col-md-3'>
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
                  <div className='col-md-3'>
                    <label className='form-label'>Especialidade</label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Buscar por especialidade...'
                      value={filtros.especialidade}
                      onChange={e =>
                        setFiltros({
                          ...filtros,
                          especialidade: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className='col-md-2'>
                    <label className='form-label'>Status</label>
                    <select
                      className='form-select'
                      value={filtros.status}
                      onChange={e =>
                        setFiltros({
                          ...filtros,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value=''>Todos</option>
                      <option value='ativo'>Ativos</option>
                      <option value='inativo'>Inativos</option>
                      <option value='ferias'>Férias</option>
                    </select>
                  </div>
                  <div className='col-md-2'>
                    <label className='form-label'>CRM/CRO</label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Buscar por CRM/CRO...'
                      value={filtros.crm_cro}
                      onChange={e =>
                        setFiltros({ ...filtros, crm_cro: e.target.value })
                      }
                    />
                  </div>
                  <div className='col-md-2 d-flex align-items-end'>
                    <button
                      className='btn btn-outline-secondary w-100'
                      onClick={() =>
                        setFiltros({
                          buscaGlobal: '',
                          nome: '',
                          especialidade: '',
                          status: '',
                          crm_cro: '',
                          cidade: '',
                          dataInicio: '',
                          dataFim: '',
                        })
                      }
                    >
                      <X size={16} className='me-2' />
                      Limpar
                    </button>
                  </div>
                </div>
                <div className='row g-3 mt-2'>
                  <div className='col-md-3'>
                    <label className='form-label'>Data Início</label>
                    <input
                      type='date'
                      className='form-control'
                      value={filtros.dataInicio}
                      onChange={e =>
                        setFiltros({ ...filtros, dataInicio: e.target.value })
                      }
                    />
                  </div>
                  <div className='col-md-3'>
                    <label className='form-label'>Data Fim</label>
                    <input
                      type='date'
                      className='form-control'
                      value={filtros.dataFim}
                      onChange={e =>
                        setFiltros({ ...filtros, dataFim: e.target.value })
                      }
                    />
                  </div>
                  <div className='col-md-3'>
                    <label className='form-label'>Busca Global</label>
                    <div className='position-relative'>
                      <input
                        type='text'
                        className='form-control'
                        placeholder='Buscar em todos os campos...'
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                      <Search
                        size={16}
                        className='position-absolute top-50 end-0 translate-middle-y me-3 text-muted'
                        style={{ pointerEvents: 'none' }}
                      />
                    </div>
                  </div>
                  <div className='col-md-3'>
                    <label className='form-label'>Cidade</label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Buscar por cidade...'
                      value={filtros.cidade}
                      onChange={e =>
                        setFiltros({ ...filtros, cidade: e.target.value })
                      }
                    />
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
                    <UserCheck size={24} className='text-white' />
                  </div>
                  <div>
                    <h4 className='mb-0'>{profissionais.length}</h4>
                    <small>Total de Profissionais</small>
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
                    <Award size={24} className='text-white' />
                  </div>
                  <div>
                    <h4 className='mb-0'>
                      {
                        profissionais.filter(
                          p => p.status === 'ativo' || p.ativo === true
                        ).length
                      }
                    </h4>
                    <small>Profissionais Ativos</small>
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
                    <GraduationCap size={24} className='text-white' />
                  </div>
                  <div>
                    <h4 className='mb-0'>
                      {new Set(profissionais.map(p => p.especialidade)).size}
                    </h4>
                    <small>Especialidades</small>
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
                    <Calendar size={24} className='text-white' />
                  </div>
                  <div>
                    <h4 className='mb-0'>
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
                    </h4>
                    <small>Novos Este Mês</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Profissionais */}
        <div className='row'>
          <div className='col-12'>
            <div className='card'>
              <div className='card-header'>
                <div className='d-flex justify-content-between align-items-center'>
                  <h5 className='card-title mb-0'>
                    <UserCheck size={18} className='me-2 text-primary' />
                    Lista de Profissionais
                  </h5>
                  <span className='badge bg-primary fs-6'>
                    {filteredProfissionais.length} profissionais
                  </span>
                </div>
              </div>
              <div className='card-body p-0'>
                <div className='table-responsive'>
                  <table className='table table-hover mb-0'>
                    <thead className='table-light'>
                      <tr>
                        <th>Nome</th>
                        <th>CRM/Registro</th>
                        <th>Especialidade</th>
                        <th>Telefone</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedProfissionais.map(profissional => (
                        <tr key={profissional.id}>
                          <td>
                            <div className='d-flex align-items-center'>
                              <div className='bg-primary bg-gradient rounded-circle p-2 me-2'>
                                <User size={14} className='text-white' />
                              </div>
                              <div>
                                <div className='fw-bold'>
                                  {profissional.nome}
                                </div>
                                <small className='text-muted'>
                                  CPF: {formatCPF(profissional.cpf)}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className='badge bg-info bg-opacity-10 text-info'>
                              {profissional.crm_cro ||
                                profissional.crm ||
                                'Não informado'}
                            </span>
                          </td>
                          <td>
                            <span className='fw-bold'>
                              {profissional.especialidade}
                            </span>
                          </td>
                          <td>
                            <div className='d-flex align-items-center'>
                              <Phone size={14} className='text-muted me-1' />
                              {formatPhone(profissional.telefone)}
                            </div>
                          </td>
                          <td>
                            <div className='d-flex align-items-center'>
                              <Mail size={14} className='text-muted me-1' />
                              {profissional.email || 'Não informado'}
                            </div>
                          </td>
                          <td>{getStatusBadge(profissional)}</td>
                          <td>
                            <div className='btn-group btn-group-sm'>
                              <button
                                className='btn btn-outline-info'
                                title='Visualizar'
                                onClick={() => openViewModal(profissional)}
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                className='btn btn-outline-primary'
                                title='Editar'
                                onClick={() => openEditModal(profissional)}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className={`btn btn-sm ${profissional.status === 'ativo' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                onClick={() => toggleStatus(profissional)}
                                title={
                                  profissional.status === 'ativo'
                                    ? 'Desativar'
                                    : 'Ativar'
                                }
                              >
                                {profissional.status === 'ativo' ? (
                                  <XCircle size={14} />
                                ) : (
                                  <CheckCircle size={14} />
                                )}
                              </button>
                              <button
                                className='btn btn-outline-danger'
                                title='Excluir'
                                onClick={() =>
                                  handleDelete(profissional.id.toString())
                                }
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
              </div>

              {/* Controles de Paginação */}
              <div className='card-footer'>
                <div className='d-flex justify-content-between align-items-center'>
                  <div className='d-flex align-items-center gap-3'>
                    <span className='text-muted'>
                      Mostrando{' '}
                      {(paginacao.pagina - 1) * paginacao.itensPorPagina + 1} a{' '}
                      {Math.min(
                        paginacao.pagina * paginacao.itensPorPagina,
                        paginacao.total
                      )}{' '}
                      de {paginacao.total} registros
                    </span>
                    <select
                      className='form-select form-select-sm'
                      style={{ width: 'auto' }}
                      value={paginacao.itensPorPagina}
                      onChange={e =>
                        handleItemsPerPageChange(Number(e.target.value))
                      }
                    >
                      <option value={5}>5 por página</option>
                      <option value={10}>10 por página</option>
                      <option value={25}>25 por página</option>
                      <option value={50}>50 por página</option>
                    </select>
                  </div>

                  <nav>
                    <ul className='pagination pagination-sm mb-0'>
                      <li
                        className={`page-item ${paginacao.pagina === 1 ? 'disabled' : ''}`}
                      >
                        <button
                          className='page-link'
                          onClick={() => handlePageChange(paginacao.pagina - 1)}
                          disabled={paginacao.pagina === 1}
                        >
                          Anterior
                        </button>
                      </li>

                      {/* Páginas */}
                      {Array.from(
                        {
                          length: Math.ceil(
                            paginacao.total / paginacao.itensPorPagina
                          ),
                        },
                        (_, i) => i + 1
                      )
                        .filter(page => {
                          const current = paginacao.pagina;
                          return (
                            page === 1 ||
                            page ===
                              Math.ceil(
                                paginacao.total / paginacao.itensPorPagina
                              ) ||
                            (page >= current - 1 && page <= current + 1)
                          );
                        })
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <li className='page-item disabled'>
                                <span className='page-link'>...</span>
                              </li>
                            )}
                            <li
                              className={`page-item ${page === paginacao.pagina ? 'active' : ''}`}
                            >
                              <button
                                className='page-link'
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </button>
                            </li>
                          </React.Fragment>
                        ))}

                      <li
                        className={`page-item ${paginacao.pagina === Math.ceil(paginacao.total / paginacao.itensPorPagina) ? 'disabled' : ''}`}
                      >
                        <button
                          className='page-link'
                          onClick={() => handlePageChange(paginacao.pagina + 1)}
                          disabled={
                            paginacao.pagina ===
                            Math.ceil(
                              paginacao.total / paginacao.itensPorPagina
                            )
                          }
                        >
                          Próxima
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
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
                  {selectedProfissional ? (
                    <>
                      <Edit size={20} className='me-2' />
                      Editar Profissional
                    </>
                  ) : (
                    <>
                      <Plus size={20} className='me-2' />
                      Novo Profissional
                    </>
                  )}
                </h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setShowModal(false)}
                />
              </div>
              <form onSubmit={selectedProfissional ? handleEdit : handleSubmit}>
                <div className='modal-body'>
                  <div className='row g-3'>
                    <div className='col-md-6'>
                      <label className='form-label'>Nome Completo *</label>
                      <input
                        type='text'
                        name='nome'
                        className='form-control'
                        value={formData.nome}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className='col-md-3'>
                      <label className='form-label'>CPF *</label>
                      <input
                        type='text'
                        name='cpf'
                        className='form-control'
                        value={formData.cpf}
                        onChange={handleInputChange}
                        placeholder='00000000000'
                        required
                      />
                    </div>
                    <div className='col-md-3'>
                      <label className='form-label'>CRM/Registro</label>
                      <input
                        type='text'
                        name='crm'
                        className='form-control'
                        value={formData.crm}
                        onChange={handleInputChange}
                        placeholder='CRM 12345'
                      />
                    </div>
                    <div className='col-md-6'>
                      <label className='form-label'>Especialidade *</label>
                      <select
                        name='especialidade'
                        className='form-select'
                        value={formData.especialidade}
                        onChange={handleInputChange}
                        required
                      >
                        <option value=''>Selecione a especialidade</option>
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
                    <div className='col-md-3'>
                      <label className='form-label'>Telefone *</label>
                      <input
                        type='text'
                        name='telefone'
                        className='form-control'
                        value={formData.telefone}
                        onChange={handleInputChange}
                        placeholder='(00) 00000-0000'
                        required
                      />
                    </div>
                    <div className='col-md-3'>
                      <label className='form-label'>Email</label>
                      <input
                        type='email'
                        name='email'
                        className='form-control'
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder='email@exemplo.com'
                      />
                    </div>
                    <div className='col-md-6'>
                      <label className='form-label'>Status</label>
                      <select
                        name='ativo'
                        className='form-select'
                        value={formData.ativo ? 'true' : 'false'}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            ativo: e.target.value === 'true',
                          })
                        }
                      >
                        <option value='true'>Ativo</option>
                        <option value='false'>Inativo</option>
                      </select>
                    </div>
                    <div className='col-12'>
                      <label className='form-label'>Observações</label>
                      <textarea
                        name='observacoes'
                        className='form-control'
                        rows={3}
                        value={formData.observacoes || ''}
                        onChange={handleInputChange}
                        placeholder='Informações adicionais sobre o profissional...'
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
                        {selectedProfissional
                          ? 'Atualizando...'
                          : 'Cadastrando...'}
                      </>
                    ) : selectedProfissional ? (
                      'Atualizar Profissional'
                    ) : (
                      'Cadastrar Profissional'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualização */}
      {showViewModal && selectedProfissional && (
        <div
          className='modal fade show d-block'
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className='modal-dialog modal-lg'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>
                  <Eye size={20} className='me-2' />
                  Dados do Profissional
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
                      {selectedProfissional.nome}
                    </p>
                  </div>
                  <div className='col-md-3'>
                    <label className='form-label fw-bold'>CPF</label>
                    <p className='form-control-plaintext'>
                      {formatCPF(selectedProfissional.cpf)}
                    </p>
                  </div>
                  <div className='col-md-3'>
                    <label className='form-label fw-bold'>CRM/Registro</label>
                    <p className='form-control-plaintext'>
                      {selectedProfissional.crm_cro ||
                        selectedProfissional.crm ||
                        'Não informado'}
                    </p>
                  </div>
                  <div className='col-md-4'>
                    <label className='form-label fw-bold'>Especialidade</label>
                    <p className='form-control-plaintext'>
                      {selectedProfissional.especialidade}
                    </p>
                  </div>
                  <div className='col-md-4'>
                    <label className='form-label fw-bold'>Telefone</label>
                    <p className='form-control-plaintext'>
                      {formatPhone(selectedProfissional.telefone)}
                    </p>
                  </div>
                  <div className='col-md-4'>
                    <label className='form-label fw-bold'>Status</label>
                    <div>{getStatusBadge(selectedProfissional)}</div>
                  </div>
                  <div className='col-md-6'>
                    <label className='form-label fw-bold'>Email</label>
                    <p className='form-control-plaintext'>
                      {selectedProfissional.email || 'Não informado'}
                    </p>
                  </div>
                  <div className='col-md-6'>
                    <label className='form-label fw-bold'>
                      Data de Cadastro
                    </label>
                    <p className='form-control-plaintext'>
                      {new Date(
                        selectedProfissional.created_at ||
                          selectedProfissional.data_cadastro ||
                          new Date()
                      ).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {selectedProfissional.observacoes && (
                    <div className='col-12'>
                      <label className='form-label fw-bold'>Observações</label>
                      <p className='form-control-plaintext'>
                        {selectedProfissional.observacoes}
                      </p>
                    </div>
                  )}
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
                    openEditModal(selectedProfissional);
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

export default Profissionais;
