-- =====================================================
-- LIMPEZA DE POLÍTICAS DUPLICADAS E CONFLITANTES
-- =====================================================

-- Remover políticas duplicadas e conflitantes
DROP POLICY IF EXISTS "Usuários podem atualizar usuários" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem inserir usuários" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem ver todos os usuários" ON usuarios;

-- Manter apenas as políticas essenciais e otimizadas:

-- 1. Política para busca por CPF (autenticação) - MANTÉM
-- "Permitir busca por CPF para autenticação" - já existe e está correta

-- 2. Política para usuários verem seus próprios dados após autenticação - MANTÉM  
-- "Usuários podem ver seus próprios dados após autenticação" - já existe e está correta

-- 3. Política para administradores gerenciarem usuários - MANTÉM
-- "Administradores podem gerenciar usuários" - já existe e está correta

-- 4. Política para inserção de novos usuários - MANTÉM
-- "Permitir inserção de novos usuários" - já existe e está correta

-- 5. Política para atualização de senhas - MANTÉM
-- "Permitir atualização de senhas" - já existe e está correta

-- Verificar as políticas finais
SELECT 
    policyname,
    cmd,
    qual,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'usuarios' 
ORDER BY 
    CASE cmd 
        WHEN 'SELECT' THEN 1
        WHEN 'INSERT' THEN 2
        WHEN 'UPDATE' THEN 3
        WHEN 'DELETE' THEN 4
        ELSE 5
    END,
    policyname;
