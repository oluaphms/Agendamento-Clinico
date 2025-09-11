-- =====================================================
-- SCRIPT PARA PÁGINA CONFIGURAÇÕES
-- =====================================================
-- Este script popula dados para a página Configurações
-- Execute APÓS o script principal (00-setup-completo-sistema.sql)

-- =====================================================
-- 1. CONFIGURAÇÕES ADICIONAIS DO SISTEMA
-- =====================================================

-- Inserir configurações adicionais
INSERT INTO configuracoes (chave, valor, descricao, categoria) VALUES
-- Configurações de sistema
('nomeClinica', '{"valor": "Clínica Médica São Paulo", "tipo": "texto"}', 'Nome da clínica', 'sistema'),
('enderecoClinica', '{"valor": "Rua das Flores, 123 - Centro", "tipo": "texto"}', 'Endereço da clínica', 'sistema'),
('telefoneClinica', '{"valor": "(11) 99999-9999", "tipo": "texto"}', 'Telefone da clínica', 'sistema'),
('emailClinica', '{"valor": "contato@clinica.com", "tipo": "email"}', 'Email da clínica', 'sistema'),
('cnpjClinica', '{"valor": "12.345.678/0001-90", "tipo": "texto"}', 'CNPJ da clínica', 'sistema'),
('horarioFuncionamento', '{"valor": "Segunda a Sexta: 08:00 às 18:00", "tipo": "texto"}', 'Horário de funcionamento', 'sistema'),

-- Configurações de notificações
('notificacoesEmail', '{"valor": true, "tipo": "boolean"}', 'Habilitar notificações por email', 'notificacoes'),
('notificacoesSMS', '{"valor": true, "tipo": "boolean"}', 'Habilitar notificações por SMS', 'notificacoes'),
('lembretesAgendamento', '{"valor": true, "tipo": "boolean"}', 'Enviar lembretes de agendamento', 'notificacoes'),
('tempoLembrete', '{"valor": 24, "tipo": "numero"}', 'Horas antes do agendamento para enviar lembrete', 'notificacoes'),
('emailRemetente', '{"valor": "noreply@clinica.com", "tipo": "email"}', 'Email remetente das notificações', 'notificacoes'),

-- Configurações de segurança
('tempoSessao', '{"valor": 480, "tipo": "numero"}', 'Tempo de sessão em minutos', 'seguranca'),
('tentativasLogin', '{"valor": 3, "tipo": "numero"}', 'Número máximo de tentativas de login', 'seguranca'),
('senhaMinima', '{"valor": 8, "tipo": "numero"}', 'Tamanho mínimo da senha', 'seguranca'),
('requerMaiuscula', '{"valor": true, "tipo": "boolean"}', 'Requer letra maiúscula na senha', 'seguranca'),
('requerMinuscula', '{"valor": true, "tipo": "boolean"}', 'Requer letra minúscula na senha', 'seguranca'),
('requerNumero', '{"valor": true, "tipo": "boolean"}', 'Requer número na senha', 'seguranca'),
('requerSimbolo', '{"valor": false, "tipo": "boolean"}', 'Requer símbolo na senha', 'seguranca'),
('bloqueioTemporario', '{"valor": 30, "tipo": "numero"}', 'Minutos de bloqueio após tentativas excedidas', 'seguranca'),

-- Configurações de interface
('tema', '{"valor": "escuro", "tipo": "select", "opcoes": ["claro", "escuro", "auto"]}', 'Tema da interface', 'interface'),
('idioma', '{"valor": "pt", "tipo": "select", "opcoes": ["pt", "en", "es"]}', 'Idioma da interface', 'interface'),
('fusoHorario', '{"valor": "America/Sao_Paulo", "tipo": "select", "opcoes": ["America/Sao_Paulo", "America/New_York", "Europe/London"]}', 'Fuso horário', 'interface'),
('formatoData', '{"valor": "DD/MM/YYYY", "tipo": "select", "opcoes": ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]}', 'Formato de data', 'interface'),
('formatoHora', '{"valor": "24h", "tipo": "select", "opcoes": ["12h", "24h"]}', 'Formato de hora', 'interface'),
('itensPorPagina', '{"valor": 10, "tipo": "numero"}', 'Itens por página nas listagens', 'interface'),

-- Configurações de backup
('backupAutomatico', '{"valor": true, "tipo": "boolean"}', 'Habilitar backup automático', 'backup'),
('frequenciaBackup', '{"valor": "diario", "tipo": "select", "opcoes": ["diario", "semanal", "mensal"]}', 'Frequência do backup', 'backup'),
('horarioBackup', '{"valor": "02:00", "tipo": "time"}', 'Horário do backup automático', 'backup'),
('manterBackups', '{"valor": 30, "tipo": "numero"}', 'Dias para manter backups', 'backup'),
('backupCloud', '{"valor": false, "tipo": "boolean"}', 'Fazer backup na nuvem', 'backup'),

-- Configurações de agendamento
('antecipacaoMinima', '{"valor": 24, "tipo": "numero"}', 'Horas mínimas de antecedência para agendamento', 'agendamento'),
('antecipacaoMaxima', '{"valor": 90, "tipo": "numero"}', 'Dias máximos de antecedência para agendamento', 'agendamento'),
('duracaoPadrao', '{"valor": 30, "tipo": "numero"}', 'Duração padrão dos agendamentos em minutos', 'agendamento'),
('intervaloAgendamento', '{"valor": 15, "tipo": "numero"}', 'Intervalo entre agendamentos em minutos', 'agendamento'),
('permitirAgendamentoFimSemana', '{"valor": false, "tipo": "boolean"}', 'Permitir agendamentos no fim de semana', 'agendamento'),
('permitirAgendamentoFeriado', '{"valor": false, "tipo": "boolean"}', 'Permitir agendamentos em feriados', 'agendamento'),

-- Configurações de pagamento
('aceitarDinheiro', '{"valor": true, "tipo": "boolean"}', 'Aceitar pagamento em dinheiro', 'pagamento'),
('aceitarCartao', '{"valor": true, "tipo": "boolean"}', 'Aceitar pagamento com cartão', 'pagamento'),
('aceitarPix', '{"valor": true, "tipo": "boolean"}', 'Aceitar pagamento via PIX', 'pagamento'),
('aceitarConvenio', '{"valor": true, "tipo": "boolean"}', 'Aceitar pagamento via convênio', 'pagamento'),
('descontoDinheiro', '{"valor": 5, "tipo": "numero"}', 'Desconto para pagamento em dinheiro (%)', 'pagamento'),
('acrescimoCartao', '{"valor": 3, "tipo": "numero"}', 'Acréscimo para pagamento com cartão (%)', 'pagamento'),

-- Configurações de relatórios
('relatorioPadrao', '{"valor": "mensal", "tipo": "select", "opcoes": ["diario", "semanal", "mensal", "anual"]}', 'Período padrão dos relatórios', 'relatorios'),
('incluirCancelamentos', '{"valor": true, "tipo": "boolean"}', 'Incluir cancelamentos nos relatórios', 'relatorios'),
('incluirFaltas', '{"valor": true, "tipo": "boolean"}', 'Incluir faltas nos relatórios', 'relatorios'),
('formatoRelatorio', '{"valor": "pdf", "tipo": "select", "opcoes": ["pdf", "excel", "csv"]}', 'Formato padrão dos relatórios', 'relatorios'),

-- Configurações de integração
('integracaoWhatsApp', '{"valor": false, "tipo": "boolean"}', 'Integração com WhatsApp', 'integracao'),
('tokenWhatsApp', '{"valor": "", "tipo": "texto"}', 'Token do WhatsApp', 'integracao'),
('integracaoEmail', '{"valor": true, "tipo": "boolean"}', 'Integração com serviço de email', 'integracao'),
('smtpServidor', '{"valor": "smtp.gmail.com", "tipo": "texto"}', 'Servidor SMTP', 'integracao'),
('smtpPorta', '{"valor": 587, "tipo": "numero"}', 'Porta SMTP', 'integracao'),
('smtpUsuario', '{"valor": "", "tipo": "email"}', 'Usuário SMTP', 'integracao'),
('smtpSenha', '{"valor": "", "tipo": "password"}', 'Senha SMTP', 'integracao')
ON CONFLICT (chave) DO NOTHING;

-- =====================================================
-- 2. CONSULTAS ÚTEIS PARA PÁGINA CONFIGURAÇÕES
-- =====================================================

-- Listar todas as configurações por categoria
SELECT 
    'Configurações por Categoria' as categoria,
    categoria as categoria_nome,
    COUNT(*) as total_configuracoes,
    COUNT(CASE WHEN valor->>'tipo' = 'boolean' THEN 1 END) as configuracoes_boolean,
    COUNT(CASE WHEN valor->>'tipo' = 'numero' THEN 1 END) as configuracoes_numero,
    COUNT(CASE WHEN valor->>'tipo' = 'texto' THEN 1 END) as configuracoes_texto,
    COUNT(CASE WHEN valor->>'tipo' = 'select' THEN 1 END) as configuracoes_select
FROM configuracoes
GROUP BY categoria
ORDER BY categoria;

-- Configurações do sistema
SELECT 
    'Configurações do Sistema' as categoria,
    chave,
    valor->>'valor' as valor_atual,
    valor->>'tipo' as tipo,
    descricao
FROM configuracoes
WHERE categoria = 'sistema'
ORDER BY chave;

-- Configurações de notificações
SELECT 
    'Configurações de Notificações' as categoria,
    chave,
    valor->>'valor' as valor_atual,
    valor->>'tipo' as tipo,
    descricao
FROM configuracoes
WHERE categoria = 'notificacoes'
ORDER BY chave;

-- Configurações de segurança
SELECT 
    'Configurações de Segurança' as categoria,
    chave,
    valor->>'valor' as valor_atual,
    valor->>'tipo' as tipo,
    descricao
FROM configuracoes
WHERE categoria = 'seguranca'
ORDER BY chave;

-- Configurações de interface
SELECT 
    'Configurações de Interface' as categoria,
    chave,
    valor->>'valor' as valor_atual,
    valor->>'tipo' as tipo,
    descricao
FROM configuracoes
WHERE categoria = 'interface'
ORDER BY chave;

-- Configurações de backup
SELECT 
    'Configurações de Backup' as categoria,
    chave,
    valor->>'valor' as valor_atual,
    valor->>'tipo' as tipo,
    descricao
FROM configuracoes
WHERE categoria = 'backup'
ORDER BY chave;

-- Configurações de agendamento
SELECT 
    'Configurações de Agendamento' as categoria,
    chave,
    valor->>'valor' as valor_atual,
    valor->>'tipo' as tipo,
    descricao
FROM configuracoes
WHERE categoria = 'agendamento'
ORDER BY chave;

-- Configurações de pagamento
SELECT 
    'Configurações de Pagamento' as categoria,
    chave,
    valor->>'valor' as valor_atual,
    valor->>'tipo' as tipo,
    descricao
FROM configuracoes
WHERE categoria = 'pagamento'
ORDER BY chave;

-- Configurações de relatórios
SELECT 
    'Configurações de Relatórios' as categoria,
    chave,
    valor->>'valor' as valor_atual,
    valor->>'tipo' as tipo,
    descricao
FROM configuracoes
WHERE categoria = 'relatorios'
ORDER BY chave;

-- Configurações de integração
SELECT 
    'Configurações de Integração' as categoria,
    chave,
    valor->>'valor' as valor_atual,
    valor->>'tipo' as tipo,
    descricao
FROM configuracoes
WHERE categoria = 'integracao'
ORDER BY chave;

-- =====================================================
-- 3. DADOS PARA TESTE DE CONFIGURAÇÕES
-- =====================================================

-- Atualizar algumas configurações para teste
UPDATE configuracoes 
SET valor = '{"valor": "Clínica Médica Teste", "tipo": "texto"}'
WHERE chave = 'nomeClinica';

UPDATE configuracoes 
SET valor = '{"valor": "claro", "tipo": "select", "opcoes": ["claro", "escuro", "auto"]}'
WHERE chave = 'tema';

UPDATE configuracoes 
SET valor = '{"valor": 20, "tipo": "numero"}'
WHERE chave = 'itensPorPagina';

-- =====================================================
-- FIM DO SCRIPT CONFIGURAÇÕES
-- =====================================================

-- Este script cria dados de exemplo para:
-- - Configurações do sistema
-- - Configurações de notificações
-- - Configurações de segurança
-- - Configurações de interface
-- - Configurações de backup
-- - Configurações de agendamento
-- - Configurações de pagamento
-- - Configurações de relatórios
-- - Configurações de integração
