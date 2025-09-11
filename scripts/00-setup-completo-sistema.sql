-- =====================================================
-- SCRIPT PRINCIPAL - SETUP COMPLETO DO SISTEMA CLÍNICO
-- =====================================================
-- Este é o script principal que deve ser executado primeiro
-- Ele cria toda a estrutura base do sistema

-- =====================================================
-- 1. EXTENSÕES NECESSÁRIAS
-- =====================================================

-- Habilitar extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar extensão para criptografia
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 2. TIPOS CUSTOMIZADOS (ENUMS)
-- =====================================================

-- Status de usuários
DO $$ BEGIN
    CREATE TYPE status_usuario AS ENUM ('ativo', 'inativo', 'suspenso');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Níveis de acesso
DO $$ BEGIN
    CREATE TYPE nivel_acesso AS ENUM ('admin', 'recepcao', 'profissional', 'desenvolvedor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Gêneros
DO $$ BEGIN
    CREATE TYPE genero AS ENUM ('masculino', 'feminino', 'outro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status de profissionais
DO $$ BEGIN
    CREATE TYPE status_profissional AS ENUM ('ativo', 'inativo', 'ferias');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status de agendamentos
DO $$ BEGIN
    CREATE TYPE status_agendamento AS ENUM ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'faltou');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status de pagamentos
DO $$ BEGIN
    CREATE TYPE status_pagamento AS ENUM ('pendente', 'pago', 'cancelado', 'reembolsado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Formas de pagamento
DO $$ BEGIN
    CREATE TYPE forma_pagamento AS ENUM ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'convenio');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tipos de auditoria
DO $$ BEGIN
    CREATE TYPE tipo_auditoria AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'password_change');
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
    tentativas_login INTEGER DEFAULT 0,
    bloqueado_ate TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABELA DE PACIENTES
-- =====================================================

CREATE TABLE IF NOT EXISTS pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    data_nascimento DATE NOT NULL,
    idade INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(data_nascimento))) STORED,
    genero genero,
    estado_civil VARCHAR(50),
    ocupacao VARCHAR(100),
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(9),
    contato_emergencia VARCHAR(255),
    telefone_emergencia VARCHAR(20),
    historico_medico TEXT,
    alergias TEXT,
    medicamentos TEXT,
    convenio VARCHAR(100),
    numero_convenio VARCHAR(50),
    observacoes TEXT,
    status status_usuario NOT NULL DEFAULT 'ativo',
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABELA DE PROFISSIONAIS (ESTRUTURA ATUAL)
-- =====================================================

CREATE TABLE IF NOT EXISTS profissionais (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    crm VARCHAR(20),
    especialidade VARCHAR(100) NOT NULL,
    subespecialidade VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(9),
    formacao TEXT,
    experiencia_anos INTEGER,
    horario_trabalho JSONB,
    disponibilidade JSONB,
    valor_consulta DECIMAL(10,2),
    ativo BOOLEAN DEFAULT true,
    observacoes TEXT,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. TABELA DE SERVIÇOS
-- =====================================================

CREATE TABLE IF NOT EXISTS servicos (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    duracao_min INTEGER NOT NULL DEFAULT 30,
    preco VARCHAR(20) NOT NULL, -- String para compatibilidade
    categoria VARCHAR(100),
    ativo BOOLEAN NOT NULL DEFAULT true,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. TABELA DE AGENDAMENTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS agendamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    profissional_id INTEGER NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
    servico_id INTEGER NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    data_hora TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS (data + hora) STORED,
    status status_agendamento NOT NULL DEFAULT 'agendado',
    observacoes TEXT,
    valor_total DECIMAL(10,2),
    duracao_real INTEGER,
    motivo_cancelamento TEXT,
    cancelado_por UUID REFERENCES usuarios(id),
    cancelado_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para evitar agendamentos duplicados no mesmo horário
    UNIQUE(profissional_id, data, hora)
);

-- =====================================================
-- 8. TABELA DE PAGAMENTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    valor DECIMAL(10,2) NOT NULL,
    forma_pagamento forma_pagamento NOT NULL,
    status status_pagamento NOT NULL DEFAULT 'pendente',
    data_pagamento TIMESTAMP WITH TIME ZONE,
    transacao_id VARCHAR(255),
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
-- 10. TABELA DE AUDITORIA (LOG DE ALTERAÇÕES)
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
    data_leitura TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 12. TABELA DE BACKUPS
-- =====================================================

CREATE TABLE IF NOT EXISTS backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_arquivo VARCHAR(255) NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    caminho_arquivo TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 13. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para usuários
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(cpf);
CREATE INDEX IF NOT EXISTS idx_usuarios_nivel_acesso ON usuarios(nivel_acesso);
CREATE INDEX IF NOT EXISTS idx_usuarios_status ON usuarios(status);

-- Índices para pacientes
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON pacientes(nome);
CREATE INDEX IF NOT EXISTS idx_pacientes_data_nascimento ON pacientes(data_nascimento);
CREATE INDEX IF NOT EXISTS idx_pacientes_status ON pacientes(status);

-- Índices para profissionais
CREATE INDEX IF NOT EXISTS idx_profissionais_cpf ON profissionais(cpf);
CREATE INDEX IF NOT EXISTS idx_profissionais_crm ON profissionais(crm);
CREATE INDEX IF NOT EXISTS idx_profissionais_especialidade ON profissionais(especialidade);
CREATE INDEX IF NOT EXISTS idx_profissionais_ativo ON profissionais(ativo);

-- Índices para agendamentos
CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente_id ON agendamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_profissional_id ON agendamentos(profissional_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_hora ON agendamentos(data_hora);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

-- Índices para pagamentos
CREATE INDEX IF NOT EXISTS idx_pagamentos_agendamento_id ON pagamentos(agendamento_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data_pagamento ON pagamentos(data_pagamento);

-- Índices para auditoria
CREATE INDEX IF NOT EXISTS idx_audit_log_tabela ON audit_log(tabela);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- Índices para notificações
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON notificacoes(created_at);

-- =====================================================
-- 14. TRIGGERS PARA UPDATED_AT
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

-- =====================================================
-- 15. DADOS INICIAIS (SEEDS)
-- =====================================================

-- Inserir usuário administrador padrão
INSERT INTO usuarios (nome, email, cpf, nivel_acesso, senha_hash, primeiro_acesso) VALUES
('Administrador', 'admin@clinica.com', '11111111111', 'admin', crypt('111', gen_salt('bf')), true),
('Recepcionista', 'recepcao@clinica.com', '22222222222', 'recepcao', crypt('222', gen_salt('bf')), true),
('Desenvolvedor', 'dev@clinica.com', '33333333333', 'desenvolvedor', crypt('333', gen_salt('bf')), false)
ON CONFLICT (email) DO NOTHING;

-- Inserir serviços padrão
INSERT INTO servicos (nome, descricao, duracao_min, preco, categoria) VALUES
('Consulta Médica', 'Consulta médica geral', 30, '150.00', 'Consulta'),
('Exame de Sangue', 'Coleta e análise de sangue', 15, '80.00', 'Exame'),
('Ultrassom', 'Exame de ultrassom', 30, '200.00', 'Exame'),
('Eletrocardiograma', 'Exame de ECG', 20, '120.00', 'Exame'),
('Consulta de Retorno', 'Consulta de retorno', 20, '100.00', 'Consulta')
ON CONFLICT DO NOTHING;

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor, descricao, categoria) VALUES
('sistema', '{"nomeClinica": "Clínica Médica", "endereco": "Rua das Flores, 123", "telefone": "(11) 99999-9999", "email": "contato@clinica.com"}', 'Configurações básicas do sistema', 'sistema'),
('notificacoes', '{"notificacoesEmail": true, "notificacoesSMS": true, "lembretesAgendamento": true}', 'Configurações de notificação', 'notificacoes'),
('seguranca', '{"tempoSessao": 480, "tentativasLogin": 3, "senhaMinima": 6}', 'Configurações de segurança', 'seguranca'),
('interface', '{"tema": "escuro", "idioma": "pt"}', 'Configurações de interface', 'interface'),
('backup', '{"backupAutomatico": true, "frequenciaBackup": "diario"}', 'Configurações de backup', 'backup')
ON CONFLICT (chave) DO NOTHING;

-- =====================================================
-- 16. VIEWS ÚTEIS
-- =====================================================

-- View para agendamentos com informações completas
CREATE OR REPLACE VIEW vw_agendamentos_completos AS
SELECT 
    a.id,
    a.data,
    a.hora,
    a.data_hora,
    a.status,
    a.observacoes,
    a.valor_total,
    a.duracao_real,
    p.nome as paciente_nome,
    p.telefone as paciente_telefone,
    p.email as paciente_email,
    pr.nome as profissional_nome,
    pr.especialidade as profissional_especialidade,
    s.nome as servico_nome,
    s.duracao_min as servico_duracao,
    s.preco as servico_preco,
    a.created_at,
    a.updated_at
FROM agendamentos a
JOIN pacientes p ON a.paciente_id = p.id
JOIN profissionais pr ON a.profissional_id = pr.id
JOIN servicos s ON a.servico_id = s.id;

-- View para relatório financeiro
CREATE OR REPLACE VIEW vw_relatorio_financeiro AS
SELECT 
    DATE(a.data) as data_agendamento,
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as agendamentos_concluidos,
    SUM(CASE WHEN a.status = 'concluido' THEN a.valor_total ELSE 0 END) as receita_total,
    SUM(CASE WHEN pg.status = 'pago' THEN pg.valor ELSE 0 END) as valor_pago,
    SUM(CASE WHEN pg.status = 'pendente' THEN pg.valor ELSE 0 END) as valor_pendente
FROM agendamentos a
LEFT JOIN pagamentos pg ON a.id = pg.agendamento_id
GROUP BY DATE(a.data)
ORDER BY data_agendamento DESC;

-- =====================================================
-- 17. FUNÇÕES ÚTEIS
-- =====================================================

-- Função para calcular idade
CREATE OR REPLACE FUNCTION calcular_idade(data_nascimento DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(data_nascimento));
END;
$$ LANGUAGE plpgsql;

-- Função para formatar CPF
CREATE OR REPLACE FUNCTION formatar_cpf(cpf VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    IF LENGTH(cpf) = 11 THEN
        RETURN SUBSTRING(cpf, 1, 3) || '.' || 
               SUBSTRING(cpf, 4, 3) || '.' || 
               SUBSTRING(cpf, 7, 3) || '-' || 
               SUBSTRING(cpf, 10, 2);
    END IF;
    RETURN cpf;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 18. COMENTÁRIOS NAS TABELAS
-- =====================================================

COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema (funcionários da clínica)';
COMMENT ON TABLE pacientes IS 'Tabela de pacientes da clínica';
COMMENT ON TABLE profissionais IS 'Tabela de profissionais de saúde';
COMMENT ON TABLE servicos IS 'Tabela de serviços oferecidos pela clínica';
COMMENT ON TABLE agendamentos IS 'Tabela de agendamentos de consultas/exames';
COMMENT ON TABLE pagamentos IS 'Tabela de pagamentos dos agendamentos';
COMMENT ON TABLE configuracoes IS 'Tabela de configurações do sistema';
COMMENT ON TABLE audit_log IS 'Log de auditoria para rastreamento de alterações';
COMMENT ON TABLE notificacoes IS 'Tabela de notificações para usuários';
COMMENT ON TABLE backups IS 'Registro de backups realizados';

-- =====================================================
-- FIM DO SCRIPT PRINCIPAL
-- =====================================================

-- Para executar este script:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá para SQL Editor
-- 3. Cole este script completo
-- 4. Execute o script
-- 5. Verifique se todas as tabelas foram criadas corretamente

-- IMPORTANTE: 
-- - Execute este script PRIMEIRO antes dos outros
-- - Este script cria toda a estrutura base necessária
-- - Inclui dados iniciais (seeds) para começar a usar o sistema
-- - Configura índices para otimizar performance
-- - Inclui triggers para auditoria automática
-- - Define views úteis para relatórios
