-- =====================================================
-- SCRIPT DE DADOS SUPER SIMPLES
-- =====================================================
-- Execute APÓS o script 00-setup-simples.sql

-- =====================================================
-- 1. DADOS DE PACIENTES
-- =====================================================

INSERT INTO pacientes (nome, cpf, data_nascimento, telefone, email, observacoes) VALUES
('Maria Silva Santos', '12345678901', '1985-03-15', '11999999999', 'maria.silva@email.com', 'Paciente pontual, sempre comparece aos agendamentos'),
('João Oliveira Costa', '98765432100', '1978-07-22', '11888888888', 'joao.costa@email.com', 'Faz acompanhamento regular'),
('Ana Paula Ferreira', '11122233344', '1992-11-08', '11777777777', 'ana.ferreira@email.com', 'Estudante de medicina, muito interessada no tratamento'),
('Carlos Eduardo Lima', '55566677788', '1980-05-30', '11666666666', 'carlos.lima@email.com', 'Paciente idoso, precisa de acompanhamento especial'),
('Fernanda Rodrigues', '99988877766', '1988-12-12', '11555555555', 'fernanda.rodrigues@email.com', 'Gestante, acompanhamento obstétrico')
ON CONFLICT (cpf) DO NOTHING;

-- =====================================================
-- 2. DADOS DE PROFISSIONAIS
-- =====================================================

INSERT INTO profissionais (nome, cpf, crm, especialidade, telefone, email, ativo, observacoes) VALUES
('Dr. Carlos Eduardo Silva', '11111111111', 'CRM 123456', 'Cardiologia', '11987654321', 'carlos.silva@clinica.com', true, 'Especialista em cardiologia intervencionista'),
('Dra. Ana Maria Santos', '22222222222', 'CRM 234567', 'Dermatologia', '11976543210', 'ana.santos@clinica.com', true, 'Especialista em dermatologia estética'),
('Dr. Roberto Lima', '33333333333', 'CRM 345678', 'Ortopedia', '11965432109', 'roberto.lima@clinica.com', true, 'Especialista em cirurgia do joelho'),
('Dra. Patricia Costa', '44444444444', 'CRM 456789', 'Ginecologia', '11954321098', 'patricia.costa@clinica.com', true, 'Especialista em ginecologia oncológica'),
('Dr. Fernando Oliveira', '55555555555', 'CRM 567890', 'Neurologia', '11943210987', 'fernando.oliveira@clinica.com', true, 'Especialista em neurologia vascular')
ON CONFLICT (cpf) DO NOTHING;

-- =====================================================
-- 3. VERIFICAÇÃO DE DADOS
-- =====================================================

-- Verificar se os dados foram inseridos
SELECT 'Pacientes inseridos' as status, COUNT(*) as total FROM pacientes;
SELECT 'Profissionais inseridos' as status, COUNT(*) as total FROM profissionais;
SELECT 'Serviços disponíveis' as status, COUNT(*) as total FROM servicos;
SELECT 'Usuários cadastrados' as status, COUNT(*) as total FROM usuarios;

-- =====================================================
-- 4. CONSULTAS BÁSICAS
-- =====================================================

-- Listar pacientes
SELECT 'Lista de Pacientes' as categoria, nome, cpf, telefone, email FROM pacientes ORDER BY nome;

-- Listar profissionais
SELECT 'Lista de Profissionais' as categoria, nome, crm, especialidade, telefone, email FROM profissionais WHERE ativo = true ORDER BY nome;

-- Listar serviços
SELECT 'Lista de Serviços' as categoria, nome, descricao, duracao_min, preco FROM servicos WHERE ativo = true ORDER BY nome;

-- Listar usuários
SELECT 'Lista de Usuários' as categoria, nome, email, nivel_acesso, status FROM usuarios ORDER BY nome;

-- =====================================================
-- FIM DO SCRIPT SUPER SIMPLES
-- =====================================================
