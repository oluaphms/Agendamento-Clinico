-- =====================================================
-- SCRIPT DE DADOS BÁSICOS
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
-- 3. DADOS DE AGENDAMENTOS
-- =====================================================

INSERT INTO agendamentos (paciente_id, profissional_id, servico_id, data, hora, status, observacoes) VALUES
-- Agendamentos de hoje
((SELECT id FROM pacientes WHERE cpf = '12345678901'), (SELECT id FROM profissionais WHERE cpf = '11111111111'), (SELECT id FROM servicos WHERE nome = 'Consulta Médica'), CURRENT_DATE, '09:00', 'agendado', 'Primeira consulta'),
((SELECT id FROM pacientes WHERE cpf = '98765432100'), (SELECT id FROM profissionais WHERE cpf = '22222222222'), (SELECT id FROM servicos WHERE nome = 'Exame de Sangue'), CURRENT_DATE, '10:30', 'confirmado', 'Exame de rotina'),
((SELECT id FROM pacientes WHERE cpf = '11122233344'), (SELECT id FROM profissionais WHERE cpf = '33333333333'), (SELECT id FROM servicos WHERE nome = 'Ultrassom'), CURRENT_DATE, '14:00', 'em_andamento', 'Ultrassom abdominal'),

-- Agendamentos de amanhã
((SELECT id FROM pacientes WHERE cpf = '55566677788'), (SELECT id FROM profissionais WHERE cpf = '11111111111'), (SELECT id FROM servicos WHERE nome = 'Consulta Médica'), CURRENT_DATE + INTERVAL '1 day', '08:00', 'agendado', 'Consulta cardiológica'),
((SELECT id FROM pacientes WHERE cpf = '99988877766'), (SELECT id FROM profissionais WHERE cpf = '22222222222'), (SELECT id FROM servicos WHERE nome = 'Exame de Sangue'), CURRENT_DATE + INTERVAL '1 day', '09:30', 'agendado', 'Exame de rotina'),
((SELECT id FROM pacientes WHERE cpf = '44433322211'), (SELECT id FROM profissionais WHERE cpf = '33333333333'), (SELECT id FROM servicos WHERE nome = 'Ultrassom'), CURRENT_DATE + INTERVAL '1 day', '11:00', 'agendado', 'Ultrassom abdominal'),

-- Agendamentos da próxima semana
((SELECT id FROM pacientes WHERE cpf = '77788899900'), (SELECT id FROM profissionais WHERE cpf = '44444444444'), (SELECT id FROM servicos WHERE nome = 'Consulta Médica'), CURRENT_DATE + INTERVAL '7 days', '09:00', 'agendado', 'Consulta ginecológica'),
((SELECT id FROM pacientes WHERE cpf = '22211100099'), (SELECT id FROM profissionais WHERE cpf = '55555555555'), (SELECT id FROM servicos WHERE nome = 'Eletrocardiograma'), CURRENT_DATE + INTERVAL '7 days', '10:30', 'agendado', 'Exame cardiológico'),
((SELECT id FROM pacientes WHERE cpf = '11111111111'), (SELECT id FROM profissionais WHERE cpf = '66666666666'), (SELECT id FROM servicos WHERE nome = 'Consulta de Retorno'), CURRENT_DATE + INTERVAL '7 days', '14:00', 'agendado', 'Consulta pediátrica')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. DADOS DE PAGAMENTOS
-- =====================================================

INSERT INTO pagamentos (agendamento_id, valor, forma_pagamento, status, data_pagamento, observacoes) VALUES
-- Pagamentos de ontem
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '1 day' AND hora = '08:30'), 150.00, 'pix', 'pago', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '08:45', 'Pagamento via PIX'),
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '1 day' AND hora = '11:00'), 150.00, 'cartao_credito', 'pago', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '11:15', 'Pagamento via cartão'),

-- Pagamentos da semana passada
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '7 days' AND hora = '09:30'), 200.00, 'dinheiro', 'pago', CURRENT_DATE - INTERVAL '7 days' + INTERVAL '09:45', 'Pagamento em dinheiro'),
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '7 days' AND hora = '10:00'), 80.00, 'convenio', 'pago', CURRENT_DATE - INTERVAL '7 days' + INTERVAL '10:15', 'Pagamento via convênio'),

-- Pagamentos pendentes
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE AND hora = '09:00'), 150.00, 'pix', 'pendente', NULL, 'Aguardando pagamento'),
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE AND hora = '10:30'), 80.00, 'cartao_debito', 'pendente', NULL, 'Aguardando pagamento')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. DADOS DE NOTIFICAÇÕES
-- =====================================================

INSERT INTO notificacoes (usuario_id, titulo, mensagem, tipo, lida) VALUES
((SELECT id FROM usuarios WHERE email = 'admin@clinica.com'), 'Novo agendamento', 'Paciente Maria Silva agendou consulta para hoje às 09:00', 'info', false),
((SELECT id FROM usuarios WHERE email = 'admin@clinica.com'), 'Pagamento recebido', 'Pagamento de R$ 150,00 recebido via PIX', 'success', false),
((SELECT id FROM usuarios WHERE email = 'admin@clinica.com'), 'Agendamento cancelado', 'Consulta de João Costa foi cancelada', 'warning', false),
((SELECT id FROM usuarios WHERE email = 'recepcao@clinica.com'), 'Lembrete de agendamento', 'Consulta de Ana Paula em 30 minutos', 'info', false),
((SELECT id FROM usuarios WHERE email = 'recepcao@clinica.com'), 'Novo paciente cadastrado', 'Carlos Eduardo foi cadastrado no sistema', 'info', true)
ON CONFLICT DO NOTHING;

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
