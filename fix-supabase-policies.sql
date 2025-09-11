-- =====================================================
-- CORREÇÃO DE POLÍTICAS RLS - SISTEMA CLÍNICO
-- =====================================================
-- Execute este script no SQL Editor do Supabase para corrigir as políticas RLS

-- =====================================================
-- 1. REMOVER POLÍTICAS PROBLEMÁTICAS
-- =====================================================

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Admins podem gerenciar todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Usuários autenticados podem ver dados básicos" ON pacientes;
DROP POLICY IF EXISTS "Profissionais podem ver seus agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Usuários autenticados podem ver pacientes" ON pacientes;
DROP POLICY IF EXISTS "Usuários autenticados podem ver profissionais" ON profissionais;
DROP POLICY IF EXISTS "Usuários autenticados podem ver serviços" ON servicos;
DROP POLICY IF EXISTS "Usuários autenticados podem ver agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Usuários autenticados podem ver pagamentos" ON pagamentos;
DROP POLICY IF EXISTS "Apenas admins podem ver configurações" ON configuracoes;
DROP POLICY IF EXISTS "Apenas admins podem ver auditoria" ON audit_log;
DROP POLICY IF EXISTS "Usuários veem apenas suas notificações" ON notificacoes;
DROP POLICY IF EXISTS "Apenas admins podem ver backups" ON backups;
DROP POLICY IF EXISTS "Todos podem visualizar permissões" ON permissions;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar permissões" ON permissions;
DROP POLICY IF EXISTS "Todos podem visualizar roles" ON roles;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar roles" ON roles;
DROP POLICY IF EXISTS "Todos podem visualizar role_permissions" ON role_permissions;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar role_permissions" ON role_permissions;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios roles" ON user_roles;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar user_roles" ON user_roles;

-- =====================================================
-- 2. CRIAR POLÍTICAS SIMPLIFICADAS
-- =====================================================

-- Políticas para usuários (temporariamente permissivas para desenvolvimento)
CREATE POLICY "Permitir acesso total a usuarios" ON usuarios
    FOR ALL USING (true);

-- Políticas para pacientes
CREATE POLICY "Permitir acesso total a pacientes" ON pacientes
    FOR ALL USING (true);

-- Políticas para profissionais
CREATE POLICY "Permitir acesso total a profissionais" ON profissionais
    FOR ALL USING (true);

-- Políticas para serviços
CREATE POLICY "Permitir acesso total a servicos" ON servicos
    FOR ALL USING (true);

-- Políticas para agendamentos
CREATE POLICY "Permitir acesso total a agendamentos" ON agendamentos
    FOR ALL USING (true);

-- Políticas para pagamentos
CREATE POLICY "Permitir acesso total a pagamentos" ON pagamentos
    FOR ALL USING (true);

-- Políticas para configurações
CREATE POLICY "Permitir acesso total a configuracoes" ON configuracoes
    FOR ALL USING (true);

-- Políticas para auditoria
CREATE POLICY "Permitir acesso total a audit_log" ON audit_log
    FOR ALL USING (true);

-- Políticas para notificações
CREATE POLICY "Permitir acesso total a notificacoes" ON notificacoes
    FOR ALL USING (true);

-- Políticas para backups
CREATE POLICY "Permitir acesso total a backups" ON backups
    FOR ALL USING (true);

-- Políticas para permissões
CREATE POLICY "Permitir acesso total a permissions" ON permissions
    FOR ALL USING (true);

-- Políticas para roles
CREATE POLICY "Permitir acesso total a roles" ON roles
    FOR ALL USING (true);

-- Políticas para role_permissions
CREATE POLICY "Permitir acesso total a role_permissions" ON role_permissions
    FOR ALL USING (true);

-- Políticas para user_roles
CREATE POLICY "Permitir acesso total a user_roles" ON user_roles
    FOR ALL USING (true);

-- =====================================================
-- 3. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
-- =====================================================

-- Listar todas as políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 4. TESTAR CONECTIVIDADE
-- =====================================================

-- Teste simples para verificar se as tabelas estão acessíveis
SELECT 'usuarios' as tabela, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'pacientes' as tabela, COUNT(*) as registros FROM pacientes
UNION ALL
SELECT 'profissionais' as tabela, COUNT(*) as registros FROM profissionais
UNION ALL
SELECT 'servicos' as tabela, COUNT(*) as registros FROM servicos
UNION ALL
SELECT 'agendamentos' as tabela, COUNT(*) as registros FROM agendamentos;

-- =====================================================
-- FIM DO SCRIPT DE CORREÇÃO
-- =====================================================
