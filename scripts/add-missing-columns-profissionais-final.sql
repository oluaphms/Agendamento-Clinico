-- =====================================================
-- ADICIONAR COLUNAS FALTANTES NA TABELA PROFISSIONAIS
-- =====================================================
-- Este script adiciona as colunas que estão faltando na tabela profissionais
-- Execute este script no Supabase SQL Editor

-- Adicionar colunas que faltam
ALTER TABLE profissionais 
ADD COLUMN IF NOT EXISTS cep VARCHAR(9),
ADD COLUMN IF NOT EXISTS endereco TEXT,
ADD COLUMN IF NOT EXISTS cidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS estado VARCHAR(2),
ADD COLUMN IF NOT EXISTS formacao TEXT,
ADD COLUMN IF NOT EXISTS experiencia_anos INTEGER,
ADD COLUMN IF NOT EXISTS horario_trabalho JSONB,
ADD COLUMN IF NOT EXISTS disponibilidade JSONB,
ADD COLUMN IF NOT EXISTS valor_consulta DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS subespecialidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS crm_cro VARCHAR(20),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ativo',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS usuario_id UUID;

-- Migrar dados existentes
UPDATE profissionais 
SET 
    crm_cro = crm,
    status = CASE WHEN ativo = true THEN 'ativo' ELSE 'inativo' END,
    created_at = COALESCE(data_cadastro, NOW()),
    updated_at = COALESCE(ultima_atualizacao, NOW())
WHERE crm IS NOT NULL OR ativo IS NOT NULL OR data_cadastro IS NOT NULL;

-- Adicionar constraints
ALTER TABLE profissionais 
ADD CONSTRAINT IF NOT EXISTS profissionais_crm_cro_unique UNIQUE (crm_cro);

-- Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profissionais' 
ORDER BY ordinal_position;
