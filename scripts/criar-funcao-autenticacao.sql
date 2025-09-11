-- =====================================================
-- CRIAR FUNÇÃO DE AUTENTICAÇÃO NO SUPABASE
-- Script para criar apenas a função de autenticação
-- =====================================================

-- Criar função para autenticar usuário
CREATE OR REPLACE FUNCTION autenticar_usuario(cpf_busca TEXT, senha_fornecida TEXT)
RETURNS TABLE (
    sucesso BOOLEAN,
    usuario_id UUID,
    nome TEXT,
    email TEXT,
    nivel_acesso TEXT,
    primeiro_acesso BOOLEAN,
    mensagem TEXT
) AS $$
DECLARE
    usuario_record RECORD;
    senha_valida BOOLEAN := FALSE;
BEGIN
    -- Buscar usuário
    SELECT * INTO usuario_record
    FROM usuarios
    WHERE cpf = cpf_busca
    AND status = 'ativo';
    
    -- Verificar se usuário existe
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, FALSE, 'Usuário não encontrado';
        RETURN;
    END IF;
    
    -- Verificar senha (comparação simples para desenvolvimento)
    senha_valida := (usuario_record.senha = senha_fornecida);
    
    -- Retornar resultado
    IF senha_valida THEN
        -- Atualizar último login
        UPDATE usuarios 
        SET ultimo_login = NOW()
        WHERE id = usuario_record.id;
        
        RETURN QUERY SELECT 
            TRUE,
            usuario_record.id,
            usuario_record.nome,
            usuario_record.email,
            usuario_record.nivel_acesso::TEXT,
            usuario_record.primeiro_acesso,
            'Login realizado com sucesso';
    ELSE
        RETURN QUERY SELECT 
            FALSE,
            NULL::UUID,
            NULL::TEXT,
            NULL::TEXT,
            NULL::TEXT,
            FALSE,
            'Senha incorreta';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Verificar se a função foi criada
SELECT 'Função autenticar_usuario criada com sucesso' as status;
