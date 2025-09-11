-- =====================================================
-- VERIFICAR TABELA AUDIT_LOG
-- =====================================================
-- Este script verifica se a tabela audit_log existe e tem a estrutura correta
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela audit_log existe
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

-- 2. Se existir, mostrar a estrutura
SELECT 
    'Estrutura da tabela audit_log' as categoria,
    column_name as campo,
    data_type as tipo,
    is_nullable as nullable
FROM information_schema.columns 
WHERE table_name = 'audit_log' 
ORDER BY ordinal_position;

-- 3. Verificar se a tabela logs_alteracoes existe (deve ser removida)
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

-- 4. Se audit_log não existir, criar uma versão simples
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'audit_log' 
        AND table_schema = 'public'
    ) THEN
        CREATE TABLE audit_log (
            id SERIAL PRIMARY KEY,
            tabela VARCHAR(100) NOT NULL,
            acao VARCHAR(50) NOT NULL,
            dados_anteriores JSONB,
            dados_novos JSONB,
            usuario_id VARCHAR(255),
            ip_address INET,
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela audit_log criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela audit_log já existe';
    END IF;
END $$;
