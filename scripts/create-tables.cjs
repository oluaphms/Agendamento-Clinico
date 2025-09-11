const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://xvjjgeoxsvzwcvjihjia.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2ampnZW94c3Z6d2N2amloamlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5ODYwNjQsImV4cCI6MjA3MTU2MjA2NH0.4FRJOc0pk--OnqdJyQDTXGn87doooRKJC7hYELy5sKs';

// Script SQL simplificado para criar as tabelas básicas
const createTablesSQL = `
-- Criar tabela de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    data_nascimento DATE NOT NULL,
    observacoes TEXT,
    convenio VARCHAR(100),
    categoria VARCHAR(50) DEFAULT 'Particular',
    tags TEXT,
    favorito BOOLEAN DEFAULT false,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de profissionais
CREATE TABLE IF NOT EXISTS profissionais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    especialidade VARCHAR(100) NOT NULL,
    crm VARCHAR(20),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de serviços
CREATE TABLE IF NOT EXISTS servicos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    duracao_min INTEGER NOT NULL DEFAULT 30,
    preco DECIMAL(10,2) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    profissional_id INTEGER NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
    servico_id INTEGER NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    duracao INTEGER DEFAULT 30,
    status VARCHAR(20) DEFAULT 'Agendado',
    origem VARCHAR(50) DEFAULT 'Sistema',
    valor_pago DECIMAL(10,2) DEFAULT 0,
    observacoes TEXT,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON pacientes(nome);
CREATE INDEX IF NOT EXISTS idx_profissionais_cpf ON profissionais(cpf);
CREATE INDEX IF NOT EXISTS idx_profissionais_especialidade ON profissionais(especialidade);
CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente_id ON agendamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_profissional_id ON agendamentos(profissional_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data);
`;

// Função para executar o SQL
async function createTables() {
  console.log('🚀 Criando tabelas no Supabase...');
  console.log(`📡 Conectando em: ${supabaseUrl}`);
  
  // Criar cliente Supabase
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Executar o SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTablesSQL });
    
    if (error) {
      console.error('❌ Erro ao criar tabelas:', error.message);
      return false;
    }
    
    console.log('✅ Tabelas criadas com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    return false;
  }
}

// Executar script
createTables().catch(console.error);
