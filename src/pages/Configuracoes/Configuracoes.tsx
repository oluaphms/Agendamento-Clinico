import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Save,
  RefreshCw,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  DollarSign,
  Zap,
  Tag,
  Image,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useThemeStore } from '@/stores/themeStore';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

interface ConfiguracoesState {
  // Configurações do Sistema
  nomeClinica: string;
  endereco: string;
  telefone: string;
  email: string;

  // Configurações de Notificação
  notificacoesEmail: boolean;
  notificacoesSMS: boolean;
  lembretesAgendamento: boolean;

  // Configurações de Segurança
  tempoSessao: number;
  tentativasLogin: number;
  senhaMinima: number;

  // Configurações de Backup
  backupAutomatico: boolean;
  frequenciaBackup: 'diario' | 'semanal' | 'mensal';
}

interface ValidationErrors {
  [key: string]: string;
}

const Configuracoes: React.FC = () => {
  const { isDark } = useThemeStore();

  // Configurações padrão
  const configuracoesPadrao: ConfiguracoesState = {
    // Configurações do Sistema
    nomeClinica: 'Clínica Médica Exemplo',
    endereco: 'Rua das Flores, 123 - Centro',
    telefone: '(11) 99999-9999',
    email: 'contato@clinica.com',

    // Configurações de Notificação
    notificacoesEmail: true,
    notificacoesSMS: false,
    lembretesAgendamento: true,

    // Configurações de Segurança
    tempoSessao: 30,
    tentativasLogin: 3,
    senhaMinima: 8,

    // Configurações de Backup
    backupAutomatico: true,
    frequenciaBackup: 'diario',
  };

  const [configuracoes, setConfiguracoes] =
    useState<ConfiguracoesState>(configuracoesPadrao);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erros, setErros] = useState<ValidationErrors>({});
  const [abaAtiva, setAbaAtiva] = useState<
    'sistema' | 'notificacoes' | 'seguranca' | 'backup'
  >('sistema');
  const [historicoBackups, setHistoricoBackups] = useState<any[]>([]);

  // Função de validação
  const validarConfiguracoes = (
    config: ConfiguracoesState
  ): ValidationErrors => {
    const erros: ValidationErrors = {};

    // Validação do sistema
    if (!config.nomeClinica.trim()) {
      erros.nomeClinica = 'Nome da clínica é obrigatório';
    }
    if (!config.email.trim()) {
      erros.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) {
      erros.email = 'E-mail inválido';
    }
    if (!config.telefone.trim()) {
      erros.telefone = 'Telefone é obrigatório';
    }
    if (!config.endereco.trim()) {
      erros.endereco = 'Endereço é obrigatório';
    }

    // Validação de segurança
    if (config.tempoSessao < 5 || config.tempoSessao > 480) {
      erros.tempoSessao = 'Tempo de sessão deve estar entre 5 e 480 minutos';
    }
    if (config.tentativasLogin < 3 || config.tentativasLogin > 10) {
      erros.tentativasLogin = 'Tentativas de login deve estar entre 3 e 10';
    }
    if (config.senhaMinima < 6 || config.senhaMinima > 20) {
      erros.senhaMinima =
        'Tamanho mínimo da senha deve estar entre 6 e 20 caracteres';
    }

    return erros;
  };

  // Carregar configurações do Supabase
  const carregarConfiguracoes = async () => {
    setCarregando(true);
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('categoria', 'sistema');

      if (error) {
        console.error('Erro ao carregar configurações:', error);
        toast.error('Erro ao carregar configurações do servidor');
        return;
      }

      if (data && data.length > 0) {
        const configs: Partial<ConfiguracoesState> = {};
        data.forEach((config: any) => {
          const valor =
            typeof config.valor === 'string'
              ? JSON.parse(config.valor)
              : config.valor;
          configs[config.chave as keyof ConfiguracoesState] = valor;
        });
        setConfiguracoes(prev => ({ ...prev, ...configs }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setCarregando(false);
    }
  };

  // Carregar histórico de backups
  const carregarHistoricoBackups = async () => {
    try {
      const { data, error } = await supabase
        .from('backups')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error) {
        setHistoricoBackups(data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de backups:', error);
    }
  };

  // Carregar configurações na inicialização
  useEffect(() => {
    carregarConfiguracoes();
    carregarHistoricoBackups();
  }, []);

  const handleInputChange = (campo: keyof ConfiguracoesState, valor: any) => {
    setConfiguracoes(prev => ({
      ...prev,
      [campo]: valor,
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (erros[campo]) {
      setErros(prev => {
        const novosErros = { ...prev };
        delete novosErros[campo];
        return novosErros;
      });
    }
  };

  const handleSalvar = async () => {
    // Validar configurações
    const errosValidacao = validarConfiguracoes(configuracoes);
    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao);
      toast.error('Por favor, corrija os erros antes de salvar');
      return;
    }

    setSalvando(true);
    setErros({});

    try {
      // Preparar dados para salvar no Supabase
      const configuracoesParaSalvar = [
        // Sistema
        {
          chave: 'nomeClinica',
          valor: configuracoes.nomeClinica,
          categoria: 'sistema',
        },
        {
          chave: 'endereco',
          valor: configuracoes.endereco,
          categoria: 'sistema',
        },
        {
          chave: 'telefone',
          valor: configuracoes.telefone,
          categoria: 'sistema',
        },
        { chave: 'email', valor: configuracoes.email, categoria: 'sistema' },

        // Notificações
        {
          chave: 'notificacoesEmail',
          valor: configuracoes.notificacoesEmail,
          categoria: 'notificacoes',
        },
        {
          chave: 'notificacoesSMS',
          valor: configuracoes.notificacoesSMS,
          categoria: 'notificacoes',
        },
        {
          chave: 'lembretesAgendamento',
          valor: configuracoes.lembretesAgendamento,
          categoria: 'notificacoes',
        },

        // Segurança
        {
          chave: 'tempoSessao',
          valor: configuracoes.tempoSessao,
          categoria: 'seguranca',
        },
        {
          chave: 'tentativasLogin',
          valor: configuracoes.tentativasLogin,
          categoria: 'seguranca',
        },
        {
          chave: 'senhaMinima',
          valor: configuracoes.senhaMinima,
          categoria: 'seguranca',
        },

        // Backup
        {
          chave: 'backupAutomatico',
          valor: configuracoes.backupAutomatico,
          categoria: 'backup',
        },
        {
          chave: 'frequenciaBackup',
          valor: configuracoes.frequenciaBackup,
          categoria: 'backup',
        },
      ];

      // Salvar no Supabase usando upsert
      for (const config of configuracoesParaSalvar) {
        const { error } = await supabase.from('configuracoes').upsert(
          {
            chave: config.chave,
            valor: config.valor,
            categoria: config.categoria,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'chave',
          }
        );

        if (error) {
          console.error(`Erro ao salvar configuração ${config.chave}:`, error);
          throw error;
        }
      }

      // Salvar também no localStorage como backup
      localStorage.setItem(
        'configuracoes_clinica',
        JSON.stringify(configuracoes)
      );

      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSalvando(false);
    }
  };

  const handleRestaurarPadrao = () => {
    if (
      window.confirm(
        'Tem certeza que deseja restaurar as configurações padrão?'
      )
    ) {
      setConfiguracoes(configuracoesPadrao);
      localStorage.removeItem('configuracoes_clinica');
      toast.success('Configurações restauradas para o padrão');
    }
  };

  // Função para gerar backup em Excel
  const handleBackupExcel = async () => {
    setSalvando(true);

    try {
      // Criar workbook
      const workbook = XLSX.utils.book_new();

      // 1. Configurações do sistema
      const { data: configuracoesData } = await supabase
        .from('configuracoes')
        .select('*');

      if (configuracoesData && configuracoesData.length > 0) {
        const wsConfig = XLSX.utils.json_to_sheet(configuracoesData);
        XLSX.utils.book_append_sheet(workbook, wsConfig, 'Configurações');
      }

      // 2. Usuários
      const { data: usuariosData } = await supabase
        .from('usuarios')
        .select('*');

      if (usuariosData && usuariosData.length > 0) {
        const wsUsuarios = XLSX.utils.json_to_sheet(usuariosData);
        XLSX.utils.book_append_sheet(workbook, wsUsuarios, 'Usuários');
      }

      // 3. Pacientes
      const { data: pacientesData } = await supabase
        .from('pacientes')
        .select('*');

      if (pacientesData && pacientesData.length > 0) {
        const wsPacientes = XLSX.utils.json_to_sheet(pacientesData);
        XLSX.utils.book_append_sheet(workbook, wsPacientes, 'Pacientes');
      }

      // 4. Profissionais
      const { data: profissionaisData } = await supabase
        .from('profissionais')
        .select('*');

      if (profissionaisData && profissionaisData.length > 0) {
        const wsProfissionais = XLSX.utils.json_to_sheet(profissionaisData);
        XLSX.utils.book_append_sheet(
          workbook,
          wsProfissionais,
          'Profissionais'
        );
      }

      // 5. Serviços
      const { data: servicosData } = await supabase
        .from('servicos')
        .select('*');

      if (servicosData && servicosData.length > 0) {
        const wsServicos = XLSX.utils.json_to_sheet(servicosData);
        XLSX.utils.book_append_sheet(workbook, wsServicos, 'Serviços');
      }

      // 6. Agendamentos
      const { data: agendamentosData } = await supabase.from('agendamentos')
        .select(`
          *,
          pacientes!inner(nome, cpf, telefone),
          profissionais!inner(nome, especialidade),
          servicos!inner(nome, duracao_min, preco)
        `);

      if (agendamentosData && agendamentosData.length > 0) {
        // Flatten dos dados relacionados
        const agendamentosFlattened = agendamentosData.map(
          (agendamento: any) => ({
            id: agendamento.id,
            data: agendamento.data,
            hora: agendamento.hora,
            duracao: agendamento.duracao,
            status: agendamento.status,
            origem: agendamento.origem,
            valor_pago: agendamento.valor_pago,
            observacoes: agendamento.observacoes,
            paciente_nome: agendamento.pacientes?.nome,
            paciente_cpf: agendamento.pacientes?.cpf,
            paciente_telefone: agendamento.pacientes?.telefone,
            profissional_nome: agendamento.profissionais?.nome,
            profissional_especialidade:
              agendamento.profissionais?.especialidade,
            servico_nome: agendamento.servicos?.nome,
            servico_duracao: agendamento.servicos?.duracao_min,
            servico_preco: agendamento.servicos?.preco,
            data_cadastro: agendamento.data_cadastro,
            ultima_atualizacao: agendamento.ultima_atualizacao,
          })
        );

        const wsAgendamentos = XLSX.utils.json_to_sheet(agendamentosFlattened);
        XLSX.utils.book_append_sheet(workbook, wsAgendamentos, 'Agendamentos');
      }

      // 7. Configuração da clínica
      const { data: configClinicaData } = await supabase
        .from('configuracao_clinica')
        .select('*');

      if (configClinicaData && configClinicaData.length > 0) {
        const wsConfigClinica = XLSX.utils.json_to_sheet(configClinicaData);
        XLSX.utils.book_append_sheet(
          workbook,
          wsConfigClinica,
          'Configuração Clínica'
        );
      }

      // 8. Horários de funcionamento
      const { data: horariosData } = await supabase
        .from('horarios_funcionamento')
        .select('*');

      if (horariosData && horariosData.length > 0) {
        const wsHorarios = XLSX.utils.json_to_sheet(horariosData);
        XLSX.utils.book_append_sheet(workbook, wsHorarios, 'Horários');
      }

      // 9. Feriados
      const { data: feriadosData } = await supabase
        .from('feriados')
        .select('*');

      if (feriadosData && feriadosData.length > 0) {
        const wsFeriados = XLSX.utils.json_to_sheet(feriadosData);
        XLSX.utils.book_append_sheet(workbook, wsFeriados, 'Feriados');
      }

      // 10. Templates
      const { data: templatesData } = await supabase
        .from('templates')
        .select('*');

      if (templatesData && templatesData.length > 0) {
        const wsTemplates = XLSX.utils.json_to_sheet(templatesData);
        XLSX.utils.book_append_sheet(workbook, wsTemplates, 'Templates');
      }

      // Gerar nome do arquivo com timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, 19);
      const nomeArquivo = `backup-clinica-${timestamp}.xlsx`;

      // Gerar arquivo Excel
      XLSX.writeFile(workbook, nomeArquivo);

      // Salvar registro do backup no banco
      const { error: backupError } = await supabase.from('backups').insert({
        nome_arquivo: nomeArquivo,
        tamanho_bytes: 0, // Não conseguimos calcular o tamanho antes da geração
        tipo: 'excel',
        status: 'concluido',
        observacoes: `Backup Excel gerado em ${new Date().toLocaleString('pt-BR')}`,
      });

      if (backupError) {
        console.warn('Erro ao salvar registro do backup:', backupError);
      }

      // Recarregar histórico de backups
      await carregarHistoricoBackups();

      toast.success(`Backup Excel gerado com sucesso! Arquivo: ${nomeArquivo}`);
    } catch (error) {
      console.error('Erro ao gerar backup Excel:', error);
      toast.error('Erro ao gerar backup Excel. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  // Função para gerar backup manual (JSON)
  const handleBackupManual = async () => {
    setSalvando(true);

    try {
      // Coletar dados de todas as tabelas importantes
      const backupData: {
        timestamp: string;
        versao: string;
        dados: {
          [key: string]: any;
        };
      } = {
        timestamp: new Date().toISOString(),
        versao: '1.0.0',
        dados: {},
      };

      // 1. Configurações do sistema
      const { data: configuracoesData, error: configError } = await supabase
        .from('configuracoes')
        .select('*');

      if (!configError) {
        backupData.dados.configuracoes = configuracoesData;
      }

      // 2. Usuários
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('usuarios')
        .select('*');

      if (!usuariosError) {
        backupData.dados.usuarios = usuariosData;
      }

      // 3. Pacientes
      const { data: pacientesData, error: pacientesError } = await supabase
        .from('pacientes')
        .select('*');

      if (!pacientesError) {
        backupData.dados.pacientes = pacientesData;
      }

      // 4. Profissionais
      const { data: profissionaisData, error: profissionaisError } =
        await supabase.from('profissionais').select('*');

      if (!profissionaisError) {
        backupData.dados.profissionais = profissionaisData;
      }

      // 5. Serviços
      const { data: servicosData, error: servicosError } = await supabase
        .from('servicos')
        .select('*');

      if (!servicosError) {
        backupData.dados.servicos = servicosData;
      }

      // 6. Agendamentos
      const { data: agendamentosData, error: agendamentosError } =
        await supabase.from('agendamentos').select('*');

      if (!agendamentosError) {
        backupData.dados.agendamentos = agendamentosData;
      }

      // 7. Configuração da clínica
      const { data: configClinicaData, error: configClinicaError } =
        await supabase.from('configuracao_clinica').select('*');

      if (!configClinicaError) {
        backupData.dados.configuracao_clinica = configClinicaData;
      }

      // 8. Horários de funcionamento
      const { data: horariosData, error: horariosError } = await supabase
        .from('horarios_funcionamento')
        .select('*');

      if (!horariosError) {
        backupData.dados.horarios_funcionamento = horariosData;
      }

      // 9. Feriados
      const { data: feriadosData, error: feriadosError } = await supabase
        .from('feriados')
        .select('*');

      if (!feriadosError) {
        backupData.dados.feriados = feriadosData;
      }

      // 10. Templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('templates')
        .select('*');

      if (!templatesError) {
        backupData.dados.templates = templatesData;
      }

      // Gerar nome do arquivo com timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, 19);
      const nomeArquivo = `backup-clinica-${timestamp}.json`;

      // Converter para JSON e criar blob
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Criar link de download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Salvar registro do backup no banco
      const { error: backupError } = await supabase.from('backups').insert({
        nome_arquivo: nomeArquivo,
        tamanho_bytes: blob.size,
        tipo: 'manual',
        status: 'concluido',
        observacoes: `Backup manual gerado em ${new Date().toLocaleString('pt-BR')}`,
      });

      if (backupError) {
        console.warn('Erro ao salvar registro do backup:', backupError);
      }

      // Recarregar histórico de backups
      await carregarHistoricoBackups();

      toast.success(`Backup gerado com sucesso! Arquivo: ${nomeArquivo}`);
    } catch (error) {
      console.error('Erro ao gerar backup:', error);
      toast.error('Erro ao gerar backup. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  // Função para restaurar backup
  const handleRestaurarBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async event => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const backupData = JSON.parse(text);

        // Validar estrutura do backup
        if (!backupData.timestamp || !backupData.dados) {
          throw new Error('Arquivo de backup inválido');
        }

        // Confirmar restauração
        if (
          !window.confirm(
            `Tem certeza que deseja restaurar o backup de ${new Date(backupData.timestamp).toLocaleString('pt-BR')}?\n\nEsta ação irá sobrescrever todos os dados atuais!`
          )
        ) {
          return;
        }

        setSalvando(true);

        // Restaurar dados tabela por tabela
        const tabelas = [
          'configuracoes',
          'usuarios',
          'pacientes',
          'profissionais',
          'servicos',
          'agendamentos',
          'configuracao_clinica',
          'horarios_funcionamento',
          'feriados',
          'templates',
        ];

        for (const tabela of tabelas) {
          if (backupData.dados[tabela]) {
            // Limpar tabela existente
            await supabase.from(tabela).delete().neq('id', 0);

            // Inserir dados do backup
            const { error } = await supabase
              .from(tabela)
              .insert(backupData.dados[tabela]);

            if (error) {
              console.error(`Erro ao restaurar ${tabela}:`, error);
            }
          }
        }

        // Recarregar configurações
        await carregarConfiguracoes();

        toast.success('Backup restaurado com sucesso!');
      } catch (error) {
        console.error('Erro ao restaurar backup:', error);
        toast.error(
          'Erro ao restaurar backup. Arquivo inválido ou corrompido.'
        );
      } finally {
        setSalvando(false);
      }
    };
    input.click();
  };

  const abas = [
    { id: 'sistema', label: 'Sistema', icon: Settings },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'backup', label: 'Backup', icon: Database },
  ] as const;

  const renderAbaSistema = () => (
    <div className='space-y-6'>
      <div
        className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        <h3
          className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          <User className='mr-2' size={20} />
          Informações da Clínica
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Nome da Clínica *
            </label>
            <input
              type='text'
              value={configuracoes.nomeClinica}
              onChange={e => handleInputChange('nomeClinica', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                erros.nomeClinica
                  ? 'border-red-500 focus:ring-red-500'
                  : isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            {erros.nomeClinica && (
              <p className='text-red-500 text-xs mt-1 flex items-center'>
                <AlertCircle className='mr-1' size={12} />
                {erros.nomeClinica}
              </p>
            )}
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Telefone *
            </label>
            <input
              type='text'
              value={configuracoes.telefone}
              onChange={e => handleInputChange('telefone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                erros.telefone
                  ? 'border-red-500 focus:ring-red-500'
                  : isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            {erros.telefone && (
              <p className='text-red-500 text-xs mt-1 flex items-center'>
                <AlertCircle className='mr-1' size={12} />
                {erros.telefone}
              </p>
            )}
          </div>

          <div className='md:col-span-2'>
            <label
              className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Endereço *
            </label>
            <input
              type='text'
              value={configuracoes.endereco}
              onChange={e => handleInputChange('endereco', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                erros.endereco
                  ? 'border-red-500 focus:ring-red-500'
                  : isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            {erros.endereco && (
              <p className='text-red-500 text-xs mt-1 flex items-center'>
                <AlertCircle className='mr-1' size={12} />
                {erros.endereco}
              </p>
            )}
          </div>

          <div className='md:col-span-2'>
            <label
              className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              E-mail *
            </label>
            <input
              type='email'
              value={configuracoes.email}
              onChange={e => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                erros.email
                  ? 'border-red-500 focus:ring-red-500'
                  : isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            {erros.email && (
              <p className='text-red-500 text-xs mt-1 flex items-center'>
                <AlertCircle className='mr-1' size={12} />
                {erros.email}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAbaNotificacoes = () => (
    <div className='space-y-6'>
      <div
        className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        <h3
          className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          <Bell className='mr-2' size={20} />
          Configurações de Notificação
        </h3>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h4
                className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}
              >
                Notificações por E-mail
              </h4>
              <p
                className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Receber notificações importantes por e-mail
              </p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={configuracoes.notificacoesEmail}
                onChange={e =>
                  handleInputChange('notificacoesEmail', e.target.checked)
                }
                className='sr-only peer'
              />
              <div
                className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                  isDark ? 'bg-gray-600' : 'bg-gray-200'
                }`}
              ></div>
            </label>
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <h4
                className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}
              >
                Notificações por SMS
              </h4>
              <p
                className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Receber notificações por mensagem de texto
              </p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={configuracoes.notificacoesSMS}
                onChange={e =>
                  handleInputChange('notificacoesSMS', e.target.checked)
                }
                className='sr-only peer'
              />
              <div
                className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                  isDark ? 'bg-gray-600' : 'bg-gray-200'
                }`}
              ></div>
            </label>
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <h4
                className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}
              >
                Lembretes de Agendamento
              </h4>
              <p
                className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Enviar lembretes automáticos de consultas
              </p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={configuracoes.lembretesAgendamento}
                onChange={e =>
                  handleInputChange('lembretesAgendamento', e.target.checked)
                }
                className='sr-only peer'
              />
              <div
                className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                  isDark ? 'bg-gray-600' : 'bg-gray-200'
                }`}
              ></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAbaSeguranca = () => (
    <div className='space-y-6'>
      <div
        className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        <h3
          className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          <Shield className='mr-2' size={20} />
          Configurações de Segurança
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Tempo de Sessão (minutos)
            </label>
            <input
              type='number'
              min='5'
              max='480'
              value={configuracoes.tempoSessao}
              onChange={e =>
                handleInputChange('tempoSessao', parseInt(e.target.value))
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                erros.tempoSessao
                  ? 'border-red-500 focus:ring-red-500'
                  : isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            {erros.tempoSessao && (
              <p className='text-red-500 text-xs mt-1 flex items-center'>
                <AlertCircle className='mr-1' size={12} />
                {erros.tempoSessao}
              </p>
            )}
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Tentativas de Login
            </label>
            <input
              type='number'
              min='3'
              max='10'
              value={configuracoes.tentativasLogin}
              onChange={e =>
                handleInputChange('tentativasLogin', parseInt(e.target.value))
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                erros.tentativasLogin
                  ? 'border-red-500 focus:ring-red-500'
                  : isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            {erros.tentativasLogin && (
              <p className='text-red-500 text-xs mt-1 flex items-center'>
                <AlertCircle className='mr-1' size={12} />
                {erros.tentativasLogin}
              </p>
            )}
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Tamanho Mínimo da Senha
            </label>
            <input
              type='number'
              min='6'
              max='20'
              value={configuracoes.senhaMinima}
              onChange={e =>
                handleInputChange('senhaMinima', parseInt(e.target.value))
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                erros.senhaMinima
                  ? 'border-red-500 focus:ring-red-500'
                  : isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            {erros.senhaMinima && (
              <p className='text-red-500 text-xs mt-1 flex items-center'>
                <AlertCircle className='mr-1' size={12} />
                {erros.senhaMinima}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAbaBackup = () => (
    <div className='space-y-6'>
      <div
        className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        <h3
          className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          <Database className='mr-2' size={20} />
          Configurações de Backup
        </h3>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h4
                className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}
              >
                Backup Automático
              </h4>
              <p
                className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Realizar backup automático dos dados
              </p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={configuracoes.backupAutomatico}
                onChange={e =>
                  handleInputChange('backupAutomatico', e.target.checked)
                }
                className='sr-only peer'
              />
              <div
                className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                  isDark ? 'bg-gray-600' : 'bg-gray-200'
                }`}
              ></div>
            </label>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Frequência do Backup
            </label>
            <select
              value={configuracoes.frequenciaBackup}
              onChange={e =>
                handleInputChange(
                  'frequenciaBackup',
                  e.target.value as 'diario' | 'semanal' | 'mensal'
                )
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value='diario'>Diário</option>
              <option value='semanal'>Semanal</option>
              <option value='mensal'>Mensal</option>
            </select>
          </div>
        </div>
      </div>

      <div
        className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        <h3
          className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          <RefreshCw className='mr-2' size={20} />
          Ações de Backup
        </h3>

        {/* Informações sobre o backup */}
        <div
          className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'} border ${isDark ? 'border-gray-600' : 'border-blue-200'}`}
        >
          <h4
            className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-blue-900'}`}
          >
            📦 O que será incluído no backup:
          </h4>
          <ul
            className={`text-xs space-y-1 ${isDark ? 'text-gray-400' : 'text-blue-700'}`}
          >
            <li>• Configurações do sistema</li>
            <li>• Dados de usuários e profissionais</li>
            <li>• Cadastro de pacientes</li>
            <li>• Serviços e agendamentos (com dados relacionados)</li>
            <li>• Configurações da clínica</li>
            <li>• Horários de funcionamento</li>
            <li>• Calendário de feriados</li>
            <li>• Templates personalizados</li>
          </ul>
          <div
            className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-600' : 'border-blue-200'}`}
          >
            <p
              className={`text-xs ${isDark ? 'text-gray-400' : 'text-blue-700'}`}
            >
              <strong>📊 Backup Excel:</strong> Planilha com múltiplas abas
              organizadas
              <br />
              <strong>📄 Backup JSON:</strong> Arquivo completo para restauração
              do sistema
            </p>
          </div>
        </div>

        <div className='flex flex-wrap gap-3'>
          <button
            onClick={handleBackupExcel}
            disabled={salvando}
            className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center'
          >
            {salvando ? (
              <>
                <Loader2 className='mr-2 animate-spin' size={16} />
                Gerando Excel...
              </>
            ) : (
              <>
                <FileSpreadsheet className='mr-2' size={16} />
                Backup Excel
              </>
            )}
          </button>

          <button
            onClick={handleBackupManual}
            disabled={salvando}
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center'
          >
            {salvando ? (
              <>
                <Loader2 className='mr-2 animate-spin' size={16} />
                Gerando JSON...
              </>
            ) : (
              <>
                <Database className='mr-2' size={16} />
                Backup JSON
              </>
            )}
          </button>

          <button
            onClick={handleRestaurarBackup}
            disabled={salvando}
            className='px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center'
          >
            {salvando ? (
              <>
                <Loader2 className='mr-2 animate-spin' size={16} />
                Restaurando...
              </>
            ) : (
              <>
                <RefreshCw className='mr-2' size={16} />
                Restaurar Backup
              </>
            )}
          </button>
        </div>
      </div>

      {/* Histórico de Backups */}
      <div
        className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        <h3
          className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          <Database className='mr-2' size={20} />
          Histórico de Backups
        </h3>

        {historicoBackups.length === 0 ? (
          <p
            className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            Nenhum backup encontrado
          </p>
        ) : (
          <div className='space-y-3'>
            {historicoBackups.map(backup => (
              <div
                key={backup.id}
                className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p
                      className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {backup.nome_arquivo}
                    </p>
                    <p
                      className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {new Date(backup.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        backup.status === 'concluido'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {backup.status === 'concluido'
                        ? 'Concluído'
                        : backup.status}
                    </span>
                    <span
                      className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {(backup.tamanho_bytes / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
                {backup.observacoes && (
                  <p
                    className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {backup.observacoes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderConteudoAba = () => {
    switch (abaAtiva) {
      case 'sistema':
        return renderAbaSistema();
      case 'notificacoes':
        return renderAbaNotificacoes();
      case 'seguranca':
        return renderAbaSeguranca();
      case 'backup':
        return renderAbaBackup();
      default:
        return renderAbaSistema();
    }
  };

  // Loading state
  if (carregando) {
    return (
      <>
        <Helmet>
          <title>Configurações - Sistema Clínica</title>
        </Helmet>
        <div
          className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
        >
          <div className='text-center'>
            <Loader2 className='mx-auto h-12 w-12 animate-spin text-blue-600' />
            <p
              className={`mt-4 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Carregando configurações...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Configurações - Sistema Clínica</title>
      </Helmet>

      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Header com status */}
          <div className='mb-8'>
            <h1
              className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              Configurações do Sistema
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Gerencie as configurações gerais da clínica
            </p>

            {/* Indicador de status */}
            <div className='mt-4 flex items-center space-x-4'>
              <div className='flex items-center text-sm'>
                <div className='w-2 h-2 bg-green-500 rounded-full mr-2'></div>
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  Conectado ao servidor
                </span>
              </div>
              {Object.keys(erros).length > 0 && (
                <div className='flex items-center text-sm text-red-500'>
                  <AlertCircle className='mr-1' size={16} />
                  {Object.keys(erros).length} erro(s) encontrado(s)
                </div>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
            {/* Sidebar com abas */}
            <div className='lg:col-span-1'>
              <div
                className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}
              >
                <nav className='p-4'>
                  <ul className='space-y-2'>
                    {abas.map(aba => {
                      const Icon = aba.icon;
                      return (
                        <li key={aba.id}>
                          <button
                            onClick={() => setAbaAtiva(aba.id)}
                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                              abaAtiva === aba.id
                                ? isDark
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-100 text-blue-700'
                                : isDark
                                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <Icon className='mr-3' size={18} />
                            {aba.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </div>

            {/* Conteúdo principal */}
            <div className='lg:col-span-3'>{renderConteudoAba()}</div>
          </div>

          {/* Botões de ação */}
          <div className='mt-8 flex justify-between items-center'>
            <div className='flex items-center space-x-4'>
              {Object.keys(erros).length > 0 && (
                <div className='flex items-center text-red-500 text-sm'>
                  <AlertCircle className='mr-1' size={16} />
                  Corrija os erros antes de salvar
                </div>
              )}
            </div>

            <div className='flex space-x-4'>
              <button
                onClick={handleRestaurarPadrao}
                disabled={salvando}
                className={`px-6 py-2 border rounded-md transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <RefreshCw className='mr-2' size={16} />
                Restaurar Padrão
              </button>

              <button
                onClick={handleSalvar}
                disabled={salvando || Object.keys(erros).length > 0}
                className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center'
              >
                {salvando ? (
                  <>
                    <Loader2 className='mr-2 animate-spin' size={16} />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className='mr-2' size={16} />
                    Salvar Configurações
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Configuracoes;
