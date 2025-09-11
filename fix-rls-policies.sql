-- =====================================================
-- CORREÇÃO DEFINITIVA DAS POLÍTICAS RLS
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- =====================================================
-- 1. DESABILITAR RLS TEMPORARIAMENTE
-- =====================================================

-- Desabilitar RLS em todas as tabelas
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais DISABLE ROW LEVEL SECURITY;
ALTER TABLE servicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE backups DISABLE ROW LEVEL SECURITY;
ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
-- =====================================================

-- Remover políticas de usuarios
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Admins podem gerenciar todos os usuários" ON usuarios;
DROP POLICY IF EXISTS "Permitir acesso total a usuarios" ON usuarios;
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON usuarios;

-- Remover políticas de pacientes
DROP POLICY IF EXISTS "Usuários autenticados podem ver dados básicos" ON pacientes;
DROP POLICY IF EXISTS "Permitir acesso total a pacientes" ON pacientes;
DROP POLICY IF EXISTS "Usuários autenticados podem ver pacientes" ON pacientes;

-- Remover políticas de profissionais
DROP POLICY IF EXISTS "Permitir acesso total a profissionais" ON profissionais;
DROP POLICY IF EXISTS "Usuários autenticados podem ver profissionais" ON profissionais;

-- Remover políticas de servicos
DROP POLICY IF EXISTS "Permitir acesso total a servicos" ON servicos;
DROP POLICY IF EXISTS "Usuários autenticados podem ver serviços" ON servicos;

-- Remover políticas de agendamentos
DROP POLICY IF EXISTS "Profissionais podem ver seus agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Permitir acesso total a agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Usuários autenticados podem ver agendamentos" ON agendamentos;

-- Remover políticas de pagamentos
DROP POLICY IF EXISTS "Permitir acesso total a pagamentos" ON pagamentos;
DROP POLICY IF EXISTS "Usuários autenticados podem ver pagamentos" ON pagamentos;

-- Remover políticas de configuracoes
DROP POLICY IF EXISTS "Apenas admins podem ver configurações" ON configuracoes;
DROP POLICY IF EXISTS "Permitir acesso total a configuracoes" ON configuracoes;

-- Remover políticas de audit_log
DROP POLICY IF EXISTS "Apenas admins podem ver auditoria" ON audit_log;
DROP POLICY IF EXISTS "Permitir acesso total a audit_log" ON audit_log;

-- Remover políticas de notificacoes
DROP POLICY IF EXISTS "Usuários veem apenas suas notificações" ON notificacoes;
DROP POLICY IF EXISTS "Permitir acesso total a notificacoes" ON notificacoes;

-- Remover políticas de backups
DROP POLICY IF EXISTS "Apenas admins podem ver backups" ON backups;
DROP POLICY IF EXISTS "Permitir acesso total a backups" ON backups;

-- Remover políticas de permissions
DROP POLICY IF EXISTS "Todos podem visualizar permissões" ON permissions;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar permissões" ON permissions;
DROP POLICY IF EXISTS "Permitir acesso total a permissions" ON permissions;

-- Remover políticas de roles
DROP POLICY IF EXISTS "Todos podem visualizar roles" ON roles;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar roles" ON roles;
DROP POLICY IF EXISTS "Permitir acesso total a roles" ON roles;

-- Remover políticas de role_permissions
DROP POLICY IF EXISTS "Todos podem visualizar role_permissions" ON role_permissions;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar role_permissions" ON role_permissions;
DROP POLICY IF EXISTS "Permitir acesso total a role_permissions" ON role_permissions;

-- Remover políticas de user_roles
DROP POLICY IF EXISTS "Usuários podem ver seus próprios roles" ON user_roles;
DROP POLICY IF EXISTS "Apenas admins podem gerenciar user_roles" ON user_roles;
DROP POLICY IF EXISTS "Permitir acesso total a user_roles" ON user_roles;

-- =====================================================
-- 3. VERIFICAR SE TODAS AS POLÍTICAS FORAM REMOVIDAS
-- =====================================================

SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 4. TESTAR ACESSO SEM RLS
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
-- 5. HABILITAR RLS NOVAMENTE (OPCIONAL)
-- =====================================================
-- Descomente as linhas abaixo se quiser habilitar RLS novamente
-- (recomendado manter desabilitado para desenvolvimento)

-- ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FIM DO SCRIPT DE CORREÇÃO DEFINITIVA
-- =====================================================
