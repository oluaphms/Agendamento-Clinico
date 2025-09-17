-- =====================================================
-- SCHEMA DO SISTEMA DE GESTÃO DE CLÍNICA
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de usuários (estendida do auth.users do Supabase)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    telefone VARCHAR(20),
    cargo VARCHAR(50) NOT NULL,
    nivel_acesso VARCHAR(20) NOT NULL DEFAULT 'usuario' CHECK (nivel_acesso IN ('admin', 'gerente', 'usuario', 'recepcao', 'profissional', 'desenvolvedor')),
    status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso')),
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultimo_acesso TIMESTAMP WITH TIME ZONE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    idade INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(data_nascimento))) STORED,
    genero VARCHAR(20) CHECK (genero IN ('masculino', 'feminino', 'outro')),
    estado_civil VARCHAR(20),
    ocupacao VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    contato_emergencia VARCHAR(100),
    telefone_emergencia VARCHAR(20),
    historico_medico TEXT,
    alergias TEXT,
    medicamentos TEXT,
    convenio VARCHAR(100),
    numero_convenio VARCHAR(50),
    observacoes TEXT,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de profissionais
CREATE TABLE IF NOT EXISTS profissionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    crm_cro VARCHAR(20) UNIQUE,
    especialidade VARCHAR(100) NOT NULL,
    subespecialidade VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    formacao TEXT,
    experiencia_anos INTEGER,
    horario_trabalho JSONB,
    disponibilidade JSONB,
    valor_consulta DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'ferias')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS servicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50),
    duracao_minutos INTEGER NOT NULL DEFAULT 60,
    valor DECIMAL(10,2) NOT NULL,
    profissional_id UUID REFERENCES profissionais(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
    servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    duracao_minutos INTEGER NOT NULL DEFAULT 60,
    status VARCHAR(20) NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'realizado', 'cancelado', 'ausente')),
    observacoes TEXT,
    motivo_cancelamento TEXT,
    data_cancelamento TIMESTAMP WITH TIME ZONE,
    usuario_cancelamento UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profissional_id, data, hora)
);

-- Tabela de consultas (histórico de agendamentos realizados)
CREATE TABLE IF NOT EXISTS consultas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
    servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
    data_realizacao DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    queixa_principal TEXT,
    historico_atual TEXT,
    exame_fisico TEXT,
    hipotese_diagnostica TEXT,
    conduta TEXT,
    prescricoes TEXT,
    observacoes TEXT,
    proxima_consulta DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
    valor DECIMAL(10,2) NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado', 'reembolsado')),
    data_pagamento TIMESTAMP WITH TIME ZONE,
    comprovante_url TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notificacoes
CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'info' CHECK (tipo IN ('info', 'success', 'warning', 'error')),
    lida BOOLEAN DEFAULT FALSE,
    data_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_leitura TIMESTAMP WITH TIME ZONE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configuracoes do sistema
CREATE TABLE IF NOT EXISTS configuracoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo VARCHAR(50) NOT NULL DEFAULT 'string' CHECK (tipo IN ('string', 'number', 'boolean', 'json')),
    categoria VARCHAR(50) NOT NULL DEFAULT 'geral',
    descricao TEXT,
    editavel BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs do sistema
CREATE TABLE IF NOT EXISTS logs_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    acao VARCHAR(100) NOT NULL,
    tabela VARCHAR(100),
    registro_id UUID,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para usuários
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(cpf);
CREATE INDEX IF NOT EXISTS idx_usuarios_nivel_acesso ON usuarios(nivel_acesso);
CREATE INDEX IF NOT EXISTS idx_usuarios_status ON usuarios(status);

-- Índices para pacientes
CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON pacientes(nome);
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX IF NOT EXISTS idx_pacientes_status ON pacientes(status);
CREATE INDEX IF NOT EXISTS idx_pacientes_data_nascimento ON pacientes(data_nascimento);

-- Índices para profissionais
CREATE INDEX IF NOT EXISTS idx_profissionais_nome ON profissionais(nome);
CREATE INDEX IF NOT EXISTS idx_profissionais_especialidade ON profissionais(especialidade);
CREATE INDEX IF NOT EXISTS idx_profissionais_status ON profissionais(status);

-- Índices para agendamentos
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_profissional_data ON agendamentos(profissional_id, data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente ON agendamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

-- Índices para consultas
CREATE INDEX IF NOT EXISTS idx_consultas_data ON consultas(data_realizacao);
CREATE INDEX IF NOT EXISTS idx_consultas_paciente ON consultas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_consultas_profissional ON consultas(profissional_id);

-- Índices para pagamentos
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data ON pagamentos(created_at);

-- Índices para notificações
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_data ON notificacoes(data_envio);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profissionais_updated_at BEFORE UPDATE ON profissionais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultas_updated_at BEFORE UPDATE ON consultas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON pagamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON configuracoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para log automático de mudanças
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO logs_sistema (usuario_id, acao, tabela, registro_id, dados_novos)
        VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO logs_sistema (usuario_id, acao, tabela, registro_id, dados_anteriores, dados_novos)
        VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO logs_sistema (usuario_id, acao, tabela, registro_id, dados_anteriores)
        VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- =====================================================
-- SISTEMA FINANCEIRO
-- =====================================================

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES profissionais(id) ON DELETE SET NULL,
    valor DECIMAL(10,2) NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL CHECK (forma_pagamento IN ('pix', 'cartao_credito', 'cartao_debito', 'dinheiro', 'boleto', 'transferencia')),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado', 'estornado', 'processando')),
    data_pagamento TIMESTAMP WITH TIME ZONE,
    data_vencimento DATE,
    codigo_transacao VARCHAR(100),
    observacoes TEXT,
    dados_pagamento JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contas a receber
CREATE TABLE IF NOT EXISTS contas_receber (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')),
    forma_pagamento VARCHAR(50),
    data_pagamento TIMESTAMP WITH TIME ZONE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fluxo de caixa
CREATE TABLE IF NOT EXISTS fluxo_caixa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    categoria VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_movimento DATE NOT NULL,
    forma_pagamento VARCHAR(50),
    status VARCHAR(20) DEFAULT 'confirmado' CHECK (status IN ('confirmado', 'pendente', 'cancelado')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações financeiras
CREATE TABLE IF NOT EXISTS configuracao_financeira (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor JSONB NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRONTUÁRIO ELETRÔNICO
-- =====================================================

-- Tabela de prontuários
CREATE TABLE IF NOT EXISTS prontuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES profissionais(id) ON DELETE SET NULL,
    data_consulta TIMESTAMP WITH TIME ZONE NOT NULL,
    sintomas TEXT,
    diagnostico TEXT,
    prescricao TEXT,
    observacoes TEXT,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'arquivado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de prescrições
CREATE TABLE IF NOT EXISTS prescricoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prontuario_id UUID REFERENCES prontuarios(id) ON DELETE CASCADE,
    medicamento VARCHAR(255) NOT NULL,
    dosagem VARCHAR(100),
    frequencia VARCHAR(100),
    duracao VARCHAR(100),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de exames
CREATE TABLE IF NOT EXISTS exames (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    prontuario_id UUID REFERENCES prontuarios(id) ON DELETE CASCADE,
    nome_exame VARCHAR(255) NOT NULL,
    tipo_exame VARCHAR(100),
    data_exame DATE,
    resultado TEXT,
    arquivo_url TEXT,
    observacoes TEXT,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'realizado', 'cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de evolução do paciente
CREATE TABLE IF NOT EXISTS evolucao_paciente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    prontuario_id UUID REFERENCES prontuarios(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES profissionais(id) ON DELETE SET NULL,
    data_evolucao TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo_evolucao VARCHAR(50) NOT NULL CHECK (tipo_evolucao IN ('consulta', 'retorno', 'emergencia', 'internacao')),
    descricao TEXT NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SISTEMA DE COMUNICAÇÃO
-- =====================================================

-- Tabela de mensagens WhatsApp
CREATE TABLE IF NOT EXISTS mensagens_whatsapp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
    numero_telefone VARCHAR(20) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('lembrete', 'confirmacao', 'cancelamento', 'reagendamento', 'geral')),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviada', 'entregue', 'falhou')),
    data_envio TIMESTAMP WITH TIME ZONE,
    resposta TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens SMS
CREATE TABLE IF NOT EXISTS mensagens_sms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
    numero_telefone VARCHAR(20) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('lembrete', 'confirmacao', 'cancelamento', 'reagendamento', 'geral')),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviada', 'entregue', 'falhou')),
    data_envio TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de emails
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
    email_destino VARCHAR(255) NOT NULL,
    assunto VARCHAR(255) NOT NULL,
    corpo TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('lembrete', 'confirmacao', 'cancelamento', 'reagendamento', 'marketing', 'geral')),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'entregue', 'falhou', 'aberto', 'clicado')),
    data_envio TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de chat interno
CREATE TABLE IF NOT EXISTS chat_interno (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    remetente_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    destinatario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'texto' CHECK (tipo IN ('texto', 'imagem', 'arquivo', 'sistema')),
    arquivo_url TEXT,
    lida BOOLEAN DEFAULT FALSE,
    data_leitura TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CONFIGURAÇÕES AVANÇADAS
-- =====================================================

-- Tabela de configurações da clínica
CREATE TABLE IF NOT EXISTS configuracao_clinica (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_clinica VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(255),
    site VARCHAR(255),
    logo_url TEXT,
    cor_primaria VARCHAR(7),
    cor_secundaria VARCHAR(7),
    horario_funcionamento JSONB,
    configuracoes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de horários de funcionamento
CREATE TABLE IF NOT EXISTS horarios_funcionamento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0 = domingo, 6 = sábado
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de feriados
CREATE TABLE IF NOT EXISTS feriados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    tipo VARCHAR(20) DEFAULT 'nacional' CHECK (tipo IN ('nacional', 'estadual', 'municipal', 'clinica')),
    ativo BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de templates
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('email', 'sms', 'whatsapp', 'relatorio', 'documento')),
    conteudo TEXT NOT NULL,
    variaveis JSONB,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE fluxo_caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracao_financeira ENABLE ROW LEVEL SECURITY;
ALTER TABLE prontuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exames ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolucao_paciente ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens_sms ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_interno ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracao_clinica ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios_funcionamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE feriados ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_sistema ENABLE ROW LEVEL SECURITY;

-- Triggers para atualizar updated_at nas novas tabelas
CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON pagamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contas_receber_updated_at BEFORE UPDATE ON contas_receber FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fluxo_caixa_updated_at BEFORE UPDATE ON fluxo_caixa FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuracao_financeira_updated_at BEFORE UPDATE ON configuracao_financeira FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prontuarios_updated_at BEFORE UPDATE ON prontuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescricoes_updated_at BEFORE UPDATE ON prescricoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exames_updated_at BEFORE UPDATE ON exames FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evolucao_paciente_updated_at BEFORE UPDATE ON evolucao_paciente FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mensagens_whatsapp_updated_at BEFORE UPDATE ON mensagens_whatsapp FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mensagens_sms_updated_at BEFORE UPDATE ON mensagens_sms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_interno_updated_at BEFORE UPDATE ON chat_interno FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuracao_clinica_updated_at BEFORE UPDATE ON configuracao_clinica FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_horarios_funcionamento_updated_at BEFORE UPDATE ON horarios_funcionamento FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feriados_updated_at BEFORE UPDATE ON feriados FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança para usuários
CREATE POLICY "Usuários podem ver seu próprio perfil" ON usuarios
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON usuarios
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins podem gerenciar todos os usuários" ON usuarios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND nivel_acesso = 'admin'
        )
    );

-- Políticas para outras tabelas (exemplos básicos)
CREATE POLICY "Usuários autenticados podem ver dados básicos" ON pacientes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Profissionais podem ver seus agendamentos" ON agendamentos
    FOR SELECT USING (
        profissional_id IN (
            SELECT id FROM profissionais WHERE usuario_id = auth.uid()
        )
    );

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir configurações padrão do sistema
INSERT INTO configuracoes (chave, valor, tipo, categoria, descricao) VALUES
('clinica_nome', 'Clínica Exemplo', 'string', 'geral', 'Nome da clínica'),
('clinica_endereco', 'Rua Exemplo, 123', 'string', 'geral', 'Endereço da clínica'),
('clinica_telefone', '(11) 99999-9999', 'string', 'geral', 'Telefone da clínica'),
('clinica_email', 'contato@clinica.com', 'string', 'geral', 'Email da clínica'),
('sistema_timezone', 'America/Sao_Paulo', 'string', 'sistema', 'Fuso horário do sistema'),
('sistema_idioma_padrao', 'pt-BR', 'string', 'sistema', 'Idioma padrão do sistema'),
('agendamento_intervalo', '30', 'number', 'agendamento', 'Intervalo padrão entre consultas (minutos)'),
('agendamento_antecedencia', '24', 'number', 'agendamento', 'Horas de antecedência para agendamento'),
('notificacoes_email', 'true', 'boolean', 'notificacoes', 'Habilitar notificações por email'),
('notificacoes_sms', 'false', 'boolean', 'notificacoes', 'Habilitar notificações por SMS')
ON CONFLICT (chave) DO NOTHING;

-- =====================================================
-- COMENTÁRIOS DAS TABELAS
-- =====================================================

COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema com diferentes níveis de acesso';
COMMENT ON TABLE pacientes IS 'Cadastro completo de pacientes com histórico médico';
COMMENT ON TABLE profissionais IS 'Equipe médica e administrativa da clínica';
COMMENT ON TABLE servicos IS 'Catálogo de serviços oferecidos pela clínica';
COMMENT ON TABLE agendamentos IS 'Sistema de agendamento de consultas';
COMMENT ON TABLE consultas IS 'Histórico de consultas realizadas';
COMMENT ON TABLE pagamentos IS 'Controle financeiro dos serviços';
COMMENT ON TABLE notificacoes IS 'Sistema de notificações para usuários';
COMMENT ON TABLE configuracoes IS 'Configurações do sistema';
COMMENT ON TABLE logs_sistema IS 'Log de todas as ações realizadas no sistema';

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
