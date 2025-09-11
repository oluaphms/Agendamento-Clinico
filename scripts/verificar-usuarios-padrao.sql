-- =====================================================
-- VERIFICAÇÃO DOS USUÁRIOS PADRÃO DO SISTEMA
-- =====================================================
-- Este script verifica se os usuários padrão foram criados corretamente
-- e se suas permissões estão configuradas adequadamente

-- =====================================================
-- 1. VERIFICAR USUÁRIOS CRIADOS
-- =====================================================

SELECT 
    'VERIFICAÇÃO DE USUÁRIOS' as secao,
    '' as detalhe;

SELECT 
    nome,
    cpf,
    nivel_acesso,
    status,
    CASE 
        WHEN cpf = '111.111.111.11' THEN '✓ Administrador'
        WHEN cpf = '222.222.222.22' THEN '✓ Recepcionista'
        WHEN cpf = '333.333.333.33' THEN '✓ Desenvolvedor'
        WHEN cpf = '444.444.444.44' THEN '✓ Profissional'
        ELSE '? Usuário não padrão'
    END as tipo_usuario,
    created_at
FROM usuarios 
WHERE cpf IN ('111.111.111.11', '222.222.222.22', '333.333.333.33', '444.444.444.44')
ORDER BY cpf;

-- =====================================================
-- 2. VERIFICAR ROLES ATRIBUÍDOS
-- =====================================================

SELECT 
    'VERIFICAÇÃO DE ROLES' as secao,
    '' as detalhe;

SELECT 
    u.nome as usuario,
    u.cpf,
    r.name as role,
    r.description as descricao_role,
    ur.created_at as atribuido_em
FROM usuarios u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.cpf IN ('111.111.111.11', '222.222.222.22', '333.333.333.33', '444.444.444.44')
ORDER BY u.cpf, r.name;

-- =====================================================
-- 3. VERIFICAR PERMISSÕES POR USUÁRIO
-- =====================================================

SELECT 
    'VERIFICAÇÃO DE PERMISSÕES' as secao,
    '' as detalhe;

-- Permissões do Administrador
SELECT 
    'ADMINISTRADOR' as usuario,
    COUNT(DISTINCT p.id) as total_permissoes,
    COUNT(DISTINCT p.resource) as recursos_acesso,
    STRING_AGG(DISTINCT p.resource, ', ' ORDER BY p.resource) as recursos
FROM usuarios u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.cpf = '111.111.111.11';

-- Permissões do Desenvolvedor
SELECT 
    'DESENVOLVEDOR' as usuario,
    COUNT(DISTINCT p.id) as total_permissoes,
    COUNT(DISTINCT p.resource) as recursos_acesso,
    STRING_AGG(DISTINCT p.resource, ', ' ORDER BY p.resource) as recursos
FROM usuarios u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.cpf = '333.333.333.33';

-- Permissões da Recepcionista
SELECT 
    'RECEPCIONISTA' as usuario,
    COUNT(DISTINCT p.id) as total_permissoes,
    COUNT(DISTINCT p.resource) as recursos_acesso,
    STRING_AGG(DISTINCT p.resource, ', ' ORDER BY p.resource) as recursos
FROM usuarios u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.cpf = '222.222.222.22';

-- Permissões do Profissional
SELECT 
    'PROFISSIONAL' as usuario,
    COUNT(DISTINCT p.id) as total_permissoes,
    COUNT(DISTINCT p.resource) as recursos_acesso,
    STRING_AGG(DISTINCT p.resource, ', ' ORDER BY p.resource) as recursos
FROM usuarios u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.cpf = '444.444.444.44';

-- =====================================================
-- 4. VERIFICAR DETALHES DAS PERMISSÕES
-- =====================================================

SELECT 
    'DETALHES DAS PERMISSÕES' as secao,
    '' as detalhe;

-- Listar todas as permissões disponíveis por recurso
SELECT 
    p.resource as recurso,
    COUNT(*) as total_permissoes,
    STRING_AGG(p.action, ', ' ORDER BY p.action) as acoes_disponiveis
FROM permissions p
GROUP BY p.resource
ORDER BY p.resource;

-- =====================================================
-- 5. VERIFICAÇÃO DE SEGURANÇA
-- =====================================================

SELECT 
    'VERIFICAÇÃO DE SEGURANÇA' as secao,
    '' as detalhe;

-- Verificar se as senhas estão criptografadas
SELECT 
    nome,
    cpf,
    CASE 
        WHEN senha_hash LIKE '$2%' THEN '✓ Senha criptografada (bcrypt)'
        ELSE '⚠ Senha não criptografada'
    END as status_senha,
    primeiro_acesso
FROM usuarios 
WHERE cpf IN ('111.111.111.11', '222.222.222.22', '333.333.333.33', '444.444.444.44')
ORDER BY cpf;

-- =====================================================
-- 6. RELATÓRIO FINAL
-- =====================================================

DO $$
DECLARE
    total_usuarios INTEGER;
    usuarios_com_roles INTEGER;
    total_permissoes INTEGER;
    total_roles INTEGER;
    admin_permissoes INTEGER;
    dev_permissoes INTEGER;
    recepcao_permissoes INTEGER;
    prof_permissoes INTEGER;
BEGIN
    -- Contar usuários padrão
    SELECT COUNT(*) INTO total_usuarios 
    FROM usuarios 
    WHERE cpf IN ('111.111.111.11', '222.222.222.22', '333.333.333.33', '444.444.444.44');
    
    -- Contar usuários com roles
    SELECT COUNT(DISTINCT u.id) INTO usuarios_com_roles
    FROM usuarios u
    JOIN user_roles ur ON u.id = ur.user_id
    WHERE u.cpf IN ('111.111.111.11', '222.222.222.22', '333.333.333.33', '444.444.444.44');
    
    -- Contar permissões e roles
    SELECT COUNT(*) INTO total_permissoes FROM permissions;
    SELECT COUNT(*) INTO total_roles FROM roles;
    
    -- Contar permissões por usuário
    SELECT COUNT(DISTINCT p.id) INTO admin_permissoes
    FROM usuarios u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.cpf = '111.111.111.11';
    
    SELECT COUNT(DISTINCT p.id) INTO dev_permissoes
    FROM usuarios u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.cpf = '333.333.333.33';
    
    SELECT COUNT(DISTINCT p.id) INTO recepcao_permissoes
    FROM usuarios u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.cpf = '222.222.222.22';
    
    SELECT COUNT(DISTINCT p.id) INTO prof_permissoes
    FROM usuarios u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.cpf = '444.444.444.44';
    
    -- Relatório final
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RELATÓRIO DE VERIFICAÇÃO DOS USUÁRIOS PADRÃO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Usuários padrão criados: % de 4', total_usuarios;
    RAISE NOTICE 'Usuários com roles atribuídos: % de 4', usuarios_com_roles;
    RAISE NOTICE 'Total de permissões no sistema: %', total_permissoes;
    RAISE NOTICE 'Total de roles no sistema: %', total_roles;
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'PERMISSÕES POR USUÁRIO:';
    RAISE NOTICE 'Administrador: % permissões', admin_permissoes;
    RAISE NOTICE 'Desenvolvedor: % permissões', dev_permissoes;
    RAISE NOTICE 'Recepcionista: % permissões', recepcao_permissoes;
    RAISE NOTICE 'Profissional: % permissões', prof_permissoes;
    RAISE NOTICE '----------------------------------------';
    
    -- Verificações de integridade
    IF total_usuarios = 4 THEN
        RAISE NOTICE '✓ Todos os usuários padrão foram criados';
    ELSE
        RAISE NOTICE '⚠ Faltam usuários padrão: % de 4', total_usuarios;
    END IF;
    
    IF usuarios_com_roles = 4 THEN
        RAISE NOTICE '✓ Todos os usuários têm roles atribuídos';
    ELSE
        RAISE NOTICE '⚠ Faltam roles: % de 4 usuários', usuarios_com_roles;
    END IF;
    
    IF admin_permissoes = dev_permissoes AND admin_permissoes > 0 THEN
        RAISE NOTICE '✓ Administrador e Desenvolvedor têm acesso total';
    ELSE
        RAISE NOTICE '⚠ Problema com permissões de acesso total';
    END IF;
    
    IF recepcao_permissoes > 0 AND prof_permissoes > 0 THEN
        RAISE NOTICE '✓ Recepcionista e Profissional têm permissões configuradas';
    ELSE
        RAISE NOTICE '⚠ Problema com permissões de Recepcionista/Profissional';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICAÇÃO CONCLUÍDA';
    RAISE NOTICE '========================================';
END $$;
