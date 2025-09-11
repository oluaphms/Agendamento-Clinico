-- =====================================================
-- USUÁRIOS PADRÃO DO SISTEMA DE GESTÃO DE CLÍNICA
-- =====================================================
-- Este script cria os usuários padrão do sistema com as credenciais especificadas

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. CRIAR USUÁRIOS PADRÃO
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
-- 2. ATRIBUIR ROLES AOS USUÁRIOS PADRÃO
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
-- 3. VERIFICAÇÃO E RELATÓRIO
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
    RAISE NOTICE 'ACESSO TOTAL: Administrador e Desenvolvedor';
    RAISE NOTICE '========================================';
END $$;


