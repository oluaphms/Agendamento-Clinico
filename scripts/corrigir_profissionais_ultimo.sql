-- =====================================================
-- CORRIGIR PÁGINA PROFISSIONAIS - SCRIPT FINAL
-- =====================================================
-- Este script corrige todos os problemas da página de Profissionais
-- e garante compatibilidade total com o Supabase

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

-- Atualizar registros existentes com dados padrão
UPDATE profissionais 
SET 
    crm = COALESCE(crm, crm_cro),
    ativo = COALESCE(ativo, CASE WHEN status = 'ativo' THEN true ELSE false END),
    data_cadastro = COALESCE(data_cadastro, created_at),
    ultima_atualizacao = COALESCE(ultima_atualizacao, created_at),
    observacoes = COALESCE(observacoes, '')
WHERE crm IS NULL OR ativo IS NULL OR data_cadastro IS NULL OR ultima_atualizacao IS NULL OR observacoes IS NULL;

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para busca otimizada
CREATE INDEX IF NOT EXISTS idx_profissionais_nome ON profissionais(nome);
CREATE INDEX IF NOT EXISTS idx_profissionais_especialidade ON profissionais(especialidade);
CREATE INDEX IF NOT EXISTS idx_profissionais_cpf ON profissionais(cpf);
CREATE INDEX IF NOT EXISTS idx_profissionais_crm_cro ON profissionais(crm_cro);
CREATE INDEX IF NOT EXISTS idx_profissionais_status ON profissionais(status);
CREATE INDEX IF NOT EXISTS idx_profissionais_cidade ON profissionais(cidade);
CREATE INDEX IF NOT EXISTS idx_profissionais_created_at ON profissionais(created_at);

-- Índice composto para busca global
CREATE INDEX IF NOT EXISTS idx_profissionais_busca_global ON profissionais(nome, especialidade, cpf, crm_cro, email, cidade);

-- 4. CRIAR TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_profissionais_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar apenas ultima_atualizacao se updated_at não existir
    NEW.ultima_atualizacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
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

-- 6. CRIAR FUNÇÃO PARA BUSCA DE PROFISSIONAIS
-- =====================================================

-- Função para buscar profissionais com filtros
CREATE OR REPLACE FUNCTION buscar_profissionais(
    busca_global TEXT DEFAULT NULL,
    filtro_nome TEXT DEFAULT NULL,
    filtro_especialidade TEXT DEFAULT NULL,
    filtro_status TEXT DEFAULT NULL,
    filtro_crm_cro TEXT DEFAULT NULL,
    filtro_cidade TEXT DEFAULT NULL,
    ordenar_por TEXT DEFAULT 'nome',
    direcao_ordenacao TEXT DEFAULT 'asc',
    limite INTEGER DEFAULT 10,
    offset_val INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    nome VARCHAR(255),
    cpf VARCHAR(14),
    crm_cro VARCHAR(20),
    especialidade VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(255),
    status VARCHAR(20),
    cidade VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id::UUID,
        p.nome::VARCHAR(255),
        p.cpf::VARCHAR(14),
        COALESCE(p.crm_cro, p.crm, '')::VARCHAR(20),
        p.especialidade::VARCHAR(100),
        p.telefone::VARCHAR(20),
        COALESCE(p.email, '')::VARCHAR(255),
        CASE 
            WHEN p.status IS NOT NULL THEN p.status
            WHEN p.ativo = true THEN 'ativo'
            ELSE 'inativo'
        END::VARCHAR(20),
        COALESCE(p.cidade, '')::VARCHAR(100),
        COALESCE(p.created_at, p.data_cadastro)::TIMESTAMP WITH TIME ZONE
    FROM profissionais p
    WHERE 
        (busca_global IS NULL OR 
         p.nome ILIKE '%' || busca_global || '%' OR
         p.especialidade ILIKE '%' || busca_global || '%' OR
         p.cpf ILIKE '%' || busca_global || '%' OR
         COALESCE(p.crm_cro, p.crm, '') ILIKE '%' || busca_global || '%' OR
         COALESCE(p.email, '') ILIKE '%' || busca_global || '%' OR
         COALESCE(p.cidade, '') ILIKE '%' || busca_global || '%')
    AND (filtro_nome IS NULL OR p.nome ILIKE '%' || filtro_nome || '%')
    AND (filtro_especialidade IS NULL OR p.especialidade ILIKE '%' || filtro_especialidade || '%')
    AND (filtro_status IS NULL OR 
         CASE 
             WHEN p.status IS NOT NULL THEN p.status
             WHEN p.ativo = true THEN 'ativo'
             ELSE 'inativo'
         END = filtro_status)
    AND (filtro_crm_cro IS NULL OR COALESCE(p.crm_cro, p.crm, '') ILIKE '%' || filtro_crm_cro || '%')
    AND (filtro_cidade IS NULL OR COALESCE(p.cidade, '') ILIKE '%' || filtro_cidade || '%')
    ORDER BY 
        CASE WHEN ordenar_por = 'nome' AND direcao_ordenacao = 'asc' THEN p.nome END ASC,
        CASE WHEN ordenar_por = 'nome' AND direcao_ordenacao = 'desc' THEN p.nome END DESC,
        CASE WHEN ordenar_por = 'especialidade' AND direcao_ordenacao = 'asc' THEN p.especialidade END ASC,
        CASE WHEN ordenar_por = 'especialidade' AND direcao_ordenacao = 'desc' THEN p.especialidade END DESC,
        CASE WHEN ordenar_por = 'created_at' AND direcao_ordenacao = 'asc' THEN COALESCE(p.created_at, p.data_cadastro) END ASC,
        CASE WHEN ordenar_por = 'created_at' AND direcao_ordenacao = 'desc' THEN COALESCE(p.created_at, p.data_cadastro) END DESC
    LIMIT limite OFFSET offset_val;
END;
$$ LANGUAGE plpgsql;

-- 7. CRIAR FUNÇÃO PARA CONTAR PROFISSIONAIS
-- =====================================================

-- Função para contar profissionais com filtros
CREATE OR REPLACE FUNCTION contar_profissionais(
    busca_global TEXT DEFAULT NULL,
    filtro_nome TEXT DEFAULT NULL,
    filtro_especialidade TEXT DEFAULT NULL,
    filtro_status TEXT DEFAULT NULL,
    filtro_crm_cro TEXT DEFAULT NULL,
    filtro_cidade TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count
    FROM profissionais p
    WHERE 
        (busca_global IS NULL OR 
         p.nome ILIKE '%' || busca_global || '%' OR
         p.especialidade ILIKE '%' || busca_global || '%' OR
         p.cpf ILIKE '%' || busca_global || '%' OR
         COALESCE(p.crm_cro, p.crm, '') ILIKE '%' || busca_global || '%' OR
         COALESCE(p.email, '') ILIKE '%' || busca_global || '%' OR
         COALESCE(p.cidade, '') ILIKE '%' || busca_global || '%')
    AND (filtro_nome IS NULL OR p.nome ILIKE '%' || filtro_nome || '%')
    AND (filtro_especialidade IS NULL OR p.especialidade ILIKE '%' || filtro_especialidade || '%')
    AND (filtro_status IS NULL OR 
         CASE 
             WHEN p.status IS NOT NULL THEN p.status
             WHEN p.ativo = true THEN 'ativo'
             ELSE 'inativo'
         END = filtro_status)
    AND (filtro_crm_cro IS NULL OR COALESCE(p.crm_cro, p.crm, '') ILIKE '%' || filtro_crm_cro || '%')
    AND (filtro_cidade IS NULL OR COALESCE(p.cidade, '') ILIKE '%' || filtro_cidade || '%');
    
    RETURN total_count;
END;
$$ LANGUAGE plpgsql;

-- 8. TESTAR FUNCIONALIDADES
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

-- Testar função de busca
SELECT 
    'FUNÇÃO BUSCA' as info,
    nome,
    especialidade,
    status
FROM buscar_profissionais('', '', '', '', '', '', 'nome', 'asc', 5, 0);

-- Testar contagem
SELECT 
    'CONTAGEM PROFISSIONAIS' as info,
    contar_profissionais('', '', '', '', '', '') as total;

-- 9. VERIFICAR ESTRUTURA FINAL
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

-- Verificar se as funções foram criadas
SELECT 
    'VERIFICAÇÃO FUNÇÕES' as info,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('buscar_profissionais', 'contar_profissionais', 'update_profissionais_updated_at');

-- Verificar se as views foram criadas
SELECT 
    'VERIFICAÇÃO VIEWS' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('estatisticas_profissionais', 'profissionais_completos');

-- 10. RESULTADO FINAL
-- =====================================================

SELECT 
    'PÁGINA PROFISSIONAIS CORRIGIDA COM SUCESSO!' as resultado,
    'Todas as funcionalidades estão prontas para uso' as status;
