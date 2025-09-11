// ============================================================================
// COMPONENTE: Modal de Agendamento Recorrente
// ============================================================================
// Este componente permite criar agendamentos que se repetem automaticamente
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  UserCheck,
  Stethoscope,
  Repeat,
  X,
  Plus,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface ModalAgendamentoRecorrenteProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  paciente_id: string;
  profissional_id: string;
  servico_id: string;
  data_inicio: string;
  hora: string;
  frequencia: 'diario' | 'semanal' | 'quinzenal' | 'mensal';
  dia_semana?: string;
  dia_mes?: string;
  quantidade: number;
  observacoes: string;
}

const ModalAgendamentoRecorrente: React.FC<ModalAgendamentoRecorrenteProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<FormData>({
    paciente_id: '',
    profissional_id: '',
    servico_id: '',
    data_inicio: '',
    hora: '',
    frequencia: 'semanal',
    dia_semana: '',
    dia_mes: '',
    quantidade: 4,
    observacoes: ''
  });

  const [pacientes, setPacientes] = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [servicos, setServicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadData();
      // Definir data mínima como hoje
      const hoje = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, data_inicio: hoje }));
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.data_inicio && formData.hora && formData.frequencia && formData.quantidade) {
      gerarPreview();
    }
  }, [formData]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      // Verificar se estamos usando o banco local (modo desenvolvimento)
      const isLocalDb =
        !import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL.includes('localhost');

      if (isLocalDb) {
        // Dados mock para desenvolvimento
        const pacientesMock = [
          { id: 1, nome: 'João Silva' },
          { id: 2, nome: 'Maria Santos' },
          { id: 3, nome: 'Pedro Oliveira' },
          { id: 4, nome: 'Ana Costa' },
          { id: 5, nome: 'Carlos Ferreira' }
        ];

        const profissionaisMock = [
          { id: 1, nome: 'Dr. João Médico', especialidade: 'Cardiologia' },
          { id: 2, nome: 'Dra. Maria Pediatra', especialidade: 'Pediatria' },
          { id: 3, nome: 'Dr. Pedro Ortopedista', especialidade: 'Ortopedia' },
          { id: 4, nome: 'Dra. Ana Dermatologista', especialidade: 'Dermatologia' },
          { id: 5, nome: 'Dr. Carlos Neurologista', especialidade: 'Neurologia' }
        ];

        const servicosMock = [
          { id: 1, nome: 'Consulta Médica', duracao: 30, valor: 150.00 },
          { id: 2, nome: 'Exame de Sangue', duracao: 15, valor: 80.00 },
          { id: 3, nome: 'Ultrassom', duracao: 45, valor: 200.00 },
          { id: 4, nome: 'Raio-X', duracao: 20, valor: 120.00 },
          { id: 5, nome: 'Consulta de Retorno', duracao: 20, valor: 100.00 }
        ];

        setPacientes(pacientesMock);
        setProfissionais(profissionaisMock);
        setServicos(servicosMock);
        return;
      }

      // Carregar dados reais do Supabase
      const [pacientesResult, profissionaisResult, servicosResult] = await Promise.all([
        supabase
          .from('pacientes')
          .select('id, nome')
          .eq('status', 'ativo')
          .order('nome'),
        supabase
          .from('profissionais')
          .select('id, nome, especialidade')
          .eq('status', 'ativo')
          .order('nome'),
        supabase
          .from('servicos')
          .select('id, nome, duracao, valor')
          .eq('status', 'ativo')
          .order('nome')
      ]);

      // Verificar erros
      if (pacientesResult.error) {
        console.warn('Erro ao carregar pacientes:', pacientesResult.error);
      }
      if (profissionaisResult.error) {
        console.warn('Erro ao carregar profissionais:', profissionaisResult.error);
      }
      if (servicosResult.error) {
        console.warn('Erro ao carregar serviços:', servicosResult.error);
      }

      setPacientes(pacientesResult.data || []);
      setProfissionais(profissionaisResult.data || []);
      setServicos(servicosResult.data || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados. Usando dados de exemplo.');
      
      // Fallback com dados básicos
      setPacientes([
        { id: 1, nome: 'Paciente Exemplo' }
      ]);
      setProfissionais([
        { id: 1, nome: 'Profissional Exemplo', especialidade: 'Especialidade' }
      ]);
      setServicos([
        { id: 1, nome: 'Serviço Exemplo', duracao: 30, valor: 100.00 }
      ]);
    } finally {
      setLoadingData(false);
    }
  };

  const gerarPreview = () => {
    const preview = [];
    const dataInicio = new Date(formData.data_inicio);
    
    for (let i = 0; i < formData.quantidade; i++) {
      const data = new Date(dataInicio);
      
      switch (formData.frequencia) {
        case 'diario':
          data.setDate(dataInicio.getDate() + i);
          break;
        case 'semanal':
          data.setDate(dataInicio.getDate() + (i * 7));
          break;
        case 'quinzenal':
          data.setDate(dataInicio.getDate() + (i * 15));
          break;
        case 'mensal':
          data.setMonth(dataInicio.getMonth() + i);
          break;
      }

      preview.push({
        data: data.toISOString().split('T')[0],
        hora: formData.hora,
        diaSemana: data.toLocaleDateString('pt-BR', { weekday: 'long' })
      });
    }

    setPreview(preview);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.paciente_id || !formData.profissional_id || !formData.servico_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (preview.length === 0) {
      toast.error('Nenhum agendamento para criar');
      return;
    }

    setLoading(true);
    try {
      const agendamentos = preview.map(item => ({
        paciente_id: parseInt(formData.paciente_id),
        profissional_id: parseInt(formData.profissional_id),
        servico_id: parseInt(formData.servico_id),
        data: item.data,
        hora: item.hora,
        status: 'agendado',
        observacoes: formData.observacoes || '',
        tipo: 'recorrente'
      }));

      // Verificar se estamos usando o banco local (modo desenvolvimento)
      const isLocalDb =
        !import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL.includes('localhost');

      if (isLocalDb) {
        // Simular inserção no banco local
        console.log('Agendamentos recorrentes criados (modo local):', agendamentos);
        toast.success(`${agendamentos.length} agendamentos recorrentes criados com sucesso!`);
        onSuccess();
        onClose();
        return;
      }

      // Inserir no Supabase real
      const { error } = await supabase
        .from('agendamentos')
        .insert(agendamentos);

      if (error) throw error;

      toast.success(`${agendamentos.length} agendamentos recorrentes criados com sucesso!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar agendamentos recorrentes:', error);
      toast.error(error.message || 'Erro ao criar agendamentos recorrentes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Repeat size={24} />
                  Agendamento Recorrente
                </h2>
                <p className="text-purple-100 mt-1">
                  Crie múltiplos agendamentos automaticamente
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {loadingData ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                <span className="ml-3 text-gray-600">Carregando dados...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline w-4 h-4 mr-1" />
                    Paciente *
                  </label>
                  <select
                    value={formData.paciente_id}
                    onChange={(e) => handleInputChange('paciente_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um paciente</option>
                    {pacientes.map(paciente => (
                      <option key={paciente.id} value={paciente.id}>
                        {paciente.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserCheck className="inline w-4 h-4 mr-1" />
                    Profissional *
                  </label>
                  <select
                    value={formData.profissional_id}
                    onChange={(e) => handleInputChange('profissional_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um profissional</option>
                    {profissionais.map(profissional => (
                      <option key={profissional.id} value={profissional.id}>
                        {profissional.nome} - {profissional.especialidade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Stethoscope className="inline w-4 h-4 mr-1" />
                    Serviço *
                  </label>
                  <select
                    value={formData.servico_id}
                    onChange={(e) => handleInputChange('servico_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um serviço</option>
                    {servicos.map(servico => (
                      <option key={servico.id} value={servico.id}>
                        {servico.nome} - {servico.duracao}min - R$ {servico.valor}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Horário *
                  </label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) => handleInputChange('hora', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Configurações de Recorrência */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Configurações de Recorrência
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => handleInputChange('data_inicio', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequência *
                    </label>
                    <select
                      value={formData.frequencia}
                      onChange={(e) => handleInputChange('frequencia', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="diario">Diário</option>
                      <option value="semanal">Semanal</option>
                      <option value="quinzenal">Quinzenal</option>
                      <option value="mensal">Mensal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantidade *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={formData.quantidade}
                      onChange={(e) => handleInputChange('quantidade', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Observações para todos os agendamentos..."
                />
              </div>

              {/* Preview */}
              {preview.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Preview dos Agendamentos ({preview.length} agendamentos)
                  </h3>
                  <div className="max-h-40 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {preview.map((item, index) => (
                        <div key={index} className="bg-white rounded p-2 text-sm">
                          <div className="font-medium">{item.data}</div>
                          <div className="text-gray-600">{item.hora} - {item.diaSemana}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || preview.length === 0}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Criar {preview.length} Agendamentos
                    </>
                  )}
                </button>
              </div>
            </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ModalAgendamentoRecorrente;
