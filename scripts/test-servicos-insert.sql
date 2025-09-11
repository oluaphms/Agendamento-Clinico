-- =====================================================
-- TESTE DE INSERÇÃO DE SERVIÇO
-- =====================================================
-- Este script testa a inserção de um serviço na tabela
-- Execute este script no Supabase SQL Editor

-- 1. Inserir um serviço de teste
INSERT INTO servicos (
    nome,
    descricao,
    duracao_min,
    preco,
    ativo,
    data_cadastro,
    ultima_atualizacao
) VALUES (
    'Teste de Serviço',
    'Serviço para teste do sistema',
    45,
    '120.50',
    true,
    NOW(),
    NOW()
);

-- 2. Verificar se o registro foi inserido
SELECT 
    'Serviço inserido com sucesso' as status,
    id,
    nome,
    descricao,
    duracao_min,
    preco,
    ativo,
    data_cadastro
FROM servicos 
WHERE nome = 'Teste de Serviço'
ORDER BY id DESC
LIMIT 1;

-- 3. Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'servicos' 
ORDER BY ordinal_position;

-- 4. Contar registros
SELECT 
    'Contadores' as categoria,
    COUNT(*) as total_servicos,
    COUNT(CASE WHEN ativo = true THEN 1 END) as servicos_ativos,
    COUNT(CASE WHEN ativo = false THEN 1 END) as servicos_inativos
FROM servicos;
