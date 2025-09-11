-- =====================================================
-- CORRIGIR DADOS EXISTENTES NO SUPABASE
-- Script para corrigir dados de usuários existentes
-- =====================================================

-- 1. ADICIONAR CAMPOS FALTANTES SE NÃO EXISTIREM
DO $$ 
BEGIN
    -- Adicionar campo senha_hash se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'senha_hash') THEN
        ALTER TABLE usuarios ADD COLUMN senha_hash VARCHAR(255);
    END IF;
    
    -- Adicionar campo telefone se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'telefone') THEN
        ALTER TABLE usuarios ADD COLUMN telefone VARCHAR(20);
    END IF;
    
    -- Adicionar campo cargo se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'cargo') THEN
        ALTER TABLE usuarios ADD COLUMN cargo VARCHAR(100);
    END IF;
    
    -- Adicionar campo status se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'status') THEN
        ALTER TABLE usuarios ADD COLUMN status VARCHAR(20) DEFAULT 'ativo';
    END IF;
    
    -- Adicionar campo primeiro_acesso se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'primeiro_acesso') THEN
        ALTER TABLE usuarios ADD COLUMN primeiro_acesso BOOLEAN DEFAULT false;
    END IF;
    
    -- Adicionar campo ultimo_login se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'ultimo_login') THEN
        ALTER TABLE usuarios ADD COLUMN ultimo_login TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. ATUALIZAR DADOS EXISTENTES
-- Gerar senhas padrão para usuários existentes
UPDATE usuarios 
SET senha_hash = crypt('123456', gen_salt('bf'))
WHERE senha_hash IS NULL OR senha_hash = '';

-- Atualizar campos com valores padrão
UPDATE usuarios 
SET telefone = 'Não informado'
WHERE telefone IS NULL OR telefone = '';

UPDATE usuarios 
SET cargo = 'Funcionário'
WHERE cargo IS NULL OR cargo = '';

UPDATE usuarios 
SET status = 'ativo'
WHERE status IS NULL OR status NOT IN ('ativo', 'inativo', 'suspenso');

UPDATE usuarios 
SET primeiro_acesso = false
WHERE primeiro_acesso IS NULL;

-- 3. VERIFICAR DADOS ATUALIZADOS
SELECT 
    'Dados atualizados com sucesso' as status,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN senha_hash IS NOT NULL THEN 1 END) as usuarios_com_senha,
    COUNT(CASE WHEN telefone IS NOT NULL THEN 1 END) as usuarios_com_telefone,
    COUNT(CASE WHEN cargo IS NOT NULL THEN 1 END) as usuarios_com_cargo
FROM usuarios;

-- 4. LISTAR USUÁRIOS ATUALIZADOS
SELECT 
    id,
    nome,
    email,
    cpf,
    telefone,
    cargo,
    nivel_acesso,
    status,
    primeiro_acesso,
    created_at
FROM usuarios
ORDER BY created_at DESC;
