-- =====================================================
-- SCRIPT PARA LISTAR TABELAS EXISTENTES NO SUPABASE
-- =====================================================
-- Execute este script no Supabase SQL Editor para ver todas as tabelas
-- e suas informações detalhadas

-- =====================================================
-- 1. LISTAR TODAS AS TABELAS DO SCHEMA PUBLIC
-- =====================================================

SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- 2. LISTAR TABELAS COM INFORMAÇÕES DETALHADAS
-- =====================================================

SELECT 
    t.table_name,
    t.table_type,
    obj_description(c.oid) as table_comment,
    pg_size_pretty(pg_total_relation_size(c.oid)) as table_size,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public'
ORDER BY t.table_name;

-- =====================================================
-- 3. LISTAR COLUNAS DE CADA TABELA
-- =====================================================

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- =====================================================
-- 4. LISTAR ÍNDICES DAS TABELAS
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
-- 5. LISTAR CHAVES ESTRANGEIRAS
-- =====================================================

SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 6. LISTAR TRIGGERS
-- =====================================================

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =====================================================
-- 7. LISTAR VIEWS
-- =====================================================

SELECT 
    table_name,
    view_definition
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- =====================================================
-- 8. LISTAR FUNÇÕES
-- =====================================================

SELECT 
    routine_name,
    routine_type,
    data_type as return_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- =====================================================
-- 9. LISTAR POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 10. CONTAR REGISTROS EM CADA TABELA
-- =====================================================

-- Função para contar registros de forma segura
DO $$
DECLARE
    rec RECORD;
    query TEXT;
    count_result INTEGER;
BEGIN
    RAISE NOTICE '=== CONTAGEM DE REGISTROS POR TABELA ===';
    
    FOR rec IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        query := 'SELECT COUNT(*) FROM ' || rec.table_name;
        EXECUTE query INTO count_result;
        RAISE NOTICE 'Tabela: % | Registros: %', rec.table_name, count_result;
    END LOOP;
END $$;

-- =====================================================
-- 11. VERIFICAR TAMANHO DAS TABELAS
-- =====================================================

SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- 12. RESUMO GERAL DO BANCO
-- =====================================================

SELECT 
    'Total de Tabelas' as metric,
    COUNT(*) as value
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
    'Total de Views' as metric,
    COUNT(*) as value
FROM information_schema.views 
WHERE table_schema = 'public'

UNION ALL

SELECT 
    'Total de Funções' as metric,
    COUNT(*) as value
FROM information_schema.routines 
WHERE routine_schema = 'public'

UNION ALL

SELECT 
    'Total de Triggers' as metric,
    COUNT(*) as value
FROM information_schema.triggers 
WHERE trigger_schema = 'public'

UNION ALL

SELECT 
    'Total de Índices' as metric,
    COUNT(*) as value
FROM pg_indexes 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Tamanho Total do Banco' as metric,
    pg_size_pretty(pg_database_size(current_database())) as value;

-- =====================================================
-- 13. VERIFICAR TABELAS ESPECÍFICAS DO SISTEMA CLÍNICO
-- =====================================================

-- Verificar se as tabelas principais existem
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios' AND table_schema = 'public') 
        THEN '✅ Existe' 
        ELSE '❌ Não existe' 
    END as usuarios,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pacientes' AND table_schema = 'public') 
        THEN '✅ Existe' 
        ELSE '❌ Não existe' 
    END as pacientes,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profissionais' AND table_schema = 'public') 
        THEN '✅ Existe' 
        ELSE '❌ Não existe' 
    END as profissionais,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'servicos' AND table_schema = 'public') 
        THEN '✅ Existe' 
        ELSE '❌ Não existe' 
    END as servicos,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agendamentos' AND table_schema = 'public') 
        THEN '✅ Existe' 
        ELSE '❌ Não existe' 
    END as agendamentos,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pagamentos' AND table_schema = 'public') 
        THEN '✅ Existe' 
        ELSE '❌ Não existe' 
    END as pagamentos,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'configuracoes' AND table_schema = 'public') 
        THEN '✅ Existe' 
        ELSE '❌ Não existe' 
    END as configuracoes,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notificacoes' AND table_schema = 'public') 
        THEN '✅ Existe' 
        ELSE '❌ Não existe' 
    END as notificacoes;

-- =====================================================
-- 14. VERIFICAR DADOS INICIAIS
-- =====================================================

-- Verificar se existem usuários iniciais
SELECT 
    'Usuários Iniciais' as tipo,
    COUNT(*) as quantidade
FROM usuarios 
WHERE cpf IN ('11111111111', '22222222222', '33333333333')

UNION ALL

-- Verificar se existem serviços iniciais
SELECT 
    'Serviços Iniciais' as tipo,
    COUNT(*) as quantidade
FROM servicos 
WHERE nome IN ('Consulta Médica', 'Exame de Sangue', 'Ultrassom', 'Eletrocardiograma', 'Consulta de Retorno')

UNION ALL

-- Verificar se existem configurações iniciais
SELECT 
    'Configurações Iniciais' as tipo,
    COUNT(*) as quantidade
FROM configuracoes 
WHERE chave IN ('sistema', 'notificacoes', 'seguranca', 'interface', 'backup');

-- =====================================================
-- 15. EXPORTAR ESTRUTURA COMPLETA
-- =====================================================

-- Gerar script para recriar todas as tabelas (sem dados)
SELECT 
    '-- Estrutura da tabela: ' || table_name || E'\n' ||
    pg_get_tabledef(table_name) || E'\n\n' as create_script
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
