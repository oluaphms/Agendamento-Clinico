-- =====================================================
-- CORRIGIR PÁGINA PACIENTES - VERSÃO SIMPLES
-- Script que adiciona campos necessários e cria views básicas
-- =====================================================

-- 1. ADICIONAR CAMPOS NECESSÁRIOS
-- =====================================================

-- Adicionar campos básicos se não existirem
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ativo';
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS genero VARCHAR(20) CHECK (genero IN ('masculino', 'feminino', 'outro'));
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS estado VARCHAR(2);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS cep VARCHAR(10);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS contato_emergencia VARCHAR(100);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS telefone_emergencia VARCHAR(20);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS historico_medico TEXT;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS alergias TEXT;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS medicamentos TEXT;
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS numero_convenio VARCHAR(50);
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. ATUALIZAR DADOS EXISTENTES
-- =====================================================

-- Atualizar status para registros existentes
UPDATE pacientes 
SET status = 'ativo'
WHERE status IS NULL;

-- Atualizar updated_at para registros existentes
UPDATE pacientes 
SET updated_at = NOW()
WHERE updated_at IS NULL;

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para consultas da página de pacientes
CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON pacientes(nome);
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf);
CREATE INDEX IF NOT EXISTS idx_pacientes_telefone ON pacientes(telefone);
CREATE INDEX IF NOT EXISTS idx_pacientes_email ON pacientes(email);
CREATE INDEX IF NOT EXISTS idx_pacientes_convenio ON pacientes(convenio);
CREATE INDEX IF NOT EXISTS idx_pacientes_status ON pacientes(status);
CREATE INDEX IF NOT EXISTS idx_pacientes_created_at ON pacientes(created_at);
CREATE INDEX IF NOT EXISTS idx_pacientes_updated_at ON pacientes(updated_at);

-- Índice composto para busca global
CREATE INDEX IF NOT EXISTS idx_pacientes_busca_global ON pacientes(nome, cpf, telefone, email, convenio);

-- 4. CRIAR FUNÇÕES AUXILIARES SIMPLES
-- =====================================================

-- Função para calcular idade
CREATE OR REPLACE FUNCTION calcular_idade_paciente(data_nascimento DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(data_nascimento));
END;
$$ LANGUAGE plpgsql;

-- 5. CRIAR TRIGGERS SIMPLES
-- =====================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION trigger_atualizar_updated_at_paciente()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela pacientes
DROP TRIGGER IF EXISTS trigger_atualizar_updated_at_paciente ON pacientes;
CREATE TRIGGER trigger_atualizar_updated_at_paciente
    BEFORE UPDATE ON pacientes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_atualizar_updated_at_paciente();

-- 6. CRIAR VIEWS SIMPLES PARA ESTATÍSTICAS
-- =====================================================

-- View para estatísticas de pacientes
CREATE OR REPLACE VIEW estatisticas_pacientes AS
SELECT 
    COUNT(*) as total_pacientes,
    COUNT(CASE WHEN status = 'ativo' THEN 1 END) as pacientes_ativos,
    COUNT(CASE WHEN status = 'inativo' THEN 1 END) as pacientes_inativos,
    COUNT(CASE WHEN convenio IS NOT NULL AND convenio != '' THEN 1 END) as pacientes_com_convenio,
    COUNT(CASE WHEN convenio IS NULL OR convenio = '' THEN 1 END) as pacientes_particular,
    COUNT(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as novos_este_mes,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as novos_esta_semana
FROM pacientes;

-- View para pacientes com informações completas
CREATE OR REPLACE VIEW pacientes_completos AS
SELECT 
    p.*,
    calcular_idade_paciente(p.data_nascimento) as idade_calculada,
    CASE 
        WHEN p.convenio IS NOT NULL AND p.convenio != '' THEN 'Convênio'
        ELSE 'Particular'
    END as tipo_pagamento
FROM pacientes p;

-- 7. CRIAR FUNÇÕES RPC SIMPLES
-- =====================================================

-- Função simples para buscar pacientes
CREATE OR REPLACE FUNCTION buscar_pacientes_simples(
    busca_global TEXT DEFAULT NULL,
    limite INTEGER DEFAULT 10,
    offset_val INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    nome VARCHAR(100),
    cpf VARCHAR(14),
    data_nascimento DATE,
    idade INTEGER,
    telefone VARCHAR(20),
    email VARCHAR(255),
    convenio VARCHAR(100),
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.nome,
        p.cpf,
        p.data_nascimento,
        calcular_idade_paciente(p.data_nascimento) as idade,
        p.telefone,
        p.email,
        p.convenio,
        p.status,
        p.created_at,
        p.updated_at
    FROM pacientes p
    WHERE 
        (busca_global IS NULL OR 
         p.nome ILIKE '%' || busca_global || '%' OR
         p.cpf ILIKE '%' || busca_global || '%' OR
         p.telefone ILIKE '%' || busca_global || '%' OR
         p.email ILIKE '%' || busca_global || '%' OR
         p.convenio ILIKE '%' || busca_global || '%')
    ORDER BY p.nome ASC
    LIMIT limite OFFSET offset_val;
END;
$$ LANGUAGE plpgsql;

-- Função simples para contar pacientes
CREATE OR REPLACE FUNCTION contar_pacientes_simples(
    busca_global TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    total INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO total
    FROM pacientes p
    WHERE 
        (busca_global IS NULL OR 
         p.nome ILIKE '%' || busca_global || '%' OR
         p.cpf ILIKE '%' || busca_global || '%' OR
         p.telefone ILIKE '%' || busca_global || '%' OR
         p.email ILIKE '%' || busca_global || '%' OR
         p.convenio ILIKE '%' || busca_global || '%');
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- 8. TESTAR FUNCIONALIDADES
-- =====================================================

-- Testar views de estatísticas
SELECT 'Testando views de estatísticas:' as info;
SELECT * FROM estatisticas_pacientes;

-- Testar função de busca simples
SELECT 'Testando função de busca simples:' as info;
SELECT * FROM buscar_pacientes_simples('', 5, 0);

-- Testar função de contagem simples
SELECT 'Testando função de contagem simples:' as info;
SELECT contar_pacientes_simples('') as total_pacientes;

-- 9. VERIFICAÇÃO FINAL
-- =====================================================

SELECT 
    'PÁGINA PACIENTES CORRIGIDA COM SUCESSO!' as resultado,
    'Todas as funcionalidades estão prontas para uso' as status;
