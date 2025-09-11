-- =====================================================
-- CRIAR FUNÇÃO PARA VERIFICAR SENHAS
-- =====================================================
-- Esta função verifica se uma senha digitada corresponde ao hash armazenado

-- Criar função para verificar senha
CREATE OR REPLACE FUNCTION verificar_senha(
    senha_digitada TEXT,
    senha_hash TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se a senha digitada corresponde ao hash
    RETURN senha_hash = crypt(senha_digitada, senha_hash);
END;
$$ LANGUAGE plpgsql;

-- Testar a função com alguns usuários
SELECT 
    nome,
    cpf,
    SUBSTRING(cpf, 1, 3) as senha_esperada,
    verificar_senha(SUBSTRING(cpf, 1, 3), senha_hash) as senha_valida
FROM usuarios
ORDER BY created_at;
