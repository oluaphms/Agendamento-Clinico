-- =====================================================
-- DIAGNOSTICAR CONEXÃO COM SUPABASE
-- =====================================================
-- Este script verifica se o Supabase está configurado corretamente
-- e se há dados nas tabelas

-- 1. VERIFICAR CONECTIVIDADE
-- =====================================================

SELECT 
    'VERIFICAÇÃO DE CONECTIVIDADE' as info,
    'Conexão com Supabase' as teste,
    CASE 
        WHEN current_database() IS NOT NULL THEN '✅ CONECTADO'
        ELSE '❌ DESCONECTADO'
    END as status;

-- 2. VERIFICAR TABELAS PRINCIPAIS
-- =====================================================

SELECT 
    'TABELAS PRINCIPAIS' as info,
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
AND table_name IN ('usuarios', 'pacientes', 'profissionais', 'servicos', 'agendamentos')
ORDER BY table_name;

-- 3. VERIFICAR DADOS DE EXEMPLO
-- =====================================================

-- Verificar se há usuários
SELECT 
    'DADOS DE USUÁRIOS' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativos,
    COUNT(CASE WHEN nivel_acesso = 'admin' THEN 1 END) as admins
FROM usuarios;

-- Verificar se há pacientes
SELECT 
    'DADOS DE PACIENTES' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativos,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as novos_30_dias
FROM pacientes;

-- Verificar se há profissionais
SELECT 
    'DADOS DE PROFISSIONAIS' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN ativo = true OR status = 'ativo' THEN 1 END) as ativos,
    COUNT(DISTINCT especialidade) as especialidades
FROM profissionais;

-- Verificar se há serviços
SELECT 
    'DADOS DE SERVIÇOS' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN ativo = true THEN 1 END) as ativos,
    COALESCE(SUM(preco), 0) as valor_total
FROM servicos;

-- Verificar se há agendamentos
SELECT 
    'DADOS DE AGENDAMENTOS' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'agendado' THEN 1 END) as agendados,
    COUNT(CASE WHEN status = 'realizado' THEN 1 END) as realizados,
    COUNT(CASE WHEN data >= CURRENT_DATE THEN 1 END) as futuros
FROM agendamentos;

-- 4. VERIFICAR ESTRUTURA DAS TABELAS
-- =====================================================

-- Verificar se as colunas necessárias existem
SELECT 
    'VERIFICAÇÃO DE ESTRUTURA' as info,
    table_name as tabela,
    column_name as coluna,
    data_type as tipo,
    is_nullable as nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('usuarios', 'pacientes', 'profissionais', 'servicos', 'agendamentos')
AND column_name IN ('id', 'nome', 'created_at', 'updated_at', 'status', 'ativo')
ORDER BY table_name, column_name;

-- 5. VERIFICAR VIEWS E FUNÇÕES
-- =====================================================

-- Verificar views criadas
SELECT 
    'VIEWS CRIADAS' as info,
    table_name as view_name,
    'VIEW' as tipo
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'VIEW'
ORDER BY table_name;

-- Verificar funções criadas
SELECT 
    'FUNÇÕES CRIADAS' as info,
    routine_name as funcao,
    routine_type as tipo
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 6. VERIFICAR TRIGGERS
-- =====================================================

SELECT 
    'TRIGGERS ATIVOS' as info,
    trigger_name as trigger,
    event_object_table as tabela,
    event_manipulation as evento,
    action_timing as timing
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 7. VERIFICAR ÍNDICES
-- =====================================================

SELECT 
    'ÍNDICES CRIADOS' as info,
    tablename as tabela,
    indexname as indice,
    indexdef as definicao
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('usuarios', 'pacientes', 'profissionais', 'servicos', 'agendamentos')
ORDER BY tablename, indexname;

-- 8. TESTAR QUERIES BÁSICAS
-- =====================================================

-- Testar query de usuários
SELECT 
    'TESTE QUERY USUÁRIOS' as info,
    id,
    nome,
    nivel_acesso,
    status
FROM usuarios 
LIMIT 3;

-- Testar query de pacientes
SELECT 
    'TESTE QUERY PACIENTES' as info,
    id,
    nome,
    cpf,
    telefone
FROM pacientes 
LIMIT 3;

-- Testar query de profissionais
SELECT 
    'TESTE QUERY PROFISSIONAIS' as info,
    id,
    nome,
    especialidade,
    ativo
FROM profissionais 
LIMIT 3;

-- Testar query de serviços
SELECT 
    'TESTE QUERY SERVIÇOS' as info,
    id,
    nome,
    preco,
    ativo
FROM servicos 
LIMIT 3;

-- Testar query de agendamentos
SELECT 
    'TESTE QUERY AGENDAMENTOS' as info,
    id,
    data,
    hora,
    status
FROM agendamentos 
LIMIT 3;

-- 9. RESUMO FINAL
-- =====================================================

SELECT 
    'DIAGNÓSTICO COMPLETO' as resultado,
    'Verifique os resultados acima para identificar problemas' as status;
