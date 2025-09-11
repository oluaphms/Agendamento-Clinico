-- =====================================================
-- TESTE COMPLETO DE PROFISSIONAL
-- =====================================================
-- Este script testa o cadastro completo de um profissional
-- Execute este script no Supabase SQL Editor

-- 1. Inserir um profissional de teste com todos os campos
INSERT INTO profissionais (
    nome,
    cpf,
    telefone,
    email,
    especialidade,
    crm,
    observacoes,
    ativo,
    data_cadastro,
    ultima_atualizacao
) VALUES (
    'Dr. Maria Santos Teste',
    '98765432100',
    '11888888888',
    'maria.teste@clinica.com',
    'Cardiologia',
    'CRM 654321',
    'Cardiologista especializada em arritmias',
    true,
    NOW(),
    NOW()
);

-- 2. Verificar se o registro foi inserido
SELECT 
    'Profissional inserido com sucesso' as status,
    id,
    nome,
    cpf,
    telefone,
    email,
    especialidade,
    crm,
    observacoes,
    ativo,
    data_cadastro
FROM profissionais 
WHERE nome = 'Dr. Maria Santos Teste'
ORDER BY id DESC
LIMIT 1;

-- 3. Testar inserção via audit_log (simular o que o código faz)
INSERT INTO audit_log (
    tabela,
    acao,
    dados_novos,
    usuario_id,
    created_at
) VALUES (
    'profissionais',
    'CREATE',
    '{"nome": "Dr. Maria Santos Teste", "especialidade": "Cardiologia"}'::jsonb,
    'sistema',
    NOW()
);

-- 4. Verificar se o log foi inserido
SELECT 
    'Log de auditoria inserido com sucesso' as status,
    id,
    tabela,
    acao,
    dados_novos,
    usuario_id,
    created_at
FROM audit_log 
WHERE tabela = 'profissionais' 
AND acao = 'CREATE'
ORDER BY id DESC
LIMIT 1;

-- 5. Contar registros
SELECT 
    'Contadores' as categoria,
    (SELECT COUNT(*) FROM profissionais) as total_profissionais,
    (SELECT COUNT(*) FROM audit_log WHERE tabela = 'profissionais') as total_logs_profissionais;
