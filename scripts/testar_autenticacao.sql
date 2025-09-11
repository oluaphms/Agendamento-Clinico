-- =====================================================
-- SCRIPT PARA TESTAR FLUXO COMPLETO DE AUTENTICAÇÃO
-- =====================================================

-- 1. LIMPAR DADOS DE TESTE ANTERIORES
DELETE FROM usuarios WHERE email LIKE '%@teste.local';
DELETE FROM usuarios WHERE nome LIKE 'Usuário Teste%';

-- 2. CRIAR USUÁRIOS DE TESTE
INSERT INTO usuarios (
    nome, 
    email, 
    cpf, 
    telefone, 
    cargo, 
    nivel_acesso, 
    status, 
    senha_hash, 
    primeiro_acesso
) VALUES 
(
    'Usuário Teste Admin',
    '12345678901@teste.local',
    '12345678901',
    '11999999999',
    'Administrador',
    'admin',
    'ativo',
    crypt('123456', gen_salt('bf')),
    false
),
(
    'Usuário Teste Recepção',
    '12345678902@teste.local',
    '12345678902',
    '11999999998',
    'Recepcionista',
    'recepcao',
    'ativo',
    crypt('123456', gen_salt('bf')),
    false
),
(
    'Usuário Teste Primeiro Acesso',
    '12345678903@teste.local',
    '12345678903',
    '11999999997',
    'Profissional',
    'profissional',
    'ativo',
    crypt('123456', gen_salt('bf')),
    true
);

-- 3. TESTAR FUNÇÃO DE AUTENTICAÇÃO
SELECT '=== TESTE DE AUTENTICAÇÃO ===' as teste;

-- Teste 1: Usuário válido
SELECT 
    'Teste 1: Usuário válido' as descricao,
    *
FROM autenticar_usuario('12345678901', '123456');

-- Teste 2: Senha incorreta
SELECT 
    'Teste 2: Senha incorreta' as descricao,
    *
FROM autenticar_usuario('12345678901', 'senha_errada');

-- Teste 3: Usuário inexistente
SELECT 
    'Teste 3: Usuário inexistente' as descricao,
    *
FROM autenticar_usuario('99999999999', '123456');

-- Teste 4: Usuário inativo
UPDATE usuarios SET status = 'inativo' WHERE cpf = '12345678902';
SELECT 
    'Teste 4: Usuário inativo' as descricao,
    *
FROM autenticar_usuario('12345678902', '123456');
UPDATE usuarios SET status = 'ativo' WHERE cpf = '12345678902';

-- Teste 5: Primeiro acesso
SELECT 
    'Teste 5: Primeiro acesso' as descricao,
    *
FROM autenticar_usuario('12345678903', '123456');

-- 4. TESTAR VALIDAÇÃO DE CPF
SELECT '=== TESTE DE VALIDAÇÃO DE CPF ===' as teste;

-- Teste 1: CPF válido
SELECT 
    'Teste 1: CPF válido' as descricao,
    validar_cpf('12345678901') as resultado;

-- Teste 2: CPF inválido (todos iguais)
SELECT 
    'Teste 2: CPF inválido (todos iguais)' as descricao,
    validar_cpf('11111111111') as resultado;

-- Teste 3: CPF inválido (tamanho)
SELECT 
    'Teste 3: CPF inválido (tamanho)' as descricao,
    validar_cpf('123456789') as resultado;

-- Teste 4: CPF com formatação
SELECT 
    'Teste 4: CPF com formatação' as descricao,
    validar_cpf('123.456.789-01') as resultado;

-- 5. TESTAR GERAÇÃO DE EMAIL
SELECT '=== TESTE DE GERAÇÃO DE EMAIL ===' as teste;

SELECT 
    'Teste 1: CPF limpo' as descricao,
    gerar_email_cpf('12345678901') as email;

SELECT 
    'Teste 2: CPF formatado' as descricao,
    gerar_email_cpf('123.456.789-01') as email;

-- 6. TESTAR BUSCA POR CPF
SELECT '=== TESTE DE BUSCA POR CPF ===' as teste;

SELECT 
    'Teste 1: Buscar usuário existente' as descricao,
    *
FROM buscar_usuario_por_cpf('12345678901');

SELECT 
    'Teste 2: Buscar usuário inexistente' as descricao,
    *
FROM buscar_usuario_por_cpf('99999999999');

-- 7. TESTAR VIEW DE USUÁRIOS COMPLETOS
SELECT '=== TESTE DE VIEW USUÁRIOS COMPLETOS ===' as teste;

SELECT 
    nome,
    email,
    cpf,
    nivel_acesso,
    status,
    primeiro_acesso
FROM usuarios_completos
WHERE email LIKE '%@teste.local'
ORDER BY nome;

-- 8. TESTAR TRIGGERS
SELECT '=== TESTE DE TRIGGERS ===' as teste;

-- Teste 1: Inserir usuário sem email (deve gerar automaticamente)
INSERT INTO usuarios (
    nome, 
    cpf, 
    telefone, 
    cargo, 
    nivel_acesso, 
    status, 
    senha_hash
) VALUES (
    'Usuário Teste Trigger',
    '12345678904',
    '11999999996',
    'Teste',
    'recepcao',
    'ativo',
    crypt('123456', gen_salt('bf'))
);

-- Verificar se email foi gerado
SELECT 
    'Teste 1: Email gerado automaticamente' as descricao,
    nome,
    email,
    cpf
FROM usuarios
WHERE cpf = '12345678904';

-- Teste 2: Tentar inserir CPF inválido (deve falhar)
DO $$
BEGIN
    INSERT INTO usuarios (
        nome, 
        cpf, 
        telefone, 
        cargo, 
        nivel_acesso, 
        status, 
        senha_hash
    ) VALUES (
        'Usuário Teste CPF Inválido',
        '11111111111',
        '11999999995',
        'Teste',
        'recepcao',
        'ativo',
        crypt('123456', gen_salt('bf'))
    );
    RAISE NOTICE 'ERRO: CPF inválido foi aceito!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'SUCESSO: CPF inválido foi rejeitado corretamente';
END $$;

-- 9. VERIFICAR ÍNDICES
SELECT '=== VERIFICAÇÃO DE ÍNDICES ===' as teste;

SELECT 
    indexname as "Nome do Índice",
    tablename as "Tabela",
    indexdef as "Definição"
FROM pg_indexes 
WHERE tablename = 'usuarios'
ORDER BY indexname;

-- 10. VERIFICAR POLÍTICAS RLS
SELECT '=== VERIFICAÇÃO DE POLÍTICAS RLS ===' as teste;

SELECT 
    schemaname as "Schema",
    tablename as "Tabela",
    policyname as "Política",
    permissive as "Permissiva",
    roles as "Roles",
    cmd as "Comando",
    qual as "Condição"
FROM pg_policies 
WHERE tablename = 'usuarios'
ORDER BY policyname;

-- 11. LIMPEZA FINAL
SELECT '=== LIMPEZA FINAL ===' as teste;

DELETE FROM usuarios WHERE email LIKE '%@teste.local';
DELETE FROM usuarios WHERE nome LIKE 'Usuário Teste%';

SELECT 'Testes concluídos com sucesso!' as resultado;
