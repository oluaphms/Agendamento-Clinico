-- =====================================================
-- VERIFICAÇÃO RÁPIDA DE TABELAS - SISTEMA CLÍNICO
-- =====================================================
-- Script simples para verificar rapidamente o status das tabelas

-- 1. VERIFICAR QUAIS TABELAS EXISTEM
SELECT 
    'TABELAS EXISTENTES' as status,
    tablename as nome_tabela
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. VERIFICAR TABELAS DO SISTEMA CLÍNICO
SELECT 
    'usuarios' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'usuarios' AND schemaname = 'public') 
         THEN '✅ EXISTE' ELSE '❌ FALTA' END as status
UNION ALL
SELECT 
    'pacientes' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'pacientes' AND schemaname = 'public') 
         THEN '✅ EXISTE' ELSE '❌ FALTA' END as status
UNION ALL
SELECT 
    'profissionais' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profissionais' AND schemaname = 'public') 
         THEN '✅ EXISTE' ELSE '❌ FALTA' END as status
UNION ALL
SELECT 
    'servicos' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'servicos' AND schemaname = 'public') 
         THEN '✅ EXISTE' ELSE '❌ FALTA' END as status
UNION ALL
SELECT 
    'agendamentos' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'agendamentos' AND schemaname = 'public') 
         THEN '✅ EXISTE' ELSE '❌ FALTA' END as status
UNION ALL
SELECT 
    'pagamentos' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'pagamentos' AND schemaname = 'public') 
         THEN '✅ EXISTE' ELSE '❌ FALTA' END as status
UNION ALL
SELECT 
    'configuracoes' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'configuracoes' AND schemaname = 'public') 
         THEN '✅ EXISTE' ELSE '❌ FALTA' END as status
UNION ALL
SELECT 
    'audit_log' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'audit_log' AND schemaname = 'public') 
         THEN '✅ EXISTE' ELSE '❌ FALTA' END as status
UNION ALL
SELECT 
    'notificacoes' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notificacoes' AND schemaname = 'public') 
         THEN '✅ EXISTE' ELSE '❌ FALTA' END as status
UNION ALL
SELECT 
    'backups' as tabela,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'backups' AND schemaname = 'public') 
         THEN '✅ EXISTE' ELSE '❌ FALTA' END as status
ORDER BY tabela;

-- 3. CONTAR TOTAL DE TABELAS CRIADAS
SELECT 
    COUNT(*) as total_tabelas_criadas,
    'de 10 tabelas esperadas' as observacao
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('usuarios', 'pacientes', 'profissionais', 'servicos', 'agendamentos', 'pagamentos', 'configuracoes', 'audit_log', 'notificacoes', 'backups');
