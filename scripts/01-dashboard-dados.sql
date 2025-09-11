-- =====================================================
-- SCRIPT PARA PÁGINA DASHBOARD
-- =====================================================
-- Este script popula dados para a página Dashboard
-- Execute APÓS o script principal (00-setup-completo-sistema.sql)

-- =====================================================
-- 1. DADOS PARA ESTATÍSTICAS DO DASHBOARD
-- =====================================================

-- Inserir pacientes de exemplo
INSERT INTO pacientes (nome, cpf, data_nascimento, genero, telefone, email, endereco, cidade, estado, cep, status) VALUES
('Maria Silva Santos', '12345678901', '1985-03-15', 'feminino', '11999999999', 'maria.silva@email.com', 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567', 'ativo'),
('João Oliveira Costa', '98765432100', '1978-07-22', 'masculino', '11888888888', 'joao.costa@email.com', 'Av. Paulista, 456', 'São Paulo', 'SP', '01310-100', 'ativo'),
('Ana Paula Ferreira', '11122233344', '1992-11-08', 'feminino', '11777777777', 'ana.ferreira@email.com', 'Rua Augusta, 789', 'São Paulo', 'SP', '01305-000', 'ativo'),
('Carlos Eduardo Lima', '55566677788', '1980-05-30', 'masculino', '11666666666', 'carlos.lima@email.com', 'Rua Oscar Freire, 321', 'São Paulo', 'SP', '01426-001', 'ativo'),
('Fernanda Rodrigues', '99988877766', '1988-12-12', 'feminino', '11555555555', 'fernanda.rodrigues@email.com', 'Av. Faria Lima, 654', 'São Paulo', 'SP', '04538-132', 'ativo'),
('Roberto Alves', '44433322211', '1975-09-18', 'masculino', '11444444444', 'roberto.alves@email.com', 'Rua Bela Cintra, 987', 'São Paulo', 'SP', '01415-000', 'ativo'),
('Patricia Mendes', '77788899900', '1990-04-25', 'feminino', '11333333333', 'patricia.mendes@email.com', 'Rua Haddock Lobo, 147', 'São Paulo', 'SP', '01414-000', 'ativo'),
('Marcos Antonio', '22211100099', '1983-08-14', 'masculino', '11222222222', 'marcos.antonio@email.com', 'Av. Rebouças, 258', 'São Paulo', 'SP', '05402-000', 'ativo')
ON CONFLICT (cpf) DO NOTHING;

-- Inserir profissionais de exemplo
INSERT INTO profissionais (nome, cpf, crm, especialidade, telefone, email, ativo, observacoes) VALUES
('Dr. Carlos Eduardo Silva', '11111111111', 'CRM 123456', 'Cardiologia', '11987654321', 'carlos.silva@clinica.com', true, 'Especialista em cardiologia clínica'),
('Dra. Ana Maria Santos', '22222222222', 'CRM 234567', 'Dermatologia', '11976543210', 'ana.santos@clinica.com', true, 'Especialista em dermatologia estética'),
('Dr. Roberto Lima', '33333333333', 'CRM 345678', 'Ortopedia', '11965432109', 'roberto.lima@clinica.com', true, 'Especialista em cirurgia ortopédica'),
('Dra. Patricia Costa', '44444444444', 'CRM 456789', 'Ginecologia', '11954321098', 'patricia.costa@clinica.com', true, 'Especialista em ginecologia e obstetrícia'),
('Dr. Fernando Oliveira', '55555555555', 'CRM 567890', 'Neurologia', '11943210987', 'fernando.oliveira@clinica.com', true, 'Especialista em neurologia clínica')
ON CONFLICT (cpf) DO NOTHING;

-- =====================================================
-- 2. AGENDAMENTOS DE EXEMPLO
-- =====================================================

-- Inserir agendamentos para os últimos 30 dias
INSERT INTO agendamentos (paciente_id, profissional_id, servico_id, data, hora, status, valor_total, observacoes) VALUES
-- Agendamentos de hoje
((SELECT id FROM pacientes WHERE cpf = '12345678901'), (SELECT id FROM profissionais WHERE cpf = '11111111111'), (SELECT id FROM servicos WHERE nome = 'Consulta Médica'), CURRENT_DATE, '09:00', 'agendado', 150.00, 'Primeira consulta'),
((SELECT id FROM pacientes WHERE cpf = '98765432100'), (SELECT id FROM profissionais WHERE cpf = '22222222222'), (SELECT id FROM servicos WHERE nome = 'Exame de Sangue'), CURRENT_DATE, '10:30', 'confirmado', 80.00, 'Exame de rotina'),
((SELECT id FROM pacientes WHERE cpf = '11122233344'), (SELECT id FROM profissionais WHERE cpf = '33333333333'), (SELECT id FROM servicos WHERE nome = 'Ultrassom'), CURRENT_DATE, '14:00', 'em_andamento', 200.00, 'Ultrassom abdominal'),

-- Agendamentos de ontem
((SELECT id FROM pacientes WHERE cpf = '55566677788'), (SELECT id FROM profissionais WHERE cpf = '11111111111'), (SELECT id FROM servicos WHERE nome = 'Consulta Médica'), CURRENT_DATE - INTERVAL '1 day', '08:30', 'concluido', 150.00, 'Consulta de retorno'),
((SELECT id FROM pacientes WHERE cpf = '99988877766'), (SELECT id FROM profissionais WHERE cpf = '44444444444'), (SELECT id FROM servicos WHERE nome = 'Consulta Médica'), CURRENT_DATE - INTERVAL '1 day', '11:00', 'concluido', 150.00, 'Consulta de rotina'),

-- Agendamentos da semana passada
((SELECT id FROM pacientes WHERE cpf = '44433322211'), (SELECT id FROM profissionais WHERE cpf = '55555555555'), (SELECT id FROM servicos WHERE nome = 'Eletrocardiograma'), CURRENT_DATE - INTERVAL '7 days', '09:30', 'concluido', 120.00, 'Exame cardiológico'),
((SELECT id FROM pacientes WHERE cpf = '77788899900'), (SELECT id FROM profissionais WHERE cpf = '22222222222'), (SELECT id FROM servicos WHERE nome = 'Exame de Sangue'), CURRENT_DATE - INTERVAL '6 days', '10:00', 'concluido', 80.00, 'Exame de rotina'),

-- Agendamentos futuros
((SELECT id FROM pacientes WHERE cpf = '22211100099'), (SELECT id FROM profissionais WHERE cpf = '11111111111'), (SELECT id FROM servicos WHERE nome = 'Consulta Médica'), CURRENT_DATE + INTERVAL '1 day', '15:30', 'agendado', 150.00, 'Consulta de retorno'),
((SELECT id FROM pacientes WHERE cpf = '12345678901'), (SELECT id FROM profissionais WHERE cpf = '33333333333'), (SELECT id FROM servicos WHERE nome = 'Ultrassom'), CURRENT_DATE + INTERVAL '2 days', '11:00', 'agendado', 200.00, 'Ultrassom de controle'),
((SELECT id FROM pacientes WHERE cpf = '98765432100'), (SELECT id FROM profissionais WHERE cpf = '44444444444'), (SELECT id FROM servicos WHERE nome = 'Consulta Médica'), CURRENT_DATE + INTERVAL '3 days', '14:30', 'agendado', 150.00, 'Primeira consulta')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. PAGAMENTOS DE EXEMPLO
-- =====================================================

-- Inserir pagamentos para agendamentos concluídos
INSERT INTO pagamentos (agendamento_id, valor, forma_pagamento, status, data_pagamento, observacoes) VALUES
-- Pagamentos de ontem
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '1 day' AND hora = '08:30'), 150.00, 'pix', 'pago', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '08:45', 'Pagamento via PIX'),
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '1 day' AND hora = '11:00'), 150.00, 'cartao_credito', 'pago', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '11:15', 'Pagamento via cartão'),

-- Pagamentos da semana passada
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '7 days' AND hora = '09:30'), 120.00, 'dinheiro', 'pago', CURRENT_DATE - INTERVAL '7 days' + INTERVAL '09:45', 'Pagamento em dinheiro'),
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '6 days' AND hora = '10:00'), 80.00, 'convenio', 'pago', CURRENT_DATE - INTERVAL '6 days' + INTERVAL '10:15', 'Pagamento via convênio'),

-- Pagamentos pendentes
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE AND hora = '09:00'), 150.00, 'pix', 'pendente', NULL, 'Aguardando pagamento'),
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE AND hora = '10:30'), 80.00, 'cartao_debito', 'pendente', NULL, 'Aguardando pagamento')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. NOTIFICAÇÕES DE EXEMPLO
-- =====================================================

-- Inserir notificações para o dashboard
INSERT INTO notificacoes (usuario_id, titulo, mensagem, tipo, lida) VALUES
((SELECT id FROM usuarios WHERE email = 'admin@clinica.com'), 'Novo agendamento', 'Paciente Maria Silva agendou consulta para hoje às 09:00', 'info', false),
((SELECT id FROM usuarios WHERE email = 'admin@clinica.com'), 'Pagamento recebido', 'Pagamento de R$ 150,00 recebido via PIX', 'success', false),
((SELECT id FROM usuarios WHERE email = 'admin@clinica.com'), 'Agendamento cancelado', 'Consulta de João Costa foi cancelada', 'warning', false),
((SELECT id FROM usuarios WHERE email = 'recepcao@clinica.com'), 'Lembrete de agendamento', 'Consulta de Ana Paula em 30 minutos', 'info', false),
((SELECT id FROM usuarios WHERE email = 'recepcao@clinica.com'), 'Novo paciente cadastrado', 'Carlos Eduardo foi cadastrado no sistema', 'info', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. CONSULTAS ÚTEIS PARA DASHBOARD
-- =====================================================

-- Estatísticas gerais
SELECT 
    'Estatísticas do Sistema' as categoria,
    (SELECT COUNT(*) FROM pacientes WHERE status = 'ativo') as total_pacientes,
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
    a.status,
    a.valor_total
FROM agendamentos a
JOIN pacientes p ON a.paciente_id = p.id
JOIN profissionais pr ON a.profissional_id = pr.id
JOIN servicos s ON a.servico_id = s.id
WHERE a.data = CURRENT_DATE
ORDER BY a.hora;

-- Receita dos últimos 7 dias
SELECT 
    'Receita dos Últimos 7 Dias' as categoria,
    DATE(a.data) as data_agendamento,
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as agendamentos_concluidos,
    COALESCE(SUM(CASE WHEN a.status = 'concluido' THEN a.valor_total ELSE 0 END), 0) as receita_dia
FROM agendamentos a
WHERE a.data >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(a.data)
ORDER BY data_agendamento DESC;

-- =====================================================
-- FIM DO SCRIPT DASHBOARD
-- =====================================================

-- Este script cria dados de exemplo para:
-- - Estatísticas do dashboard
-- - Gráficos e métricas
-- - Agendamentos recentes
-- - Notificações
-- - Relatórios financeiros
