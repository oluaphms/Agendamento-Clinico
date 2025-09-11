-- =====================================================
-- VERIFICAR FORMATO DOS CPFs NO BANCO
-- =====================================================

-- Verificar como os CPFs estão armazenados
SELECT 
    nome,
    cpf,
    LENGTH(cpf) as tamanho_cpf,
    CASE 
        WHEN cpf ~ '^[0-9]{11}$' THEN '✅ Apenas números (11 dígitos)'
        WHEN cpf ~ '^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$' THEN '❌ Com formatação (XXX.XXX.XXX-XX)'
        ELSE '⚠️ Formato desconhecido'
    END as formato_cpf
FROM usuarios
ORDER BY created_at;

-- Mostrar CPFs limpos (sem formatação)
SELECT 
    nome,
    cpf as cpf_original,
    REGEXP_REPLACE(cpf, '[^0-9]', '', 'g') as cpf_limpo,
    LENGTH(REGEXP_REPLACE(cpf, '[^0-9]', '', 'g')) as tamanho_limpo
FROM usuarios
ORDER BY created_at;
