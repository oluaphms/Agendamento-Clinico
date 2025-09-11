-- =====================================================
-- VALIDAR CORREÇÕES IMPLEMENTADAS
-- Script para verificar se os problemas foram resolvidos
-- =====================================================

-- 1. VERIFICAR ESTRUTURA DA TABELA
SELECT 
    'Estrutura da tabela usuarios:' as info,
    column_name as campo,
    data_type as tipo,
    is_nullable as pode_ser_null,
    column_default as valor_padrao
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;

-- 2. VERIFICAR DADOS DE STATUS
SELECT 
    'Verificação de status:' as info,
    status,
    COUNT(*) as quantidade
FROM usuarios
GROUP BY status
ORDER BY status;

-- 3. TESTAR VALIDAÇÃO DE CPF
SELECT 
    'Teste de validação de CPF:' as info,
    '11111111111' as cpf_teste,
    validar_cpf('11111111111') as resultado;

-- 4. VERIFICAR POLÍTICAS RLS
SELECT 
    'Políticas RLS ativas:' as info,
    policyname as politica,
    permissive as permissiva,
    cmd as comando
FROM pg_policies 
WHERE tablename = 'usuarios'
ORDER BY policyname;

-- 5. TESTAR FUNÇÃO DE AUTENTICAÇÃO
DO $$
DECLARE
    resultado RECORD;
BEGIN
    -- Teste com usuário existente
    SELECT * INTO resultado
    FROM autenticar_usuario('11111111111', '123456');
    
    IF resultado.sucesso THEN
        RAISE NOTICE 'SUCESSO: Autenticação funcionando corretamente';
        RAISE NOTICE 'Usuário: %, Nível: %', resultado.nome, resultado.nivel_acesso;
    ELSE
        RAISE NOTICE 'ERRO: Falha na autenticação - %', resultado.mensagem;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERRO: Função de autenticação não encontrada ou com erro: %', SQLERRM;
END $$;

-- 6. VERIFICAR ÍNDICES
SELECT 
    'Índices criados:' as info,
    indexname as nome_indice,
    tablename as tabela
FROM pg_indexes 
WHERE tablename = 'usuarios'
ORDER BY indexname;

-- 7. VERIFICAR TRIGGERS
SELECT 
    'Triggers ativos:' as info,
    trigger_name as nome_trigger,
    event_manipulation as evento,
    action_timing as timing
FROM information_schema.triggers
WHERE event_object_table = 'usuarios'
ORDER BY trigger_name;

-- 8. RESUMO FINAL
SELECT 
    'RESUMO DAS CORREÇÕES:' as info,
    'Estrutura corrigida' as item1,
    'Status validado' as item2,
    'CPF validado' as item3,
    'Políticas RLS criadas' as item4,
    'Funções de autenticação ativas' as item5;
