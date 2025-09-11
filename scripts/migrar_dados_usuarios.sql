-- =====================================================
-- SCRIPT PARA MIGRAR DADOS DE USUÁRIOS
-- Migração do banco local para formato compatível com Supabase
-- =====================================================

-- 1. BACKUP DOS DADOS ORIGINAIS
CREATE TABLE IF NOT EXISTS usuarios_backup AS 
SELECT * FROM usuarios;

-- 2. MIGRAR DADOS EXISTENTES
-- Atualizar emails baseados no CPF (apenas se não tiver email)
UPDATE usuarios 
SET email = CONCAT(REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', ''), '@clinica.local')
WHERE email IS NULL OR email = '' OR email NOT LIKE '%@%';

-- Gerar senhas padrão para usuários sem senha_hash
UPDATE usuarios 
SET senha_hash = crypt('123456', gen_salt('bf'))
WHERE senha_hash IS NULL OR senha_hash = '';

-- Atualizar campos com valores padrão
UPDATE usuarios 
SET telefone = COALESCE(telefone, 'Não informado')
WHERE telefone IS NULL OR telefone = '';

UPDATE usuarios 
SET cargo = COALESCE(cargo, 'Funcionário')
WHERE cargo IS NULL OR cargo = '';

UPDATE usuarios 
SET status = 'ativo'
WHERE status IS NULL 
   OR status NOT IN ('ativo', 'inativo', 'suspenso');

UPDATE usuarios 
SET primeiro_acesso = COALESCE(primeiro_acesso, false)
WHERE primeiro_acesso IS NULL;

-- 3. VALIDAR DADOS MIGRADOS
SELECT 
    'Total de usuários' as "Métrica",
    COUNT(*) as "Valor"
FROM usuarios
UNION ALL
SELECT 
    'Usuários com email' as "Métrica",
    COUNT(*) as "Valor"
FROM usuarios 
WHERE email IS NOT NULL AND email != ''
UNION ALL
SELECT 
    'Usuários com senha_hash' as "Métrica",
    COUNT(*) as "Valor"
FROM usuarios 
WHERE senha_hash IS NOT NULL AND senha_hash != ''
UNION ALL
SELECT 
    'Usuários ativos' as "Métrica",
    COUNT(*) as "Valor"
FROM usuarios 
WHERE status = 'ativo';

-- 4. VERIFICAR DADOS ÚNICOS
SELECT 
    'CPFs únicos' as "Métrica",
    COUNT(DISTINCT cpf) as "Valor"
FROM usuarios
UNION ALL
SELECT 
    'Emails únicos' as "Métrica",
    COUNT(DISTINCT email) as "Valor"
FROM usuarios
WHERE email IS NOT NULL AND email != '';

-- 5. LISTAR USUÁRIOS MIGRADOS
SELECT 
    id,
    nome,
    cpf,
    email,
    nivel_acesso,
    status,
    created_at
FROM usuarios
ORDER BY created_at DESC;
