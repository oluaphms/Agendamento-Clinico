-- =====================================================
-- SETUP COMPLETO DOS USUÁRIOS PADRÃO DO SISTEMA
-- =====================================================
-- Este script executa todos os passos necessários para criar
-- os usuários padrão do sistema com suas respectivas permissões

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. ATUALIZAR SCHEMA DA TABELA USUARIOS (se necessário)
-- =====================================================

-- Adicionar 'desenvolvedor' ao CHECK constraint se não existir
DO $$
BEGIN
    -- Verificar se o constraint já inclui 'desenvolvedor'
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%nivel_acesso%' 
        AND check_clause LIKE '%desenvolvedor%'
    ) THEN
        -- Remover constraint antigo e criar novo
        ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_nivel_acesso_check;
        ALTER TABLE usuarios ADD CONSTRAINT usuarios_nivel_acesso_check 
        CHECK (nivel_acesso IN ('admin', 'gerente', 'usuario', 'recepcao', 'profissional', 'desenvolvedor'));
        
        RAISE NOTICE 'Schema da tabela usuarios atualizado com sucesso';
    ELSE
        RAISE NOTICE 'Schema da tabela usuarios já está atualizado';
    END IF;
END $$;

-- =====================================================
-- 2. CRIAR USUÁRIOS PADRÃO
-- =====================================================

-- Inserir usuário Administrador
INSERT INTO usuarios (
    id,
    nome,
    email,
    cpf,
    telefone,
    cargo,
    nivel_acesso,
    status,
    senha_hash,
    primeiro_acesso,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'Administrador do Sistema',
    'admin@sistemaclinico.com',
    '111.111.111.11',
    '(11) 99999-1111',
    'Administrador',
    'admin',
    'ativo',
    crypt('111', gen_salt('bf')),
    false,
    NOW(),
    NOW()
) ON CONFLICT (cpf) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    nivel_acesso = EXCLUDED.nivel_acesso,
    status = EXCLUDED.status,
    senha_hash = EXCLUDED.senha_hash,
    updated_at = NOW();

-- Inserir usuário Recepcionista
INSERT INTO usuarios (
    id,
    nome,
    email,
    cpf,
    telefone,
    cargo,
    nivel_acesso,
    status,
    senha_hash,
    primeiro_acesso,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'Recepcionista',
    'recepcao@sistemaclinico.com',
    '222.222.222.22',
    '(11) 99999-2222',
    'Recepcionista',
    'recepcao',
    'ativo',
    crypt('222', gen_salt('bf')),
    false,
    NOW(),
    NOW()
) ON CONFLICT (cpf) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    nivel_acesso = EXCLUDED.nivel_acesso,
    status = EXCLUDED.status,
    senha_hash = EXCLUDED.senha_hash,
    updated_at = NOW();

-- Inserir usuário Desenvolvedor
INSERT INTO usuarios (
    id,
    nome,
    email,
    cpf,
    telefone,
    cargo,
    nivel_acesso,
    status,
    senha_hash,
    primeiro_acesso,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'Desenvolvedor do Sistema',
    'dev@sistemaclinico.com',
    '333.333.333.33',
    '(11) 99999-3333',
    'Desenvolvedor',
    'desenvolvedor',
    'ativo',
    crypt('333', gen_salt('bf')),
    false,
    NOW(),
    NOW()
) ON CONFLICT (cpf) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    nivel_acesso = EXCLUDED.nivel_acesso,
    status = EXCLUDED.status,
    senha_hash = EXCLUDED.senha_hash,
    updated_at = NOW();

-- Inserir usuário Profissional
INSERT INTO usuarios (
    id,
    nome,
    email,
    cpf,
    telefone,
    cargo,
    nivel_acesso,
    status,
    senha_hash,
    primeiro_acesso,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'Profissional de Saúde',
    'profissional@sistemaclinico.com',
    '444.444.444.44',
    '(11) 99999-4444',
    'Profissional de Saúde',
    'profissional',
    'ativo',
    crypt('4444', gen_salt('bf')),
    false,
    NOW(),
    NOW()
) ON CONFLICT (cpf) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    nivel_acesso = EXCLUDED.nivel_acesso,
    status = EXCLUDED.status,
    senha_hash = EXCLUDED.senha_hash,
    updated_at = NOW();

-- =====================================================
-- 3. VERIFICAR SE SISTEMA DE PERMISSÕES EXISTE
-- =====================================================

DO $$
DECLARE
    permissions_table_exists BOOLEAN;
    roles_table_exists BOOLEAN;
    user_roles_table_exists BOOLEAN;
    role_permissions_table_exists BOOLEAN;
BEGIN
    -- Verificar se as tabelas de permissões existem
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'permissions'
    ) INTO permissions_table_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'roles'
    ) INTO roles_table_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_roles'
    ) INTO user_roles_table_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'role_permissions'
    ) INTO role_permissions_table_exists;
    
    IF NOT (permissions_table_exists AND roles_table_exists AND user_roles_table_exists AND role_permissions_table_exists) THEN
        RAISE NOTICE 'Sistema de permissões não encontrado. Execute primeiro o script permissoes-corrigido-final.sql';
        RAISE EXCEPTION 'Sistema de permissões necessário para continuar';
    ELSE
        RAISE NOTICE 'Sistema de permissões encontrado. Continuando...';
    END IF;
END $$;

-- =====================================================
-- 4. ATRIBUIR ROLES AOS USUÁRIOS PADRÃO
-- =====================================================

-- Atribuir role de Administrador ao usuário admin
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    u.id
FROM usuarios u, roles r
WHERE u.cpf = '111.111.111.11'
AND r.name = 'Administrador'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Atribuir role de Recepcionista ao usuário recepcionista
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    (SELECT id FROM usuarios WHERE cpf = '111.111.111.11' LIMIT 1)
FROM usuarios u, roles r
WHERE u.cpf = '222.222.222.22'
AND r.name = 'Recepcionista'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Atribuir role de Desenvolvedor ao usuário desenvolvedor
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    (SELECT id FROM usuarios WHERE cpf = '111.111.111.11' LIMIT 1)
FROM usuarios u, roles r
WHERE u.cpf = '333.333.333.33'
AND r.name = 'Desenvolvedor'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Atribuir role de Profissional de Saúde ao usuário profissional
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    u.id,
    r.id,
    (SELECT id FROM usuarios WHERE cpf = '111.111.111.11' LIMIT 1)
FROM usuarios u, roles r
WHERE u.cpf = '444.444.444.44'
AND r.name = 'Profissional de Saúde'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- =====================================================
-- 5. VERIFICAÇÃO E RELATÓRIO FINAL
-- =====================================================

DO $$
DECLARE
    admin_count INTEGER;
    recepcao_count INTEGER;
    dev_count INTEGER;
    prof_count INTEGER;
    admin_role_count INTEGER;
    recepcao_role_count INTEGER;
    dev_role_count INTEGER;
    prof_role_count INTEGER;
    total_permissions INTEGER;
    total_roles INTEGER;
BEGIN
    -- Contar usuários criados
    SELECT COUNT(*) INTO admin_count FROM usuarios WHERE cpf = '111.111.111.11';
    SELECT COUNT(*) INTO recepcao_count FROM usuarios WHERE cpf = '222.222.222.22';
    SELECT COUNT(*) INTO dev_count FROM usuarios WHERE cpf = '333.333.333.33';
    SELECT COUNT(*) INTO prof_count FROM usuarios WHERE cpf = '444.444.444.44';
    
    -- Contar roles atribuídos
    SELECT COUNT(*) INTO admin_role_count 
    FROM user_roles ur 
    JOIN usuarios u ON ur.user_id = u.id 
    JOIN roles r ON ur.role_id = r.id 
    WHERE u.cpf = '111.111.111.11' AND r.name = 'Administrador';
    
    SELECT COUNT(*) INTO recepcao_role_count 
    FROM user_roles ur 
    JOIN usuarios u ON ur.user_id = u.id 
    JOIN roles r ON ur.role_id = r.id 
    WHERE u.cpf = '222.222.222.22' AND r.name = 'Recepcionista';
    
    SELECT COUNT(*) INTO dev_role_count 
    FROM user_roles ur 
    JOIN usuarios u ON ur.user_id = u.id 
    JOIN roles r ON ur.role_id = r.id 
    WHERE u.cpf = '333.333.333.33' AND r.name = 'Desenvolvedor';
    
    SELECT COUNT(*) INTO prof_role_count 
    FROM user_roles ur 
    JOIN usuarios u ON ur.user_id = u.id 
    JOIN roles r ON ur.role_id = r.id 
    WHERE u.cpf = '444.444.444.44' AND r.name = 'Profissional de Saúde';
    
    -- Contar permissões e roles
    SELECT COUNT(*) INTO total_permissions FROM permissions;
    SELECT COUNT(*) INTO total_roles FROM roles;
    
    -- Relatório
    RAISE NOTICE '========================================';
    RAISE NOTICE 'USUÁRIOS PADRÃO CRIADOS COM SUCESSO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Administrador (111.111.111.11): % usuário(s), % role(s)', admin_count, admin_role_count;
    RAISE NOTICE 'Recepcionista (222.222.222.22): % usuário(s), % role(s)', recepcao_count, recepcao_role_count;
    RAISE NOTICE 'Desenvolvedor (333.333.333.33): % usuário(s), % role(s)', dev_count, dev_role_count;
    RAISE NOTICE 'Profissional (444.444.444.44): % usuário(s), % role(s)', prof_count, prof_role_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CREDENCIAIS DE ACESSO:';
    RAISE NOTICE 'Admin: CPF 111.111.111.11 | Senha: 111';
    RAISE NOTICE 'Recepcionista: CPF 222.222.222.22 | Senha: 222';
    RAISE NOTICE 'Desenvolvedor: CPF 333.333.333.33 | Senha: 333';
    RAISE NOTICE 'Profissional: CPF 444.444.444.44 | Senha: 4444';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'NÍVEIS DE ACESSO:';
    RAISE NOTICE 'ACESSO TOTAL: Administrador e Desenvolvedor';
    RAISE NOTICE 'ACESSO RECEPÇÃO: Recepcionista';
    RAISE NOTICE 'ACESSO PROFISSIONAL: Profissional de Saúde';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SISTEMA DE PERMISSÕES:';
    RAISE NOTICE 'Total de permissões: %', total_permissions;
    RAISE NOTICE 'Total de roles: %', total_roles;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SETUP CONCLUÍDO COM SUCESSO!';
    RAISE NOTICE '========================================';
END $$;
