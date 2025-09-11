-- =====================================================
-- SCRIPT SIMPLES - APENAS ESTRUTURA BÁSICA
-- =====================================================
-- Este script cria apenas a estrutura básica necessária

-- =====================================================
-- 1. EXTENSÕES NECESSÁRIAS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 2. TIPOS CUSTOMIZADOS (ENUMS)
-- =====================================================

DO $$ BEGIN
    CREATE TYPE status_usuario AS ENUM ('ativo', 'inativo', 'suspenso');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE nivel_acesso AS ENUM ('admin', 'recepcao', 'profissional', 'desenvolvedor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_agendamento AS ENUM ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'faltou');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_pagamento AS ENUM ('pendente', 'pago', 'cancelado', 'reembolsado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE forma_pagamento AS ENUM ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'convenio');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 3. TABELA DE USUÁRIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    cargo VARCHAR(100),
    nivel_acesso nivel_acesso NOT NULL DEFAULT 'recepcao',
    status status_usuario NOT NULL DEFAULT 'ativo',
    senha_hash VARCHAR(255) NOT NULL,
    primeiro_acesso BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABELA DE PACIENTES (ESTRUTURA SIMPLES)
-- =====================================================

CREATE TABLE IF NOT EXISTS pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    data_nascimento DATE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABELA DE PROFISSIONAIS (ESTRUTURA SIMPLES)
-- =====================================================

CREATE TABLE IF NOT EXISTS profissionais (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    crm VARCHAR(20),
    especialidade VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. TABELA DE SERVIÇOS (ESTRUTURA SIMPLES)
-- =====================================================

CREATE TABLE IF NOT EXISTS servicos (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    duracao_min INTEGER NOT NULL DEFAULT 30,
    preco VARCHAR(20) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. TABELA DE AGENDAMENTOS (ESTRUTURA SIMPLES)
-- =====================================================

CREATE TABLE IF NOT EXISTS agendamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    profissional_id INTEGER NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
    servico_id INTEGER NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    status status_agendamento NOT NULL DEFAULT 'agendado',
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. TABELA DE PAGAMENTOS (ESTRUTURA SIMPLES)
-- =====================================================

CREATE TABLE IF NOT EXISTS pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    valor DECIMAL(10,2) NOT NULL,
    forma_pagamento forma_pagamento NOT NULL,
    status status_pagamento NOT NULL DEFAULT 'pendente',
    data_pagamento TIMESTAMP WITH TIME ZONE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. TABELA DE CONFIGURAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS configuracoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor JSONB NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. TABELA DE AUDITORIA
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tabela VARCHAR(100) NOT NULL,
    acao VARCHAR(50) NOT NULL,
    dados_anteriores JSONB,
    dados_novos JSONB,
    profissional_id VARCHAR(50),
    usuario_id VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 11. TABELA DE NOTIFICAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    lida BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 12. DADOS INICIAIS
-- =====================================================

-- Usuários básicos
INSERT INTO usuarios (nome, email, cpf, nivel_acesso, senha_hash, primeiro_acesso) VALUES
('Administrador', 'admin@clinica.com', '11111111111', 'admin', crypt('111', gen_salt('bf')), true),
('Recepcionista', 'recepcao@clinica.com', '22222222222', 'recepcao', crypt('222', gen_salt('bf')), true),
('Desenvolvedor', 'dev@clinica.com', '33333333333', 'desenvolvedor', crypt('333', gen_salt('bf')), false)
ON CONFLICT (email) DO NOTHING;

-- Serviços básicos
INSERT INTO servicos (nome, descricao, duracao_min, preco) VALUES
('Consulta Médica', 'Consulta médica geral', 30, '150.00'),
('Exame de Sangue', 'Coleta e análise de sangue', 15, '80.00'),
('Ultrassom', 'Exame de ultrassom', 30, '200.00'),
('Eletrocardiograma', 'Exame de ECG', 20, '120.00'),
('Consulta de Retorno', 'Consulta de retorno', 20, '100.00')
ON CONFLICT DO NOTHING;

-- Configurações básicas
INSERT INTO configuracoes (chave, valor, descricao, categoria) VALUES
('sistema', '{"nomeClinica": "Clínica Médica", "endereco": "Rua das Flores, 123", "telefone": "(11) 99999-9999", "email": "contato@clinica.com"}', 'Configurações básicas do sistema', 'sistema'),
('notificacoes', '{"notificacoesEmail": true, "notificacoesSMS": true, "lembretesAgendamento": true}', 'Configurações de notificação', 'notificacoes'),
('seguranca', '{"tempoSessao": 480, "tentativasLogin": 3, "senhaMinima": 6}', 'Configurações de segurança', 'seguranca'),
('interface', '{"tema": "escuro", "idioma": "pt"}', 'Configurações de interface', 'interface'),
('backup', '{"backupAutomatico": true, "frequenciaBackup": "diario"}', 'Configurações de backup', 'backup')
ON CONFLICT (chave) DO NOTHING;

-- =====================================================
-- FIM DO SCRIPT SIMPLES
-- =====================================================
