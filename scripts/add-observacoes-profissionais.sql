-- =====================================================
-- ADICIONAR CAMPO OBSERVAÇÕES À TABELA PROFISSIONAIS
-- =====================================================
-- Este script adiciona o campo 'observacoes' à tabela 'profissionais'
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna observacoes à tabela profissionais
ALTER TABLE profissionais 
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Comentário na coluna
COMMENT ON COLUMN profissionais.observacoes IS 'Observações adicionais sobre o profissional';

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profissionais' 
AND column_name = 'observacoes';
