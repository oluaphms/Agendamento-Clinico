-- =====================================================
-- TESTE SIMPLES DE AUTENTICAÇÃO
-- =====================================================

-- 1. VERIFICAR ESTRUTURA DA TABELA
SELECT 
    column_name as "Campo",
    data_type as "Tipo",
    is_nullable as "Pode ser NULL"
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;

-- 2. VERIFICAR DADOS EXISTENTES
SELECT 
    'Total de usuários' as "Métrica",
    COUNT(*) as "Valor"
FROM usuarios
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

-- 3. TESTAR FUNÇÃO DE AUTENTICAÇÃO (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.routines 
               WHERE routine_name = 'autenticar_usuario') THEN
        
        RAISE NOTICE 'Testando função de autenticação...';
        
        -- Teste com usuário existente
        PERFORM * FROM autenticar_usuario('11111111111', '123456');
        
        RAISE NOTICE 'Função de autenticação testada com sucesso!';
    ELSE
        RAISE NOTICE 'Função de autenticação não encontrada. Execute o script configurar_supabase_auth.sql primeiro.';
    END IF;
END $$;

-- 4. LISTAR USUÁRIOS PARA TESTE
SELECT 
    'Usuários disponíveis para teste:' as info,
    nome,
    cpf,
    email,
    nivel_acesso,
    status
FROM usuarios
ORDER BY nome;
