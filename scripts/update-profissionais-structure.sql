-- =====================================================
-- ATUALIZAR ESTRUTURA DA TABELA PROFISSIONAIS
-- =====================================================
-- Este script atualiza a estrutura da tabela profissionais para corresponder ao código
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos verificar se precisamos fazer backup dos dados existentes
SELECT COUNT(*) as total_profissionais FROM profissionais;

-- 2. Adicionar colunas que faltam (se não existirem)
DO $$ 
BEGIN
    -- Adicionar crm_cro se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profissionais' 
        AND column_name = 'crm_cro'
    ) THEN
        ALTER TABLE profissionais ADD COLUMN crm_cro VARCHAR(20);
        RAISE NOTICE 'Coluna crm_cro adicionada';
    END IF;

    -- Adicionar subespecialidade se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profissionais' 
        AND column_name = 'subespecialidade'
    ) THEN
        ALTER TABLE profissionais ADD COLUMN subespecialidade VARCHAR(100);
        RAISE NOTICE 'Coluna subespecialidade adicionada';
    END IF;

    -- Adicionar endereco se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profissionais' 
        AND column_name = 'endereco'
    ) THEN
        ALTER TABLE profissionais ADD COLUMN endereco TEXT;
        RAISE NOTICE 'Coluna endereco adicionada';
    END IF;

    -- Adicionar cidade se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profissionais' 
        AND column_name = 'cidade'
    ) THEN
        ALTER TABLE profissionais ADD COLUMN cidade VARCHAR(100);
        RAISE NOTICE 'Coluna cidade adicionada';
    END IF;

    -- Adicionar estado se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profissionais' 
        AND column_name = 'estado'
    ) THEN
        ALTER TABLE profissionais ADD COLUMN estado VARCHAR(2);
        RAISE NOTICE 'Coluna estado adicionada';
    END IF;

    -- Adicionar cep se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profissionais' 
        AND column_name = 'cep'
    ) THEN
        ALTER TABLE profissionais ADD COLUMN cep VARCHAR(9);
        RAISE NOTICE 'Coluna cep adicionada';
    END IF;

    -- Adicionar formacao se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profissionais' 
        AND column_name = 'formacao'
    ) THEN
        ALTER TABLE profissionais ADD COLUMN formacao TEXT;
        RAISE NOTICE 'Coluna formacao adicionada';
    END IF;

    -- Adicionar experiencia_anos se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profissionais' 
        AND column_name = 'experiencia_anos'
    ) THEN
        ALTER TABLE profissionais ADD COLUMN experiencia_anos INTEGER;
        RAISE NOTICE 'Coluna experiencia_anos adicionada';
    END IF;

    -- Adicionar horario_trabalho se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profissionais' 
        AND column_name = 'horario_trabalho'
    ) THEN
        ALTER TABLE profissionais ADD COLUMN horario_trabalho JSONB;
        RAISE NOTICE 'Coluna horario_trabalho adicionada';
    END IF;

    -- Adicionar disponibilidade se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profissionais' 
        AND column_name = 'disponibilidade'
    ) THEN
        ALTER TABLE profissionais ADD COLUMN disponibilidade JSONB;
        RAISE NOTICE 'Coluna disponibilidade adicionada';
    END IF;

    -- Adicionar valor_consulta se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profissionais' 
        AND column_name = 'valor_consulta'
    ) THEN
        ALTER TABLE profissionais ADD COLUMN valor_consulta DECIMAL(10,2);
        RAISE NOTICE 'Coluna valor_consulta adicionada';
    END IF;

    -- Adicionar status se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profissionais' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE profissionais ADD COLUMN status VARCHAR(20) DEFAULT 'ativo';
        RAISE NOTICE 'Coluna status adicionada';
    END IF;

    -- Adicionar created_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profissionais' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE profissionais ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna created_at adicionada';
    END IF;

    -- Adicionar updated_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profissionais' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE profissionais ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna updated_at adicionada';
    END IF;

    -- Adicionar usuario_id se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profissionais' 
        AND column_name = 'usuario_id'
    ) THEN
        ALTER TABLE profissionais ADD COLUMN usuario_id UUID;
        RAISE NOTICE 'Coluna usuario_id adicionada';
    END IF;
END $$;

-- 3. Migrar dados existentes
UPDATE profissionais 
SET 
    crm_cro = crm,
    status = CASE WHEN ativo = true THEN 'ativo' ELSE 'inativo' END,
    created_at = COALESCE(data_cadastro, NOW()),
    updated_at = COALESCE(ultima_atualizacao, NOW())
WHERE crm IS NOT NULL OR ativo IS NOT NULL OR data_cadastro IS NOT NULL;

-- 4. Remover colunas antigas (opcional - comente se quiser manter)
-- ALTER TABLE profissionais DROP COLUMN IF EXISTS crm;
-- ALTER TABLE profissionais DROP COLUMN IF EXISTS ativo;
-- ALTER TABLE profissionais DROP COLUMN IF EXISTS data_cadastro;
-- ALTER TABLE profissionais DROP COLUMN IF EXISTS ultima_atualizacao;

-- 5. Adicionar constraints e índices
ALTER TABLE profissionais 
ADD CONSTRAINT IF NOT EXISTS profissionais_cpf_unique UNIQUE (cpf);

ALTER TABLE profissionais 
ADD CONSTRAINT IF NOT EXISTS profissionais_crm_cro_unique UNIQUE (crm_cro);

-- 6. Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profissionais' 
ORDER BY ordinal_position;
