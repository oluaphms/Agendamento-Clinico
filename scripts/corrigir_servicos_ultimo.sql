-- =====================================================
-- CORRIGIR PÁGINA SERVIÇOS - SCRIPT FINAL
-- =====================================================
-- Este script corrige todos os problemas da página de Serviços
-- e garante compatibilidade total com o Supabase

-- 1. ADICIONAR COLUNAS FALTANTES
-- =====================================================

-- Adicionar colunas que podem estar faltando na tabela servicos
ALTER TABLE servicos 
ADD COLUMN IF NOT EXISTS data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS categoria VARCHAR(100);

-- 2. ATUALIZAR DADOS EXISTENTES
-- =====================================================

-- Atualizar registros existentes com dados padrão (apenas se necessário)
UPDATE servicos 
SET 
    data_cadastro = COALESCE(data_cadastro, created_at),
    ultima_atualizacao = COALESCE(ultima_atualizacao, created_at),
    categoria = COALESCE(categoria, 'Geral')
WHERE 
    (data_cadastro IS NULL) OR 
    (ultima_atualizacao IS NULL) OR 
    (categoria IS NULL);

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Verificar e criar índices apenas para colunas que existem
DO $$
BEGIN
    -- Índice para nome (sempre existe)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'servicos' AND column_name = 'nome') THEN
        CREATE INDEX IF NOT EXISTS idx_servicos_nome ON servicos(nome);
    END IF;
    
    -- Índice para ativo (sempre existe)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'servicos' AND column_name = 'ativo') THEN
        CREATE INDEX IF NOT EXISTS idx_servicos_ativo ON servicos(ativo);
    END IF;
    
    -- Índice para preco (sempre existe)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'servicos' AND column_name = 'preco') THEN
        CREATE INDEX IF NOT EXISTS idx_servicos_preco ON servicos(preco);
    END IF;
    
    -- Índice para categoria (pode existir)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'servicos' AND column_name = 'categoria') THEN
        CREATE INDEX IF NOT EXISTS idx_servicos_categoria ON servicos(categoria);
    END IF;
    
    -- Índice para created_at (sempre existe)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'servicos' AND column_name = 'created_at') THEN
        CREATE INDEX IF NOT EXISTS idx_servicos_created_at ON servicos(created_at);
    END IF;
    
    -- Índice composto para busca global
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'servicos' AND column_name = 'nome') AND
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'servicos' AND column_name = 'descricao') THEN
        CREATE INDEX IF NOT EXISTS idx_servicos_busca_global ON servicos(nome, descricao);
    END IF;
END $$;

-- 4. CRIAR TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Função para atualizar ultima_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_servicos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ultima_atualizacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar ultima_atualizacao
DROP TRIGGER IF EXISTS trigger_update_servicos_updated_at ON servicos;
CREATE TRIGGER trigger_update_servicos_updated_at
    BEFORE UPDATE ON servicos
    FOR EACH ROW
    EXECUTE FUNCTION update_servicos_updated_at();

-- 5. CRIAR VIEWS PARA ESTATÍSTICAS
-- =====================================================

-- View para estatísticas de serviços
CREATE OR REPLACE VIEW estatisticas_servicos AS
SELECT 
    COUNT(*) as total_servicos,
    COUNT(CASE WHEN ativo = true THEN 1 END) as servicos_ativos,
    COUNT(CASE WHEN ativo = false THEN 1 END) as servicos_inativos,
    COALESCE(SUM(preco), 0) as valor_total,
    COALESCE(AVG(preco), 0) as preco_medio,
    COUNT(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as novos_este_mes,
    COUNT(CASE WHEN created_at >= DATE_TRUNC('week', CURRENT_DATE) THEN 1 END) as novos_esta_semana,
    COUNT(DISTINCT categoria) as total_categorias
FROM servicos;

-- View para serviços completos (com dados calculados)
CREATE OR REPLACE VIEW servicos_completos AS
SELECT 
    s.*,
    COALESCE(s.data_cadastro, s.created_at) as data_cadastro_final,
    COALESCE(s.ultima_atualizacao, s.created_at) as ultima_atualizacao_final,
    COALESCE(s.categoria, 'Geral') as categoria_final
FROM servicos s;

-- 6. CRIAR FUNÇÃO PARA BUSCA DE SERVIÇOS
-- =====================================================

-- Função para buscar serviços com filtros
CREATE OR REPLACE FUNCTION buscar_servicos(
    busca_global TEXT DEFAULT NULL,
    filtro_nome TEXT DEFAULT NULL,
    filtro_categoria TEXT DEFAULT NULL,
    filtro_ativo BOOLEAN DEFAULT NULL,
    preco_min DECIMAL DEFAULT NULL,
    preco_max DECIMAL DEFAULT NULL,
    ordenar_por TEXT DEFAULT 'nome',
    direcao_ordenacao TEXT DEFAULT 'asc',
    limite INTEGER DEFAULT 10,
    offset_val INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    nome VARCHAR(255),
    descricao TEXT,
    preco DECIMAL(10,2),
    duracao_min INTEGER,
    ativo BOOLEAN,
    categoria VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id::UUID,
        s.nome::VARCHAR(255),
        COALESCE(s.descricao, '')::TEXT,
        s.preco::DECIMAL(10,2),
        s.duracao_min::INTEGER,
        s.ativo::BOOLEAN,
        COALESCE(s.categoria, 'Geral')::VARCHAR(100),
        COALESCE(s.created_at, s.data_cadastro)::TIMESTAMP WITH TIME ZONE
    FROM servicos s
    WHERE 
        (busca_global IS NULL OR 
         s.nome ILIKE '%' || busca_global || '%' OR
         COALESCE(s.descricao, '') ILIKE '%' || busca_global || '%' OR
         COALESCE(s.categoria, '') ILIKE '%' || busca_global || '%')
    AND (filtro_nome IS NULL OR s.nome ILIKE '%' || filtro_nome || '%')
    AND (filtro_categoria IS NULL OR COALESCE(s.categoria, 'Geral') ILIKE '%' || filtro_categoria || '%')
    AND (filtro_ativo IS NULL OR s.ativo = filtro_ativo)
    AND (preco_min IS NULL OR s.preco >= preco_min)
    AND (preco_max IS NULL OR s.preco <= preco_max)
    ORDER BY 
        CASE WHEN ordenar_por = 'nome' AND direcao_ordenacao = 'asc' THEN s.nome END ASC,
        CASE WHEN ordenar_por = 'nome' AND direcao_ordenacao = 'desc' THEN s.nome END DESC,
        CASE WHEN ordenar_por = 'preco' AND direcao_ordenacao = 'asc' THEN s.preco END ASC,
        CASE WHEN ordenar_por = 'preco' AND direcao_ordenacao = 'desc' THEN s.preco END DESC,
        CASE WHEN ordenar_por = 'created_at' AND direcao_ordenacao = 'asc' THEN COALESCE(s.created_at, s.data_cadastro) END ASC,
        CASE WHEN ordenar_por = 'created_at' AND direcao_ordenacao = 'desc' THEN COALESCE(s.created_at, s.data_cadastro) END DESC
    LIMIT limite OFFSET offset_val;
END;
$$ LANGUAGE plpgsql;

-- 7. CRIAR FUNÇÃO PARA CONTAR SERVIÇOS
-- =====================================================

-- Função para contar serviços com filtros
CREATE OR REPLACE FUNCTION contar_servicos(
    busca_global TEXT DEFAULT NULL,
    filtro_nome TEXT DEFAULT NULL,
    filtro_categoria TEXT DEFAULT NULL,
    filtro_ativo BOOLEAN DEFAULT NULL,
    preco_min DECIMAL DEFAULT NULL,
    preco_max DECIMAL DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count
    FROM servicos s
    WHERE 
        (busca_global IS NULL OR 
         s.nome ILIKE '%' || busca_global || '%' OR
         COALESCE(s.descricao, '') ILIKE '%' || busca_global || '%' OR
         COALESCE(s.categoria, '') ILIKE '%' || busca_global || '%')
    AND (filtro_nome IS NULL OR s.nome ILIKE '%' || filtro_nome || '%')
    AND (filtro_categoria IS NULL OR COALESCE(s.categoria, 'Geral') ILIKE '%' || filtro_categoria || '%')
    AND (filtro_ativo IS NULL OR s.ativo = filtro_ativo)
    AND (preco_min IS NULL OR s.preco >= preco_min)
    AND (preco_max IS NULL OR s.preco <= preco_max);
    
    RETURN total_count;
END;
$$ LANGUAGE plpgsql;

-- 8. TESTAR FUNCIONALIDADES
-- =====================================================

-- Testar estatísticas
SELECT 
    'ESTATÍSTICAS SERVIÇOS' as info,
    total_servicos,
    servicos_ativos,
    servicos_inativos,
    valor_total,
    preco_medio,
    novos_este_mes,
    novos_esta_semana,
    total_categorias
FROM estatisticas_servicos;

-- Testar busca de serviços
SELECT 
    'BUSCA SERVIÇOS' as info,
    nome,
    preco,
    ativo,
    categoria_final
FROM servicos_completos
LIMIT 5;

-- Testar função de busca
SELECT 
    'FUNÇÃO BUSCA' as info,
    nome,
    preco,
    ativo,
    categoria
FROM buscar_servicos('', '', '', NULL, NULL, NULL, 'nome', 'asc', 5, 0);

-- Testar contagem
SELECT 
    'CONTAGEM SERVIÇOS' as info,
    contar_servicos('', '', '', NULL, NULL, NULL) as total;

-- 9. VERIFICAR ESTRUTURA FINAL
-- =====================================================

-- Verificar se todas as colunas existem
SELECT 
    'VERIFICAÇÃO ESTRUTURA' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'servicos' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se as funções foram criadas
SELECT 
    'VERIFICAÇÃO FUNÇÕES' as info,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('buscar_servicos', 'contar_servicos', 'update_servicos_updated_at');

-- Verificar se as views foram criadas
SELECT 
    'VERIFICAÇÃO VIEWS' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('estatisticas_servicos', 'servicos_completos');

-- 10. RESULTADO FINAL
-- =====================================================

SELECT 
    'PÁGINA SERVIÇOS CORRIGIDA COM SUCESSO!' as resultado,
    'Todas as funcionalidades estão prontas para uso' as status;
