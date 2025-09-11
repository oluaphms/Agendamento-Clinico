-- =====================================================
-- CORREÇÃO SEGURA DO TRIGGER DA TABELA PROFISSIONAIS
-- =====================================================
-- Este script corrige apenas o trigger da tabela profissionais
-- sem afetar outras tabelas que usam a mesma função

-- 1. Remover apenas o trigger específico da tabela profissionais
DROP TRIGGER IF EXISTS update_profissionais_updated_at ON profissionais;
DROP TRIGGER IF EXISTS update_profissional_updated_at ON profissionais;
DROP TRIGGER IF EXISTS update_profissional_updated_at ON profissional;

-- 2. Criar função específica para profissionais (se não existir)
CREATE OR REPLACE FUNCTION update_profissionais_ultima_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar o campo ultima_atualizacao que realmente existe na tabela
    NEW.ultima_atualizacao = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Criar trigger específico para profissionais
CREATE TRIGGER update_profissionais_ultima_atualizacao
    BEFORE UPDATE ON profissionais
    FOR EACH ROW
    EXECUTE FUNCTION update_profissionais_ultima_atualizacao();

-- 4. Verificar se a correção funcionou
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profissionais'
ORDER BY trigger_name;
