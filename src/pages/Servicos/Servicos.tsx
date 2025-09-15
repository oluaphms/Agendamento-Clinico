  import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Settings,
  Plus,
  FileText,
  DollarSign,
  Clock,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { printReport, ReportData } from '@/lib/reportTemplate';

interface Servico {
  id: number;
  nome: string;
  descricao: string | null;
  duracao_min: number;
  preco: string | number; // Pode ser string (do banco) ou number (processado)
  ativo: boolean;
  data_cadastro: string;
  ultima_atualizacao: string;
}

interface Filtros {
  nome: string;
  ativo: boolean | null;
  preco_min: string;
  preco_max: string;
}

const Servicos: React.FC = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedServico, setSelectedServico] = useState<Servico | null>(null);
  const [filtros, setFiltros] = useState<Filtros>({
    nome: '',
    ativo: null,
    preco_min: '',
    preco_max: '',
  });

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    duracao_min: '',
    preco: '',
    ativo: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadServicos();
  }, []);

  const loadServicos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .order('nome');

      if (error) throw error;

      setServicos(data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return false;
    }
    if (!formData.preco.trim()) {
      toast.error('Preço é obrigatório');
      return false;
    }
    if (!formData.duracao_min.trim()) {
      toast.error('Duração é obrigatória');
      return false;
    }
    if (parseFloat(formData.preco) <= 0) {
      toast.error('Preço deve ser maior que zero');
      return false;
    }
    if (parseInt(formData.duracao_min) <= 0) {
      toast.error('Duração deve ser maior que zero');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const servicoData = {
        ...formData,
        preco: parseFloat(formData.preco),
        duracao_min: parseInt(formData.duracao_min),
        data_cadastro: new Date().toISOString(),
        ultima_atualizacao: new Date().toISOString(),
      };

      const { error } = await supabase.from('servicos').insert(servicoData);

      if (error) throw error;

      toast.success('Serviço cadastrado com sucesso!');
      setShowModal(false);
      resetForm();
      loadServicos();
    } catch (error) {
      console.error('Erro ao cadastrar serviço:', error);
      toast.error('Erro ao cadastrar serviço');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedServico || !validateForm()) return;

    setIsSubmitting(true);

    try {
      const servicoData = {
        ...formData,
        preco: parseFloat(formData.preco),
        duracao_min: parseInt(formData.duracao_min),
        ultima_atualizacao: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('servicos')
        .update(servicoData)
        .eq('id', selectedServico.id);

      if (error) throw error;

      toast.success('Serviço atualizado com sucesso!');
      setShowModal(false);
      setSelectedServico(null);
      resetForm();
      loadServicos();
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      toast.error('Erro ao atualizar serviço');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) return;

    try {
      const { error } = await supabase.from('servicos').delete().eq('id', id);

      if (error) throw error;

      toast.success('Serviço excluído com sucesso!');
      loadServicos();
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      toast.error('Erro ao excluir serviço');
    }
  };

  const toggleStatus = async (servico: Servico) => {
    try {
      const { error } = await supabase
        .from('servicos')
        .update({
          ativo: !servico.ativo,
          ultima_atualizacao: new Date().toISOString(),
        })
        .eq('id', servico.id);

      if (error) throw error;

      toast.success(servico.ativo ? 'Serviço desativado' : 'Serviço ativado');
      loadServicos();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      duracao_min: '',
      preco: '',
      ativo: true,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

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

  const openEditModal = (servico: Servico) => {
    setSelectedServico(servico);
    setFormData({
      nome: servico.nome,
      descricao: servico.descricao || '',
      duracao_min: servico.duracao_min.toString(),
      preco: (typeof servico.preco === 'string'
        ? parseFloat(servico.preco)
        : servico.preco
      ).toString(),
      ativo: servico.ativo,
    });
    setShowModal(true);
  };

  const openViewModal = (servico: Servico) => {
    setSelectedServico(servico);
    setShowViewModal(true);
  };

  const getStatusBadge = (ativo: boolean) => {
    if (ativo) {
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}min` : ''}`.trim();
    }
    return `${mins}min`;
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numPrice);
  };

  const filteredServicos = servicos.filter(servico => {
    if (
      filtros.nome &&
      !servico.nome.toLowerCase().includes(filtros.nome.toLowerCase())
    )
      return false;
    if (filtros.ativo !== null && servico.ativo !== filtros.ativo) return false;

    const servicoPreco =
      typeof servico.preco === 'string'
        ? parseFloat(servico.preco)
        : servico.preco;
    if (filtros.preco_min && servicoPreco < parseFloat(filtros.preco_min))
      return false;
    if (filtros.preco_max && servicoPreco > parseFloat(filtros.preco_max))
      return false;
    return true;
  });

  // Função para imprimir lista de serviços
  const imprimirServicos = () => {
    if (filteredServicos.length === 0) {
      toast.error('Nenhum serviço encontrado para imprimir');
      return;
    }

    try {
      const servicosAtivos = filteredServicos.filter(s => s.ativo).length;
      const servicosInativos = filteredServicos.filter(s => !s.ativo).length;
      const valorTotal = filteredServicos.reduce((sum, s) => {
        const preco =
          typeof s.preco === 'string' ? parseFloat(s.preco) : s.preco;
        return sum + preco;
      }, 0);

      const reportData: ReportData = {
        title: 'Relatório de Serviços',
        data: filteredServicos,
        columns: [
          { key: 'nome', label: 'Nome' },
          {
            key: 'descricao',
            label: 'Descrição',
            format: (value: any) => value || 'Sem descrição',
          },
          {
            key: 'duracao_min',
            label: 'Duração',
            format: (value: any) => formatDuration(value),
          },
          {
            key: 'preco',
            label: 'Preço',
            format: (value: any) => formatPrice(value),
          },
          {
            key: 'ativo',
            label: 'Status',
            format: (value: any) => (value ? 'Ativo' : 'Inativo'),
          },
          {
            key: 'data_cadastro',
            label: 'Data Cadastro',
            format: (value: any) => new Date(value).toLocaleDateString('pt-BR'),
          },
        ],
        summary: [
          { label: 'Ativos', value: servicosAtivos },
          { label: 'Inativos', value: servicosInativos },
          { label: 'Valor Total', value: Math.round(valorTotal) },
        ],
        filters: {
          Nome: filtros.nome,
          Status:
            filtros.ativo !== null
              ? filtros.ativo
                ? 'Ativos'
                : 'Inativos'
              : '',
          'Preço Mínimo': filtros.preco_min,
          'Preço Máximo': filtros.preco_max,
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
        <title>Serviços - Sistema Clínica</title>
      </Helmet>

      <div className='container-fluid'>
        {/* Header */}
        <div className='row mb-4'>
          <div className='col-12'>
            <div className='mb-6'>
            </div>
            <div className='d-flex justify-content-between align-items-center'>
              <div></div>
              <div className='d-flex gap-2'>
                <button
                  className='btn btn-primary'
                  onClick={() => {
                    setSelectedServico(null);
                    resetForm();
                    setShowModal(true);
                  }}
                >
                  <Plus size={16} className='me-2' />
                  Novo Serviço
                </button>

                <button
                  className='btn btn-outline-info btn-sm d-flex align-items-center gap-2'
                  onClick={imprimirServicos}
                  title='Imprimir lista de serviços'
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
                    <label className='form-label'>Status</label>
                    <select
                      className='form-select'
                      value={
                        filtros.ativo === null ? '' : filtros.ativo.toString()
                      }
                      onChange={e =>
                        setFiltros({
                          ...filtros,
                          ativo:
                            e.target.value === ''
                              ? null
                              : e.target.value === 'true',
                        })
                      }
                    >
                      <option value=''>Todos</option>
                      <option value='true'>Ativos</option>
                      <option value='false'>Inativos</option>
                    </select>
                  </div>
                  <div className='col-md-2'>
                    <label className='form-label'>Preço Mínimo</label>
                    <input
                      type='number'
                      className='form-control'
                      placeholder='0.00'
                      value={filtros.preco_min}
                      onChange={e =>
                        setFiltros({ ...filtros, preco_min: e.target.value })
                      }
                      step='0.01'
                    />
                  </div>
                  <div className='col-md-2'>
                    <label className='form-label'>Preço Máximo</label>
                    <input
                      type='number'
                      className='form-control'
                      placeholder='0.00'
                      value={filtros.preco_max}
                      onChange={e =>
                        setFiltros({ ...filtros, preco_max: e.target.value })
                      }
                      step='0.01'
                    />
                  </div>
                  <div className='col-md-2 d-flex align-items-end'>
                    <button
                      className='btn btn-outline-secondary w-100'
                      onClick={() =>
                        setFiltros({
                          nome: '',
                          ativo: null,
                          preco_min: '',
                          preco_max: '',
                        })
                      }
                    >
                      <X size={16} className='me-2' />
                      Limpar
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
                    <Settings size={24} className='text-white' />
                  </div>
                  <div>
                    <h4 className='mb-0'>{servicos.length}</h4>
                    <small>Total de Serviços</small>
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
                    <CheckCircle size={24} className='text-white' />
                  </div>
                  <div>
                    <h4 className='mb-0'>
                      {servicos.filter(s => s.ativo).length}
                    </h4>
                    <small>Serviços Ativos</small>
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
                    <DollarSign size={24} className='text-white' />
                  </div>
                  <div>
                    <h4 className='mb-0'>
                      {formatPrice(
                        servicos.reduce((sum, s) => {
                          const preco =
                            typeof s.preco === 'string'
                              ? parseFloat(s.preco)
                              : s.preco;
                          return sum + preco;
                        }, 0)
                      )}
                    </h4>
                    <small>Valor Total</small>
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
                    <Clock size={24} className='text-white' />
                  </div>
                  <div>
                    <h4 className='mb-0'>
                      {
                        servicos.filter(s => {
                          const cadastro = new Date(s.data_cadastro);
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

        {/* Lista de Serviços */}
        <div className='row'>
          <div className='col-12'>
            <div className='card'>
              <div className='card-header'>
                <div className='d-flex justify-content-between align-items-center'>
                  <h5 className='card-title mb-0'>
                    <Settings size={18} className='me-2 text-primary' />
                    Lista de Serviços
                  </h5>
                  <span className='badge bg-primary fs-6'>
                    {filteredServicos.length} serviços
                  </span>
                </div>
              </div>
              <div className='card-body p-0'>
                <div className='table-responsive'>
                  <table className='table table-hover mb-0'>
                    <thead className='table-light'>
                      <tr>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>Preço</th>
                        <th>Duração</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServicos.map(servico => (
                        <tr key={servico.id}>
                          <td>
                            <div className='d-flex align-items-center'>
                              <div className='bg-primary bg-gradient rounded-circle p-2 me-2'>
                                <Settings size={14} className='text-white' />
                              </div>
                              <div>
                                <div className='fw-bold'>{servico.nome}</div>
                                <small className='text-muted'>
                                  ID: #{servico.id}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div
                              className='text-truncate'
                              style={{ maxWidth: '200px' }}
                            >
                              {servico.descricao || 'Sem descrição'}
                            </div>
                          </td>
                          <td>
                            <span className='fw-bold text-success'>
                              {formatPrice(servico.preco)}
                            </span>
                          </td>
                          <td>
                            <div className='d-flex align-items-center'>
                              <Clock size={14} className='text-muted me-1' />
                              {formatDuration(servico.duracao_min)}
                            </div>
                          </td>
                          <td>{getStatusBadge(servico.ativo)}</td>
                          <td>
                            <div className='btn-group btn-group-sm'>
                              <button
                                className='btn btn-outline-info'
                                title='Visualizar'
                                onClick={() => openViewModal(servico)}
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                className='btn btn-outline-primary'
                                title='Editar'
                                onClick={() => openEditModal(servico)}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className={`btn btn-sm ${servico.ativo ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                onClick={() => toggleStatus(servico)}
                                title={servico.ativo ? 'Desativar' : 'Ativar'}
                              >
                                {servico.ativo ? (
                                  <XCircle size={14} />
                                ) : (
                                  <CheckCircle size={14} />
                                )}
                              </button>
                              <button
                                className='btn btn-outline-danger'
                                title='Excluir'
                                onClick={() => handleDelete(servico.id)}
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
                  {selectedServico ? (
                    <>
                      <Edit size={20} className='me-2' />
                      Editar Serviço
                    </>
                  ) : (
                    <>
                      <Plus size={20} className='me-2' />
                      Novo Serviço
                    </>
                  )}
                </h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setShowModal(false)}
                />
              </div>
              <form onSubmit={selectedServico ? handleEdit : handleSubmit}>
                <div className='modal-body'>
                  <div className='row g-3'>
                    <div className='col-md-8'>
                      <label className='form-label'>Nome do Serviço *</label>
                      <input
                        type='text'
                        name='nome'
                        className='form-control'
                        value={formData.nome}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className='col-md-4'>
                      <label className='form-label'>Preço *</label>
                      <div className='input-group'>
                        <span className='input-group-text'>R$</span>
                        <input
                          type='number'
                          name='preco'
                          className='form-control'
                          value={formData.preco}
                          onChange={handleInputChange}
                          placeholder='0.00'
                          step='0.01'
                          min='0'
                          required
                        />
                      </div>
                    </div>
                    <div className='col-md-4'>
                      <label className='form-label'>Duração (minutos) *</label>
                      <input
                        type='number'
                        name='duracao_min'
                        className='form-control'
                        value={formData.duracao_min}
                        onChange={handleInputChange}
                        placeholder='60'
                        min='1'
                        required
                      />
                    </div>
                    <div className='col-md-4'>
                      <div className='form-check mt-4'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          name='ativo'
                          id='ativo'
                          checked={formData.ativo}
                          onChange={handleInputChange}
                        />
                        <label className='form-check-label' htmlFor='ativo'>
                          Serviço ativo
                        </label>
                      </div>
                    </div>
                    <div className='col-12'>
                      <label className='form-label'>Descrição</label>
                      <textarea
                        name='descricao'
                        className='form-control'
                        rows={3}
                        value={formData.descricao}
                        onChange={handleInputChange}
                        placeholder='Descreva detalhes sobre o serviço...'
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
                        {selectedServico ? 'Atualizando...' : 'Cadastrando...'}
                      </>
                    ) : selectedServico ? (
                      'Atualizar Serviço'
                    ) : (
                      'Cadastrar Serviço'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visualização */}
      {showViewModal && selectedServico && (
        <div
          className='modal fade show d-block'
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className='modal-dialog modal-lg'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>
                  <Eye size={20} className='me-2' />
                  Detalhes do Serviço
                </h5>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setShowViewModal(false)}
                />
              </div>
              <div className='modal-body'>
                <div className='row g-3'>
                  <div className='col-md-8'>
                    <label className='form-label fw-bold'>
                      Nome do Serviço
                    </label>
                    <p className='form-control-plaintext'>
                      {selectedServico.nome}
                    </p>
                  </div>
                  <div className='col-md-4'>
                    <label className='form-label fw-bold'>Status</label>
                    <div>{getStatusBadge(selectedServico.ativo)}</div>
                  </div>
                  <div className='col-md-4'>
                    <label className='form-label fw-bold'>Preço</label>
                    <p className='form-control-plaintext text-success fw-bold'>
                      {formatPrice(selectedServico.preco)}
                    </p>
                  </div>
                  <div className='col-md-4'>
                    <label className='form-label fw-bold'>Duração</label>
                    <p className='form-control-plaintext'>
                      {formatDuration(selectedServico.duracao_min)}
                    </p>
                  </div>
                  <div className='col-md-4'>
                    <label className='form-label fw-bold'>ID do Serviço</label>
                    <p className='form-control-plaintext'>
                      #{selectedServico.id}
                    </p>
                  </div>
                  {selectedServico.descricao && (
                    <div className='col-12'>
                      <label className='form-label fw-bold'>Descrição</label>
                      <p className='form-control-plaintext'>
                        {selectedServico.descricao}
                      </p>
                    </div>
                  )}
                  <div className='col-md-6'>
                    <label className='form-label fw-bold'>
                      Data de Cadastro
                    </label>
                    <p className='form-control-plaintext'>
                      {new Date(
                        selectedServico.data_cadastro
                      ).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className='col-md-6'>
                    <label className='form-label fw-bold'>
                      Última Atualização
                    </label>
                    <p className='form-control-plaintext'>
                      {new Date(
                        selectedServico.ultima_atualizacao
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
                    openEditModal(selectedServico);
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

export default Servicos;
