import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { supabase } from '@/lib/supabase';
import { executeWithRetry, isRetryableError } from '@/lib/supabaseHealthCheck';
import toast from 'react-hot-toast';

interface ModalAgendamentoProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  paciente: string;
  profissional: string;
  servico: string;
  data: string;
  hora: string;
  status: string;
  observacoes: string;
}

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
}

interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
}

interface Servico {
  id: string;
  nome: string;
  preco: number;
  duracao_min: number;
}

export default function ModalAgendamento({
  open,
  onClose,
  onSuccess,
}: ModalAgendamentoProps) {
  const { isDark } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const [form, setForm] = useState<FormData>({
    paciente: '',
    profissional: '',
    servico: '',
    data: '',
    hora: '',
    status: 'Agendado',
    observacoes: '',
  });

  // Carregar dados iniciais
  useEffect(() => {
    if (open) {
      carregarDados();
      // Definir data mínima como hoje
      const hoje = new Date().toISOString().split('T')[0];
      setForm(prev => ({ ...prev, data: hoje }));
    }
  }, [open]);

  const carregarDados = async () => {
    try {
      // Verificar se estamos usando o banco local (modo desenvolvimento)
      const isLocalDb =
        !import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL.includes('localhost');

      if (isLocalDb) {
        // Dados mock para desenvolvimento
        setPacientes([
          { id: '1', nome: 'Maria Silva', cpf: '123.456.789-00' },
          { id: '2', nome: 'João Santos', cpf: '987.654.321-00' },
          { id: '3', nome: 'Ana Costa', cpf: '456.789.123-00' },
          { id: '4', nome: 'Pedro Oliveira', cpf: '789.123.456-00' },
        ]);

        setProfissionais([
          { id: '1', nome: 'Dr. Pedro Cardoso', especialidade: 'Cardiologia' },
          { id: '2', nome: 'Dra. Ana Maria', especialidade: 'Dermatologia' },
          { id: '3', nome: 'Dr. Carlos Silva', especialidade: 'Ortopedia' },
          { id: '4', nome: 'Dra. Juliana Santos', especialidade: 'Pediatria' },
        ]);

        setServicos([
          { id: '1', nome: 'Consulta Médica', preco: 150, duracao_min: 30 },
          { id: '2', nome: 'Exame de Sangue', preco: 80, duracao_min: 15 },
          { id: '3', nome: 'Ultrassom', preco: 200, duracao_min: 45 },
          { id: '4', nome: 'Raio-X', preco: 120, duracao_min: 20 },
          { id: '5', nome: 'Consulta de Retorno', preco: 100, duracao_min: 20 },
        ]);
        return;
      }

      // Carregar dados reais do Supabase
      const [pacientesRes, profissionaisRes, servicosRes] = await Promise.all([
        supabase
          .from('pacientes')
          .select('id, nome, cpf')
          .eq('status', 'ativo')
          .order('nome'),
        supabase
          .from('profissionais')
          .select('id, nome, especialidade')
          .eq('status', 'ativo')
          .order('nome'),
        supabase
          .from('servicos')
          .select('id, nome, preco, duracao_min')
          .eq('ativo', true)
          .order('nome'),
      ]);

      // Log dos dados carregados para debug
      console.log('📊 Dados carregados no modal de agendamento:');
      console.log('👥 Pacientes:', pacientesRes.data);
      console.log('👨‍⚕️ Profissionais:', profissionaisRes.data);
      console.log('🛠️ Serviços:', servicosRes.data);

      if (pacientesRes.data) setPacientes(pacientesRes.data);
      if (profissionaisRes.data) setProfissionais(profissionaisRes.data);
      if (servicosRes.data) setServicos(servicosRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do formulário');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!form.paciente) newErrors.paciente = 'Paciente é obrigatório';
    if (!form.profissional)
      newErrors.profissional = 'Profissional é obrigatório';
    if (!form.servico) newErrors.servico = 'Serviço é obrigatório';
    if (!form.data) newErrors.data = 'Data é obrigatória';
    if (!form.hora) newErrors.hora = 'Hora é obrigatória';

    // Validar se a data não é no passado
    const dataAgendamento = new Date(`${form.data}T${form.hora}`);
    const agora = new Date();
    if (dataAgendamento < agora) {
      newErrors.data = 'Data e hora não podem ser no passado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);
    try {
      const isLocalDb =
        !import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL.includes('localhost');

      if (isLocalDb) {
        // Simular salvamento em modo desenvolvimento
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Agendamento salvo (modo desenvolvimento):', form);
        toast.success('Agendamento salvo com sucesso!');
      } else {
        // Função para tentar salvar com retry
        const salvarComRetry = async (tentativas = 3) => {
          for (let i = 0; i < tentativas; i++) {
            try {
              console.log(`🔄 Tentativa ${i + 1} de salvar agendamento...`);

              const { data, error } = await supabase
                .from('agendamentos')
                .insert({
                  paciente_id: form.paciente,
                  profissional_id: form.profissional,
                  servico_id: form.servico,
                  data: form.data,
                  hora: form.hora,
                  status: form.status.toLowerCase(),
                  observacoes: form.observacoes,
                  created_at: new Date().toISOString(),
                })
                .select();

              if (error) {
                console.error(`❌ Erro na tentativa ${i + 1}:`, error);

                // Se for erro 503 (Service Unavailable), tentar novamente
                if (error.code === '503' || error.message?.includes('503')) {
                  if (i < tentativas - 1) {
                    console.log(
                      `⏳ Aguardando 2 segundos antes da próxima tentativa...`
                    );
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                  }
                }

                throw error;
              }

              console.log('✅ Agendamento salvo com sucesso!', data);
              return data;
            } catch (error) {
              console.error(`❌ Erro na tentativa ${i + 1}:`, error);

              if (i === tentativas - 1) {
                throw error;
              }

              // Aguardar antes da próxima tentativa
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        };

        await salvarComRetry();
        toast.success('Agendamento salvo com sucesso!');
      }

      // Limpar formulário
      setForm({
        paciente: '',
        profissional: '',
        servico: '',
        data: '',
        hora: '',
        status: 'Agendado',
        observacoes: '',
      });
      setErrors({});

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);

      // Mensagem de erro mais específica
      let errorMessage = 'Erro ao salvar agendamento';
      if (error.code === '503' || error.message?.includes('503')) {
        errorMessage =
          'Servidor temporariamente indisponível. Tente novamente em alguns minutos.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Erro de conectividade. Verifique sua internet.';
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      paciente: '',
      profissional: '',
      servico: '',
      data: '',
      hora: '',
      status: 'Agendado',
      observacoes: '',
    });
    setErrors({});
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className='fixed inset-0 flex items-center justify-center z-[100] p-4'>
        {/* Fundo escuro com blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className='absolute inset-0 bg-black/70 backdrop-blur-sm'
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`relative rounded-2xl shadow-2xl w-full max-w-3xl p-6 space-y-6 z-50 border transition-colors duration-300 ${
            isDark
              ? 'bg-gray-900 text-gray-200 border-cyan-500/20'
              : 'bg-white text-gray-900 border-gray-200'
          }`}
        >
          {/* Header */}
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-3'>
              <div
                className={`p-2 rounded-lg ${
                  isDark ? 'bg-cyan-500/20' : 'bg-cyan-100'
                }`}
              >
                <Calendar
                  className={`w-6 h-6 ${
                    isDark ? 'text-cyan-400' : 'text-cyan-600'
                  }`}
                />
              </div>
              <h2
                className={`text-2xl font-bold ${
                  isDark ? 'text-cyan-400' : 'text-cyan-600'
                }`}
              >
                Novo Agendamento
              </h2>
            </div>
            <motion.button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={22} />
            </motion.button>
          </div>

          {/* Form */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Paciente */}
            <div className='space-y-2'>
              <label
                className={`text-sm font-medium flex items-center gap-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <User size={16} />
                Paciente *
              </label>
              <select
                className={`w-full p-3 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-cyan-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500'
                } ${errors.paciente ? 'border-red-500' : ''}`}
                value={form.paciente}
                onChange={e => setForm({ ...form, paciente: e.target.value })}
              >
                <option value=''>Selecione um paciente</option>
                {pacientes.map(paciente => (
                  <option key={paciente.id} value={paciente.id}>
                    {paciente.nome} - {paciente.cpf}
                  </option>
                ))}
              </select>
              {errors.paciente && (
                <p className='text-red-500 text-xs flex items-center gap-1'>
                  <AlertCircle size={12} />
                  {errors.paciente}
                </p>
              )}
            </div>

            {/* Profissional */}
            <div className='space-y-2'>
              <label
                className={`text-sm font-medium flex items-center gap-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <Stethoscope size={16} />
                Profissional *
              </label>
              <select
                className={`w-full p-3 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-cyan-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500'
                } ${errors.profissional ? 'border-red-500' : ''}`}
                value={form.profissional}
                onChange={e =>
                  setForm({ ...form, profissional: e.target.value })
                }
              >
                <option value=''>Selecione um profissional</option>
                {profissionais.map(profissional => (
                  <option key={profissional.id} value={profissional.id}>
                    {profissional.nome} - {profissional.especialidade}
                  </option>
                ))}
              </select>
              {errors.profissional && (
                <p className='text-red-500 text-xs flex items-center gap-1'>
                  <AlertCircle size={12} />
                  {errors.profissional}
                </p>
              )}
            </div>

            {/* Serviço */}
            <div className='space-y-2'>
              <label
                className={`text-sm font-medium flex items-center gap-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <FileText size={16} />
                Serviço *
              </label>
              <select
                className={`w-full p-3 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-cyan-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500'
                } ${errors.servico ? 'border-red-500' : ''}`}
                value={form.servico}
                onChange={e => setForm({ ...form, servico: e.target.value })}
              >
                <option value=''>Selecione um serviço</option>
                {servicos.map(servico => (
                  <option key={servico.id} value={servico.id}>
                    {servico.nome} - R$ {servico.preco} ({servico.duracao_min}
                    min)
                  </option>
                ))}
              </select>
              {errors.servico && (
                <p className='text-red-500 text-xs flex items-center gap-1'>
                  <AlertCircle size={12} />
                  {errors.servico}
                </p>
              )}
            </div>

            {/* Data */}
            <div className='space-y-2'>
              <label
                className={`text-sm font-medium flex items-center gap-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <Calendar size={16} />
                Data *
              </label>
              <input
                type='date'
                min={new Date().toISOString().split('T')[0]}
                className={`w-full p-3 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-cyan-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500'
                } ${errors.data ? 'border-red-500' : ''}`}
                value={form.data}
                onChange={e => setForm({ ...form, data: e.target.value })}
              />
              {errors.data && (
                <p className='text-red-500 text-xs flex items-center gap-1'>
                  <AlertCircle size={12} />
                  {errors.data}
                </p>
              )}
            </div>

            {/* Hora */}
            <div className='space-y-2'>
              <label
                className={`text-sm font-medium flex items-center gap-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                <Clock size={16} />
                Hora *
              </label>
              <input
                type='time'
                className={`w-full p-3 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-cyan-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500'
                } ${errors.hora ? 'border-red-500' : ''}`}
                value={form.hora}
                onChange={e => setForm({ ...form, hora: e.target.value })}
              />
              {errors.hora && (
                <p className='text-red-500 text-xs flex items-center gap-1'>
                  <AlertCircle size={12} />
                  {errors.hora}
                </p>
              )}
            </div>

            {/* Status */}
            <div className='space-y-2'>
              <label
                className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Status
              </label>
              <select
                className={`w-full p-3 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-cyan-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500'
                }`}
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                <option value='Agendado'>Agendado</option>
                <option value='Confirmado'>Confirmado</option>
                <option value='Concluído'>Concluído</option>
                <option value='Cancelado'>Cancelado</option>
              </select>
            </div>
          </div>

          {/* Observações */}
          <div className='space-y-2'>
            <label
              className={`text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Observações
            </label>
            <textarea
              rows={3}
              className={`w-full p-3 rounded-lg border transition-colors resize-none ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-gray-200 focus:border-cyan-500'
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500'
              }`}
              placeholder='Digite observações sobre o agendamento...'
              value={form.observacoes}
              onChange={e => setForm({ ...form, observacoes: e.target.value })}
            />
          </div>

          {/* Ações */}
          <div className='flex justify-end gap-4 pt-4 border-t border-gray-700'>
            <motion.button
              onClick={handleClose}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                loading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : isDark
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Salvar Agendamento
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
