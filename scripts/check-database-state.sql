-- =====================================================
-- VERIFICAR ESTADO ATUAL DO BANCO DE DADOS
-- =====================================================
-- Este script verifica o estado atual do banco e identifica o que precisa ser feito
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se as tabelas principais existem
SELECT 
    'Tabelas Existentes' as categoria,
    table_name as nome,
    CASE 
        WHEN table_name IN ('usuarios', 'pacientes', 'profissionais', 'servicos', 'agendamentos', 'pagamentos', 'configuracoes', 'audit_log', 'notificacoes', 'backups') 
        THEN 'OK' 
        ELSE 'FALTANDO' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('usuarios', 'pacientes', 'profissionais', 'servicos', 'agendamentos', 'pagamentos', 'configuracoes', 'audit_log', 'notificacoes', 'backups')
ORDER BY table_name;

-- 2. Verificar se a tabela profissionais tem o campo observacoes
SELECT 
    'Campo observacoes na tabela profissionais' as categoria,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profissionais' 
            AND column_name = 'observacoes'
        ) 
        THEN 'EXISTE' 
        ELSE 'FALTANDO' 
    END as status;

-- 3. Verificar se a tabela audit_log existe
SELECT 
    'Tabela audit_log' as categoria,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'audit_log' 
            AND table_schema = 'public'
        ) 
        THEN 'EXISTE' 
        ELSE 'FALTANDO' 
    END as status;

-- 4. Verificar se a tabela logs_alteracoes existe (deve ser removida)
SELECT 
    'Tabela logs_alteracoes (deve ser removida)' as categoria,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'logs_alteracoes' 
            AND table_schema = 'public'
        ) 
        THEN 'EXISTE - REMOVER' 
        ELSE 'NÃO EXISTE - OK' 
    END as status;

-- 5. Verificar tipos customizados
SELECT 
    'Tipos Customizados' as categoria,
    typname as nome,
    'EXISTE' as status
FROM pg_type 
WHERE typname IN (
    'status_usuario', 'nivel_acesso', 'genero', 'status_profissional',
    'status_agendamento', 'status_pagamento', 'forma_pagamento',
    'tipo_auditoria', 'tema_sistema', 'idioma_sistema', 'frequencia_backup'
)
ORDER BY typname;

-- 6. Verificar estrutura da tabela profissionais
SELECT 
    'Estrutura da tabela profissionais' as categoria,
    column_name as campo,
    data_type as tipo,
    is_nullable as nullable
FROM information_schema.columns 
WHERE table_name = 'profissionais' 
ORDER BY ordinal_position;
