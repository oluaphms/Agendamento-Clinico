-- =====================================================
-- SCRIPT DE EXECUÇÃO CORRIGIDO
-- =====================================================
-- Execute os scripts na ordem correta para evitar erros

-- =====================================================
-- 1. SCRIPT PRINCIPAL (OBRIGATÓRIO)
-- =====================================================

-- Execute primeiro: 00-setup-completo-sistema-corrigido.sql
-- Este script cria toda a estrutura base do sistema

-- =====================================================
-- 2. SCRIPTS DE DADOS (OPCIONAIS)
-- =====================================================

-- Execute segundo: 02-pacientes-dados-corrigido.sql
-- Este script popula dados para a página Pacientes

-- Execute terceiro: 03-profissionais-dados-corrigido.sql
-- Este script popula dados para a página Profissionais

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
    'audit_log', 'notificacoes', 'backups'
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
ORDER BY tabela;

-- =====================================================
-- FIM DO SCRIPT DE EXECUÇÃO
-- =====================================================

-- INSTRUÇÕES:
-- 1. Execute primeiro: 00-setup-completo-sistema-corrigido.sql
-- 2. Execute segundo: 02-pacientes-dados-corrigido.sql
-- 3. Execute terceiro: 03-profissionais-dados-corrigido.sql
-- 4. Execute este script para verificar se tudo está funcionando
