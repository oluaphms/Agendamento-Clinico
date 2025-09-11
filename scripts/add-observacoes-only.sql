-- =====================================================
-- ADICIONAR APENAS O CAMPO OBSERVAÇÕES À TABELA PROFISSIONAIS
-- =====================================================
-- Este script adiciona apenas o campo 'observacoes' à tabela 'profissionais'
-- Execute este script no Supabase SQL Editor

-- Verificar se a tabela profissionais existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profissionais') THEN
        RAISE EXCEPTION 'Tabela profissionais não existe. Execute primeiro o schema completo.';
    END IF;
END $$;

-- Adicionar coluna observacoes se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profissionais' 
        AND column_name = 'observacoes'
    ) THEN
        ALTER TABLE profissionais ADD COLUMN observacoes TEXT;
        RAISE NOTICE 'Campo observacoes adicionado à tabela profissionais';
    ELSE
        RAISE NOTICE 'Campo observacoes já existe na tabela profissionais';
    END IF;
END $$;

-- Verificar se a coluna foi adicionada
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profissionais' 
AND column_name = 'observacoes';

-- Comentário na coluna
COMMENT ON COLUMN profissionais.observacoes IS 'Observações adicionais sobre o profissional';



