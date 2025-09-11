-- =====================================================
-- CORRIGIR STATUS SIMPLES
-- Script seguro para corrigir apenas valores NULL
-- =====================================================

-- 1. VERIFICAR VALORES ATUAIS DE STATUS
SELECT 
    'Valores atuais de status:' as info,
    status,
    COUNT(*) as quantidade
FROM usuarios
GROUP BY status
ORDER BY status;

-- 2. CORRIGIR APENAS VALORES NULL
UPDATE usuarios 
SET status = 'ativo'
WHERE status IS NULL;

-- 3. VERIFICAR SE AINDA HÁ PROBLEMAS
SELECT 
    'Valores após correção:' as info,
    status,
    COUNT(*) as quantidade
FROM usuarios
GROUP BY status
ORDER BY status;

-- 4. VERIFICAR SE EXISTEM VALORES INVÁLIDOS
SELECT 
    'Verificação de valores inválidos:' as info,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN status IN ('ativo', 'inativo', 'suspenso') THEN 1 END) as status_validos,
    COUNT(CASE WHEN status NOT IN ('ativo', 'inativo', 'suspenso') THEN 1 END) as status_invalidos
FROM usuarios;

-- 5. LISTAR USUÁRIOS COM STATUS CORRIGIDO
SELECT 
    'Usuários com status corrigido:' as info,
    nome,
    cpf,
    status,
    nivel_acesso
FROM usuarios
WHERE status = 'ativo'
ORDER BY nome;
