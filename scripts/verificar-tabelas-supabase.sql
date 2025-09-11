-- =====================================================
-- SCRIPT DE VERIFICAÇÃO DE TABELAS DO SUPABASE
-- =====================================================
-- Este script verifica quais tabelas existem no Supabase
-- e quais ainda precisam ser criadas para o sistema clínico

-- =====================================================
-- 1. LISTAR TODAS AS TABELAS EXISTENTES
-- =====================================================

-- Mostrar todas as tabelas do schema public
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- 2. VERIFICAR TABELAS ESPECÍFICAS DO SISTEMA CLÍNICO
-- =====================================================

-- Lista das tabelas esperadas no sistema clínico
WITH tabelas_esperadas AS (
    SELECT unnest(ARRAY[
        'usuarios',
        'pacientes', 
        'profissionais',
        'servicos',
        'agendamentos',
        'pagamentos',
        'configuracoes',
        'audit_log',
        'notificacoes',
        'backups'
    ]) AS tabela_esperada
),
tabelas_existentes AS (
    SELECT tablename AS tabela_existente
    FROM pg_tables 
    WHERE schemaname = 'public'
)
SELECT 
    te.tabela_esperada,
    CASE 
        WHEN tex.tabela_existente IS NOT NULL THEN '✅ EXISTE'
        ELSE '❌ FALTA CRIAR'
    END AS status,
    CASE 
        WHEN tex.tabela_existente IS NOT NULL THEN 'Tabela já existe no banco'
        ELSE 'Tabela precisa ser criada'
    END AS observacao
FROM tabelas_esperadas te
LEFT JOIN tabelas_existentes tex ON te.tabela_esperada = tex.tabela_existente
ORDER BY te.tabela_esperada;

-- =====================================================
-- 3. VERIFICAR ESTRUTURA DAS TABELAS EXISTENTES
-- =====================================================

-- Verificar colunas das tabelas principais (se existirem)
DO $$
DECLARE
    tabela_name TEXT;
    tabelas_principais TEXT[] := ARRAY['usuarios', 'pacientes', 'profissionais', 'servicos', 'agendamentos'];
BEGIN
    FOREACH tabela_name IN ARRAY tabelas_principais
    LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = tabela_name AND schemaname = 'public') THEN
            RAISE NOTICE '=== ESTRUTURA DA TABELA: % ===', UPPER(tabela_name);
            FOR tabela_name IN 
                SELECT column_name || ' (' || data_type || ')' as coluna_info
                FROM information_schema.columns 
                WHERE table_name = tabela_name AND table_schema = 'public'
                ORDER BY ordinal_position
            LOOP
                RAISE NOTICE '%', tabela_name;
            END LOOP;
            RAISE NOTICE '';
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- 4. VERIFICAR ÍNDICES EXISTENTES
-- =====================================================

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- 5. VERIFICAR TIPOS CUSTOMIZADOS (ENUMS)
-- =====================================================

SELECT 
    t.typname as tipo_nome,
    e.enumlabel as valor_enum
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('status_usuario', 'nivel_acesso', 'status_agendamento', 'status_pagamento', 'forma_pagamento', 'tipo_auditoria')
ORDER BY t.typname, e.enumsortorder;

-- =====================================================
-- 6. VERIFICAR FUNÇÕES E TRIGGERS
-- =====================================================

-- Verificar funções existentes
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Verificar triggers existentes
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 7. VERIFICAR VIEWS EXISTENTES
-- =====================================================

SELECT 
    table_name as view_name,
    view_definition
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- 8. RESUMO GERAL DO STATUS
-- =====================================================

WITH status_tabelas AS (
    SELECT 
        CASE 
            WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'usuarios' AND schemaname = 'public') THEN 1 ELSE 0 
        END as usuarios,
        CASE 
            WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'pacientes' AND schemaname = 'public') THEN 1 ELSE 0 
        END as pacientes,
        CASE 
            WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profissionais' AND schemaname = 'public') THEN 1 ELSE 0 
        END as profissionais,
        CASE 
            WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'servicos' AND schemaname = 'public') THEN 1 ELSE 0 
        END as servicos,
        CASE 
            WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'agendamentos' AND schemaname = 'public') THEN 1 ELSE 0 
        END as agendamentos,
        CASE 
            WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'pagamentos' AND schemaname = 'public') THEN 1 ELSE 0 
        END as pagamentos,
        CASE 
            WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'configuracoes' AND schemaname = 'public') THEN 1 ELSE 0 
        END as configuracoes,
        CASE 
            WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'audit_log' AND schemaname = 'public') THEN 1 ELSE 0 
        END as audit_log,
        CASE 
            WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'notificacoes' AND schemaname = 'public') THEN 1 ELSE 0 
        END as notificacoes,
        CASE 
            WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'backups' AND schemaname = 'public') THEN 1 ELSE 0 
        END as backups
)
SELECT 
    'RESUMO GERAL' as categoria,
    (usuarios + pacientes + profissionais + servicos + agendamentos + pagamentos + configuracoes + audit_log + notificacoes + backups) as tabelas_criadas,
    10 as total_tabelas,
    ROUND(
        (usuarios + pacientes + profissionais + servicos + agendamentos + pagamentos + configuracoes + audit_log + notificacoes + backups) * 100.0 / 10, 
        2
    ) as percentual_completo
FROM status_tabelas;

-- =====================================================
-- 9. COMANDOS PARA CRIAR TABELAS FALTANTES
-- =====================================================

-- Gerar comandos CREATE TABLE para tabelas que não existem
DO $$
DECLARE
    tabela_name TEXT;
    tabelas_faltantes TEXT[] := ARRAY[]::TEXT[];
    tabelas_esperadas TEXT[] := ARRAY['usuarios', 'pacientes', 'profissionais', 'servicos', 'agendamentos', 'pagamentos', 'configuracoes', 'audit_log', 'notificacoes', 'backups'];
BEGIN
    -- Verificar quais tabelas faltam
    FOREACH tabela_name IN ARRAY tabelas_esperadas
    LOOP
        IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = tabela_name AND schemaname = 'public') THEN
            tabelas_faltantes := array_append(tabelas_faltantes, tabela_name);
        END IF;
    END LOOP;
    
    -- Mostrar tabelas faltantes
    IF array_length(tabelas_faltantes, 1) > 0 THEN
        RAISE NOTICE 'TABELAS QUE PRECISAM SER CRIADAS:';
        FOREACH tabela_name IN ARRAY tabelas_faltantes
        LOOP
            RAISE NOTICE '- %', tabela_name;
        END LOOP;
        RAISE NOTICE '';
        RAISE NOTICE 'Para criar as tabelas faltantes, execute o script: 00-setup-completo-sistema-corrigido.sql';
    ELSE
        RAISE NOTICE 'TODAS AS TABELAS PRINCIPAIS JÁ EXISTEM! ✅';
    END IF;
END $$;

-- =====================================================
-- 10. VERIFICAÇÃO DE DADOS INICIAIS
-- =====================================================

-- Verificar se existem dados nas tabelas principais
SELECT 
    'usuarios' as tabela,
    COUNT(*) as total_registros
FROM usuarios
UNION ALL
SELECT 
    'pacientes' as tabela,
    COUNT(*) as total_registros
FROM pacientes
UNION ALL
SELECT 
    'profissionais' as tabela,
    COUNT(*) as total_registros
FROM profissionais
UNION ALL
SELECT 
    'servicos' as tabela,
    COUNT(*) as total_registros
FROM servicos
UNION ALL
SELECT 
    'agendamentos' as tabela,
    COUNT(*) as total_registros
FROM agendamentos
UNION ALL
SELECT 
    'configuracoes' as tabela,
    COUNT(*) as total_registros
FROM configuracoes
ORDER BY tabela;

-- =====================================================
-- FIM DO SCRIPT DE VERIFICAÇÃO
-- =====================================================

-- INSTRUÇÕES DE USO:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Verifique os resultados de cada seção
-- 3. Se alguma tabela estiver faltando, execute o script de setup
-- 4. Monitore o percentual de completude do sistema
