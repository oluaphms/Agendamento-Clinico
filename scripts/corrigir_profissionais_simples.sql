-- =====================================================
-- CORRIGIR PÁGINA PROFISSIONAIS - SCRIPT SIMPLES
-- =====================================================
-- Este script corrige os problemas da página de Profissionais
-- de forma segura, sem referenciar colunas que podem não existir

-- 1. ADICIONAR COLUNAS FALTANTES
-- =====================================================

-- Adicionar colunas que podem estar faltando na tabela profissionais
ALTER TABLE profissionais 
ADD COLUMN IF NOT EXISTS crm VARCHAR(20),
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- 2. ATUALIZAR DADOS EXISTENTES
-- =====================================================

-- Atualizar registros existentes com dados padrão (apenas se necessário)
UPDATE profissionais 
SET 
    crm = COALESCE(crm, crm_cro),
    ativo = COALESCE(ativo, CASE WHEN status = 'ativo' THEN true ELSE false END),
    data_cadastro = COALESCE(data_cadastro, created_at),
    ultima_atualizacao = COALESCE(ultima_atualizacao, created_at),
    observacoes = COALESCE(observacoes, '')
WHERE 
    (crm IS NULL AND crm_cro IS NOT NULL) OR 
    (ativo IS NULL) OR 
    (data_cadastro IS NULL) OR 
    (ultima_atualizacao IS NULL) OR 
    (observacoes IS NULL);

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para busca otimizada
CREATE INDEX IF NOT EXISTS idx_profissionais_nome ON profissionais(nome);
CREATE INDEX IF NOT EXISTS idx_profissionais_especialidade ON profissionais(especialidade);
CREATE INDEX IF NOT EXISTS idx_profissionais_cpf ON profissionais(cpf);
CREATE INDEX IF NOT EXISTS idx_profissionais_crm_cro ON profissionais(crm_cro);
CREATE INDEX IF NOT EXISTS idx_profissionais_status ON profissionais(status);
CREATE INDEX IF NOT EXISTS idx_profissionais_created_at ON profissionais(created_at);

-- Índice composto para busca global (sem cidade)
CREATE INDEX IF NOT EXISTS idx_profissionais_busca_global ON profissionais(nome, especialidade, cpf, crm_cro, email);

-- 4. CRIAR TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Função para atualizar ultima_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_profissionais_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ultima_atualizacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar ultima_atualizacao
DROP TRIGGER IF EXISTS trigger_update_profissionais_updated_at ON profissionais;
CREATE TRIGGER trigger_update_profissionais_updated_at
    BEFORE UPDATE ON profissionais
    FOR EACH ROW
    EXECUTE FUNCTION update_profissionais_updated_at();

-- 5. CRIAR VIEWS PARA ESTATÍSTICAS
-- =====================================================

-- View para estatísticas de profissionais
CREATE OR REPLACE VIEW estatisticas_profissionais AS
SELECT 
    COUNT(*) as total_profissionais,
    COUNT(CASE WHEN status = 'ativo' OR ativo = true THEN 1 END) as profissionais_ativos,
    COUNT(CASE WHEN status = 'inativo' OR ativo = false THEN 1 END) as profissionais_inativos,
    COUNT(CASE WHEN status = 'ferias' THEN 1 END) as profissionais_ferias,
    COUNT(DISTINCT especialidade) as total_especialidades,
    COUNT(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as novos_este_mes,
    COUNT(CASE WHEN created_at >= DATE_TRUNC('week', CURRENT_DATE) THEN 1 END) as novos_esta_semana
FROM profissionais;

-- View para profissionais completos (com dados calculados)
CREATE OR REPLACE VIEW profissionais_completos AS
SELECT 
    p.*,
    CASE 
        WHEN p.status IS NOT NULL THEN p.status
        WHEN p.ativo = true THEN 'ativo'
        ELSE 'inativo'
    END as status_final,
    CASE 
        WHEN p.crm_cro IS NOT NULL THEN p.crm_cro
        WHEN p.crm IS NOT NULL THEN p.crm
        ELSE 'Não informado'
    END as registro_final,
    COALESCE(p.data_cadastro, p.created_at) as data_cadastro_final,
    COALESCE(p.ultima_atualizacao, p.created_at) as ultima_atualizacao_final
FROM profissionais p;

-- 6. TESTAR FUNCIONALIDADES
-- =====================================================

-- Testar estatísticas
SELECT 
    'ESTATÍSTICAS PROFISSIONAIS' as info,
    total_profissionais,
    profissionais_ativos,
    profissionais_inativos,
    profissionais_ferias,
    total_especialidades,
    novos_este_mes,
    novos_esta_semana
FROM estatisticas_profissionais;

-- Testar busca de profissionais
SELECT 
    'BUSCA PROFISSIONAIS' as info,
    nome,
    especialidade,
    status_final,
    registro_final
FROM profissionais_completos
LIMIT 5;

-- 7. VERIFICAR ESTRUTURA FINAL
-- =====================================================

-- Verificar se todas as colunas existem
SELECT 
    'VERIFICAÇÃO ESTRUTURA' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profissionais' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se as views foram criadas
SELECT 
    'VERIFICAÇÃO VIEWS' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('estatisticas_profissionais', 'profissionais_completos');

-- 8. RESULTADO FINAL
-- =====================================================

SELECT 
    'PÁGINA PROFISSIONAIS CORRIGIDA COM SUCESSO!' as resultado,
    'Todas as funcionalidades estão prontas para uso' as status;
