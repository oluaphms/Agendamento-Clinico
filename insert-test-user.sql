-- =====================================================
-- INSERIR USUÁRIO TESTE NO SUPABASE
-- =====================================================

-- Inserir usuário teste (CPF: 555.555.555-55, Senha: 555)
-- Nota: Usando senha_hash em vez de senha, conforme estrutura da tabela
INSERT INTO usuarios (
    nome,
    cpf,
    email,
    nivel_acesso,
    status,
    senha_hash,
    primeiro_acesso,
    created_at,
    updated_at
) VALUES (
    'Usuário Teste',
    '55555555555',
    'teste@clinica.local',
    'usuario',
    'ativo',
    '555', -- Senha em texto plano (será migrada automaticamente)
    false,
    NOW(),
    NOW()
) ON CONFLICT (cpf) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    nivel_acesso = EXCLUDED.nivel_acesso,
    status = EXCLUDED.status,
    senha_hash = EXCLUDED.senha_hash,
    primeiro_acesso = EXCLUDED.primeiro_acesso,
    updated_at = NOW();

-- Verificar se o usuário foi inserido
SELECT 
    id,
    nome,
    cpf,
    email,
    nivel_acesso,
    status,
    primeiro_acesso,
    created_at,
    updated_at
FROM usuarios 
WHERE cpf = '55555555555';

-- Listar todos os usuários ativos
SELECT 
    nome,
    cpf,
    nivel_acesso,
    status,
    created_at
FROM usuarios 
WHERE status = 'ativo'
ORDER BY created_at DESC;
