-- =====================================================
-- SCRIPT PARA PÁGINA RELATÓRIOS
-- =====================================================
-- Este script popula dados para a página Relatórios
-- Execute APÓS o script principal (00-setup-completo-sistema.sql)

-- =====================================================
-- 1. DADOS ADICIONAIS PARA RELATÓRIOS
-- =====================================================

-- Inserir mais agendamentos para relatórios (últimos 90 dias)
INSERT INTO agendamentos (paciente_id, profissional_id, servico_id, data, hora, status, valor_total, duracao_real, observacoes) VALUES
-- Agendamentos de 30 dias atrás
((SELECT id FROM pacientes WHERE cpf = '12345678901'), (SELECT id FROM profissionais WHERE cpf = '11111111111'), (SELECT id FROM servicos WHERE nome = 'Consulta Médica'), CURRENT_DATE - INTERVAL '30 days', '09:00', 'concluido', 150.00, 45, 'Consulta de rotina'),
((SELECT id FROM pacientes WHERE cpf = '98765432100'), (SELECT id FROM profissionais WHERE cpf = '22222222222'), (SELECT id FROM servicos WHERE nome = 'Exame de Sangue'), CURRENT_DATE - INTERVAL '30 days', '10:30', 'concluido', 80.00, 15, 'Exame de rotina'),
((SELECT id FROM pacientes WHERE cpf = '11122233344'), (SELECT id FROM profissionais WHERE cpf = '33333333333'), (SELECT id FROM servicos WHERE nome = 'Ultrassom'), CURRENT_DATE - INTERVAL '30 days', '14:00', 'concluido', 200.00, 30, 'Ultrassom abdominal'),

-- Agendamentos de 45 dias atrás
((SELECT id FROM pacientes WHERE cpf = '55566677788'), (SELECT id FROM profissionais WHERE cpf = '44444444444'), (SELECT id FROM servicos WHERE nome = 'Consulta Médica'), CURRENT_DATE - INTERVAL '45 days', '08:30', 'concluido', 150.00, 40, 'Consulta de retorno'),
((SELECT id FROM pacientes WHERE cpf = '99988877766'), (SELECT id FROM profissionais WHERE cpf = '11111111111'), (SELECT id FROM servicos WHERE nome = 'Consulta Cardiológica'), CURRENT_DATE - INTERVAL '45 days', '11:00', 'concluido', 300.00, 50, 'Consulta cardiológica'),

-- Agendamentos de 60 dias atrás
((SELECT id FROM pacientes WHERE cpf = '44433322211'), (SELECT id FROM profissionais WHERE cpf = '22222222222'), (SELECT id FROM servicos WHERE nome = 'Consulta Dermatológica'), CURRENT_DATE - INTERVAL '60 days', '09:30', 'concluido', 250.00, 35, 'Consulta dermatológica'),
((SELECT id FROM pacientes WHERE cpf = '77788899900'), (SELECT id FROM profissionais WHERE cpf = '33333333333'), (SELECT id FROM servicos WHERE nome = 'Consulta Ortopédica'), CURRENT_DATE - INTERVAL '60 days', '14:00', 'concluido', 280.00, 45, 'Consulta ortopédica'),

-- Agendamentos de 75 dias atrás
((SELECT id FROM pacientes WHERE cpf = '22211100099'), (SELECT id FROM profissionais WHERE cpf = '44444444444'), (SELECT id FROM servicos WHERE nome = 'Consulta Ginecológica'), CURRENT_DATE - INTERVAL '75 days', '08:00', 'concluido', 220.00, 40, 'Consulta ginecológica'),
((SELECT id FROM pacientes WHERE cpf = '11111111111'), (SELECT id FROM profissionais WHERE cpf = '55555555555'), (SELECT id FROM servicos WHERE nome = 'Consulta Neurológica'), CURRENT_DATE - INTERVAL '75 days', '10:30', 'concluido', 350.00, 50, 'Consulta neurológica'),

-- Agendamentos de 90 dias atrás
((SELECT id FROM pacientes WHERE cpf = '22222222222'), (SELECT id FROM profissionais WHERE cpf = '66666666666'), (SELECT id FROM servicos WHERE nome = 'Consulta Pediátrica'), CURRENT_DATE - INTERVAL '90 days', '09:00', 'concluido', 200.00, 30, 'Consulta pediátrica'),
((SELECT id FROM pacientes WHERE cpf = '33333333333'), (SELECT id FROM profissionais WHERE cpf = '77777777777'), (SELECT id FROM servicos WHERE nome = 'Consulta Oftalmológica'), CURRENT_DATE - INTERVAL '90 days', '14:00', 'concluido', 320.00, 40, 'Consulta oftalmológica')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. PAGAMENTOS PARA RELATÓRIOS
-- =====================================================

-- Inserir pagamentos para agendamentos concluídos
INSERT INTO pagamentos (agendamento_id, valor, forma_pagamento, status, data_pagamento, observacoes) VALUES
-- Pagamentos de ontem
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '1 day' AND hora = '08:30'), 150.00, 'pix', 'pago', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '08:45', 'Pagamento via PIX'),
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '1 day' AND hora = '11:00'), 150.00, 'cartao_credito', 'pago', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '11:15', 'Pagamento via cartão'),

-- Pagamentos da semana passada
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '7 days' AND hora = '09:00'), 200.00, 'dinheiro', 'pago', CURRENT_DATE - INTERVAL '7 days' + INTERVAL '09:15', 'Pagamento em dinheiro'),
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '7 days' AND hora = '14:00'), 150.00, 'convenio', 'pago', CURRENT_DATE - INTERVAL '7 days' + INTERVAL '14:15', 'Pagamento via convênio'),

-- Pagamentos de 2 semanas atrás
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '14 days' AND hora = '08:00'), 300.00, 'pix', 'pago', CURRENT_DATE - INTERVAL '14 days' + INTERVAL '08:15', 'Pagamento via PIX'),
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '14 days' AND hora = '10:30'), 250.00, 'cartao_debito', 'pago', CURRENT_DATE - INTERVAL '14 days' + INTERVAL '10:45', 'Pagamento via cartão'),

-- Pagamentos de 3 semanas atrás
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '21 days' AND hora = '09:00'), 280.00, 'transferencia', 'pago', CURRENT_DATE - INTERVAL '21 days' + INTERVAL '09:15', 'Pagamento via transferência'),
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '21 days' AND hora = '14:00'), 220.00, 'pix', 'pago', CURRENT_DATE - INTERVAL '21 days' + INTERVAL '14:15', 'Pagamento via PIX'),

-- Pagamentos de 30 dias atrás
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '30 days' AND hora = '09:00'), 150.00, 'dinheiro', 'pago', CURRENT_DATE - INTERVAL '30 days' + INTERVAL '09:15', 'Pagamento em dinheiro'),
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE - INTERVAL '30 days' AND hora = '10:30'), 80.00, 'convenio', 'pago', CURRENT_DATE - INTERVAL '30 days' + INTERVAL '10:45', 'Pagamento via convênio'),

-- Pagamentos pendentes
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE AND hora = '09:00'), 150.00, 'pix', 'pendente', NULL, 'Aguardando pagamento'),
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE AND hora = '10:30'), 80.00, 'cartao_debito', 'pendente', NULL, 'Aguardando pagamento'),
((SELECT id FROM agendamentos WHERE data = CURRENT_DATE AND hora = '14:00'), 200.00, 'dinheiro', 'pendente', NULL, 'Aguardando pagamento')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. CONSULTAS ÚTEIS PARA RELATÓRIOS
-- =====================================================

-- Relatório financeiro mensal
SELECT 
    'Relatório Financeiro Mensal' as categoria,
    DATE_TRUNC('month', a.data) as mes,
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as agendamentos_concluidos,
    COALESCE(SUM(CASE WHEN a.status = 'concluido' THEN a.valor_total ELSE 0 END), 0) as receita_bruta,
    COALESCE(SUM(CASE WHEN pg.status = 'pago' THEN pg.valor ELSE 0 END), 0) as receita_liquida,
    COALESCE(SUM(CASE WHEN pg.status = 'pendente' THEN pg.valor ELSE 0 END), 0) as receita_pendente
FROM agendamentos a
LEFT JOIN pagamentos pg ON a.id = pg.agendamento_id
WHERE a.data >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', a.data)
ORDER BY mes DESC;

-- Relatório por profissional
SELECT 
    'Relatório por Profissional' as categoria,
    pr.nome as profissional,
    pr.especialidade,
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as agendamentos_concluidos,
    COALESCE(SUM(CASE WHEN a.status = 'concluido' THEN a.valor_total ELSE 0 END), 0) as receita_total,
    AVG(CASE WHEN a.status = 'concluido' THEN a.duracao_real END) as duracao_media_real
FROM agendamentos a
JOIN profissionais pr ON a.profissional_id = pr.id
WHERE a.data >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY pr.id, pr.nome, pr.especialidade
ORDER BY receita_total DESC;

-- Relatório por serviço
SELECT 
    'Relatório por Serviço' as categoria,
    s.nome as servico,
    s.categoria as categoria_servico,
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as agendamentos_concluidos,
    COALESCE(SUM(CASE WHEN a.status = 'concluido' THEN a.valor_total ELSE 0 END), 0) as receita_total,
    AVG(a.valor_total) as valor_medio
FROM agendamentos a
JOIN servicos s ON a.servico_id = s.id
WHERE a.data >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY s.id, s.nome, s.categoria
ORDER BY receita_total DESC;

-- Relatório por forma de pagamento
SELECT 
    'Relatório por Forma de Pagamento' as categoria,
    pg.forma_pagamento,
    COUNT(*) as total_pagamentos,
    COALESCE(SUM(pg.valor), 0) as valor_total,
    COUNT(CASE WHEN pg.status = 'pago' THEN 1 END) as pagamentos_realizados,
    COUNT(CASE WHEN pg.status = 'pendente' THEN 1 END) as pagamentos_pendentes
FROM pagamentos pg
WHERE pg.created_at >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY pg.forma_pagamento
ORDER BY valor_total DESC;

-- Relatório de pacientes mais frequentes
SELECT 
    'Pacientes Mais Frequentes' as categoria,
    p.nome as paciente,
    p.telefone,
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as agendamentos_concluidos,
    COALESCE(SUM(CASE WHEN a.status = 'concluido' THEN a.valor_total ELSE 0 END), 0) as valor_total_gasto
FROM agendamentos a
JOIN pacientes p ON a.paciente_id = p.id
WHERE a.data >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY p.id, p.nome, p.telefone
ORDER BY total_agendamentos DESC
LIMIT 10;

-- Relatório de horários mais movimentados
SELECT 
    'Horários Mais Movimentados' as categoria,
    EXTRACT(HOUR FROM a.hora) as hora,
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as agendamentos_concluidos
FROM agendamentos a
WHERE a.data >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY EXTRACT(HOUR FROM a.hora)
ORDER BY total_agendamentos DESC;

-- Relatório de dias da semana mais movimentados
SELECT 
    'Dias da Semana Mais Movimentados' as categoria,
    CASE EXTRACT(DOW FROM a.data)
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Segunda-feira'
        WHEN 2 THEN 'Terça-feira'
        WHEN 3 THEN 'Quarta-feira'
        WHEN 4 THEN 'Quinta-feira'
        WHEN 5 THEN 'Sexta-feira'
        WHEN 6 THEN 'Sábado'
    END as dia_semana,
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as agendamentos_concluidos
FROM agendamentos a
WHERE a.data >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY EXTRACT(DOW FROM a.data)
ORDER BY total_agendamentos DESC;

-- Relatório de cancelamentos
SELECT 
    'Relatório de Cancelamentos' as categoria,
    DATE_TRUNC('month', a.data) as mes,
    COUNT(*) as total_cancelamentos,
    COUNT(CASE WHEN a.motivo_cancelamento IS NOT NULL THEN 1 END) as com_motivo,
    COUNT(CASE WHEN a.motivo_cancelamento IS NULL THEN 1 END) as sem_motivo
FROM agendamentos a
WHERE a.status = 'cancelado' AND a.data >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', a.data)
ORDER BY mes DESC;

-- Relatório de faltas
SELECT 
    'Relatório de Faltas' as categoria,
    DATE_TRUNC('month', a.data) as mes,
    COUNT(*) as total_faltas,
    COUNT(CASE WHEN a.motivo_cancelamento IS NOT NULL THEN 1 END) as com_motivo,
    COUNT(CASE WHEN a.motivo_cancelamento IS NULL THEN 1 END) as sem_motivo
FROM agendamentos a
WHERE a.status = 'faltou' AND a.data >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', a.data)
ORDER BY mes DESC;

-- Relatório de receita diária (últimos 30 dias)
SELECT 
    'Receita Diária' as categoria,
    DATE(a.data) as data_agendamento,
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as agendamentos_concluidos,
    COALESCE(SUM(CASE WHEN a.status = 'concluido' THEN a.valor_total ELSE 0 END), 0) as receita_dia,
    COALESCE(SUM(CASE WHEN pg.status = 'pago' THEN pg.valor ELSE 0 END), 0) as receita_paga
FROM agendamentos a
LEFT JOIN pagamentos pg ON a.id = pg.agendamento_id
WHERE a.data >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(a.data)
ORDER BY data_agendamento DESC;

-- =====================================================
-- FIM DO SCRIPT RELATÓRIOS
-- =====================================================

-- Este script cria dados de exemplo para:
-- - Agendamentos históricos (últimos 90 dias)
-- - Pagamentos para relatórios financeiros
-- - Dados para relatórios por profissional
-- - Dados para relatórios por serviço
-- - Dados para relatórios de pagamento
-- - Dados para relatórios de pacientes
-- - Dados para relatórios de horários
-- - Dados para relatórios de cancelamentos e faltas
