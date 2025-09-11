-- =====================================================
-- SISTEMA CLÍNICO - SCHEMA COMPLETO PARA SUPABASE
-- =====================================================
-- Este script cria TODAS as tabelas necessárias para o sistema clínico
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- 1. EXTENSÕES NECESSÁRIAS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 2. TIPOS CUSTOMIZADOS (ENUMS)
-- =====================================================

CREATE TYPE status_usuario AS ENUM ('ativo', 'inativo', 'suspenso');
CREATE TYPE nivel_acesso AS ENUM ('admin', 'recepcao', 'profissional', 'desenvolvedor');
CREATE TYPE genero AS ENUM ('masculino', 'feminino', 'outro');
CREATE TYPE status_profissional AS ENUM ('ativo', 'inativo', 'ferias');
CREATE TYPE status_agendamento AS ENUM ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'faltou');
CREATE TYPE status_pagamento AS ENUM ('pendente', 'pago', 'cancelado', 'reembolsado');
CREATE TYPE forma_pagamento AS ENUM ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'convenio');
CREATE TYPE tipo_auditoria AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'password_change');

-- =====================================================
-- 3. TABELA DE USUÁRIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
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
-- 4. TABELA DE PACIENTES
-- =====================================================

CREATE TABLE IF NOT EXISTS pacientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    data_nascimento DATE NOT NULL,
    genero genero,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(9),
    observacoes TEXT,
    convenio VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABELA DE PROFISSIONAIS
-- =====================================================

CREATE TABLE IF NOT EXISTS profissionais (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    crm_cro VARCHAR(20) UNIQUE,
    especialidade VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    status status_profissional NOT NULL DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. TABELA DE SERVIÇOS
-- =====================================================

CREATE TABLE IF NOT EXISTS servicos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    duracao_min INTEGER NOT NULL DEFAULT 30,
    preco DECIMAL(10,2) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. TABELA DE AGENDAMENTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS agendamentos (
    id SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    profissional_id INTEGER NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
    servico_id INTEGER NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    status status_agendamento NOT NULL DEFAULT 'agendado',
    observacoes TEXT,
    valor_total DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profissional_id, data, hora)
);

-- =====================================================
-- 8. TABELA DE PAGAMENTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS pagamentos (
    id SERIAL PRIMARY KEY,
    agendamento_id INTEGER NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    valor DECIMAL(10,2) NOT NULL,
    forma_pagamento forma_pagamento NOT NULL,
    status status_pagamento NOT NULL DEFAULT 'pendente',
    data_pagamento TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. TABELA DE CONFIGURAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS configuracoes (
    id SERIAL PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor JSONB NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. TABELA DE AUDITORIA (LOG DE ALTERAÇÕES)
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    tabela VARCHAR(100) NOT NULL,
    registro_id INTEGER NOT NULL,
    acao tipo_auditoria NOT NULL,
    dados_anteriores JSONB,
    dados_novos JSONB,
    usuario_id INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 11. TABELA DE NOTIFICAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS notificacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'info', 'warning', 'error', 'success'
    lida BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 12. TABELA DE BACKUPS
-- =====================================================

CREATE TABLE IF NOT EXISTS backups (
    id SERIAL PRIMARY KEY,
    nome_arquivo VARCHAR(255) NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'completo', 'incremental', 'diferencial'
    status VARCHAR(50) NOT NULL, -- 'em_andamento', 'concluido', 'erro'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 13. TABELA DE PERMISSÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    recurso VARCHAR(100) NOT NULL,
    acao VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 14. TABELA DE ROLES (PAPÉIS)
-- =====================================================

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    nivel_acesso INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 15. TABELA DE USER_ROLES (USUÁRIOS E SEUS PAPÉIS)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, role_id)
);

-- =====================================================
-- 16. TABELA DE TEMPLATES DE NOTIFICAÇÃO
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_templates (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push'
    assunto VARCHAR(255),
    template TEXT NOT NULL,
    variaveis JSONB,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 17. TABELA DE CONFIGURAÇÃO DE RELATÓRIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS relatorios_config (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    query_sql TEXT NOT NULL,
    parametros JSONB,
    formato VARCHAR(50) NOT NULL, -- 'pdf', 'excel', 'csv'
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 18. TABELA DE RELATÓRIOS GERADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS relatorios_gerados (
    id SERIAL PRIMARY KEY,
    config_id INTEGER NOT NULL REFERENCES relatorios_config(id),
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho_arquivo TEXT,
    tamanho_bytes BIGINT,
    status VARCHAR(50) NOT NULL, -- 'gerando', 'concluido', 'erro'
    parametros_usados JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 19. TABELA DE FEEDBACK
-- =====================================================

CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    tipo VARCHAR(50) NOT NULL, -- 'sugestao', 'problema', 'elogio'
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pendente', -- 'pendente', 'em_analise', 'resolvido'
    prioridade VARCHAR(20) DEFAULT 'media', -- 'baixa', 'media', 'alta'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 20. TABELA DE LOGS DE ALTERAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS logs_alteracoes (
    id SERIAL PRIMARY KEY,
    tabela VARCHAR(100) NOT NULL,
    registro_id INTEGER NOT NULL,
    acao VARCHAR(50) NOT NULL, -- 'insert', 'update', 'delete'
    dados_anteriores JSONB,
    dados_novos JSONB,
    usuario_id INTEGER REFERENCES usuarios(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 21. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para usuários
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(cpf);
CREATE INDEX IF NOT EXISTS idx_usuarios_nivel_acesso ON usuarios(nivel_acesso);

-- Índices para pacientes
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON pacientes(nome);

-- Índices para profissionais
CREATE INDEX IF NOT EXISTS idx_profissionais_cpf ON profissionais(cpf);
CREATE INDEX IF NOT EXISTS idx_profissionais_especialidade ON profissionais(especialidade);

-- Índices para agendamentos
CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente_id ON agendamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_profissional_id ON agendamentos(profissional_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data);

-- Índices para pagamentos
CREATE INDEX IF NOT EXISTS idx_pagamentos_agendamento_id ON pagamentos(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);

-- Índices para notificações
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);

-- =====================================================
-- 22. TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas as tabelas com updated_at
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pacientes_updated_at ON pacientes;
CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profissionais_updated_at ON profissionais;
CREATE TRIGGER update_profissionais_updated_at BEFORE UPDATE ON profissionais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_servicos_updated_at ON servicos;
CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_agendamentos_updated_at ON agendamentos;
CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pagamentos_updated_at ON pagamentos;
CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON pagamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_configuracoes_updated_at ON configuracoes;
CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON configuracoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_permissions_updated_at ON permissions;
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_relatorios_config_updated_at ON relatorios_config;
CREATE TRIGGER update_relatorios_config_updated_at BEFORE UPDATE ON relatorios_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feedback_updated_at ON feedback;
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 23. DADOS INICIAIS (SEEDS)
-- =====================================================

-- Inserir usuários padrão (apenas se não existirem)
INSERT INTO usuarios (nome, email, cpf, nivel_acesso, senha_hash, primeiro_acesso) 
SELECT 'Administrador', 'admin@clinica.com', '11111111111', 'admin', crypt('111', gen_salt('bf')), true
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE cpf = '11111111111');

INSERT INTO usuarios (nome, email, cpf, nivel_acesso, senha_hash, primeiro_acesso) 
SELECT 'Recepcionista', 'recepcao@clinica.com', '22222222222', 'recepcao', crypt('222', gen_salt('bf')), true
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE cpf = '22222222222');

INSERT INTO usuarios (nome, email, cpf, nivel_acesso, senha_hash, primeiro_acesso) 
SELECT 'Desenvolvedor', 'dev@clinica.com', '33333333333', 'desenvolvedor', crypt('333', gen_salt('bf')), false
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE cpf = '33333333333');

-- Inserir serviços padrão (apenas se não existirem)
INSERT INTO servicos (nome, descricao, duracao_min, preco) 
SELECT 'Consulta Médica', 'Consulta médica geral', 30, 150.00
WHERE NOT EXISTS (SELECT 1 FROM servicos WHERE nome = 'Consulta Médica');

INSERT INTO servicos (nome, descricao, duracao_min, preco) 
SELECT 'Exame de Sangue', 'Coleta e análise de sangue', 15, 80.00
WHERE NOT EXISTS (SELECT 1 FROM servicos WHERE nome = 'Exame de Sangue');

INSERT INTO servicos (nome, descricao, duracao_min, preco) 
SELECT 'Ultrassom', 'Exame de ultrassom', 30, 200.00
WHERE NOT EXISTS (SELECT 1 FROM servicos WHERE nome = 'Ultrassom');

-- Inserir configurações padrão (apenas se não existirem)
INSERT INTO configuracoes (chave, valor, descricao, categoria) 
SELECT 'sistema', '{"nomeClinica": "Clínica Médica", "endereco": "Rua das Flores, 123"}', 'Configurações básicas do sistema', 'sistema'
WHERE NOT EXISTS (SELECT 1 FROM configuracoes WHERE chave = 'sistema');

-- Inserir permissões básicas (apenas se não existirem)
INSERT INTO permissions (nome, descricao, recurso, acao) 
SELECT 'ver_pacientes', 'Visualizar pacientes', 'pacientes', 'read'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE nome = 'ver_pacientes');

INSERT INTO permissions (nome, descricao, recurso, acao) 
SELECT 'criar_pacientes', 'Criar pacientes', 'pacientes', 'create'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE nome = 'criar_pacientes');

INSERT INTO permissions (nome, descricao, recurso, acao) 
SELECT 'editar_pacientes', 'Editar pacientes', 'pacientes', 'update'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE nome = 'editar_pacientes');

INSERT INTO permissions (nome, descricao, recurso, acao) 
SELECT 'deletar_pacientes', 'Deletar pacientes', 'pacientes', 'delete'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE nome = 'deletar_pacientes');

INSERT INTO permissions (nome, descricao, recurso, acao) 
SELECT 'ver_agendamentos', 'Visualizar agendamentos', 'agendamentos', 'read'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE nome = 'ver_agendamentos');

INSERT INTO permissions (nome, descricao, recurso, acao) 
SELECT 'criar_agendamentos', 'Criar agendamentos', 'agendamentos', 'create'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE nome = 'criar_agendamentos');

INSERT INTO permissions (nome, descricao, recurso, acao) 
SELECT 'editar_agendamentos', 'Editar agendamentos', 'agendamentos', 'update'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE nome = 'editar_agendamentos');

INSERT INTO permissions (nome, descricao, recurso, acao) 
SELECT 'deletar_agendamentos', 'Deletar agendamentos', 'agendamentos', 'delete'
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE nome = 'deletar_agendamentos');

-- Inserir roles básicos (apenas se não existirem)
INSERT INTO roles (nome, descricao, nivel_acesso) 
SELECT 'admin', 'Administrador do sistema', 100
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nome = 'admin');

INSERT INTO roles (nome, descricao, nivel_acesso) 
SELECT 'recepcao', 'Recepcionista', 50
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nome = 'recepcao');

INSERT INTO roles (nome, descricao, nivel_acesso) 
SELECT 'profissional', 'Profissional de saúde', 30
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nome = 'profissional');

-- =====================================================
-- 24. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_servicos FROM servicos;
SELECT COUNT(*) as total_configuracoes FROM configuracoes;
SELECT COUNT(*) as total_permissions FROM permissions;
SELECT COUNT(*) as total_roles FROM roles;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
