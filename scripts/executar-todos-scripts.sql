-- =====================================================
-- SCRIPT DE EXECUÇÃO EM LOTE
-- =====================================================
-- Este script executa todos os scripts na ordem correta
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- AVISO IMPORTANTE
-- =====================================================
-- Este script executa TODOS os scripts de uma vez
-- Certifique-se de que:
-- 1. Você está em um ambiente de desenvolvimento
-- 2. Fez backup dos dados existentes
-- 3. Tem permissão para executar scripts
-- 4. O banco de dados está vazio ou pode ser limpo

-- =====================================================
-- 1. SCRIPT PRINCIPAL (OBRIGATÓRIO)
-- =====================================================

-- Executar script principal
\i 00-setup-completo-sistema.sql

-- =====================================================
-- 2. SCRIPTS DE DADOS (OPCIONAIS)
-- =====================================================

-- Executar script de dashboard
\i 01-dashboard-dados.sql

-- Executar script de pacientes
\i 02-pacientes-dados.sql

-- Executar script de profissionais
\i 03-profissionais-dados.sql

-- Executar script de serviços
\i 04-servicos-dados.sql

-- Executar script de agenda
\i 05-agenda-dados.sql

-- Executar script de relatórios
\i 06-relatorios-dados.sql

-- Executar script de configurações
\i 07-configuracoes-dados.sql

-- Executar script de notificações
\i 08-notificacoes-dados.sql

-- Executar script de usuários
\i 09-usuarios-dados.sql

-- Executar script de permissões
\i 10-permissoes-dados.sql

-- =====================================================
-- 3. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    'Verificação de Tabelas' as categoria,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'usuarios', 'pacientes', 'profissionais', 'servicos', 
    'agendamentos', 'pagamentos', 'configuracoes', 
    'audit_log', 'notificacoes', 'backups', 'permissoes',
    'usuario_permissoes', 'nivel_permissoes'
)
ORDER BY table_name;

-- Verificar contagem de registros
SELECT 
    'Contagem de Registros' as categoria,
    'usuarios' as tabela,
    COUNT(*) as total
FROM usuarios
UNION ALL
SELECT 
    'Contagem de Registros' as categoria,
    'pacientes' as tabela,
    COUNT(*) as total
FROM pacientes
UNION ALL
SELECT 
    'Contagem de Registros' as categoria,
    'profissionais' as tabela,
    COUNT(*) as total
FROM profissionais
UNION ALL
SELECT 
    'Contagem de Registros' as categoria,
    'servicos' as tabela,
    COUNT(*) as total
FROM servicos
UNION ALL
SELECT 
    'Contagem de Registros' as categoria,
    'agendamentos' as tabela,
    COUNT(*) as total
FROM agendamentos
UNION ALL
SELECT 
    'Contagem de Registros' as categoria,
    'pagamentos' as tabela,
    COUNT(*) as total
FROM pagamentos
UNION ALL
SELECT 
    'Contagem de Registros' as categoria,
    'configuracoes' as tabela,
    COUNT(*) as total
FROM configuracoes
UNION ALL
SELECT 
    'Contagem de Registros' as categoria,
    'notificacoes' as tabela,
    COUNT(*) as total
FROM notificacoes
UNION ALL
SELECT 
    'Contagem de Registros' as categoria,
    'permissoes' as tabela,
    COUNT(*) as total
FROM permissoes
ORDER BY tabela;

-- =====================================================
-- FIM DO SCRIPT DE EXECUÇÃO EM LOTE
-- =====================================================

-- Este script executa todos os scripts na ordem correta
-- Execute apenas se tiver certeza de que quer popular o banco
-- com todos os dados de exemplo
