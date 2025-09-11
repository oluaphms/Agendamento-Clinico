-- =====================================================
-- SCRIPT PARA PÁGINA NOTIFICAÇÕES
-- =====================================================
-- Este script popula dados para a página Notificações
-- Execute APÓS o script principal (00-setup-completo-sistema.sql)

-- =====================================================
-- 1. NOTIFICAÇÕES DE EXEMPLO
-- =====================================================

-- Inserir notificações para diferentes usuários
INSERT INTO notificacoes (usuario_id, titulo, mensagem, tipo, lida, data_leitura) VALUES
-- Notificações para o administrador
((SELECT id FROM usuarios WHERE email = 'admin@clinica.com'), 'Novo agendamento', 'Paciente Maria Silva agendou consulta para hoje às 09:00', 'info', false, NULL),
((SELECT id FROM usuarios WHERE email = 'admin@clinica.com'), 'Pagamento recebido', 'Pagamento de R$ 150,00 recebido via PIX', 'success', false, NULL),
((SELECT id FROM usuarios WHERE email = 'admin@clinica.com'), 'Agendamento cancelado', 'Consulta de João Costa foi cancelada', 'warning', false, NULL),
((SELECT id FROM usuarios WHERE email = 'admin@clinica.com'), 'Sistema atualizado', 'Sistema foi atualizado para a versão 2.1.0', 'info', true, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
((SELECT id FROM usuarios WHERE email = 'admin@clinica.com'), 'Backup realizado', 'Backup automático foi realizado com sucesso', 'success', true, CURRENT_TIMESTAMP - INTERVAL '1 day'),
((SELECT id FROM usuarios WHERE email = 'admin@clinica.com'), 'Erro no sistema', 'Erro ao processar pagamento do agendamento #123', 'error', false, NULL),
((SELECT id FROM usuarios WHERE email = 'admin@clinica.com'), 'Novo paciente cadastrado', 'Carlos Eduardo foi cadastrado no sistema', 'info', true, CURRENT_TIMESTAMP - INTERVAL '3 hours'),
((SELECT id FROM usuarios WHERE email = 'admin@clinica.com'), 'Relatório gerado', 'Relatório mensal foi gerado com sucesso', 'success', true, CURRENT_TIMESTAMP - INTERVAL '2 days'),
((SELECT id FROM usuarios WHERE email = 'admin@clinica.com'), 'Profissional inativo', 'Dr. João Silva não tem agendamentos há 30 dias', 'warning', false, NULL),
((SELECT id FROM usuarios WHERE email = 'admin@clinica.com'), 'Sistema lento', 'Sistema está respondendo lentamente', 'error', false, NULL),

-- Notificações para a recepcionista
((SELECT id FROM usuarios WHERE email = 'recepcao@clinica.com'), 'Lembrete de agendamento', 'Consulta de Ana Paula em 30 minutos', 'info', false, NULL),
((SELECT id FROM usuarios WHERE email = 'recepcao@clinica.com'), 'Novo paciente cadastrado', 'Fernanda Rodrigues foi cadastrada no sistema', 'info', true, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
((SELECT id FROM usuarios WHERE email = 'recepcao@clinica.com'), 'Agendamento confirmado', 'Consulta de Roberto Lima foi confirmada', 'success', true, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
((SELECT id FROM usuarios WHERE email = 'recepcao@clinica.com'), 'Paciente faltou', 'Paciente Patricia Mendes não compareceu', 'warning', false, NULL),
((SELECT id FROM usuarios WHERE email = 'recepcao@clinica.com'), 'Pagamento pendente', 'Pagamento de R$ 200,00 está pendente há 3 dias', 'warning', false, NULL),
((SELECT id FROM usuarios WHERE email = 'recepcao@clinica.com'), 'Agendamento duplicado', 'Possível agendamento duplicado detectado', 'error', false, NULL),
((SELECT id FROM usuarios WHERE email = 'recepcao@clinica.com'), 'Novo profissional', 'Dr. Carlos Silva foi cadastrado no sistema', 'info', true, CURRENT_TIMESTAMP - INTERVAL '4 hours'),
((SELECT id FROM usuarios WHERE email = 'recepcao@clinica.com'), 'Consulta concluída', 'Consulta de Marcos Antonio foi concluída', 'success', true, CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
((SELECT id FROM usuarios WHERE email = 'recepcao@clinica.com'), 'Sistema em manutenção', 'Sistema estará em manutenção das 02:00 às 04:00', 'info', true, CURRENT_TIMESTAMP - INTERVAL '1 day'),
((SELECT id FROM usuarios WHERE email = 'recepcao@clinica.com'), 'Erro ao enviar email', 'Falha ao enviar lembrete por email', 'error', false, NULL),

-- Notificações para o desenvolvedor
((SELECT id FROM usuarios WHERE email = 'dev@clinica.com'), 'Erro crítico', 'Erro 500 no endpoint de agendamentos', 'error', false, NULL),
((SELECT id FROM usuarios WHERE email = 'dev@clinica.com'), 'Sistema atualizado', 'Deploy da versão 2.1.0 realizado com sucesso', 'success', true, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
((SELECT id FROM usuarios WHERE email = 'dev@clinica.com'), 'Backup falhou', 'Backup automático falhou - espaço em disco insuficiente', 'error', false, NULL),
((SELECT id FROM usuarios WHERE email = 'dev@clinica.com'), 'Nova funcionalidade', 'Funcionalidade de relatórios foi implementada', 'info', true, CURRENT_TIMESTAMP - INTERVAL '3 days'),
((SELECT id FROM usuarios WHERE email = 'dev@clinica.com'), 'Performance baixa', 'Tempo de resposta do banco de dados está alto', 'warning', false, NULL),
((SELECT id FROM usuarios WHERE email = 'dev@clinica.com'), 'Teste concluído', 'Testes automatizados foram executados com sucesso', 'success', true, CURRENT_TIMESTAMP - INTERVAL '6 hours'),
((SELECT id FROM usuarios WHERE email = 'dev@clinica.com'), 'Dependência desatualizada', 'Biblioteca React precisa ser atualizada', 'warning', false, NULL),
((SELECT id FROM usuarios WHERE email = 'dev@clinica.com'), 'Log de erro', 'Múltiplos erros 404 detectados', 'error', false, NULL),
((SELECT id FROM usuarios WHERE email = 'dev@clinica.com'), 'Monitoramento', 'Sistema está funcionando normalmente', 'info', true, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
((SELECT id FROM usuarios WHERE email = 'dev@clinica.com'), 'Deploy agendado', 'Deploy da versão 2.2.0 agendado para amanhã', 'info', false, NULL)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. NOTIFICAÇÕES HISTÓRICAS (PARA TESTE DE FILTROS)
-- =====================================================

-- Inserir notificações antigas para teste de filtros
INSERT INTO notificacoes (usuario_id, titulo, mensagem, tipo, lida, data_leitura, created_at) VALUES
-- Notificações de 1 semana atrás
((SELECT id FROM usuarios WHERE email = 'admin@clinica.com'), 'Relatório semanal', 'Relatório semanal foi gerado', 'info', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '7 days'),
((SELECT id FROM usuarios WHERE email = 'recepcao@clinica.com'), 'Backup semanal', 'Backup semanal foi realizado', 'success', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '7 days'),
((SELECT id FROM usuarios WHERE email = 'dev@clinica.com'), 'Atualização de segurança', 'Atualização de segurança foi aplicada', 'info', true, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '7 days'),

-- Notificações de 2 semanas atrás
((SELECT id FROM usuarios WHERE email = 'admin@clinica.com'), 'Relatório mensal', 'Relatório mensal foi gerado', 'info', true, CURRENT_TIMESTAMP - INTERVAL '14 days', CURRENT_TIMESTAMP - INTERVAL '14 days'),
((SELECT id FROM usuarios WHERE email = 'recepcao@clinica.com'), 'Manutenção programada', 'Manutenção programada foi realizada', 'success', true, CURRENT_TIMESTAMP - INTERVAL '14 days', CURRENT_TIMESTAMP - INTERVAL '14 days'),
((SELECT id FROM usuarios WHERE email = 'dev@clinica.com'), 'Deploy realizado', 'Deploy da versão 2.0.0 foi realizado', 'success', true, CURRENT_TIMESTAMP - INTERVAL '14 days', CURRENT_TIMESTAMP - INTERVAL '14 days'),

-- Notificações de 1 mês atrás
((SELECT id FROM usuarios WHERE email = 'admin@clinica.com'), 'Relatório anual', 'Relatório anual foi gerado', 'info', true, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP - INTERVAL '30 days'),
((SELECT id FROM usuarios WHERE email = 'recepcao@clinica.com'), 'Sistema migrado', 'Sistema foi migrado para novo servidor', 'info', true, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP - INTERVAL '30 days'),
((SELECT id FROM usuarios WHERE email = 'dev@clinica.com'), 'Nova versão', 'Nova versão do sistema foi lançada', 'info', true, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP - INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. CONSULTAS ÚTEIS PARA PÁGINA NOTIFICAÇÕES
-- =====================================================

-- Estatísticas de notificações
SELECT 
    'Estatísticas de Notificações' as categoria,
    COUNT(*) as total_notificacoes,
    COUNT(CASE WHEN lida = true THEN 1 END) as notificacoes_lidas,
    COUNT(CASE WHEN lida = false THEN 1 END) as notificacoes_nao_lidas,
    COUNT(CASE WHEN tipo = 'info' THEN 1 END) as notificacoes_info,
    COUNT(CASE WHEN tipo = 'success' THEN 1 END) as notificacoes_success,
    COUNT(CASE WHEN tipo = 'warning' THEN 1 END) as notificacoes_warning,
    COUNT(CASE WHEN tipo = 'error' THEN 1 END) as notificacoes_error
FROM notificacoes;

-- Notificações por usuário
SELECT 
    'Notificações por Usuário' as categoria,
    u.nome as usuario,
    u.email,
    COUNT(*) as total_notificacoes,
    COUNT(CASE WHEN n.lida = true THEN 1 END) as lidas,
    COUNT(CASE WHEN n.lida = false THEN 1 END) as nao_lidas
FROM notificacoes n
JOIN usuarios u ON n.usuario_id = u.id
GROUP BY u.id, u.nome, u.email
ORDER BY total_notificacoes DESC;

-- Notificações por tipo
SELECT 
    'Notificações por Tipo' as categoria,
    tipo,
    COUNT(*) as quantidade,
    COUNT(CASE WHEN lida = true THEN 1 END) as lidas,
    COUNT(CASE WHEN lida = false THEN 1 END) as nao_lidas
FROM notificacoes
GROUP BY tipo
ORDER BY quantidade DESC;

-- Notificações recentes (últimas 24 horas)
SELECT 
    'Notificações Recentes' as categoria,
    n.id,
    u.nome as usuario,
    n.titulo,
    n.mensagem,
    n.tipo,
    n.lida,
    n.created_at
FROM notificacoes n
JOIN usuarios u ON n.usuario_id = u.id
WHERE n.created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
ORDER BY n.created_at DESC;

-- Notificações não lidas
SELECT 
    'Notificações Não Lidas' as categoria,
    n.id,
    u.nome as usuario,
    n.titulo,
    n.mensagem,
    n.tipo,
    n.created_at
FROM notificacoes n
JOIN usuarios u ON n.usuario_id = u.id
WHERE n.lida = false
ORDER BY n.created_at DESC;

-- Notificações por dia (últimos 30 dias)
SELECT 
    'Notificações por Dia' as categoria,
    DATE(n.created_at) as data,
    COUNT(*) as total_notificacoes,
    COUNT(CASE WHEN n.lida = true THEN 1 END) as lidas,
    COUNT(CASE WHEN n.lida = false THEN 1 END) as nao_lidas
FROM notificacoes n
WHERE n.created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY DATE(n.created_at)
ORDER BY data DESC;

-- Notificações por hora do dia
SELECT 
    'Notificações por Hora' as categoria,
    EXTRACT(HOUR FROM n.created_at) as hora,
    COUNT(*) as quantidade
FROM notificacoes n
WHERE n.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM n.created_at)
ORDER BY hora;

-- Notificações mais antigas não lidas
SELECT 
    'Notificações Antigas Não Lidas' as categoria,
    n.id,
    u.nome as usuario,
    n.titulo,
    n.mensagem,
    n.tipo,
    n.created_at,
    EXTRACT(DAYS FROM CURRENT_TIMESTAMP - n.created_at) as dias_atras
FROM notificacoes n
JOIN usuarios u ON n.usuario_id = u.id
WHERE n.lida = false
ORDER BY n.created_at ASC
LIMIT 10;

-- Notificações por usuário e tipo
SELECT 
    'Notificações por Usuário e Tipo' as categoria,
    u.nome as usuario,
    n.tipo,
    COUNT(*) as quantidade
FROM notificacoes n
JOIN usuarios u ON n.usuario_id = u.id
GROUP BY u.id, u.nome, n.tipo
ORDER BY u.nome, n.tipo;

-- =====================================================
-- FIM DO SCRIPT NOTIFICAÇÕES
-- =====================================================

-- Este script cria dados de exemplo para:
-- - Notificações para diferentes usuários
-- - Notificações de diferentes tipos
-- - Notificações lidas e não lidas
-- - Notificações históricas
-- - Dados para testes de filtros e busca
-- - Estatísticas e relatórios de notificações
