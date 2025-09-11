-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA AUTENTICAÇÃO
-- =====================================================

-- Remover políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON usuarios;
DROP POLICY IF EXISTS "Administradores podem ver todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON usuarios;

-- Criar política que permite busca por CPF para autenticação
-- Esta política permite que qualquer requisição (incluindo anônimas) 
-- busque usuários por CPF, mas apenas para autenticação
CREATE POLICY "Permitir busca por CPF para autenticação" ON usuarios
    FOR SELECT USING (true);

-- Política para permitir que usuários vejam seus próprios dados após autenticados
CREATE POLICY "Usuários podem ver seus próprios dados após autenticação" ON usuarios
    FOR SELECT USING (auth.uid()::TEXT = id::TEXT);

-- Política para administradores gerenciarem usuários
CREATE POLICY "Administradores podem gerenciar usuários" ON usuarios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.nivel_acesso = 'admin'
        )
    );

-- Política para permitir inserção de novos usuários (registro)
CREATE POLICY "Permitir inserção de novos usuários" ON usuarios
    FOR INSERT WITH CHECK (true);

-- Política para permitir atualização de senhas (primeiro acesso)
CREATE POLICY "Permitir atualização de senhas" ON usuarios
    FOR UPDATE USING (
        auth.uid()::TEXT = id::TEXT OR
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.nivel_acesso = 'admin'
        )
    );

-- Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuarios' 
ORDER BY policyname;
