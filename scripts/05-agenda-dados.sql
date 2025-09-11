-- =====================================================
-- SCRIPT PARA PÁGINA AGENDA
-- =====================================================
-- Este script popula dados para a página Agenda
-- Execute APÓS o script principal (00-setup-completo-sistema.sql)

-- =====================================================
-- 1. DADOS PARA AGENDAMENTOS
-- =====================================================

-- Inserir agendamentos para os próximos 30 dias
INSERT INTO agendamentos (paciente_id, profissional_id, servico_id, data, hora, status, valor_total, duracao_real, observacoes) VALUES
-- Agendamentos de hoje
((SELECT id FROM pacientes WHERE cpf = '12345678901'), (SELECT id FROM profissionais WHERE cpf = '11111111111'), (SELECT id FROM servicos WHERE nome = 'Consulta Médica'), CURRENT_DATE, '09:00', 'agendado', 150.00, NULL, 'Primeira consulta'),
((SELECT id FROM pacientes WHERE cpf = '98765432100'), (SELECT id FROM profissionais WHERE cpf = '22222222222'), (SELECT id FROM servicos WHERE nome = 'Exame de Sangue'), CURRENT_DATE, '10:30', 'confirmado', 80.00, NULL, 'Exame de rotina'),
((SELECT id FROM pacientes WHERE cpf = '11122233344'), (SELECT id FROM profissionais WHERE cpf = '33333333333'), (SELECT id FROM servicos WHERE nome = 'Ultrassom'), CURRENT_DATE, '14:00', 'em_andamento', 200.00, NULL, 'Ultrassom abdominal'),
((SELECT id FROM pacientes WHERE cpf = '55566677788'), (SELECT id FROM profissionais WHERE cpf = '44444444444'), (SELECT id FROM servicos WHERE nome = 'Consulta Médica'), CURRENT_DATE, '15:30', 'agendado', 150.00, NULL, 'Consulta de retorno'),

-- Agendamentos de amanhã
((SELECT id FROM pacientes WHERE cpf = '99988877766'), (SELECT id FROM profissionais WHERE cpf = '11111111111'), (SELECT id FROM servicos WHERE nome = 'Consulta Cardiológica'), CURRENT_DATE + INTERVAL '1 day', '08:00', 'agendado', 300.00, NULL, 'Consulta cardiológica'),
((SELECT id FROM pacientes WHERE cpf = '44433322211'), (SELECT id FROM profissionais WHERE cpf = '22222222222'), (SELECT id FROM servicos WHERE nome = 'Consulta Dermatológica'), CURRENT_DATE + INTERVAL '1 day', '09:30', 'agendado', 250.00, NULL, 'Consulta dermatológica'),
((SELECT id FROM pacientes WHERE cpf = '77788899900'), (SELECT id FROM profissionais WHERE cpf = '33333333333'), (SELECT id FROM servicos WHERE nome = 'Consulta Ortopédica'), CURRENT_DATE + INTERVAL '1 day', '11:00', 'agendado', 280.00, NULL, 'Consulta ortopédica'),
((SELECT id FROM pacientes WHERE cpf = '22211100099'), (SELECT id FROM profissionais WHERE cpf = '44444444444'), (SELECT id FROM servicos WHERE nome = 'Consulta Ginecológica'), CURRENT_DATE + INTERVAL '1 day', '14:00', 'agendado', 220.00, NULL, 'Consulta ginecológica'),

-- Agendamentos da próxima semana
((SELECT id FROM pacientes WHERE cpf = '11111111111'), (SELECT id FROM profissionais WHERE cpf = '55555555555'), (SELECT id FROM servicos WHERE nome = 'Consulta Neurológica'), CURRENT_DATE + INTERVAL '7 days', '09:00', 'agendado', 350.00, NULL, 'Consulta neurológica'),
((SELECT id FROM pacientes WHERE cpf = '22222222222'), (SELECT id FROM profissionais WHERE cpf = '66666666666'), (SELECT id FROM servicos WHERE nome = 'Consulta Pediátrica'), CURRENT_DATE + INTERVAL '7 days', '10:30', 'agendado', 200.00, NULL, 'Consulta pediátrica'),
((SELECT id FROM pacientes WHERE cpf = '33333333333'), (SELECT id FROM profissionais WHERE cpf = '77777777777'), (SELECT id FROM servicos WHERE nome = 'Consulta Oftalmológica'), CURRENT_DATE + INTERVAL '7 days', '14:00', 'agendado', 320.00, NULL, 'Consulta oftalmológica'),
((SELECT id FROM pacientes WHERE cpf = '44444444444'), (SELECT id FROM profissionais WHERE cpf = '88888888888'), (SELECT id FROM servicos WHERE nome = 'Consulta Psiquiátrica'), CURRENT_DATE + INTERVAL '7 days', '15:30', 'agendado', 220.00, NULL, 'Consulta psiquiátrica'),

-- Agendamentos da segunda semana
((SELECT id FROM pacientes WHERE cpf = '55555555555'), (SELECT id FROM profissionais WHERE cpf = '99999999999'), (SELECT id FROM servicos WHERE nome = 'Consulta Urológica'), CURRENT_DATE + INTERVAL '14 days', '08:00', 'agendado', 380.00, NULL, 'Consulta urológica'),
((SELECT id FROM pacientes WHERE cpf = '66666666666'), (SELECT id FROM profissionais WHERE cpf = '00000000000'), (SELECT id FROM servicos WHERE nome = 'Consulta Endocrinológica'), CURRENT_DATE + INTERVAL '14 days', '09:30', 'agendado', 260.00, NULL, 'Consulta endocrinológica'),
((SELECT id FROM pacientes WHERE cpf = '77777777777'), (SELECT id FROM profissionais WHERE cpf = '11111111111'), (SELECT id FROM servicos WHERE nome = 'Eletrocardiograma'), CURRENT_DATE + INTERVAL '14 days', '11:00', 'agendado', 120.00, NULL, 'Exame cardiológico'),
((SELECT id FROM pacientes WHERE cpf = '88888888888'), (SELECT id FROM profissionais WHERE cpf = '22222222222'), (SELECT id FROM servicos WHERE nome = 'Hemograma Completo'), CURRENT_DATE + INTERVAL '14 days', '14:00', 'agendado', 80.00, NULL, 'Exame de rotina'),

-- Agendamentos da terceira semana
((SELECT id FROM pacientes WHERE cpf = '99999999999'), (SELECT id FROM profissionais WHERE cpf = '33333333333'), (SELECT id FROM servicos WHERE nome = 'Ultrassom Abdominal'), CURRENT_DATE + INTERVAL '21 days', '08:00', 'agendado', 200.00, NULL, 'Ultrassom abdominal'),
((SELECT id FROM pacientes WHERE cpf = '00000000000'), (SELECT id FROM profissionais WHERE cpf = '44444444444'), (SELECT id FROM servicos WHERE nome = 'Mamografia'), CURRENT_DATE + INTERVAL '21 days', '09:30', 'agendado', 120.00, NULL, 'Exame de rastreamento'),
((SELECT id FROM pacientes WHERE cpf = '11111111111'), (SELECT id FROM profissionais WHERE cpf = '55555555555'), (SELECT id FROM servicos WHERE nome = 'Teste Ergométrico'), CURRENT_DATE + INTERVAL '21 days', '11:00', 'agendado', 400.00, NULL, 'Teste de esforço'),
((SELECT id FROM pacientes WHERE cpf = '22222222222'), (SELECT id FROM profissionais WHERE cpf = '66666666666'), (SELECT id FROM servicos WHERE nome = 'Endoscopia Digestiva'), CURRENT_DATE + INTERVAL '21 days', '14:00', 'agendado', 350.00, NULL, 'Endoscopia digestiva'),

-- Agendamentos da quarta semana
((SELECT id FROM pacientes WHERE cpf = '33333333333'), (SELECT id FROM profissionais WHERE cpf = '77777777777'), (SELECT id FROM servicos WHERE nome = 'Colonoscopia'), CURRENT_DATE + INTERVAL '28 days', '08:00', 'agendado', 500.00, NULL, 'Colonoscopia'),
((SELECT id FROM pacientes WHERE cpf = '44444444444'), (SELECT id FROM profissionais WHERE cpf = '88888888888'), (SELECT id FROM servicos WHERE nome = 'Botox'), CURRENT_DATE + INTERVAL '28 days', '09:30', 'agendado', 800.00, NULL, 'Aplicação de botox'),
((SELECT id FROM pacientes WHERE cpf = '55555555555'), (SELECT id FROM profissionais WHERE cpf = '99999999999'), (SELECT id FROM servicos WHERE nome = 'Vacina da Gripe'), CURRENT_DATE + INTERVAL '28 days', '11:00', 'agendado', 80.00, NULL, 'Vacina da gripe'),
((SELECT id FROM pacientes WHERE cpf = '66666666666'), (SELECT id FROM profissionais WHERE cpf = '00000000000'), (SELECT id FROM servicos WHERE nome = 'Limpeza de Pele'), CURRENT_DATE + INTERVAL '28 days', '14:00', 'agendado', 200.00, NULL, 'Limpeza de pele')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. AGENDAMENTOS CONCLUÍDOS (PARA HISTÓRICO)
-- =====================================================

-- Inserir agendamentos concluídos dos últimos 30 dias
INSERT INTO agendamentos (paciente_id, profissional_id, servico_id, data, hora, status, valor_total, duracao_real, observacoes) VALUES
-- Agendamentos de ontem
((SELECT id FROM pacientes WHERE cpf = '12345678901'), (SELECT id FROM profissionais WHERE cpf = '11111111111'), (SELECT id FROM servicos WHERE nome = 'Consulta Médica'), CURRENT_DATE - INTERVAL '1 day', '08:30', 'concluido', 150.00, 45, 'Consulta de retorno - paciente estável'),
((SELECT id FROM pacientes WHERE cpf = '98765432100'), (SELECT id FROM profissionais WHERE cpf = '22222222222'), (SELECT id FROM servicos WHERE nome = 'Exame de Sangue'), CURRENT_DATE - INTERVAL '1 day', '10:00', 'concluido', 80.00, 15, 'Exame de rotina - resultados normais'),

-- Agendamentos da semana passada
((SELECT id FROM pacientes WHERE cpf = '11122233344'), (SELECT id FROM profissionais WHERE cpf = '33333333333'), (SELECT id FROM servicos WHERE nome = 'Ultrassom'), CURRENT_DATE - INTERVAL '7 days', '09:00', 'concluido', 200.00, 30, 'Ultrassom abdominal - sem alterações'),
((SELECT id FROM pacientes WHERE cpf = '55566677788'), (SELECT id FROM profissionais WHERE cpf = '44444444444'), (SELECT id FROM servicos WHERE nome = 'Consulta Médica'), CURRENT_DATE - INTERVAL '7 days', '14:00', 'concluido', 150.00, 40, 'Consulta de rotina'),

-- Agendamentos de 2 semanas atrás
((SELECT id FROM pacientes WHERE cpf = '99988877766'), (SELECT id FROM profissionais WHERE cpf = '11111111111'), (SELECT id FROM servicos WHERE nome = 'Consulta Cardiológica'), CURRENT_DATE - INTERVAL '14 days', '08:00', 'concluido', 300.00, 50, 'Consulta cardiológica - paciente estável'),
((SELECT id FROM pacientes WHERE cpf = '44433322211'), (SELECT id FROM profissionais WHERE cpf = '22222222222'), (SELECT id FROM servicos WHERE nome = 'Consulta Dermatológica'), CURRENT_DATE - INTERVAL '14 days', '10:30', 'concluido', 250.00, 35, 'Consulta dermatológica - tratamento prescrito'),

-- Agendamentos de 3 semanas atrás
((SELECT id FROM pacientes WHERE cpf = '77788899900'), (SELECT id FROM profissionais WHERE cpf = '33333333333'), (SELECT id FROM servicos WHERE nome = 'Consulta Ortopédica'), CURRENT_DATE - INTERVAL '21 days', '09:00', 'concluido', 280.00, 45, 'Consulta ortopédica - fisioterapia prescrita'),
((SELECT id FROM pacientes WHERE cpf = '22211100099'), (SELECT id FROM profissionais WHERE cpf = '44444444444'), (SELECT id FROM servicos WHERE nome = 'Consulta Ginecológica'), CURRENT_DATE - INTERVAL '21 days', '14:00', 'concluido', 220.00, 40, 'Consulta ginecológica - exames solicitados')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. AGENDAMENTOS CANCELADOS (PARA TESTE DE FILTROS)
-- =====================================================

-- Inserir agendamentos cancelados
INSERT INTO agendamentos (paciente_id, profissional_id, servico_id, data, hora, status, valor_total, motivo_cancelamento, observacoes) VALUES
((SELECT id FROM pacientes WHERE cpf = '11111111111'), (SELECT id FROM profissionais WHERE cpf = '55555555555'), (SELECT id FROM servicos WHERE nome = 'Consulta Neurológica'), CURRENT_DATE - INTERVAL '3 days', '09:00', 'cancelado', 350.00, 'Paciente cancelou por motivos pessoais', 'Agendamento cancelado pelo paciente'),
((SELECT id FROM pacientes WHERE cpf = '22222222222'), (SELECT id FROM profissionais WHERE cpf = '66666666666'), (SELECT id FROM servicos WHERE nome = 'Consulta Pediátrica'), CURRENT_DATE - INTERVAL '5 days', '10:30', 'cancelado', 200.00, 'Profissional indisponível', 'Agendamento cancelado pela clínica'),
((SELECT id FROM pacientes WHERE cpf = '33333333333'), (SELECT id FROM profissionais WHERE cpf = '77777777777'), (SELECT id FROM servicos WHERE nome = 'Consulta Oftalmológica'), CURRENT_DATE - INTERVAL '10 days', '14:00', 'cancelado', 320.00, 'Paciente não compareceu', 'Agendamento cancelado por falta')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. CONSULTAS ÚTEIS PARA PÁGINA AGENDA
-- =====================================================

-- Estatísticas de agendamentos
SELECT 
    'Estatísticas de Agendamentos' as categoria,
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN status = 'agendado' THEN 1 END) as agendados,
    COUNT(CASE WHEN status = 'confirmado' THEN 1 END) as confirmados,
    COUNT(CASE WHEN status = 'em_andamento' THEN 1 END) as em_andamento,
    COUNT(CASE WHEN status = 'concluido' THEN 1 END) as concluidos,
    COUNT(CASE WHEN status = 'cancelado' THEN 1 END) as cancelados,
    COUNT(CASE WHEN status = 'faltou' THEN 1 END) as faltou,
    COUNT(CASE WHEN data = CURRENT_DATE THEN 1 END) as agendamentos_hoje,
    COUNT(CASE WHEN data >= CURRENT_DATE AND data <= CURRENT_DATE + INTERVAL '7 days' THEN 1 END) as agendamentos_semana
FROM agendamentos;

-- Agendamentos de hoje
SELECT 
    'Agendamentos de Hoje' as categoria,
    a.id,
    p.nome as paciente,
    pr.nome as profissional,
    s.nome as servico,
    a.hora,
    a.status,
    a.valor_total,
    a.observacoes
FROM agendamentos a
JOIN pacientes p ON a.paciente_id = p.id
JOIN profissionais pr ON a.profissional_id = pr.id
JOIN servicos s ON a.servico_id = s.id
WHERE a.data = CURRENT_DATE
ORDER BY a.hora;

-- Agendamentos da próxima semana
SELECT 
    'Agendamentos da Próxima Semana' as categoria,
    a.data,
    a.hora,
    p.nome as paciente,
    pr.nome as profissional,
    s.nome as servico,
    a.status,
    a.valor_total
FROM agendamentos a
JOIN pacientes p ON a.paciente_id = p.id
JOIN profissionais pr ON a.profissional_id = pr.id
JOIN servicos s ON a.servico_id = s.id
WHERE a.data >= CURRENT_DATE AND a.data <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY a.data, a.hora;

-- Agendamentos por profissional
SELECT 
    'Agendamentos por Profissional' as categoria,
    pr.nome as profissional,
    pr.especialidade,
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as concluidos,
    COUNT(CASE WHEN a.data >= CURRENT_DATE THEN 1 END) as futuros
FROM agendamentos a
JOIN profissionais pr ON a.profissional_id = pr.id
GROUP BY pr.id, pr.nome, pr.especialidade
ORDER BY total_agendamentos DESC;

-- Agendamentos por serviço
SELECT 
    'Agendamentos por Serviço' as categoria,
    s.nome as servico,
    s.categoria as categoria_servico,
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as concluidos,
    AVG(a.valor_total) as valor_medio
FROM agendamentos a
JOIN servicos s ON a.servico_id = s.id
GROUP BY s.id, s.nome, s.categoria
ORDER BY total_agendamentos DESC;

-- Agendamentos por status
SELECT 
    'Agendamentos por Status' as categoria,
    status,
    COUNT(*) as quantidade,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentual
FROM agendamentos
GROUP BY status
ORDER BY quantidade DESC;

-- Agendamentos por dia da semana
SELECT 
    'Agendamentos por Dia da Semana' as categoria,
    CASE EXTRACT(DOW FROM data)
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Segunda-feira'
        WHEN 2 THEN 'Terça-feira'
        WHEN 3 THEN 'Quarta-feira'
        WHEN 4 THEN 'Quinta-feira'
        WHEN 5 THEN 'Sexta-feira'
        WHEN 6 THEN 'Sábado'
    END as dia_semana,
    COUNT(*) as quantidade
FROM agendamentos
WHERE data >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY EXTRACT(DOW FROM data)
ORDER BY EXTRACT(DOW FROM data);

-- Receita por dia (últimos 30 dias)
SELECT 
    'Receita por Dia' as categoria,
    DATE(a.data) as data_agendamento,
    COUNT(*) as total_agendamentos,
    COUNT(CASE WHEN a.status = 'concluido' THEN 1 END) as agendamentos_concluidos,
    COALESCE(SUM(CASE WHEN a.status = 'concluido' THEN a.valor_total ELSE 0 END), 0) as receita_dia
FROM agendamentos a
WHERE a.data >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(a.data)
ORDER BY data_agendamento DESC;

-- =====================================================
-- FIM DO SCRIPT AGENDA
-- =====================================================

-- Este script cria dados de exemplo para:
-- - Agendamentos futuros (próximos 30 dias)
-- - Agendamentos concluídos (histórico)
-- - Agendamentos cancelados
-- - Dados para testes de filtros e busca
-- - Estatísticas e relatórios da agenda
