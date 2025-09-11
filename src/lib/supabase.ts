import { createClient } from '@supabase/supabase-js';
import { localDb } from './database';
import { config, devLog } from '@/config/environment';
import { initializeSupabaseCleanup } from './supabaseCleanup';

// Verificar se temos credenciais válidas do Supabase
const hasValidCredentials =
  config.supabaseUrl &&
  config.supabaseKey &&
  config.supabaseUrl.startsWith('https://') &&
  config.supabaseUrl.includes('.supabase.co') &&
  config.supabaseUrl !== 'https://seu-projeto.supabase.co' &&
  config.supabaseKey !== 'sua_chave_anonima_aqui';

// Usar mock data se habilitado ou se não há credenciais válidas
const shouldUseMockData = !hasValidCredentials || config.enableMockData;

// Função para verificar conectividade com Supabase
const checkSupabaseConnection = async () => {
  if (!hasValidCredentials) return false;

  try {
    const client = createSupabaseInstance();
    if (!client) return false;

    // Teste simples de conectividade
    const { error } = await client
      .from('usuarios')
      .select('count', { count: 'exact', head: true })
      .limit(1);

    return !error;
  } catch (error) {
    console.warn('Erro ao verificar conectividade Supabase:', error);
    return false;
  }
};

// Função para autenticar usuário via Supabase
const authenticateUser = async (cpf: string, password: string) => {
  if (!hasValidCredentials) return null;

  // Verificar conectividade antes de tentar autenticar
  const isConnected = await checkSupabaseConnection();
  if (!isConnected) {
    console.warn('Supabase não está acessível, usando fallback local');
    return null;
  }

  try {
    const client = createSupabaseInstance();
    if (!client) return null;

    // Limpar CPF para busca
    const cpfLimpo = cpf.replace(/[.\-\s]/g, '');

    // Buscar usuário diretamente na tabela usuarios
    const { data, error } = await client
      .from('usuarios')
      .select('*')
      .eq('cpf', cpfLimpo)
      .eq('status', 'ativo')
      .maybeSingle(); // Usar maybeSingle() em vez de single() para evitar erro se não encontrar

    if (error) {
      console.error('Erro na busca do usuário:', error);
      console.error('Detalhes do erro:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return null;
    }

    // Se não encontrou o usuário, retornar null
    if (!data) {
      console.log('Usuário não encontrado:', cpfLimpo);
      return null;
    }

    if (data && data.senha === password) {
      // Criar objeto de usuário compatível
      const user = {
        id: data.id,
        email: data.email || `${data.cpf}@clinica.local`,
        user_metadata: {
          nome: data.nome,
          cpf: cpf,
          nivel_acesso: data.nivel_acesso,
          primeiro_acesso: data.primeiro_acesso || false,
        },
        must_change_password: data.primeiro_acesso || false,
      };

      // Criar sessão simulada
      const session = {
        user,
        access_token: 'supabase_access_token_' + Date.now(),
        refresh_token: 'supabase_refresh_token_' + Date.now(),
        expires_at: Date.now() + 3600000,
        expires_in: 3600,
        token_type: 'bearer',
      };

      return { user, session };
    }

    return null;
  } catch (error) {
    console.error('Erro na autenticação Supabase:', error);
    return null;
  }
};

// Log de informações sobre a configuração
if (config.isDevelopment) {
  if (shouldUseMockData) {
    devLog('ℹ️ Usando banco de dados local para desenvolvimento');
    if (!hasValidCredentials) {
      devLog('Para configurar o Supabase, crie um arquivo .env.local com:');
      devLog('VITE_SUPABASE_URL=sua_url_do_supabase');
      devLog('VITE_SUPABASE_ANON_KEY=sua_chave_anonima');
    }
  } else {
    devLog('ℹ️ Usando Supabase para desenvolvimento');
  }
}

// Criar instância única do Supabase para evitar múltiplas instâncias
let supabaseInstance: any = null;
let isInitialized = false;

// Função para criar instância única do Supabase
const createSupabaseInstance = () => {
  if (supabaseInstance || isInitialized) {
    return supabaseInstance;
  }

  isInitialized = true;

  try {
    supabaseInstance = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Configurações para evitar múltiplas instâncias
        storage: {
          getItem: (key: string) => {
            try {
              return localStorage.getItem(key);
            } catch (error) {
              return null;
            }
          },
          setItem: (key: string, value: string) => {
            try {
              localStorage.setItem(key, value);
            } catch (error) {
              // Ignorar erros de storage
            }
          },
          removeItem: (key: string) => {
            try {
              localStorage.removeItem(key);
            } catch (error) {
              // Ignorar erros de storage
            }
          },
        },
      },
    });

    console.log('🔗 Supabase instance created successfully');
    return supabaseInstance;
  } catch (error) {
    console.error('❌ Error creating Supabase instance:', error);
    isInitialized = false;
    return null;
  }
};

// Função para obter a instância do Supabase
const getSupabaseInstance = () => {
  if (shouldUseMockData) {
    console.log('📦 Usando banco de dados local (mock data)');
    return localDb;
  }

  const instance = createSupabaseInstance();
  if (!instance) {
    console.warn('⚠️ Falha ao criar instância do Supabase, usando banco local');
    return localDb;
  }

  return instance;
};

// Inicializar limpeza de instâncias duplicadas
initializeSupabaseCleanup();

// Exportar a instância
export const supabase = getSupabaseInstance();

// Exportar função de autenticação e verificação de conectividade
export { authenticateUser, checkSupabaseConnection };

// Tipos para as tabelas do Supabase
export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: number;
          nome: string;
          cpf: string;
          senha: string;
          role: 'admin' | 'recepcao' | 'profissional';
          profissional_id: number | null;
          primeiro_acesso: boolean;
          data_criacao: string;
          ultimo_acesso: string | null;
        };
        Insert: {
          id?: number;
          nome: string;
          cpf: string;
          senha: string;
          role?: 'admin' | 'recepcao' | 'profissional';
          profissional_id?: number | null;
          primeiro_acesso?: boolean;
          data_criacao?: string;
          ultimo_acesso?: string | null;
        };
        Update: {
          id?: number;
          nome?: string;
          cpf?: string;
          senha?: string;
          role?: 'admin' | 'recepcao' | 'profissional';
          profissional_id?: number | null;
          primeiro_acesso?: boolean;
          data_criacao?: string;
          ultimo_acesso?: string | null;
        };
      };
      pacientes: {
        Row: {
          id: number;
          nome: string;
          cpf: string;
          telefone: string;
          email: string | null;
          data_nascimento: string;
          observacoes: string | null;
          convenio: string | null;
          categoria: string;
          tags: string | null;
          favorito: boolean;
          data_cadastro: string;
          ultima_atualizacao: string;
        };
        Insert: {
          id?: number;
          nome: string;
          cpf: string;
          telefone: string;
          email?: string | null;
          data_nascimento: string;
          observacoes?: string | null;
          convenio?: string | null;
          categoria?: string;
          tags?: string | null;
          favorito?: boolean;
          data_cadastro?: string;
          ultima_atualizacao?: string;
        };
        Update: {
          id?: number;
          nome?: string;
          cpf?: string;
          telefone?: string;
          email?: string | null;
          data_nascimento?: string;
          observacoes?: string | null;
          convenio?: string | null;
          categoria?: string;
          tags?: string | null;
          favorito?: boolean;
          data_cadastro?: string;
          ultima_atualizacao?: string;
        };
      };
      profissionais: {
        Row: {
          id: number;
          nome: string;
          cpf: string;
          telefone: string;
          email: string | null;
          especialidade: string;
          crm: string | null;
          observacoes: string | null;
          ativo: boolean;
          data_cadastro: string;
          ultima_atualizacao: string;
        };
        Insert: {
          id?: number;
          nome: string;
          cpf: string;
          telefone: string;
          email?: string | null;
          especialidade: string;
          crm?: string | null;
          observacoes?: string | null;
          ativo?: boolean;
          data_cadastro?: string;
          ultima_atualizacao?: string;
        };
        Update: {
          id?: number;
          nome?: string;
          cpf?: string;
          telefone?: string;
          email?: string | null;
          especialidade?: string;
          crm?: string | null;
          observacoes?: string | null;
          ativo?: boolean;
          data_cadastro?: string;
          ultima_atualizacao?: string;
        };
      };
      servicos: {
        Row: {
          id: number;
          nome: string;
          descricao: string | null;
          duracao_min: number;
          preco: number;
          ativo: boolean;
          data_cadastro: string;
          ultima_atualizacao: string;
        };
        Insert: {
          id?: number;
          nome: string;
          descricao?: string | null;
          duracao_min: number;
          preco: number;
          ativo?: boolean;
          data_cadastro?: string;
          ultima_atualizacao?: string;
        };
        Update: {
          id?: number;
          nome?: string;
          descricao?: string | null;
          duracao_min?: number;
          preco?: number;
          ativo?: boolean;
          data_cadastro?: string;
          ultima_atualizacao?: string;
        };
      };
      agendamentos: {
        Row: {
          id: number;
          paciente_id: number;
          profissional_id: number;
          servico_id: number;
          data: string;
          hora: string;
          duracao: number;
          status:
            | 'Agendado'
            | 'Confirmado'
            | 'Realizado'
            | 'Cancelado'
            | 'Falta';
          origem: string;
          valor_pago: number;
          observacoes: string | null;
          data_cadastro: string;
          ultima_atualizacao: string;
        };
        Insert: {
          id?: number;
          paciente_id: number;
          profissional_id: number;
          servico_id: number;
          data: string;
          hora: string;
          duracao?: number;
          status?:
            | 'Agendado'
            | 'Confirmado'
            | 'Realizado'
            | 'Cancelado'
            | 'Falta';
          origem?: string;
          valor_pago?: number;
          observacoes?: string | null;
          data_cadastro?: string;
          ultima_atualizacao?: string;
        };
        Update: {
          id?: number;
          paciente_id?: number;
          profissional_id?: number;
          servico_id?: number;
          data?: string;
          hora?: string;
          duracao?: number;
          status?:
            | 'Agendado'
            | 'Confirmado'
            | 'Realizado'
            | 'Cancelado'
            | 'Falta';
          origem?: string;
          valor_pago?: number;
          observacoes?: string | null;
          data_cadastro?: string;
          ultima_atualizacao?: string;
        };
      };
    };
  };
}
