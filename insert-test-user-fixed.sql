-- =====================================================
-- INSERIR USUÁRIO TESTE NO SUPABASE (VERSÃO CORRIGIDA)
-- =====================================================

-- Inserir usuário teste (CPF: 555.555.555-55, Senha: 555)
-- Usando a estrutura correta da tabela com senha_hash
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
    '555', -- Senha em texto plano (o sistema fará hash automaticamente)
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
    'Usuário inserido com sucesso!' as status,
    id,
    nome,
    cpf,
    email,
    nivel_acesso,
    status as usuario_status,
    primeiro_acesso,
    created_at,
    updated_at
FROM usuarios 
WHERE cpf = '55555555555';

-- Listar todos os usuários ativos para verificação
SELECT 
    'Lista de todos os usuários ativos:' as info,
    COUNT(*) as total_usuarios_ativos
FROM usuarios 
WHERE status = 'ativo';

-- Mostrar detalhes dos usuários ativos
SELECT 
    nome,
    cpf,
    nivel_acesso,
    status,
    primeiro_acesso,
    created_at
FROM usuarios 
WHERE status = 'ativo'
ORDER BY created_at DESC;

-- Teste de login (simular busca por CPF)
SELECT 
    'Teste de busca por CPF para login:' as teste,
    CASE 
        WHEN COUNT(*) > 0 THEN 'SUCESSO - Usuário encontrado'
        ELSE 'FALHA - Usuário não encontrado'
    END as resultado,
    nome,
    cpf,
    status
FROM usuarios 
WHERE cpf = '55555555555' 
AND status = 'ativo';
