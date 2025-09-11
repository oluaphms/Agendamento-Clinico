-- =====================================================
-- TESTE DE INSERÇÃO NA TABELA PROFISSIONAIS
-- =====================================================
-- Este script testa se a inserção na tabela profissionais está funcionando
-- Execute este script no Supabase SQL Editor

-- Inserir um profissional de teste
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
    'Dr. João Silva Teste',
    '12345678901',
    '11999999999',
    'joao.teste@clinica.com',
    'Clínico Geral',
    'CRM 123456',
    'Profissional de teste para verificar funcionamento',
    true,
    NOW(),
    NOW()
);

-- Verificar se o registro foi inserido
SELECT 
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
WHERE nome = 'Dr. João Silva Teste'
ORDER BY id DESC
LIMIT 1;

-- Contar total de profissionais
SELECT COUNT(*) as total_profissionais FROM profissionais;
