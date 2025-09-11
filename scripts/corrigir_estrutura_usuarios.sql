-- =====================================================
-- SCRIPT PARA CORRIGIR ESTRUTURA DE USUÁRIOS
-- Compatibilidade entre banco local e Supabase
-- =====================================================

-- 1. ADICIONAR CAMPOS FALTANTES NA TABELA USUÁRIOS
-- (Execute apenas se os campos não existirem)

-- Adicionar campo email se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'email') THEN
        ALTER TABLE usuarios ADD COLUMN email VARCHAR(255);
    END IF;
END $$;

-- Adicionar campo senha_hash se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'senha_hash') THEN
        ALTER TABLE usuarios ADD COLUMN senha_hash VARCHAR(255);
    END IF;
END $$;

-- Adicionar campo status se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'status') THEN
        ALTER TABLE usuarios ADD COLUMN status VARCHAR(20) DEFAULT 'ativo';
    END IF;
END $$;

-- Adicionar campo cargo se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'cargo') THEN
        ALTER TABLE usuarios ADD COLUMN cargo VARCHAR(100);
    END IF;
END $$;

-- Adicionar campo telefone se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'telefone') THEN
        ALTER TABLE usuarios ADD COLUMN telefone VARCHAR(20);
    END IF;
END $$;

-- Adicionar campos de timestamp se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'created_at') THEN
        ALTER TABLE usuarios ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'updated_at') THEN
        ALTER TABLE usuarios ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'usuarios' AND column_name = 'ultimo_login') THEN
        ALTER TABLE usuarios ADD COLUMN ultimo_login TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. ATUALIZAR DADOS EXISTENTES
-- Gerar emails baseados no CPF para usuários existentes
UPDATE usuarios 
SET email = CONCAT(cpf, '@clinica.local')
WHERE email IS NULL OR email = '';

-- Atualizar senha_hash com hash da senha atual (temporário)
-- NOTA: Em produção, isso deve ser feito com bcrypt
-- Como a coluna 'senha' não existe no Supabase, vamos gerar hashes temporários
UPDATE usuarios 
SET senha_hash = crypt('123456', gen_salt('bf'))
WHERE senha_hash IS NULL OR senha_hash = '';

-- Atualizar campos com valores padrão
UPDATE usuarios 
SET status = 'ativo' 
WHERE status IS NULL OR status = '';

UPDATE usuarios 
SET cargo = 'Funcionário' 
WHERE cargo IS NULL OR cargo = '';

UPDATE usuarios 
SET telefone = 'Não informado' 
WHERE telefone IS NULL OR telefone = '';

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(cpf);
CREATE INDEX IF NOT EXISTS idx_usuarios_status ON usuarios(status);
CREATE INDEX IF NOT EXISTS idx_usuarios_nivel_acesso ON usuarios(nivel_acesso);

-- 4. CRIAR TRIGGER PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_usuarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_usuarios_updated_at ON usuarios;
CREATE TRIGGER trigger_update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_usuarios_updated_at();

-- 5. VERIFICAR ESTRUTURA FINAL
SELECT 
    column_name as "Campo",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL",
    column_default as "Valor Padrão"
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;
