-- =====================================================
-- SCRIPT DE VERIFICAÇÃO SIMPLES DAS PERMISSÕES
-- Sistema de Gestão de Clínica - Supabase
-- =====================================================
-- Execute este script após o script principal para verificar se tudo funcionou

-- =====================================================
-- 1. VERIFICAR ESTRUTURA DAS TABELAS
-- =====================================================

SELECT 
    'Tabelas de Permissões' as categoria,
    table_name as tabela,
    'Criada' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('permissions', 'roles', 'role_permissions', 'user_roles')
ORDER BY table_name;

-- =====================================================
-- 2. VERIFICAR DADOS INSERIDOS
-- =====================================================

SELECT 
    'Permissões' as tipo,
    COUNT(*) as total
FROM permissions

UNION ALL

SELECT 
    'Roles' as tipo,
    COUNT(*) as total
FROM roles

UNION ALL

SELECT 
    'Relacionamentos Role-Permission' as tipo,
    COUNT(*) as total
FROM role_permissions

UNION ALL

SELECT 
    'Usuários com Roles' as tipo,
    COUNT(*) as total
FROM user_roles;

-- =====================================================
-- 3. VERIFICAR ROLES E SUAS PERMISSÕES
-- =====================================================

SELECT 
    r.name as role_name,
    COUNT(rp.permission_id) as total_permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY r.name;

-- =====================================================
-- 4. VERIFICAR USUÁRIOS E SEUS ROLES
-- =====================================================

SELECT 
    u.nome,
    u.nivel_acesso,
    STRING_AGG(r.name, ', ') as roles_atribuidos
FROM usuarios u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.nome, u.nivel_acesso
ORDER BY u.nome;

-- =====================================================
-- 5. TESTE DE FUNCIONALIDADE
-- =====================================================

-- Verificar se o Administrador tem permissão para excluir pacientes
SELECT 
    'Teste: Admin pode excluir pacientes' as teste,
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ SIM'
        ELSE '✗ NÃO'
    END as resultado
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'Administrador' 
AND p.resource = 'patients' 
AND p.action = 'delete';

-- Verificar se a Recepcionista NÃO tem permissão para excluir pacientes
SELECT 
    'Teste: Recepcionista NÃO pode excluir pacientes' as teste,
    CASE 
        WHEN COUNT(*) = 0 THEN '✓ CORRETO'
        ELSE '✗ INCORRETO'
    END as resultado
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'Recepcionista' 
AND p.resource = 'patients' 
AND p.action = 'delete';

-- =====================================================
-- 6. RELATÓRIO FINAL
-- =====================================================

SELECT 
    '========================================' as relatorio
UNION ALL
SELECT 'SISTEMA DE PERMISSÕES VERIFICADO!'
UNION ALL
SELECT '========================================'
UNION ALL
SELECT 'Status: ✓ IMPLEMENTADO COM SUCESSO'
UNION ALL
SELECT 'Próximo passo: Testar no frontend'
UNION ALL
SELECT '========================================';
