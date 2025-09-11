-- =====================================================
-- REMOVER TRIGGER ANTIGO DA TABELA PROFISSIONAIS
-- =====================================================
-- Este script remove o trigger antigo que está causando conflito

-- 1. Remover o trigger antigo problemático
DROP TRIGGER IF EXISTS trigger_update_profissionais_updated_at ON profissionais;

-- 2. Verificar se apenas o trigger correto permanece
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profissionais'
ORDER BY trigger_name;
