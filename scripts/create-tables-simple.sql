-- Script SQL simplificado para criar as tabelas básicas no Supabase
-- Execute este script no Supabase Dashboard > SQL Editor

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

-- Inserir dados de exemplo
INSERT INTO pacientes (nome, cpf, telefone, email, data_nascimento, observacoes, convenio, categoria, tags, favorito) VALUES
('Ana Silva Santos', '123.456.789-01', '(11) 99999-1111', 'ana.silva@email.com', '1985-03-15', 'Paciente com histórico de alergias', 'Unimed', 'Particular', 'VIP,Alergias', true),
('Carlos Eduardo Oliveira', '987.654.321-02', '(11) 88888-2222', 'carlos.oliveira@email.com', '1978-07-22', 'Paciente frequente, sempre pontual', 'Bradesco Saúde', 'Convenio', 'Frequente,Pontual', false),
('Maria Fernanda Costa', '456.789.123-03', '(11) 77777-3333', 'maria.costa@email.com', '1992-11-08', 'Primeira consulta', 'SUS', 'SUS', 'Nova', false),
('João Pedro Mendes', '789.123.456-04', '(11) 66666-4444', 'joao.mendes@email.com', '1980-05-12', 'Paciente com diabetes tipo 2', 'Amil', 'Convenio', 'Diabetes,Crônico', true),
('Lucia Helena Rodrigues', '321.654.987-05', '(11) 55555-5555', 'lucia.rodrigues@email.com', '1975-09-30', 'Paciente idosa, necessita acompanhante', 'NotreDame Intermédica', 'Convenio', 'Idosa,Acompanhante', false),
('Roberto Alves Pereira', '654.321.789-06', '(11) 44444-6666', 'roberto.pereira@email.com', '1988-12-03', 'Paciente atleta, exames regulares', 'Particular', 'Particular', 'Atleta,Exames', true),
('Fernanda Lima Souza', '147.258.369-07', '(11) 33333-7777', 'fernanda.lima@email.com', '1995-04-18', 'Paciente gestante, acompanhamento especial', 'SulAmérica', 'Convenio', 'Gestante,Especial', false),
('Antonio Carlos Ferreira', '369.258.147-08', '(11) 22222-8888', 'antonio.ferreira@email.com', '1970-08-25', 'Paciente com hipertensão', 'Golden Cross', 'Convenio', 'Hipertensão,Crônico', false);

INSERT INTO profissionais (nome, cpf, telefone, email, especialidade, crm, observacoes, ativo) VALUES
('Dr. João Silva', '111.222.333-44', '(11) 99999-0001', 'joao.silva@clinica.com', 'Cardiologia', '123456-SP', 'Especialista em arritmias', true),
('Dra. Maria Santos', '222.333.444-55', '(11) 99999-0002', 'maria.santos@clinica.com', 'Dermatologia', '234567-SP', 'Especialista em câncer de pele', true),
('Dr. Carlos Oliveira', '333.444.555-66', '(11) 99999-0003', 'carlos.oliveira@clinica.com', 'Ortopedia', '345678-SP', 'Especialista em coluna', true),
('Dra. Ana Costa', '444.555.666-77', '(11) 99999-0004', 'ana.costa@clinica.com', 'Ginecologia', '456789-SP', 'Especialista em reprodução humana', true),
('Dr. Pedro Mendes', '555.666.777-88', '(11) 99999-0005', 'pedro.mendes@clinica.com', 'Neurologia', '567890-SP', 'Especialista em epilepsia', true),
('Dra. Lucia Rodrigues', '666.777.888-99', '(11) 99999-0006', 'lucia.rodrigues@clinica.com', 'Pediatria', '678901-SP', 'Especialista em neonatologia', true),
('Dr. Roberto Alves', '777.888.999-00', '(11) 99999-0007', 'roberto.alves@clinica.com', 'Urologia', '789012-SP', 'Especialista em próstata', true),
('Dra. Fernanda Lima', '888.999.000-11', '(11) 99999-0008', 'fernanda.lima@clinica.com', 'Psiquiatria', '890123-SP', 'Especialista em ansiedade e depressão', true);

INSERT INTO servicos (nome, descricao, duracao_min, preco, ativo) VALUES
('Consulta Médica', 'Consulta médica geral', 30, 150.00, true),
('Exame de Sangue', 'Coleta e análise de sangue', 15, 80.00, true),
('Ultrassom', 'Exame de ultrassonografia', 45, 200.00, true),
('Raio-X', 'Exame radiográfico', 20, 120.00, true),
('Eletrocardiograma', 'Exame cardíaco', 15, 100.00, true),
('Endoscopia', 'Exame do sistema digestivo', 60, 350.00, true),
('Mamografia', 'Exame de mama', 30, 180.00, true),
('Tomografia', 'Exame de tomografia computadorizada', 45, 500.00, true),
('Ressonância Magnética', 'Exame de ressonância magnética', 90, 800.00, true),
('Ecocardiograma', 'Exame do coração', 40, 250.00, true),
('Colonoscopia', 'Exame do cólon', 75, 400.00, true),
('Biópsia', 'Coleta de amostra para análise', 30, 300.00, true),
('Fisioterapia', 'Sessão de fisioterapia', 60, 120.00, true),
('Psicoterapia', 'Sessão de psicoterapia', 50, 200.00, true),
('Nutrição', 'Consulta nutricional', 45, 150.00, true);

INSERT INTO agendamentos (paciente_id, profissional_id, servico_id, data, hora, duracao, status, origem, valor_pago, observacoes) VALUES
(1, 1, 1, '2024-01-15', '09:00', 30, 'Realizado', 'Sistema', 150.00, 'Consulta de rotina'),
(2, 2, 2, '2024-01-16', '10:30', 15, 'Realizado', 'Sistema', 80.00, 'Exame de rotina'),
(3, 3, 3, '2024-01-17', '14:00', 45, 'Agendado', 'Sistema', 0.00, 'Primeira consulta'),
(4, 4, 4, '2024-01-18', '16:30', 20, 'Confirmado', 'Sistema', 0.00, 'Exame de rotina'),
(5, 5, 5, '2024-01-19', '08:30', 15, 'Realizado', 'Sistema', 100.00, 'Exame cardíaco'),
(6, 6, 6, '2024-01-20', '11:00', 60, 'Agendado', 'Sistema', 0.00, 'Exame especializado'),
(7, 7, 7, '2024-01-21', '13:30', 30, 'Confirmado', 'Sistema', 0.00, 'Exame de rotina'),
(8, 8, 8, '2024-01-22', '15:00', 45, 'Agendado', 'Sistema', 0.00, 'Exame especializado');

-- Verificar se as tabelas foram criadas
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT COUNT(*) as total_pacientes FROM pacientes;
SELECT COUNT(*) as total_profissionais FROM profissionais;
SELECT COUNT(*) as total_servicos FROM servicos;
SELECT COUNT(*) as total_agendamentos FROM agendamentos;
