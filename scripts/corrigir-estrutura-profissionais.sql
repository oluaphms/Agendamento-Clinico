-- =====================================================
-- CORRIGIR ESTRUTURA DA TABELA PROFISSIONAIS
-- =====================================================
-- Este script adiciona as colunas faltantes na tabela profissionais

-- Adicionar colunas faltantes na tabela profissionais
ALTER TABLE profissionais 
ADD COLUMN IF NOT EXISTS subespecialidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS crm_cro VARCHAR(20),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ativo';

-- Adicionar colunas que podem estar faltando na tabela usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verificar se as colunas foram adicionadas corretamente
SELECT 
    'Verificação da estrutura da tabela profissionais' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profissionais' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se as colunas específicas existem agora
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profissionais' AND column_name = 'subespecialidade') 
        THEN '✅ subespecialidade ADICIONADA'
        ELSE '❌ subespecialidade AINDA FALTA'
    END as status_subespecialidade,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profissionais' AND column_name = 'crm_cro') 
        THEN '✅ crm_cro ADICIONADO'
        ELSE '❌ crm_cro AINDA FALTA'
    END as status_crm_cro,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profissionais' AND column_name = 'status') 
        THEN '✅ status ADICIONADO'
        ELSE '❌ status AINDA FALTA'
    END as status_status;

-- Atualizar registros existentes com status padrão
UPDATE profissionais 
SET status = 'ativo' 
WHERE status IS NULL;

-- Verificar quantos registros foram atualizados
SELECT 
    COUNT(*) as total_profissionais,
    COUNT(CASE WHEN status = 'ativo' THEN 1 END) as profissionais_ativos
FROM profissionais;
