-- =====================================================
-- SCRIPT DE DADOS DE EXEMPLO PARA PERMISSÕES
-- Sistema de Gestão de Clínica - Supabase
-- =====================================================

-- =====================================================
-- 1. VERIFICAR SE AS TABELAS EXISTEM
-- =====================================================

DO $$
BEGIN
    -- Verificar se as tabelas de permissões existem
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions') THEN
        RAISE EXCEPTION 'Execute primeiro o script 11-permissoes-tabelas.sql';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
        RAISE EXCEPTION 'Execute primeiro o script 11-permissoes-tabelas.sql';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        RAISE EXCEPTION 'Execute primeiro o script 11-permissoes-tabelas.sql';
    END IF;
    
    RAISE NOTICE 'Tabelas de permissões encontradas. Inserindo dados de exemplo...';
END $$;

-- =====================================================
-- 2. ATRIBUIR ROLES A USUÁRIOS EXISTENTES
-- =====================================================

-- Atribuir role de Administrador ao primeiro usuário (se existir)
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    u.id
FROM usuarios u, roles r
WHERE u.nivel_acesso = 'admin'
AND r.name = 'Administrador'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
)
LIMIT 1;

-- Atribuir role de Recepcionista aos usuários de recepção
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    (SELECT id FROM usuarios WHERE nivel_acesso = 'admin' LIMIT 1)
FROM usuarios u, roles r
WHERE u.nivel_acesso = 'recepcao'
AND r.name = 'Recepcionista'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Atribuir role de Profissional de Saúde aos profissionais
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    (SELECT id FROM usuarios WHERE nivel_acesso = 'admin' LIMIT 1)
FROM usuarios u, roles r
WHERE u.nivel_acesso = 'profissional'
AND r.name = 'Profissional de Saúde'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Atribuir role de Gerente aos gerentes
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    (SELECT id FROM usuarios WHERE nivel_acesso = 'admin' LIMIT 1)
FROM usuarios u, roles r
WHERE u.nivel_acesso = 'gerente'
AND r.name = 'Gerente'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- =====================================================
-- 3. CRIAR USUÁRIOS DE EXEMPLO (SE NÃO EXISTIREM)
-- =====================================================

-- Inserir usuário administrador de exemplo se não existir
INSERT INTO usuarios (id, nome, email, cpf, cargo, nivel_acesso, status)
SELECT 
    uuid_generate_v4(),
    'Administrador Sistema',
    'admin@sistema.com',
    '12345678901',
    'Administrador',
    'admin',
    'ativo'
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE email = 'admin@sistema.com'
);

-- Inserir usuário recepcionista de exemplo se não existir
INSERT INTO usuarios (id, nome, email, cpf, cargo, nivel_acesso, status)
SELECT 
    uuid_generate_v4(),
    'Recepcionista Exemplo',
    'recepcao@sistema.com',
    '12345678902',
    'Recepcionista',
    'recepcao',
    'ativo'
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE email = 'recepcao@sistema.com'
);

-- Inserir usuário profissional de exemplo se não existir
INSERT INTO usuarios (id, nome, email, cpf, cargo, nivel_acesso, status)
SELECT 
    uuid_generate_v4(),
    'Dr. João Silva',
    'joao.silva@sistema.com',
    '12345678903',
    'Médico',
    'profissional',
    'ativo'
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE email = 'joao.silva@sistema.com'
);

-- =====================================================
-- 4. ATRIBUIR ROLES AOS USUÁRIOS DE EXEMPLO
-- =====================================================

-- Atribuir role de Administrador ao usuário admin
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    u.id
FROM usuarios u, roles r
WHERE u.email = 'admin@sistema.com'
AND r.name = 'Administrador'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Atribuir role de Recepcionista ao usuário recepcao
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    (SELECT id FROM usuarios WHERE email = 'admin@sistema.com' LIMIT 1)
FROM usuarios u, roles r
WHERE u.email = 'recepcao@sistema.com'
AND r.name = 'Recepcionista'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Atribuir role de Profissional de Saúde ao Dr. João
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    (SELECT id FROM usuarios WHERE email = 'admin@sistema.com' LIMIT 1)
FROM usuarios u, roles r
WHERE u.email = 'joao.silva@sistema.com'
AND r.name = 'Profissional de Saúde'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- =====================================================
-- 5. CRIAR ROLES CUSTOMIZADOS DE EXEMPLO
-- =====================================================

-- Inserir role customizado "Enfermeiro"
INSERT INTO roles (name, description, is_system_role)
SELECT 'Enfermeiro', 'Acesso específico para enfermeiros', false
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Enfermeiro');

-- Atribuir permissões ao role Enfermeiro
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Enfermeiro'
AND (
    (p.resource = 'patients' AND p.action IN ('read', 'update'))
    OR (p.resource = 'schedule' AND p.action IN ('read', 'update'))
    OR (p.resource = 'services' AND p.action = 'read')
    OR (p.resource = 'reports' AND p.action = 'read')
    OR (p.resource = 'notifications' AND p.action = 'read')
)
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- Inserir role customizado "Financeiro"
INSERT INTO roles (name, description, is_system_role)
SELECT 'Financeiro', 'Acesso para área financeira', false
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Financeiro');

-- Atribuir permissões ao role Financeiro
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Financeiro'
AND (
    (p.resource = 'patients' AND p.action = 'read')
    OR (p.resource = 'schedule' AND p.action = 'read')
    OR (p.resource = 'services' AND p.action = 'read')
    OR (p.resource = 'reports' AND p.action IN ('read', 'export'))
    OR (p.resource = 'notifications' AND p.action = 'read')
)
AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
);

-- =====================================================
-- 6. CRIAR USUÁRIO DE EXEMPLO COM MÚLTIPLOS ROLES
-- =====================================================

-- Inserir usuário com múltiplos roles
INSERT INTO usuarios (id, nome, email, cpf, cargo, nivel_acesso, status)
SELECT 
    uuid_generate_v4(),
    'Maria Santos',
    'maria.santos@sistema.com',
    '12345678904',
    'Enfermeira',
    'profissional',
    'ativo'
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE email = 'maria.santos@sistema.com'
);

-- Atribuir múltiplos roles à Maria
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    (SELECT id FROM usuarios WHERE email = 'admin@sistema.com' LIMIT 1)
FROM usuarios u, roles r
WHERE u.email = 'maria.santos@sistema.com'
AND r.name IN ('Profissional de Saúde', 'Enfermeiro')
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- =====================================================
-- 7. VERIFICAÇÃO E RELATÓRIO FINAL
-- =====================================================

DO $$
DECLARE
    total_permissions INTEGER;
    total_roles INTEGER;
    total_user_roles INTEGER;
    total_role_permissions INTEGER;
BEGIN
    -- Contar registros
    SELECT COUNT(*) INTO total_permissions FROM permissions;
    SELECT COUNT(*) INTO total_roles FROM roles;
    SELECT COUNT(*) INTO total_user_roles FROM user_roles;
    SELECT COUNT(*) INTO total_role_permissions FROM role_permissions;
    
    -- Exibir relatório
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RELATÓRIO DE PERMISSÕES';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Permissões cadastradas: %', total_permissions;
    RAISE NOTICE 'Roles cadastrados: %', total_roles;
    RAISE NOTICE 'Usuários com roles atribuídos: %', total_user_roles;
    RAISE NOTICE 'Relacionamentos role-permission: %', total_role_permissions;
    RAISE NOTICE '========================================';
    
    -- Listar roles e suas permissões
    RAISE NOTICE 'ROLES E SUAS PERMISSÕES:';
    FOR rec IN 
        SELECT r.name as role_name, COUNT(rp.permission_id) as permission_count
        FROM roles r
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        GROUP BY r.id, r.name
        ORDER BY r.name
    LOOP
        RAISE NOTICE '  %: % permissões', rec.role_name, rec.permission_count;
    END LOOP;
    
    -- Listar usuários e seus roles
    RAISE NOTICE 'USUÁRIOS E SEUS ROLES:';
    FOR rec IN 
        SELECT u.nome, u.email, STRING_AGG(r.name, ', ') as roles
        FROM usuarios u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        GROUP BY u.id, u.nome, u.email
        ORDER BY u.nome
    LOOP
        RAISE NOTICE '  % (%): %', rec.nome, rec.email, COALESCE(rec.roles, 'Sem roles');
    END LOOP;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Dados de exemplo inseridos com sucesso!';
    RAISE NOTICE '========================================';
END $$;
