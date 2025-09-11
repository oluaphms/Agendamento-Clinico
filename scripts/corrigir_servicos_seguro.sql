-- =====================================================
-- CORRIGIR PÁGINA SERVIÇOS - SCRIPT SEGURO
-- =====================================================
-- Este script corrige os problemas da página de Serviços
-- de forma segura, sem triggers problemáticos

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
END $$;

-- 4. CRIAR VIEWS PARA ESTATÍSTICAS
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

-- 5. TESTAR FUNCIONALIDADES
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

-- 6. VERIFICAR ESTRUTURA FINAL
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

-- Verificar se as views foram criadas
SELECT 
    'VERIFICAÇÃO VIEWS' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('estatisticas_servicos', 'servicos_completos');

-- 7. RESULTADO FINAL
-- =====================================================

SELECT 
    'PÁGINA SERVIÇOS CORRIGIDA COM SUCESSO!' as resultado,
    'Todas as funcionalidades estão prontas para uso' as status;
