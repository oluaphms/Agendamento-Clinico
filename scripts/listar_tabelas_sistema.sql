-- =====================================================
-- LISTAR TABELAS DO SISTEMA CLÍNICO
-- =====================================================
-- Este script lista todas as tabelas do sistema clínico
-- com informações detalhadas sobre estrutura e dados

-- 1. LISTAR TODAS AS TABELAS DO SISTEMA
-- =====================================================

SELECT 
    'TABELAS DO SISTEMA CLÍNICO' as categoria,
    table_name as nome_tabela,
    table_type as tipo,
    CASE 
        WHEN table_name IN ('usuarios', 'pacientes', 'profissionais', 'servicos', 'agendamentos') 
        THEN '✅ PRINCIPAL'
        WHEN table_name LIKE '%_config%' OR table_name LIKE '%_settings%'
        THEN '⚙️ CONFIGURAÇÃO'
        WHEN table_name LIKE '%_log%' OR table_name LIKE '%_audit%'
        THEN '📝 AUDITORIA'
        WHEN table_name LIKE '%_view%' OR table_name LIKE '%_completos%' OR table_name LIKE '%_estatisticas%'
        THEN '📊 VIEW'
        ELSE '🔧 AUXILIAR'
    END as categoria_tabela
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY 
    CASE 
        WHEN table_name IN ('usuarios', 'pacientes', 'profissionais', 'servicos', 'agendamentos') 
        THEN 1
        WHEN table_name LIKE '%_config%' OR table_name LIKE '%_settings%'
        THEN 2
        WHEN table_name LIKE '%_log%' OR table_name LIKE '%_audit%'
        THEN 3
        WHEN table_name LIKE '%_view%' OR table_name LIKE '%_completos%' OR table_name LIKE '%_estatisticas%'
        THEN 4
        ELSE 5
    END,
    table_name;

-- 2. CONTAR REGISTROS POR TABELA
-- =====================================================

SELECT 
    'CONTAGEM DE REGISTROS' as info,
    table_name as tabela,
    CASE 
        WHEN table_name = 'usuarios' THEN (SELECT COUNT(*) FROM usuarios)
        WHEN table_name = 'pacientes' THEN (SELECT COUNT(*) FROM pacientes)
        WHEN table_name = 'profissionais' THEN (SELECT COUNT(*) FROM profissionais)
        WHEN table_name = 'servicos' THEN (SELECT COUNT(*) FROM servicos)
        WHEN table_name = 'agendamentos' THEN (SELECT COUNT(*) FROM agendamentos)
        ELSE 0
    END as total_registros
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name IN ('usuarios', 'pacientes', 'profissionais', 'servicos', 'agendamentos')
ORDER BY total_registros DESC;

-- 3. ESTRUTURA DAS TABELAS PRINCIPAIS
-- =====================================================

-- Estrutura da tabela usuarios
SELECT 
    'ESTRUTURA - USUÁRIOS' as info,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as padrao
FROM information_schema.columns 
WHERE table_name = 'usuarios' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Estrutura da tabela pacientes
SELECT 
    'ESTRUTURA - PACIENTES' as info,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as padrao
FROM information_schema.columns 
WHERE table_name = 'pacientes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Estrutura da tabela profissionais
SELECT 
    'ESTRUTURA - PROFISSIONAIS' as info,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as padrao
FROM information_schema.columns 
WHERE table_name = 'profissionais' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Estrutura da tabela servicos
SELECT 
    'ESTRUTURA - SERVIÇOS' as info,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as padrao
FROM information_schema.columns 
WHERE table_name = 'servicos' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Estrutura da tabela agendamentos
SELECT 
    'ESTRUTURA - AGENDAMENTOS' as info,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable,
    column_default as padrao
FROM information_schema.columns 
WHERE table_name = 'agendamentos' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. VIEWS DO SISTEMA
-- =====================================================

SELECT 
    'VIEWS DO SISTEMA' as info,
    table_name as nome_view,
    table_type as tipo
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'VIEW'
ORDER BY table_name;

-- 5. FUNÇÕES DO SISTEMA
-- =====================================================

SELECT 
    'FUNÇÕES DO SISTEMA' as info,
    routine_name as nome_funcao,
    routine_type as tipo,
    data_type as retorno
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type IN ('FUNCTION', 'PROCEDURE')
ORDER BY routine_name;

-- 6. TRIGGERS DO SISTEMA
-- =====================================================

SELECT 
    'TRIGGERS DO SISTEMA' as info,
    trigger_name as nome_trigger,
    event_object_table as tabela,
    event_manipulation as evento,
    action_timing as timing
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 7. ÍNDICES DO SISTEMA
-- =====================================================

SELECT 
    'ÍNDICES DO SISTEMA' as info,
    schemaname as schema,
    tablename as tabela,
    indexname as indice,
    indexdef as definicao
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 8. ESTATÍSTICAS GERAIS
-- =====================================================

SELECT 
    'ESTATÍSTICAS GERAIS' as info,
    'Total de Tabelas' as metrica,
    COUNT(*) as valor
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
    'ESTATÍSTICAS GERAIS' as info,
    'Total de Views' as metrica,
    COUNT(*) as valor
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'VIEW'

UNION ALL

SELECT 
    'ESTATÍSTICAS GERAIS' as info,
    'Total de Funções' as metrica,
    COUNT(*) as valor
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'

UNION ALL

SELECT 
    'ESTATÍSTICAS GERAIS' as info,
    'Total de Triggers' as metrica,
    COUNT(*) as valor
FROM information_schema.triggers 
WHERE event_object_schema = 'public'

UNION ALL

SELECT 
    'ESTATÍSTICAS GERAIS' as info,
    'Total de Índices' as metrica,
    COUNT(*) as valor
FROM pg_indexes 
WHERE schemaname = 'public';

-- 9. VERIFICAR INTEGRIDADE DAS RELAÇÕES
-- =====================================================

SELECT 
    'VERIFICAÇÃO DE INTEGRIDADE' as info,
    tc.table_name as tabela_origem,
    kcu.column_name as coluna_origem,
    ccu.table_name as tabela_destino,
    ccu.column_name as coluna_destino,
    tc.constraint_name as constraint
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 10. RESUMO FINAL
-- =====================================================

SELECT 
    'SISTEMA CLÍNICO - RESUMO FINAL' as resultado,
    'Todas as tabelas listadas com sucesso' as status;
