-- =====================================================
-- TESTE DAS POLÍTICAS DE AUTENTICAÇÃO
-- =====================================================

-- Teste 1: Verificar se consegue buscar usuário por CPF (simulação de autenticação)
-- Este teste simula o que o sistema faz durante o login
SELECT 
    'Teste de busca por CPF' as teste,
    CASE 
        WHEN COUNT(*) > 0 THEN 'SUCESSO - Usuário encontrado'
        ELSE 'FALHA - Usuário não encontrado'
    END as resultado
FROM usuarios 
WHERE cpf = '55555555555' 
AND status = 'ativo';

-- Teste 2: Verificar se há usuários ativos no sistema
SELECT 
    'Contagem de usuários ativos' as teste,
    COUNT(*) as total_usuarios_ativos
FROM usuarios 
WHERE status = 'ativo';

-- Teste 3: Verificar estrutura da tabela usuarios
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Teste 4: Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'usuarios';

-- Teste 5: Listar todas as políticas ativas (resumo)
SELECT 
    policyname,
    cmd as operacao,
    CASE 
        WHEN qual IS NULL THEN 'Sem restrições'
        WHEN qual = 'true' THEN 'Permitido para todos'
        ELSE 'Com restrições específicas'
    END as restricoes
FROM pg_policies 
WHERE tablename = 'usuarios' 
ORDER BY 
    CASE cmd 
        WHEN 'SELECT' THEN 1
        WHEN 'INSERT' THEN 2
        WHEN 'UPDATE' THEN 3
        WHEN 'DELETE' THEN 4
        ELSE 5
    END;
