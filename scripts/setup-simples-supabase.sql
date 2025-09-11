-- =====================================================
-- SETUP SIMPLES PARA SUPABASE
-- =====================================================
-- Este script é mais simples e compatível com o schema existente do Supabase

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. ADICIONAR 'desenvolvedor' AO ENUM nivel_acesso
-- =====================================================

-- Adicionar 'desenvolvedor' ao ENUM nivel_acesso se não existir
DO $$
BEGIN
    -- Verificar se o valor 'desenvolvedor' já existe no ENUM
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'desenvolvedor' 
        AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'nivel_acesso'
        )
    ) THEN
        -- Adicionar 'desenvolvedor' ao ENUM existente
        ALTER TYPE nivel_acesso ADD VALUE 'desenvolvedor';
        RAISE NOTICE 'Valor "desenvolvedor" adicionado ao ENUM nivel_acesso';
    ELSE
        RAISE NOTICE 'Valor "desenvolvedor" já existe no ENUM nivel_acesso';
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
-- 3. VERIFICAÇÃO E RELATÓRIO
-- =====================================================

DO $$
DECLARE
    total_usuarios INTEGER;
    admin_count INTEGER;
    recepcao_count INTEGER;
    dev_count INTEGER;
    prof_count INTEGER;
BEGIN
    -- Contar usuários padrão
    SELECT COUNT(*) INTO total_usuarios 
    FROM usuarios 
    WHERE cpf IN ('111.111.111.11', '222.222.222.22', '333.333.333.33', '444.444.444.44');
    
    -- Contar cada tipo de usuário
    SELECT COUNT(*) INTO admin_count FROM usuarios WHERE cpf = '111.111.111.11';
    SELECT COUNT(*) INTO recepcao_count FROM usuarios WHERE cpf = '222.222.222.22';
    SELECT COUNT(*) INTO dev_count FROM usuarios WHERE cpf = '333.333.333.33';
    SELECT COUNT(*) INTO prof_count FROM usuarios WHERE cpf = '444.444.444.44';
    
    -- Relatório
    RAISE NOTICE '========================================';
    RAISE NOTICE 'USUÁRIOS PADRÃO CRIADOS COM SUCESSO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total de usuários criados: % de 4', total_usuarios;
    RAISE NOTICE 'Administrador: %', admin_count;
    RAISE NOTICE 'Recepcionista: %', recepcao_count;
    RAISE NOTICE 'Desenvolvedor: %', dev_count;
    RAISE NOTICE 'Profissional: %', prof_count;
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
