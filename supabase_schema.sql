-- =====================================================
-- SISTEMA CLÍNICO - SCHEMA COMPLETO PARA SUPABASE
-- =====================================================
-- Este arquivo contém todas as tabelas necessárias para o sistema clínico
-- Execute este script no Supabase SQL Editor para criar toda a estrutura

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
CREATE TYPE status_usuario AS ENUM ('ativo', 'inativo', 'suspenso');

-- Níveis de acesso
CREATE TYPE nivel_acesso AS ENUM ('admin', 'recepcao', 'profissional', 'desenvolvedor');

-- Gêneros
CREATE TYPE genero AS ENUM ('masculino', 'feminino', 'outro');

-- Status de profissionais
CREATE TYPE status_profissional AS ENUM ('ativo', 'inativo', 'ferias');

-- Status de agendamentos
CREATE TYPE status_agendamento AS ENUM ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'faltou');

-- Status de pagamentos
CREATE TYPE status_pagamento AS ENUM ('pendente', 'pago', 'cancelado', 'reembolsado');

-- Formas de pagamento
CREATE TYPE forma_pagamento AS ENUM ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'convenio');

-- Tipos de auditoria
CREATE TYPE tipo_auditoria AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'password_change');

-- Temas do sistema
CREATE TYPE tema_sistema AS ENUM ('claro', 'escuro', 'auto');

-- Idiomas
CREATE TYPE idioma_sistema AS ENUM ('pt', 'en', 'es');

-- Frequências de backup
CREATE TYPE frequencia_backup AS ENUM ('diario', 'semanal', 'mensal');

-- =====================================================
-- 3. TABELA DE USUÁRIOS
-- =====================================================

CREATE TABLE usuarios (
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

CREATE TABLE pacientes (
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
-- 5. TABELA DE PROFISSIONAIS
-- =====================================================

CREATE TABLE profissionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    crm_cro VARCHAR(20) UNIQUE,
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
    horario_trabalho JSONB, -- Ex: {"segunda": {"inicio": "08:00", "fim": "18:00"}, ...}
    disponibilidade JSONB, -- Ex: {"feriados": false, "finais_semana": true}
    valor_consulta DECIMAL(10,2),
    status status_profissional NOT NULL DEFAULT 'ativo',
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. TABELA DE SERVIÇOS
-- =====================================================

CREATE TABLE servicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    duracao_min INTEGER NOT NULL DEFAULT 30,
    preco DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(100),
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. TABELA DE AGENDAMENTOS
-- =====================================================

CREATE TABLE agendamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
    servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    data_hora TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS (data + hora) STORED,
    status status_agendamento NOT NULL DEFAULT 'agendado',
    observacoes TEXT,
    valor_total DECIMAL(10,2),
    duracao_real INTEGER, -- em minutos
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

CREATE TABLE pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    valor DECIMAL(10,2) NOT NULL,
    forma_pagamento forma_pagamento NOT NULL,
    status status_pagamento NOT NULL DEFAULT 'pendente',
    data_pagamento TIMESTAMP WITH TIME ZONE,
    transacao_id VARCHAR(255), -- ID da transação no gateway de pagamento
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. TABELA DE CONFIGURAÇÕES
-- =====================================================

CREATE TABLE configuracoes (
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

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tabela VARCHAR(100) NOT NULL,
    registro_id UUID NOT NULL,
    acao tipo_auditoria NOT NULL,
    dados_anteriores JSONB,
    dados_novos JSONB,
    usuario_id UUID REFERENCES usuarios(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 11. TABELA DE NOTIFICAÇÕES
-- =====================================================

CREATE TABLE notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'info', 'warning', 'error', 'success'
    lida BOOLEAN DEFAULT false,
    data_leitura TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 12. TABELA DE BACKUPS
-- =====================================================

CREATE TABLE backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_arquivo VARCHAR(255) NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'completo', 'incremental', 'diferencial'
    status VARCHAR(50) NOT NULL, -- 'em_andamento', 'concluido', 'erro'
    caminho_arquivo TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 13. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para usuários
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_cpf ON usuarios(cpf);
CREATE INDEX idx_usuarios_nivel_acesso ON usuarios(nivel_acesso);
CREATE INDEX idx_usuarios_status ON usuarios(status);

-- Índices para pacientes
CREATE INDEX idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX idx_pacientes_nome ON pacientes(nome);
CREATE INDEX idx_pacientes_data_nascimento ON pacientes(data_nascimento);
CREATE INDEX idx_pacientes_status ON pacientes(status);

-- Índices para profissionais
CREATE INDEX idx_profissionais_cpf ON profissionais(cpf);
CREATE INDEX idx_profissionais_crm_cro ON profissionais(crm_cro);
CREATE INDEX idx_profissionais_especialidade ON profissionais(especialidade);
CREATE INDEX idx_profissionais_status ON profissionais(status);

-- Índices para agendamentos
CREATE INDEX idx_agendamentos_paciente_id ON agendamentos(paciente_id);
CREATE INDEX idx_agendamentos_profissional_id ON agendamentos(profissional_id);
CREATE INDEX idx_agendamentos_data ON agendamentos(data);
CREATE INDEX idx_agendamentos_data_hora ON agendamentos(data_hora);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_agendamentos_profissional_data ON agendamentos(profissional_id, data);

-- Índices para pagamentos
CREATE INDEX idx_pagamentos_agendamento_id ON pagamentos(agendamento_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);
CREATE INDEX idx_pagamentos_data_pagamento ON pagamentos(data_pagamento);

-- Índices para auditoria
CREATE INDEX idx_audit_log_tabela ON audit_log(tabela);
CREATE INDEX idx_audit_log_registro_id ON audit_log(registro_id);
CREATE INDEX idx_audit_log_usuario_id ON audit_log(usuario_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Índices para notificações
CREATE INDEX idx_notificacoes_usuario_id ON notificacoes(usuario_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX idx_notificacoes_created_at ON notificacoes(created_at);

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
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profissionais_updated_at BEFORE UPDATE ON profissionais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON pagamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON configuracoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 15. TRIGGER PARA AUDITORIA AUTOMÁTICA
-- =====================================================

-- Função para auditoria automática
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (tabela, registro_id, acao, dados_anteriores, usuario_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'delete', to_jsonb(OLD), current_setting('app.current_user_id', true)::uuid);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (tabela, registro_id, acao, dados_anteriores, dados_novos, usuario_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'update', to_jsonb(OLD), to_jsonb(NEW), current_setting('app.current_user_id', true)::uuid);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (tabela, registro_id, acao, dados_novos, usuario_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'create', to_jsonb(NEW), current_setting('app.current_user_id', true)::uuid);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers de auditoria para tabelas principais
CREATE TRIGGER audit_usuarios AFTER INSERT OR UPDATE OR DELETE ON usuarios FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_pacientes AFTER INSERT OR UPDATE OR DELETE ON pacientes FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_profissionais AFTER INSERT OR UPDATE OR DELETE ON profissionais FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_servicos AFTER INSERT OR UPDATE OR DELETE ON servicos FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_agendamentos AFTER INSERT OR UPDATE OR DELETE ON agendamentos FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_pagamentos AFTER INSERT OR UPDATE OR DELETE ON pagamentos FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- 16. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários (apenas admins podem ver todos)
CREATE POLICY "Admins podem ver todos os usuários" ON usuarios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios u 
            WHERE u.id = current_setting('app.current_user_id', true)::uuid 
            AND u.nivel_acesso = 'admin'
        )
    );

-- Políticas para pacientes (todos os usuários autenticados podem ver)
CREATE POLICY "Usuários autenticados podem ver pacientes" ON pacientes
    FOR ALL USING (
        current_setting('app.current_user_id', true)::uuid IS NOT NULL
    );

-- Políticas para profissionais (todos os usuários autenticados podem ver)
CREATE POLICY "Usuários autenticados podem ver profissionais" ON profissionais
    FOR ALL USING (
        current_setting('app.current_user_id', true)::uuid IS NOT NULL
    );

-- Políticas para serviços (todos os usuários autenticados podem ver)
CREATE POLICY "Usuários autenticados podem ver serviços" ON servicos
    FOR ALL USING (
        current_setting('app.current_user_id', true)::uuid IS NOT NULL
    );

-- Políticas para agendamentos (todos os usuários autenticados podem ver)
CREATE POLICY "Usuários autenticados podem ver agendamentos" ON agendamentos
    FOR ALL USING (
        current_setting('app.current_user_id', true)::uuid IS NOT NULL
    );

-- Políticas para pagamentos (todos os usuários autenticados podem ver)
CREATE POLICY "Usuários autenticados podem ver pagamentos" ON pagamentos
    FOR ALL USING (
        current_setting('app.current_user_id', true)::uuid IS NOT NULL
    );

-- Políticas para configurações (apenas admins)
CREATE POLICY "Apenas admins podem ver configurações" ON configuracoes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios u 
            WHERE u.id = current_setting('app.current_user_id', true)::uuid 
            AND u.nivel_acesso = 'admin'
        )
    );

-- Políticas para auditoria (apenas admins)
CREATE POLICY "Apenas admins podem ver auditoria" ON audit_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios u 
            WHERE u.id = current_setting('app.current_user_id', true)::uuid 
            AND u.nivel_acesso = 'admin'
        )
    );

-- Políticas para notificações (usuário só vê suas próprias)
CREATE POLICY "Usuários veem apenas suas notificações" ON notificacoes
    FOR ALL USING (
        usuario_id = current_setting('app.current_user_id', true)::uuid
    );

-- Políticas para backups (apenas admins)
CREATE POLICY "Apenas admins podem ver backups" ON backups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios u 
            WHERE u.id = current_setting('app.current_user_id', true)::uuid 
            AND u.nivel_acesso = 'admin'
        )
    );

-- =====================================================
-- 17. DADOS INICIAIS (SEEDS)
-- =====================================================

-- Inserir usuário administrador padrão
INSERT INTO usuarios (nome, email, cpf, nivel_acesso, senha_hash, primeiro_acesso) VALUES
('Administrador', 'admin@clinica.com', '11111111111', 'admin', crypt('111', gen_salt('bf')), true),
('Recepcionista', 'recepcao@clinica.com', '22222222222', 'recepcao', crypt('222', gen_salt('bf')), true),
('Desenvolvedor', 'dev@clinica.com', '33333333333', 'desenvolvedor', crypt('333', gen_salt('bf')), false);

-- Inserir serviços padrão
INSERT INTO servicos (nome, descricao, duracao_min, preco, categoria) VALUES
('Consulta Médica', 'Consulta médica geral', 30, 150.00, 'Consulta'),
('Exame de Sangue', 'Coleta e análise de sangue', 15, 80.00, 'Exame'),
('Ultrassom', 'Exame de ultrassom', 30, 200.00, 'Exame'),
('Eletrocardiograma', 'Exame de ECG', 20, 120.00, 'Exame'),
('Consulta de Retorno', 'Consulta de retorno', 20, 100.00, 'Consulta');

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor, descricao, categoria) VALUES
('sistema', '{"nomeClinica": "Clínica Médica", "endereco": "Rua das Flores, 123", "telefone": "(11) 99999-9999", "email": "contato@clinica.com"}', 'Configurações básicas do sistema', 'sistema'),
('notificacoes', '{"notificacoesEmail": true, "notificacoesSMS": true, "lembretesAgendamento": true}', 'Configurações de notificação', 'notificacoes'),
('seguranca', '{"tempoSessao": 480, "tentativasLogin": 3, "senhaMinima": 6}', 'Configurações de segurança', 'seguranca'),
('interface', '{"tema": "claro", "idioma": "pt"}', 'Configurações de interface', 'interface'),
('backup', '{"backupAutomatico": true, "frequenciaBackup": "diario"}', 'Configurações de backup', 'backup');

-- =====================================================
-- 18. VIEWS ÚTEIS
-- =====================================================

-- View para agendamentos com informações completas
CREATE VIEW vw_agendamentos_completos AS
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
CREATE VIEW vw_relatorio_financeiro AS
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

-- View para estatísticas de profissionais
CREATE VIEW vw_estatisticas_profissionais AS
SELECT 
    pr.id,
    pr.nome,
    pr.especialidade,
    COUNT(a.id) as total_agendamentos,
    COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as agendamentos_concluidos,
    COUNT(CASE WHEN a.data >= CURRENT_DATE THEN 1 END) as agendamentos_futuros,
    AVG(CASE WHEN a.status = 'concluido' THEN a.duracao_real END) as duracao_media_real
FROM profissionais pr
LEFT JOIN agendamentos a ON pr.id = a.profissional_id
GROUP BY pr.id, pr.nome, pr.especialidade;

-- =====================================================
-- 19. FUNÇÕES ÚTEIS
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

-- Função para verificar disponibilidade de horário
CREATE OR REPLACE FUNCTION verificar_disponibilidade(
    p_profissional_id UUID,
    p_data DATE,
    p_hora TIME,
    p_duracao INTEGER DEFAULT 30
)
RETURNS BOOLEAN AS $$
DECLARE
    conflito_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO conflito_count
    FROM agendamentos
    WHERE profissional_id = p_profissional_id
    AND data = p_data
    AND status NOT IN ('cancelado', 'faltou')
    AND (
        (hora <= p_hora AND hora + INTERVAL '1 minute' * duracao_min > p_hora) OR
        (p_hora <= hora AND p_hora + INTERVAL '1 minute' * p_duracao > hora)
    );
    
    RETURN conflito_count = 0;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 20. TABELAS DE PERMISSÕES
-- =====================================================

-- Tabela de permissões
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para garantir combinação única de resource + action
    CONSTRAINT unique_resource_action UNIQUE (resource, action)
);

-- Tabela de roles (papéis)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento role-permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para evitar duplicatas
    CONSTRAINT unique_role_permission UNIQUE (role_id, permission_id)
);

-- Tabela de relacionamento user-roles
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para evitar duplicatas
    CONSTRAINT unique_user_role UNIQUE (user_id, role_id)
);

-- =====================================================
-- 21. ÍNDICES PARA TABELAS DE PERMISSÕES
-- =====================================================

-- Índices para permissions
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON permissions(resource, action);

-- Índices para roles
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_system ON roles(is_system_role);

-- Índices para role_permissions
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Índices para user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_assigned_by ON user_roles(assigned_by);

-- =====================================================
-- 22. RLS PARA TABELAS DE PERMISSÕES
-- =====================================================

-- Habilitar RLS em todas as tabelas de permissões
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas para permissions
CREATE POLICY "Todos podem visualizar permissões" ON permissions
    FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem gerenciar permissões" ON permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND nivel_acesso = 'admin'
        )
    );

-- Políticas para roles
CREATE POLICY "Todos podem visualizar roles" ON roles
    FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem gerenciar roles" ON roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND nivel_acesso = 'admin'
        )
    );

-- Políticas para role_permissions
CREATE POLICY "Todos podem visualizar role_permissions" ON role_permissions
    FOR SELECT USING (true);

CREATE POLICY "Apenas admins podem gerenciar role_permissions" ON role_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND nivel_acesso = 'admin'
        )
    );

-- Políticas para user_roles
CREATE POLICY "Usuários podem ver seus próprios roles" ON user_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Apenas admins podem gerenciar user_roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND nivel_acesso = 'admin'
        )
    );

-- =====================================================
-- 23. TRIGGERS PARA TABELAS DE PERMISSÕES
-- =====================================================

-- Triggers para updated_at
CREATE TRIGGER update_permissions_updated_at 
    BEFORE UPDATE ON permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 24. DADOS INICIAIS PARA PERMISSÕES
-- =====================================================

-- Inserir permissões básicas do sistema
INSERT INTO permissions (name, description, resource, action) VALUES
-- Permissões de Pacientes
('Visualizar Pacientes', 'Permite visualizar a lista de pacientes', 'patients', 'read'),
('Criar Pacientes', 'Permite criar novos pacientes', 'patients', 'create'),
('Editar Pacientes', 'Permite editar informações de pacientes', 'patients', 'update'),
('Excluir Pacientes', 'Permite excluir pacientes', 'patients', 'delete'),

-- Permissões de Profissionais
('Visualizar Profissionais', 'Permite visualizar a lista de profissionais', 'professionals', 'read'),
('Criar Profissionais', 'Permite criar novos profissionais', 'professionals', 'create'),
('Editar Profissionais', 'Permite editar informações de profissionais', 'professionals', 'update'),
('Excluir Profissionais', 'Permite excluir profissionais', 'professionals', 'delete'),

-- Permissões de Agenda
('Visualizar Agenda', 'Permite visualizar a agenda', 'schedule', 'read'),
('Criar Agendamentos', 'Permite criar novos agendamentos', 'schedule', 'create'),
('Editar Agendamentos', 'Permite editar agendamentos', 'schedule', 'update'),
('Cancelar Agendamentos', 'Permite cancelar agendamentos', 'schedule', 'cancel'),

-- Permissões de Serviços
('Visualizar Serviços', 'Permite visualizar a lista de serviços', 'services', 'read'),
('Criar Serviços', 'Permite criar novos serviços', 'services', 'create'),
('Editar Serviços', 'Permite editar informações de serviços', 'services', 'update'),
('Excluir Serviços', 'Permite excluir serviços', 'services', 'delete'),

-- Permissões de Relatórios
('Visualizar Relatórios', 'Permite visualizar relatórios', 'reports', 'read'),
('Exportar Relatórios', 'Permite exportar relatórios', 'reports', 'export'),

-- Permissões de Usuários
('Visualizar Usuários', 'Permite visualizar a lista de usuários', 'users', 'read'),
('Criar Usuários', 'Permite criar novos usuários', 'users', 'create'),
('Editar Usuários', 'Permite editar informações de usuários', 'users', 'update'),
('Excluir Usuários', 'Permite excluir usuários', 'users', 'delete'),

-- Permissões de Configurações
('Visualizar Configurações', 'Permite visualizar configurações do sistema', 'settings', 'read'),
('Editar Configurações', 'Permite editar configurações do sistema', 'settings', 'update'),

-- Permissões de Backup
('Visualizar Backup', 'Permite visualizar backups', 'backup', 'read'),
('Criar Backup', 'Permite criar backups', 'backup', 'create'),
('Restaurar Backup', 'Permite restaurar backups', 'backup', 'restore'),

-- Permissões de Permissões
('Visualizar Permissões', 'Permite visualizar permissões e roles', 'permissions', 'read'),
('Gerenciar Permissões', 'Permite gerenciar permissões e roles', 'permissions', 'manage'),

-- Permissões de Notificações
('Visualizar Notificações', 'Permite visualizar notificações', 'notifications', 'read'),
('Gerenciar Notificações', 'Permite gerenciar notificações', 'notifications', 'manage');

-- Inserir roles básicos do sistema
INSERT INTO roles (name, description, is_system_role) VALUES
('Administrador', 'Acesso completo ao sistema', true),
('Gerente', 'Acesso de gerenciamento', true),
('Recepcionista', 'Acesso de recepção', true),
('Profissional de Saúde', 'Acesso médico/profissional', true),
('Usuário', 'Acesso básico', true);

-- Atribuir permissões aos roles
-- Administrador - todas as permissões
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Administrador';

-- Gerente - permissões de gerenciamento (exceto permissões e backup)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Gerente'
AND p.resource NOT IN ('permissions', 'backup');

-- Recepcionista - permissões de recepção
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Recepcionista'
AND (
    (p.resource = 'patients' AND p.action IN ('read', 'create', 'update'))
    OR (p.resource = 'schedule' AND p.action IN ('read', 'create', 'update', 'cancel'))
    OR (p.resource = 'services' AND p.action = 'read')
    OR (p.resource = 'reports' AND p.action = 'read')
    OR (p.resource = 'notifications' AND p.action = 'read')
);

-- Profissional de Saúde - permissões médicas
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Profissional de Saúde'
AND (
    (p.resource = 'patients' AND p.action IN ('read', 'update'))
    OR (p.resource = 'schedule' AND p.action IN ('read', 'update'))
    OR (p.resource = 'services' AND p.action = 'read')
    OR (p.resource = 'reports' AND p.action IN ('read', 'export'))
    OR (p.resource = 'notifications' AND p.action = 'read')
);

-- Usuário - permissões básicas
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Usuário'
AND (
    (p.resource = 'patients' AND p.action = 'read')
    OR (p.resource = 'schedule' AND p.action = 'read')
    OR (p.resource = 'services' AND p.action = 'read')
    OR (p.resource = 'notifications' AND p.action = 'read')
);

-- =====================================================
-- 25. COMENTÁRIOS NAS TABELAS E COLUNAS
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
COMMENT ON TABLE permissions IS 'Tabela de permissões do sistema';
COMMENT ON TABLE roles IS 'Tabela de papéis/funções dos usuários';
COMMENT ON TABLE role_permissions IS 'Relacionamento many-to-many entre roles e permissions';
COMMENT ON TABLE user_roles IS 'Relacionamento many-to-many entre usuários e roles';

COMMENT ON COLUMN permissions.resource IS 'Recurso do sistema (ex: patients, schedule, users)';
COMMENT ON COLUMN permissions.action IS 'Ação permitida (ex: read, create, update, delete)';
COMMENT ON COLUMN roles.is_system_role IS 'Indica se é um role do sistema (não pode ser excluído)';
COMMENT ON COLUMN user_roles.assigned_by IS 'Usuário que atribuiu o role';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Para executar este script:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá para SQL Editor
-- 3. Cole este script completo
-- 4. Execute o script
-- 5. Verifique se todas as tabelas foram criadas corretamente

-- IMPORTANTE: 
-- - Este script cria toda a estrutura necessária para o sistema clínico
-- - Inclui dados iniciais (seeds) para começar a usar o sistema
-- - Configura políticas de segurança (RLS) para proteção dos dados
-- - Cria índices para otimizar performance
-- - Inclui triggers para auditoria automática
-- - Define views úteis para relatórios
