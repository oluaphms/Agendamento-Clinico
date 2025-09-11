-- =====================================================
-- SCRIPT DE DADOS BÁSICOS - VERSÃO CORRIGIDA
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
('Fernanda Rodrigues', '99988877766', '1988-12-12', '11555555555', 'fernanda.rodrigues@email.com', 'Gestante, acompanhamento obstétrico'),
('Roberto Alves', '44433322211', '1975-09-18', '11444444444', 'roberto.alves@email.com', 'Colega médico, referência de outros pacientes'),
('Patricia Mendes', '77788899900', '1990-04-25', '11333333333', 'patricia.mendes@email.com', 'Paciente com histórico de enxaqueca crônica'),
('Marcos Antonio', '22211100099', '1983-08-14', '11222222222', 'marcos.antonio@email.com', 'Trabalha muito tempo sentado, dores na coluna'),
('Luciana Ferreira', '11111111111', '1990-05-15', '11911111111', 'luciana.ferreira@email.com', 'Paciente pontual, sempre comparece aos agendamentos'),
('Pedro Henrique Silva', '22222222222', '1985-08-22', '11922222222', 'pedro.silva@email.com', 'Faz acompanhamento regular')
ON CONFLICT (cpf) DO NOTHING;

-- =====================================================
-- 2. DADOS DE PROFISSIONAIS
-- =====================================================

INSERT INTO profissionais (nome, cpf, crm, especialidade, telefone, email, ativo, observacoes) VALUES
('Dr. Carlos Eduardo Silva', '11111111111', 'CRM 123456', 'Cardiologia', '11987654321', 'carlos.silva@clinica.com', true, 'Especialista em cardiologia intervencionista, realiza cateterismos'),
('Dra. Ana Maria Santos', '22222222222', 'CRM 234567', 'Dermatologia', '11976543210', 'ana.santos@clinica.com', true, 'Especialista em dermatologia estética e cosmiatria'),
('Dr. Roberto Lima', '33333333333', 'CRM 345678', 'Ortopedia', '11965432109', 'roberto.lima@clinica.com', true, 'Especialista em cirurgia do joelho, realiza artroscopias'),
('Dra. Patricia Costa', '44444444444', 'CRM 456789', 'Ginecologia', '11954321098', 'patricia.costa@clinica.com', true, 'Especialista em ginecologia oncológica, realiza cirurgias complexas'),
('Dr. Fernando Oliveira', '55555555555', 'CRM 567890', 'Neurologia', '11943210987', 'fernando.oliveira@clinica.com', true, 'Especialista em neurologia vascular, trata AVCs'),
('Dra. Mariana Rodrigues', '66666666666', 'CRM 678901', 'Pediatria', '11932109876', 'mariana.rodrigues@clinica.com', true, 'Especialista em neonatologia, cuida de recém-nascidos'),
('Dr. Paulo Henrique', '77777777777', 'CRM 789012', 'Oftalmologia', '11921098765', 'paulo.henrique@clinica.com', true, 'Especialista em retina, realiza cirurgias vitreorretinianas'),
('Dra. Camila Ferreira', '88888888888', 'CRM 890123', 'Psiquiatria', '11910987654', 'camila.ferreira@clinica.com', true, 'Especialista em psiquiatria da infância e adolescência'),
('Dr. Rafael Santos', '99999999999', 'CRM 901234', 'Urologia', '11909876543', 'rafael.santos@clinica.com', true, 'Especialista em urologia oncológica, realiza cirurgias robóticas'),
('Dra. Beatriz Lima', '00000000000', 'CRM 012345', 'Endocrinologia', '11908765432', 'beatriz.lima@clinica.com', true, 'Especialista em diabetes e doenças da tireoide')
ON CONFLICT (cpf) DO NOTHING;

-- =====================================================
-- 3. DADOS DE AGENDAMENTOS (SEM SUBCONSULTAS)
-- =====================================================

-- Primeiro, vamos obter os IDs necessários
DO $$
DECLARE
    paciente1_id UUID;
    paciente2_id UUID;
    paciente3_id UUID;
    profissional1_id INTEGER;
    profissional2_id INTEGER;
    profissional3_id INTEGER;
    servico1_id INTEGER;
    servico2_id INTEGER;
    servico3_id INTEGER;
BEGIN
    -- Obter IDs dos pacientes
    SELECT id INTO paciente1_id FROM pacientes WHERE cpf = '12345678901' LIMIT 1;
    SELECT id INTO paciente2_id FROM pacientes WHERE cpf = '98765432100' LIMIT 1;
    SELECT id INTO paciente3_id FROM pacientes WHERE cpf = '11122233344' LIMIT 1;
    
    -- Obter IDs dos profissionais
    SELECT id INTO profissional1_id FROM profissionais WHERE cpf = '11111111111' LIMIT 1;
    SELECT id INTO profissional2_id FROM profissionais WHERE cpf = '22222222222' LIMIT 1;
    SELECT id INTO profissional3_id FROM profissionais WHERE cpf = '33333333333' LIMIT 1;
    
    -- Obter IDs dos serviços
    SELECT id INTO servico1_id FROM servicos WHERE nome = 'Consulta Médica' LIMIT 1;
    SELECT id INTO servico2_id FROM servicos WHERE nome = 'Exame de Sangue' LIMIT 1;
    SELECT id INTO servico3_id FROM servicos WHERE nome = 'Ultrassom' LIMIT 1;
    
    -- Inserir agendamentos
    INSERT INTO agendamentos (paciente_id, profissional_id, servico_id, data, hora, status, observacoes) VALUES
    (paciente1_id, profissional1_id, servico1_id, CURRENT_DATE, '09:00', 'agendado', 'Primeira consulta'),
    (paciente2_id, profissional2_id, servico2_id, CURRENT_DATE, '10:30', 'confirmado', 'Exame de rotina'),
    (paciente3_id, profissional3_id, servico3_id, CURRENT_DATE, '14:00', 'em_andamento', 'Ultrassom abdominal'),
    (paciente1_id, profissional1_id, servico1_id, CURRENT_DATE + INTERVAL '1 day', '08:00', 'agendado', 'Consulta cardiológica'),
    (paciente2_id, profissional2_id, servico2_id, CURRENT_DATE + INTERVAL '1 day', '09:30', 'agendado', 'Exame de rotina'),
    (paciente3_id, profissional3_id, servico3_id, CURRENT_DATE + INTERVAL '1 day', '11:00', 'agendado', 'Ultrassom abdominal')
    ON CONFLICT DO NOTHING;
END $$;

-- =====================================================
-- 4. DADOS DE PAGAMENTOS (SEM SUBCONSULTAS)
-- =====================================================

DO $$
DECLARE
    agendamento1_id UUID;
    agendamento2_id UUID;
BEGIN
    -- Obter IDs dos agendamentos
    SELECT id INTO agendamento1_id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '1 day' AND hora = '08:30' LIMIT 1;
    SELECT id INTO agendamento2_id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '1 day' AND hora = '11:00' LIMIT 1;
    
    -- Inserir pagamentos
    INSERT INTO pagamentos (agendamento_id, valor, forma_pagamento, status, data_pagamento, observacoes) VALUES
    (agendamento1_id, 150.00, 'pix', 'pago', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '08:45', 'Pagamento via PIX'),
    (agendamento2_id, 150.00, 'cartao_credito', 'pago', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '11:15', 'Pagamento via cartão')
    ON CONFLICT DO NOTHING;
END $$;

-- =====================================================
-- 5. DADOS DE NOTIFICAÇÕES (SEM SUBCONSULTAS)
-- =====================================================

DO $$
DECLARE
    admin_id UUID;
    recepcao_id UUID;
BEGIN
    -- Obter IDs dos usuários
    SELECT id INTO admin_id FROM usuarios WHERE email = 'admin@clinica.com' LIMIT 1;
    SELECT id INTO recepcao_id FROM usuarios WHERE email = 'recepcao@clinica.com' LIMIT 1;
    
    -- Inserir notificações
    INSERT INTO notificacoes (usuario_id, titulo, mensagem, tipo, lida) VALUES
    (admin_id, 'Novo agendamento', 'Paciente Maria Silva agendou consulta para hoje às 09:00', 'info', false),
    (admin_id, 'Pagamento recebido', 'Pagamento de R$ 150,00 recebido via PIX', 'success', false),
    (admin_id, 'Agendamento cancelado', 'Consulta de João Costa foi cancelada', 'warning', false),
    (recepcao_id, 'Lembrete de agendamento', 'Consulta de Ana Paula em 30 minutos', 'info', false),
    (recepcao_id, 'Novo paciente cadastrado', 'Carlos Eduardo foi cadastrado no sistema', 'info', true)
    ON CONFLICT DO NOTHING;
END $$;

-- =====================================================
-- 6. CONSULTAS ÚTEIS
-- =====================================================

-- Estatísticas gerais
SELECT 
    'Estatísticas do Sistema' as categoria,
    (SELECT COUNT(*) FROM pacientes) as total_pacientes,
    (SELECT COUNT(*) FROM profissionais WHERE ativo = true) as total_profissionais,
    (SELECT COUNT(*) FROM servicos WHERE ativo = true) as total_servicos,
    (SELECT COUNT(*) FROM agendamentos WHERE data = CURRENT_DATE) as agendamentos_hoje,
    (SELECT COUNT(*) FROM agendamentos WHERE data >= CURRENT_DATE - INTERVAL '7 days' AND status = 'concluido') as agendamentos_semana,
    (SELECT COALESCE(SUM(valor), 0) FROM pagamentos WHERE status = 'pago' AND data_pagamento >= CURRENT_DATE - INTERVAL '30 days') as receita_mes;

-- Agendamentos de hoje
SELECT 
    'Agendamentos de Hoje' as categoria,
    a.id,
    p.nome as paciente,
    pr.nome as profissional,
    s.nome as servico,
    a.hora,
    a.status
FROM agendamentos a
JOIN pacientes p ON a.paciente_id = p.id
JOIN profissionais pr ON a.profissional_id = pr.id
JOIN servicos s ON a.servico_id = s.id
WHERE a.data = CURRENT_DATE
ORDER BY a.hora;

-- =====================================================
-- FIM DO SCRIPT DE DADOS BÁSICOS
-- =====================================================
